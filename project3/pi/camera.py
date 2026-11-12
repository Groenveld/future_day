#!/usr/bin/env python3
"""What does the AI see? Take a photo, send it to the cloud, hear the answer.

  python3 camera.py                take a photo every time you press Enter
  python3 camera.py --shake        take a photo every time you shake the Arduino
  python3 camera.py --burst 10     take 10 photos, one every second
  python3 camera.py --speak        ... and the Pi says the answer out loud
  python3 camera.py my-photo.jpg   send a photo you already have
"""

import argparse
import glob
import json
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path

import boto3

CONFIG = json.loads((Path(__file__).parent / "config.json").read_text())
session = boto3.Session(profile_name="ai-camera", region_name=CONFIG["region"])
s3 = session.client("s3")
polly = session.client("polly")

GREEN, PINK, YELLOW, GRAY, BOLD, RESET = "\033[92m", "\033[95m", "\033[93m", "\033[90m", "\033[1m", "\033[0m"


def find_camera():
    # The USB webcam (e.g. Logitech C920); /dev/video0 if we can't tell
    cameras = sorted(glob.glob("/dev/v4l/by-id/usb-*-video-index0"))
    return cameras[0] if cameras else "/dev/video0"


def take_photo(path):
    for n in (3, 2, 1):
        print(f"{BOLD}{YELLOW}  {n}...{RESET}", flush=True)
        time.sleep(0.7)
    print(f"{BOLD}  📸 CHEESE!{RESET}", flush=True)
    subprocess.run(
        ["fswebcam", "--quiet", "--device", find_camera(), "--resolution", "1280x720",
         "--skip", "20", "--no-banner", "--jpeg", "90", str(path)],
        check=True,
    )


def upload(path, name=None):
    name = name or "photo-" + datetime.now().strftime("%Y%m%d-%H%M%S")
    suffix = path.suffix.lower() if path.suffix.lower() in (".jpg", ".jpeg", ".png") else ".jpg"
    content_type = "image/png" if suffix == ".png" else "image/jpeg"
    s3.upload_file(str(path), CONFIG["bucket"], f"photos/{name}{suffix}",
                   ExtraArgs={"ContentType": content_type})
    return name


def wait_for_result(name, seconds=40, dots=True):
    if dots:
        print(f"{GRAY}  ☁️  Sent to the cloud. The AI is thinking", end="", flush=True)
    deadline = time.time() + seconds
    while time.time() < deadline:
        try:
            body = s3.get_object(Bucket=CONFIG["bucket"], Key=f"results/{name}.json")["Body"].read()
            if dots:
                print(RESET)
            return json.loads(body)
        except s3.exceptions.NoSuchKey:
            if dots:
                print(".", end="", flush=True)
            time.sleep(1)
    if dots:
        print(RESET)
    return None


def show(result):
    print(f"\n  {BOLD}🤖 {result['sentence']}{RESET}\n")
    for label in result["labels"]:
        bar = "█" * round(label["confidence"] / 5)
        print(f"  {label['name']:<22} {PINK}{bar:<20}{RESET} {label['confidence']:5.1f}%")
    for face in result["faces"]:
        extras = [word for word, on in [("smiling", face["smiling"]), ("glasses", face["glasses"]),
                                        ("sunglasses", face["sunglasses"]), ("beard", face["beard"])] if on]
        print(f"\n  {GREEN}😀 Face: {face['age_low']}–{face['age_high']} years, {face['feeling']}"
              f"{' · ' + ', '.join(extras) if extras else ''}{RESET}")
    for line in result["text"]:
        print(f"  {YELLOW}📝 Text: {line}{RESET}")
    print(f"\n  {GRAY}See it in the gallery: {CONFIG['gallery_url']}{RESET}\n")


def speak(sentence):
    try:
        audio = polly.synthesize_speech(Text=sentence, OutputFormat="mp3", VoiceId="Matthew", Engine="neural")
        with tempfile.NamedTemporaryFile(suffix=".mp3") as mp3:
            mp3.write(audio["AudioStream"].read())
            mp3.flush()
            subprocess.run(["mpg123", "--quiet", mp3.name], check=False)
    except Exception as error:
        print(f"{GRAY}  (Could not speak: {error}){RESET}")


def run(path, speak_it):
    name = upload(path)
    result = wait_for_result(name)
    if result is None:
        print("  The AI didn't answer in time. Check the gallery in a moment!")
        return
    show(result)
    if speak_it:
        speak(result["sentence"])


def find_arduino():
    ports = sorted(glob.glob("/dev/serial/by-id/*Arduino*")) or sorted(glob.glob("/dev/ttyACM*"))
    if not ports:
        sys.exit("No Arduino found. Is it plugged into the Pi?")
    return ports[0]


def shake_mode(speak_it):
    import serial  # pyserial

    photo = Path(tempfile.gettempdir()) / "ai-camera.jpg"
    biggest = 600  # the meter is full at 600 degrees per second
    with serial.Serial(find_arduino(), 115200, timeout=2) as arduino:
        print(f"\n{BOLD}  👁️  WHAT DOES THE AI SEE?{RESET}")
        print(f"{GRAY}  Shake or twist the Arduino to take a photo. Ctrl+C to stop.{RESET}\n")
        while True:
            line = arduino.readline().decode(errors="ignore").strip()
            if line.startswith("G "):
                speed = int(float(line[2:] or 0))
                filled = min(30, round(speed / biggest * 30))
                mark = round(300 / biggest * 30)  # where SHAKE starts
                bar = "".join("█" if i < filled else ("|" if i == mark else "·") for i in range(30))
                print(f"\r  🌀 {PINK}{bar}{RESET} {speed:4d} °/s ", end="", flush=True)
            elif line.startswith("SHAKE"):
                print(f"\n\n{BOLD}  💥 SHAKE! ({line.split()[1]} °/s){RESET}")
                try:
                    take_photo(photo)
                    run(photo, speak_it)
                except subprocess.CalledProcessError:
                    print("  The camera didn't work. Is the webcam plugged in?")
                arduino.reset_input_buffer()  # forget shakes that happened while we were busy
            elif line.startswith("ERROR"):
                print(f"\n  The Arduino says: {line}")


def burst_mode(count):
    folder = Path(tempfile.mkdtemp(prefix="ai-burst-"))
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    print(f"\n{BOLD}  📸 Taking {count} photos, one every second...{RESET}")
    # ffmpeg keeps the camera running, so the photos are exactly 1 second apart
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-f", "v4l2", "-input_format", "mjpeg",
         "-video_size", "1280x720", "-i", find_camera(), "-ss", "1",
         "-vf", "fps=1", "-frames:v", str(count), "-q:v", "3", str(folder / "%02d.jpg")],
        check=True,
    )
    photos = sorted(folder.glob("*.jpg"))
    print(f"{GRAY}  ☁️  Sending {len(photos)} photos to the AI...{RESET}\n")

    def send(item):
        number, path = item
        name = upload(path, f"photo-{stamp}-{number:02d}")
        return wait_for_result(name, seconds=60, dots=False)

    with ThreadPoolExecutor(10) as pool:
        results = list(pool.map(send, enumerate(photos, 1)))
    for number, result in enumerate(results, 1):
        if result is None:
            print(f"  {number:2}. (no answer yet, check the gallery)")
            continue
        faces = ", ".join(f"{f['age_low']}–{f['age_high']} {f['feeling']}" for f in result["faces"])
        labels = ", ".join(label["name"] for label in result["labels"][:4]) or "???"
        print(f"  {number:2}. {labels}{GREEN}{'  😀 ' + faces if faces else ''}{RESET}")
    print(f"\n  {GRAY}See them in the gallery: {CONFIG['gallery_url']}{RESET}\n")


def main():
    parser = argparse.ArgumentParser(description="What does the AI see?")
    parser.add_argument("photo", nargs="?", type=Path, help="a photo to send instead of using the camera")
    parser.add_argument("--speak", action="store_true", help="say the answer out loud (Amazon Polly)")
    parser.add_argument("--shake", action="store_true", help="take a photo when the Arduino is shaken")
    parser.add_argument("--burst", type=int, metavar="N", help="take N photos, one every second")
    args = parser.parse_args()

    try:
        if args.shake:
            shake_mode(args.speak)
            return
        if args.burst:
            burst_mode(args.burst)
            return
    except KeyboardInterrupt:
        print("\n  Bye! 👋")
        return

    if args.photo:
        run(args.photo, args.speak)
        return

    print(f"\n{BOLD}  👁️  WHAT DOES THE AI SEE?{RESET}")
    print(f"{GRAY}  Press Enter to take a photo. Ctrl+C to stop.{RESET}\n")
    photo = Path(tempfile.gettempdir()) / "ai-camera.jpg"
    while True:
        try:
            input(f"{BOLD}  [Enter] = 📸 {RESET}")
            take_photo(photo)
            run(photo, args.speak)
        except KeyboardInterrupt:
            print("\n  Bye! 👋")
            sys.exit(0)
        except subprocess.CalledProcessError:
            print("  The camera didn't work. Is the webcam plugged in?")


if __name__ == "__main__":
    main()
