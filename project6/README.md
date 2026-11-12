# Project 6: Cloud knob

**Zukunftstag project 6 · bonus**

He turns a knob, and its value (0–100) shows up in the cloud and on a web page. When someone changes the value on the web page, the Pi gets the new value, and the knob continues from there.

**The idea:** a device and the cloud can stay in sync, and the change can come from either side.

## How it fits together

```
knob ──5 wires──▶ Arduino Uno ──USB──▶ Pi ──internet──▶ AWS IoT Core (device shadow) ◀──▶ web page
turn / press        "VALUE 42"          sends & listens     stores the newest value          shows & sets
```

**Device shadow:** a small JSON document in AWS IoT Core that holds the newest state of a device:

```json
{ "state": { "reported": { "value": 42 }, "desired": { "value": 70 } } }
```

- **reported:** what the knob says it is. The Pi updates it on every click.
- **desired:** what the cloud wants it to be. When the web page sets it, the Pi gets a message and sends `SET 70` to the Arduino.

## Parts

- Rotary encoder module (KY-040) with pins CLK, DT, SW, +, GND
  - It turns endlessly in clicks and has a push button (SW).
  - It isn't a potentiometer: it has no end position and reports steps, not a position.
- Arduino Uno and its USB cable
- the RobotDyn TM1637 display from project 5
- jumper wires (female–male) and a breadboard for sharing 5V

## Wiring

The RobotDyn display from project 5 shows the knob's value.

| Encoder | Arduino Uno | | Display | Arduino Uno |
|---|---|---|---|---|
| CLK | 10 | | CLK | 3 |
| DT | 9 | | DIO | 2 |
| SW | 8 | | VCC | 5V |
| + | 5V | | GND | GND |
| GND | GND | | | |

The Uno has only one 5V pin, so share it. Use the breadboard's + rail, or 5V on the ICSP header (pin 2, next to the dot). The picture is in `wiring.svg`.

## Arduino commands (over USB, 9600 baud)

| Arduino sends | Meaning |
|---|---|
| `VALUE 42` | the value changed, or the answer to `GET` / `SET` |
| `PRESS` | the knob was pressed |

| Send to the Arduino | Effect |
|---|---|
| `SET 70` | sets the value to 70 (0–100) |
| `GET` | asks for the current value |

Settings at the top of `arduino/knob/knob.ino`:
- `REVERSE`: set to `true` if turning right counts down
- `STEPS_PER_CLICK`: try `2` if one click only moves half a step

```
arduino-cli compile --fqbn arduino:avr:uno arduino/knob
arduino-cli upload  --fqbn arduino:avr:uno -p <port> arduino/knob
```

## Running it

```
terraform init
terraform apply                 # ~5-15 min the first time (CloudFront)
terraform output page_login     # username / password for https://knob.groenveld.ch
```

| File | What it is |
|---|---|
| `main.tf` | IoT thing + certificate + policy (only its own shadow), the page (S3 + CloudFront + password), the API Lambda |
| `lambda/api.py` | `GET /api/knob` reads the shadow, `POST /api/knob?value=70` sets `desired` |
| `web/index.html` | The page: a live dial (updates every second), slider and buttons |
| `bridge/knob-bridge.py` | Keeps the knob and the shadow in sync (MQTT over TLS with the certificate) |
| `bridge/install-on-pi.sh` | Copies the bridge and the certificate to the Pi |

Terraform writes the certificate, private key and endpoint into `certs/` (ignored by git).

**The bridge on the Pi:** `./bridge/install-on-pi.sh`, then on the Pi
`python3 ~/cloud-knob/knob-bridge.py`.
**The bridge on the Mac:** needs `pip install paho-mqtt pyserial`, then
`python3 bridge/knob-bridge.py --dir certs`.

How the two directions work:

- Knob turned → `VALUE 42` → the bridge reports `{"reported": {"value": 42}, "desired": null}`.
  Clearing `desired` matters: otherwise the old wish would pull the knob back.
- Page sets 70 → `desired: 70` → IoT Core sends a **delta** → the bridge sends `SET 70`
  → the Arduino answers `VALUE 70` → reported = 70, the delta is gone.
- On start, the bridge asks for the shadow and sets the knob to the last value,
  because opening the USB port restarts the Uno at 50.
- Pressing the knob reports `pressed` (a timestamp) and the page glows.

The Uno must run `arduino/knob` for this project. The photo counter / clock from
project 5 is a different sketch, so upload that one again to go back.
