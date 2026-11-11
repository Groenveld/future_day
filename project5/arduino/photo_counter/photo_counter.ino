// Photo counter: Arduino + RobotDyn 4-digit TM1637 display.
// Works on an Arduino Uno (5 V) and on the Nano 33 BLE Sense (3.3 V).
//
// The Pi tells the Arduino over USB how many photos have been taken:
//   send "42" + Enter  -> the display shows 42
//   send "+"  + Enter  -> the display counts up by one
//   send "0"  + Enter  -> back to zero
// The Arduino answers with "COUNT 42" so the sender knows it arrived.
//
// Wiring (4 wires):
//   display CLK -> D3
//   display DIO -> D2
//   display VCC -> 5V on the Uno, 3.3V on the Nano 33 BLE (its pins only take 3.3 V)
//   display GND -> GND

#include <TM1637Display.h>

const int CLK_PIN = 3;
const int DIO_PIN = 2;

TM1637Display display(CLK_PIN, DIO_PIN);
long photos = 0;
String line;

void show(long count) {
  photos = constrain(count, 0, 9999);
  display.showNumberDec(photos);
  Serial.print("COUNT ");
  Serial.println(photos);
}

void handleLine(const String &text) {
  if (text == "+") {
    show(photos + 1);
    return;
  }
  if (text.length() == 0) {
    return;
  }
  for (unsigned int i = 0; i < text.length(); i++) {
    if (!isDigit(text[i])) {
      Serial.println("ERROR: send a number or +");
      return;
    }
  }
  show(text.toInt());
}

void setup() {
  Serial.begin(9600);
  display.setBrightness(5);  // 0 (dim) to 7 (bright)
  display.showNumberDec(photos);
}

void loop() {
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
