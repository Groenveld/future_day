// Shake trigger for the AI camera.
// The gyroscope measures how fast the Arduino turns (in degrees per second).
// Twist or shake it fast enough and it tells the Raspberry Pi: SHAKE!
//
// Over USB it sends lines like:
//   G 12        how fast it is turning right now (10 times per second)
//   SHAKE 412   fast enough: take a photo!
//
// Nano 33 BLE Sense Rev2 (BMI270 chip): compile normally.
// Nano 33 BLE Sense Rev1 (LSM9DS1 chip): compile with -DUSE_LSM9DS1.

#if defined(USE_LSM9DS1)
#include <Arduino_LSM9DS1.h>
#else
#include <Arduino_BMI270_BMM150.h>
#endif

const float SHAKE_SPEED = 300.0;          // degrees per second. Higher = you must shake harder
const unsigned long WAIT_AFTER_SHAKE = 2000; // ms before the next shake counts

unsigned long lastShake = 0;
unsigned long lastReport = 0;
float fastest = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(LEDG, OUTPUT);
  digitalWrite(LEDG, HIGH);  // the RGB LED is on when the pin is LOW

  if (!IMU.begin()) {
    while (true) {  // no gyroscope found: blink fast and complain
      Serial.println("ERROR no gyroscope");
      digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
      delay(200);
    }
  }
  digitalWrite(LEDG, LOW);  // green = ready
  Serial.println("READY");
}

void loop() {
  if (IMU.gyroscopeAvailable()) {
    float x, y, z;
    IMU.readGyroscope(x, y, z);
    float speed = sqrt(x * x + y * y + z * z);
    if (speed > fastest) fastest = speed;

    if (speed > SHAKE_SPEED && millis() - lastShake > WAIT_AFTER_SHAKE) {
      lastShake = millis();
      Serial.print("SHAKE ");
      Serial.println(speed, 0);
      digitalWrite(LED_BUILTIN, HIGH);
    }
  }

  if (millis() - lastShake > 300) {
    digitalWrite(LED_BUILTIN, LOW);
  }

  if (millis() - lastReport >= 100) {
    lastReport = millis();
    Serial.print("G ");
    Serial.println(fastest, 0);
    fastest = 0;
  }
}
