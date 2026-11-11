# Project 4: Room guardian

**Zukunftstag project 4 of 4 · 2+ hours · stretch goal, only if there's time**

An Arduino Nano 33 BLE Sense notices movement or a wave. The Raspberry Pi then takes a photo, and AWS emails it to him through SNS.

**The idea:** small sensors, a small computer and the cloud can work together.

## How it fits together

The Arduino has no Wi-Fi, so it talks to the Pi over USB or Bluetooth, and the Pi talks to AWS.

```
Arduino Nano 33 BLE Sense ──USB / Bluetooth──▶ Pi ──photo──▶ AWS ──SNS──▶ email
     (movement or wave)                      (camera)
```

## To do

- Arduino sketch that detects movement or a wave and tells the Pi
- Pi script that listens to the Arduino, takes a photo and sends it to AWS
- Terraform for the AWS side (S3 for the photo, SNS topic, email subscription)
