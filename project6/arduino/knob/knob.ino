// Cloud knob: rotary encoder (KY-040) and TM1637 display on an Arduino Uno.
//
// Turning the knob changes a value from 0 to 100. The display shows it,
// and the Arduino reports it to the Pi over USB:
//   "VALUE 42"  after every click of the knob
//   "PRESS"     when the knob is pushed
// The Pi (or the cloud through the Pi) can also set the value:
//   send "SET 42" + Enter  -> the value becomes 42 and the Arduino answers "VALUE 42"
//   send "GET"    + Enter  -> the Arduino answers with the current value
//
// Wiring:
//   display CLK -> 3      encoder CLK -> 10
//   display DIO -> 2      encoder DT  -> 9
//   display VCC -> 5V     encoder SW  -> 8
//   display GND -> GND    encoder +   -> 5V (shared with the display, e.g. breadboard rail)
//                         encoder GND -> GND

#include <TM1637Display.h>

const int DISPLAY_CLK_PIN = 3;
const int DISPLAY_DIO_PIN = 2;
const int CLK_PIN = 10;
const int DT_PIN = 9;
const int SW_PIN = 8;

TM1637Display display(DISPLAY_CLK_PIN, DISPLAY_DIO_PIN);

const int MIN_VALUE = 0;
const int MAX_VALUE = 100;
const int STEPS_PER_CLICK = 4;  // most KY-040 knobs; try 2 if one click moves by half
const bool REVERSE = false;     // set to true if turning right counts down

uint8_t lastState = 0;

int value = 50;
int stepBuffer = 0;
bool lastButton = HIGH;
unsigned long lastButtonChange = 0;
String line;

// Reads CLK and DT. The table turns the pattern of the two signals into
// "one step left" (-1), "one step right" (+1) or "no step" (0).
int8_t readEncoder() {
  static const int8_t table[16] = {0, -1, 1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, -1, 0};
  uint8_t state = (digitalRead(CLK_PIN) << 1) | digitalRead(DT_PIN);
  lastState = ((lastState << 2) | state) & 0x0F;
  return table[lastState];
}

void report() {
  display.showNumberDec(value);
  Serial.print("VALUE ");
  Serial.println(value);
}

void setValue(int newValue) {
  value = constrain(newValue, MIN_VALUE, MAX_VALUE);
  report();
}

void handleLine(String text) {
  text.trim();
  if (text == "GET") {
    report();
  } else if (text.startsWith("SET ")) {
    String number = text.substring(4);
    number.trim();
    if (number.length() == 0) {
      Serial.println("ERROR: send SET <number>");
      return;
    }
    for (unsigned int i = 0; i < number.length(); i++) {
      if (!isDigit(number[i])) {
        Serial.println("ERROR: send SET <number>");
        return;
      }
    }
    setValue(number.toInt());
  } else if (text.length() > 0) {
    Serial.println("ERROR: send SET <number> or GET");
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(CLK_PIN, INPUT_PULLUP);
  pinMode(DT_PIN, INPUT_PULLUP);
  pinMode(SW_PIN, INPUT_PULLUP);
  lastState = (digitalRead(CLK_PIN) << 1) | digitalRead(DT_PIN);
  display.setBrightness(5);
  report();
}

void loop() {
  // Knob: collect steps, and count one full click as one value change.
  int8_t steps = readEncoder();
  stepBuffer += REVERSE ? -steps : steps;
  if (stepBuffer >= STEPS_PER_CLICK || stepBuffer <= -STEPS_PER_CLICK) {
    int clicks = stepBuffer / STEPS_PER_CLICK;
    stepBuffer -= clicks * STEPS_PER_CLICK;
    int newValue = constrain(value + clicks, MIN_VALUE, MAX_VALUE);
    if (newValue != value) {
      setValue(newValue);
    }
  }

  // Button: report a press, ignoring the bouncing of the contact.
  bool button = digitalRead(SW_PIN);
  if (button != lastButton && millis() - lastButtonChange > 30) {
    lastButtonChange = millis();
    lastButton = button;
    if (button == LOW) {
      Serial.println("PRESS");
    }
  }

  // Commands from the Pi.
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      handleLine(line);
      line = "";
    } else if (c != '\r' && line.length() < 20) {
      line += c;
    }
  }
}
