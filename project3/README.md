# Project 3: "What does the AI see?" camera

**Zukunftstag project 3 of 4 · 1–2 hours · the main build**

The Raspberry Pi takes a photo and uploads it to S3. The upload triggers a Lambda function, which sends the photo to Amazon Rekognition. The labels Rekognition finds show up on the Pi and next to the photo in a web gallery.

Then comes the fun part: he tries to fool the AI with odd objects, unusual angles or disguises (see `MISSIONS.md`).

**The idea:** AI services are building blocks you can plug together, and they can be wrong.

## How it fits together

```
Pi camera ──photo──▶ S3 bucket ──triggers──▶ Lambda ──▶ Rekognition
   ▲                    │                       │       (labels, faces, text)
   │                    │                       ▼
   └──── answer ────────┴──────────── results/*.json ──▶ web gallery
                                                         https://ai-camera.groenveld.ch
```

| File | What it is |
|---|---|
| `main.tf` | Bucket, Lambda, S3 trigger, gallery (CloudFront + HTTPS + password), the Pi's AWS key |
| `lambda/analyze.py` | Runs for every new photo: asks Rekognition for labels, faces and text, saves the results |
| `gallery/index.html` | The gallery page; checks for new photos every 3 seconds |
| `pi/camera.py` | On the Pi: press Enter → 3-2-1 → photo → upload → shows what the AI sees |
| `pi/install-on-pi.sh` | Run on the Mac: installs everything on the Pi and gives it its key |
| `arduino/shake-trigger/` | Arduino sketch: the Nano 33 BLE Sense's gyroscope sends `SHAKE` over USB |
| `MISSIONS.md` | Nine missions, from "say hello" to "fool the AI" and "shake to shoot" |

## Setting it up

```
terraform init
terraform apply                 # the first time ~5-15 min (CloudFront)
./pi/install-on-pi.sh           # installs the camera program on the Pi (uses `ssh pi`)
terraform output gallery_login  # username / password for the gallery
```

On the Pi:

```
cd ~/ai-camera
python3 camera.py               # press Enter to take a photo
python3 camera.py --speak       # ... and hear the answer (needs HDMI sound or a USB speaker)
python3 camera.py some.jpg      # send an existing photo
python3 camera.py --shake       # shake the Arduino to take a photo
python3 camera.py --burst 10    # 10 photos, one per second (ffmpeg keeps the camera open)
```

## The Arduino shake trigger

The Nano 33 BLE Sense is plugged into the Pi by USB (`/dev/ttyACM0`). It sends
`G <speed>` ten times a second and `SHAKE <speed>` when it turns faster than
300 °/s. The green LED means the gyroscope is ready; the orange one flashes on a shake.

**This board is a Rev1** (LSM9DS1 chip at I2C `0x6B`/`0x1E`), so it needs the
`-DUSE_LSM9DS1` flag. A Rev2 (BMI270) compiles without it. Careful: the Rev2
library reports success on a Rev1 board and then only reads zeros.

`arduino-cli` is in `~/bin` on the Pi. To change the sketch and upload it again:

```
scp -r arduino/shake-trigger pi:ai-camera/arduino/
ssh pi
cd ~/ai-camera/arduino
~/bin/arduino-cli compile -b arduino:mbed_nano:nano33ble \
  --build-property "compiler.cpp.extra_flags=-DUSE_LSM9DS1" \
  -u -p /dev/ttyACM0 shake-trigger
```

## Good to know

- **Privacy:** the bucket is private. The gallery asks for a username and password
  (a CloudFront Function checks it). Photos are deleted automatically after 30 days,
  and `terraform destroy` deletes everything at once.
- **The Pi's key** (IAM user `ai-camera-pi`) can only upload to `photos/`, read
  `results/` and use Polly. Nothing else. It lives in `~/.aws/credentials` on the Pi
  under the profile `[ai-camera]`.
- **Cost:** Rekognition is about 0.001 USD per call and each photo makes 3 calls,
  so 100 photos ≈ 0.30 USD. Lambda, S3, CloudFront and Polly are cents.
- **Debugging the Lambda:** `aws logs tail /aws/lambda/ai-camera-analyze --follow --region eu-central-1`
- **Faces:** Rekognition guesses age range and emotion. It doesn't recognize *who*
  someone is, and nothing is stored outside this bucket.
