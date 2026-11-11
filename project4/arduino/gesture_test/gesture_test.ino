// Gesture test for the Arduino Nano 33 BLE Sense.
// Swipe a hand over the board, about 5-10 cm above it.
// Open the serial monitor at 9600 baud to see UP / DOWN / LEFT / RIGHT.

#include <Arduino_APDS9960.h>

bool sensorOk = false;
bool wasConnected = false;

void setup() {
  Serial.begin(9600);
  sensorOk = APDS.begin();
}

void loop() {
  // Say hello every time a computer opens the serial port.
  bool connected = Serial;
  if (connected && !wasConnected) {
    if (sensorOk) {
      Serial.println("READY: gesture sensor found, wave your hand over the board");
    } else {
      Serial.println("ERROR: gesture sensor not found");
    }
  }
  wasConnected = connected;

  if (sensorOk && APDS.gestureAvailable()) {
    switch (APDS.readGesture()) {
      case GESTURE_UP:    Serial.println("UP");    break;
      case GESTURE_DOWN:  Serial.println("DOWN");  break;
      case GESTURE_LEFT:  Serial.println("LEFT");  break;
      case GESTURE_RIGHT: Serial.println("RIGHT"); break;
      default: break;
    }
  }
}
