# Project 5: Photo counter display

**Zukunftstag project 5 · bonus, goes with projects 3 and 4**

A 4-digit LED display shows how many photos the Pi has taken so far. Every time the camera takes a photo, the number goes up.

**The idea:** a computer can control real electronics, and devices can talk to each other.

## How it fits together

```
Pi takes a photo ──USB──▶ Arduino Uno ──4 wires──▶ RobotDyn TM1637 display
     sends "+"                counts                                shows 42
```

The Pi sends a line of text over USB:

| Pi sends | Display shows |
|---|---|
| `42` | 42 |
| `+` | one more than before |
| `0` | 0 |

| `TIME 13:45:10` | 13:45, then keeps running as a clock (colon blinks every second) |

The Arduino answers with `COUNT 42` (or `TIME 13:45:10`). A number, `+` or the
knob switches from the clock back to the counter.

**The knob:** a KY-040 rotary encoder (from project 6) counts up or down by hand,
one per click, and **pushing** it jumps up by 100 (`PUSH_JUMP` in the sketch).
The Arduino then sends `COUNT 43` by itself. The knob's SW pin goes to pin 8.

The display always shows 4 digits (`0042`). Past 9999 it starts again at `0001`.

**The clock:** the Uno has no real clock chip. It counts from the time it was
given, using its own timer, so it can drift by a few seconds or more per hour.
Send `TIME` again to correct it. Opening the USB port restarts the Uno, so the
clock and the count are gone after that until they are sent again.

## Parts

- Arduino Uno (a clone with a CH340 USB chip, `/dev/ttyUSB0` on the Pi) and its USB cable
- RobotDyn 4-digit display module with a TM1637 chip
- 4 jumper wires (female–male: display header pins → Uno sockets)

## Wiring

| Display | Arduino Uno | | Knob (KY-040) | Arduino Uno |
|---|---|---|---|---|
| CLK | 3 | | CLK | 10 |
| DIO | 2 | | DT | 9 |
| VCC | 5V | | + | 5V (shared) |
| GND | GND | | GND | GND |
| | | | SW | 8 |

The Uno runs on 5 V, so VCC goes to **5V**. The picture is in `wiring.svg`.

If you use the Nano 33 BLE Sense instead, connect VCC to **3.3V**. The module pulls CLK and DIO up to VCC, and the Nano 33 BLE's pins only take 3.3 V.

## Software

Already installed on the Mac:

- `arduino-cli` with board support `arduino:avr` (Uno) and `arduino:mbed_nano` (Nano 33 BLE)
- the `TM1637` library by Avishay Orpaz
- the program `arduino/photo_counter/photo_counter.ino`

```
arduino-cli compile --fqbn arduino:avr:uno arduino/photo_counter
arduino-cli upload  --fqbn arduino:avr:uno -p <port> arduino/photo_counter
```

`arduino-cli board list` shows the port: `/dev/cu.usbserial…` on the Mac, `/dev/ttyUSB0` on the Pi. For the Nano 33 BLE, use `--fqbn arduino:mbed_nano:nano33ble`.

Brightness: `display.setBrightness(5)` in `setup()`, from 0 (dim) to 7 (bright).

## Alternative: the bare Everlight display

There is also a bare blue Everlight ELF-415UBWA display: 16 pins, common cathode. It needs 12 wires and 8 × 470 Ω resistors and runs from a **5 V Arduino** (Uno or Nano). The program would need the `SevSeg` library and pin setup again.

## To do

- wire up the module and upload the program to the Uno
- send `+` from the photo script in project 3 or 4
