#!/usr/bin/env python3
"""Keeps the knob and its device shadow in AWS IoT Core in sync.

  knob turned   -> Arduino sends "VALUE 42" -> shadow "reported": 42
  web page sets -> shadow "desired": 70     -> Arduino gets "SET 70"

Needs in --dir (default: this folder): knob-config.json, knob.cert.pem,
knob.private.key and AmazonRootCA1.pem (the last one may also sit next to this script).
"""

import argparse
import glob
import json
import sys
import threading
import time
from pathlib import Path

import paho.mqtt.client as mqtt
import serial

GREEN, PINK, GRAY, BOLD, RESET = "\033[92m", "\033[95m", "\033[90m", "\033[1m", "\033[0m"


def find_uno():
    ports = (sorted(glob.glob("/dev/serial/by-id/*1a86*")) or sorted(glob.glob("/dev/ttyUSB*"))
             or sorted(glob.glob("/dev/cu.usbserial*")))
    if not ports:
        sys.exit("No Arduino Uno found. Is it plugged in?")
    return ports[0]


def find_file(name, folders):
    for folder in folders:
        if (folder / name).exists():
            return str(folder / name)
    sys.exit(f"Missing {name} (looked in {', '.join(map(str, folders))})")


class Bridge:
    def __init__(self, folder):
        here = Path(__file__).resolve().parent
        folders = [folder, here]
        config = json.loads(Path(find_file("knob-config.json", folders)).read_text())
        self.thing = config["thing_name"]
        self.topic = f"$aws/things/{self.thing}/shadow"
        self.synced = False
        self.lock = threading.Lock()

        port = find_uno()
        print(f"{GRAY}  Arduino on {port} (it restarts now, one moment...){RESET}")
        self.arduino = serial.Serial(port, 9600, timeout=1)
        time.sleep(2.5)                  # opening the port restarts the Uno
        self.arduino.reset_input_buffer()  # forget the "VALUE 50" it says after starting

        try:  # paho-mqtt 2.x
            self.mqtt = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, client_id=self.thing)
        except AttributeError:  # paho-mqtt 1.x
            self.mqtt = mqtt.Client(client_id=self.thing)
        self.mqtt.tls_set(
            ca_certs=find_file("AmazonRootCA1.pem", folders),
            certfile=find_file("knob.cert.pem", folders),
            keyfile=find_file("knob.private.key", folders),
        )
        self.mqtt.on_connect = self.on_connect
        self.mqtt.on_message = self.on_message
        self.mqtt.on_disconnect = lambda *args: print(f"{GRAY}  (cloud connection lost, reconnecting...){RESET}")
        print(f"{GRAY}  Connecting to {config['endpoint']} ...{RESET}")
        self.mqtt.connect(config["endpoint"], 8883, keepalive=30)

    # ---- cloud -> knob ----

    def on_connect(self, client, userdata, flags, rc):
        if rc != 0:
            print(f"  Cloud said no (code {rc}). Is the certificate active?")
            return
        print(f"{GREEN}  ☁️  Connected to AWS IoT Core as '{self.thing}'{RESET}")
        client.subscribe(f"{self.topic}/update/delta", qos=1)
        client.subscribe(f"{self.topic}/get/accepted", qos=1)
        client.subscribe(f"{self.topic}/get/rejected", qos=1)
        client.publish(f"{self.topic}/get", "", qos=1)  # what does the cloud know?

    def on_message(self, client, userdata, message):
        data = json.loads(message.payload or b"{}")
        if message.topic.endswith("/get/accepted") and not self.synced:
            self.synced = True
            state = data.get("state", {})
            value = state.get("desired", {}).get("value", state.get("reported", {}).get("value"))
            if value is not None:
                print(f"  {PINK}🔽 cloud → knob: starting at {value}{RESET}")
                self.send(f"SET {value}")
            else:
                self.send("GET")
        elif message.topic.endswith("/get/rejected") and not self.synced:
            self.synced = True  # no shadow yet: the knob's value becomes the first one
            self.send("GET")
        elif message.topic.endswith("/update/delta"):
            value = data.get("state", {}).get("value")
            if isinstance(value, int):
                print(f"  {PINK}🔽 cloud → knob: {value}{RESET}")
                self.send(f"SET {value}")

    def send(self, command):
        with self.lock:
            self.arduino.write(f"{command}\n".encode())

    # ---- knob -> cloud ----

    def report(self, reported, clear_desired=False):
        state = {"reported": dict(reported, online=True)}
        if clear_desired:
            state["desired"] = None  # the knob decides now, so forget old wishes
        self.mqtt.publish(f"{self.topic}/update", json.dumps({"state": state}), qos=1)

    def run(self):
        self.mqtt.loop_start()
        print(f"\n{BOLD}  🎛️  CLOUD KNOB{RESET}  {GRAY}Turn or press the knob. Ctrl+C to stop.{RESET}\n")
        try:
            while True:
                line = self.arduino.readline().decode(errors="ignore").strip()
                if line.startswith("VALUE "):
                    value = int(line.split()[1])
                    print(f"  {GREEN}🔼 knob → cloud: {value}{RESET}")
                    self.report({"value": value}, clear_desired=True)
                elif line == "PRESS":
                    print(f"  {GREEN}👆 knob pressed{RESET}")
                    self.report({"pressed": int(time.time() * 1000)})
                elif line.startswith("ERROR"):
                    print(f"  {GRAY}Arduino: {line}{RESET}")
        except KeyboardInterrupt:
            print("\n  Bye! 👋")
        finally:
            info = self.mqtt.publish(f"{self.topic}/update",
                                     json.dumps({"state": {"reported": {"online": False}}}), qos=1)
            info.wait_for_publish(timeout=3)
            self.mqtt.loop_stop()
            self.mqtt.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync the knob with AWS IoT Core")
    parser.add_argument("--dir", type=Path, default=Path(__file__).resolve().parent,
                        help="folder with knob-config.json and the certificate files")
    Bridge(parser.parse_args().dir).run()
