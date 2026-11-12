// Photo counter: Arduino + RobotDyn 4-digit TM1637 display.
// Works on an Arduino Uno (5 V) and on the Nano 33 BLE Sense (3.3 V).
//
// The Pi tells the Arduino over USB how many photos have been taken:
//   send "42" + Enter  -> the display shows 42
//   send "+"  + Enter  -> the display counts up by one
//   send "0"  + Enter  -> back to zero
// The Arduino answers with "COUNT 42" so the sender knows it arrived.
//
// Clock mode: send "TIME 13:45:10" + Enter -> the display shows 13:45 and keeps
// counting by itself (the colon blinks every second). Sending a number or "+",
// or turning the knob, switches back to the counter.
//
// Turn the knob (KY-040 rotary encoder) to count up or down by hand.
// Push the knob to jump up by 100. The Arduino then sends "COUNT 43" by itself.
//
// Wiring:
//   display CLK -> D3          knob CLK -> D10
//   display DIO -> D2          knob DT  -> D9
//   display VCC -> 5V *        knob +   -> 5V (share it, e.g. breadboard rail)
//   display GND -> GND         knob GND -> GND
//                              knob SW  -> D8 (the push button)
//   * 3.3V on the Nano 33 BLE (its pins only take 3.3 V)

#include <TM1637Display.h>

const int CLK_PIN = 3;
const int DIO_PIN = 2;
const int KNOB_CLK_PIN = 10;
const int KNOB_DT_PIN = 9;
const int KNOB_SW_PIN = 8;
const int PUSH_JUMP = 100;      // pushing the knob adds this much
const int STEPS_PER_CLICK = 4;  // most KY-040 knobs; try 2 if one click moves by 2
const bool REVERSE = false;     // set to true if turning right counts down

TM1637Display display(CLK_PIN, DIO_PIN);
long photos = 0;
String line;
uint8_t knobState = 0;
int knobSteps = 0;
bool lastButton = HIGH;  // HIGH = not pressed (the pin is pulled up)
unsigned long lastButtonChange = 0;

// Clock mode. The Uno has no real clock, so it counts from the time it was given.
bool clockMode = false;
long clockSeconds = 0;        // the time that was sent, in seconds after midnight
unsigned long clockSetAt = 0; // millis() when it was sent
long lastShown = -1;

// Reads the knob's two signals. The table turns their pattern into
// "one step left" (-1), "one step right" (+1) or "no step" (0).
int8_t readKnob() {
  static const int8_t table[16] = {0, -1, 1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, -1, 0};
  uint8_t state = (digitalRead(KNOB_CLK_PIN) << 1) | digitalRead(KNOB_DT_PIN);
  knobState = ((knobState << 2) | state) & 0x0F;
  return table[knobState];
}

void showClock() {
  long now = (clockSeconds + (millis() - clockSetAt) / 1000) % 86400L;
  if (now == lastShown) return;
  lastShown = now;
  int hours = now / 3600;
  int minutes = (now / 60) % 60;
  uint8_t colon = (now % 2 == 0) ? 0b01000000 : 0;  // blinks every second
  display.showNumberDecEx(hours * 100 + minutes, colon, true);  // true = 09:05, not 9:5
}

bool setTime(const String &text) {
  int hours, minutes, seconds = 0;
  if (sscanf(text.c_str(), "%d:%d:%d", &hours, &minutes, &seconds) < 2 ||
      hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
    return false;
  }
  clockSeconds = hours * 3600L + minutes * 60L + seconds;
  clockSetAt = millis();
  clockMode = true;
  lastShown = -1;
  showClock();
  Serial.print("TIME ");
  Serial.println(text);
  return true;
}

void show(long count) {
  clockMode = false;
  if (count > 9999) count = 1;  // past 9999: start again at 0001
  if (count < 0) count = 0;
  photos = count;
  display.showNumberDec(photos, true);  // true = leading zeros: 0042
  Serial.print("COUNT ");
  Serial.println(photos);
}

void handleLine(const String &text) {
  if (text.startsWith("TIME ")) {
    if (!setTime(text.substring(5))) {
      Serial.println("ERROR: send TIME 13:45 or TIME 13:45:10");
    }
    return;
  }
  if (text == "+") {
    show(photos + 1);
    return;
  }
  if (text.length() == 0) {
    return;
  }
  for (unsigned int i = 0; i < text.length(); i++) {
    if (!isDigit(text[i])) {
      Serial.println("ERROR: send a number, + or TIME 13:45");
      return;
    }
  }
  show(text.toInt());
}

void setup() {
  Serial.begin(9600);
  pinMode(KNOB_CLK_PIN, INPUT_PULLUP);
  pinMode(KNOB_DT_PIN, INPUT_PULLUP);
  pinMode(KNOB_SW_PIN, INPUT_PULLUP);
  knobState = (digitalRead(KNOB_CLK_PIN) << 1) | digitalRead(KNOB_DT_PIN);
  display.setBrightness(5);  // 0 (dim) to 7 (bright)
  display.showNumberDec(photos, true);
}

void loop() {
  if (clockMode) {
    showClock();
  }

  // The knob: 4 small steps = 1 click = count up or down by one
  int8_t step = readKnob();
  knobSteps += REVERSE ? -step : step;
  if (knobSteps >= STEPS_PER_CLICK || knobSteps <= -STEPS_PER_CLICK) {
    int clicks = knobSteps / STEPS_PER_CLICK;
    knobSteps -= clicks * STEPS_PER_CLICK;
    long next = max(photos + clicks, 0L);
    if (next != photos) {
      show(next);
    }
  }

  // Pushing the knob: jump by 100 (ignoring the bouncing of the contact)
  bool button = digitalRead(KNOB_SW_PIN);
  if (button != lastButton && millis() - lastButtonChange > 30) {
    lastButtonChange = millis();
    lastButton = button;
    if (button == LOW) {
      show(photos + PUSH_JUMP);
    }
  }

  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      line.trim();
      handleLine(line);
      line = "";
    } else if (c != '\r' && line.length() < 16) {
      line += c;
    }
  }
}
