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

## To do

- wire up the encoder and test it
- Terraform: an IoT thing, a certificate and a policy that lets only the Pi update only its own shadow
- Pi script: read `VALUE`, update `reported`, listen for `desired`, send `SET` (it keeps the USB connection open, because opening it restarts the Uno)
- web page: show the value live and set a new one
