# Time estimates

How long it takes to build and test each project before the day. This doesn't include the time he spends building on the day.

These estimates assume:

- all the hardware is wired up and works
- there's an AWS account with Terraform set up
- the Pi has internet

| Project | Estimate | What's left to build |
|---|---|---|
| [1. Website](project1/) | **0.5–1 h** | Terraform: S3 bucket, website hosting, public-read policy, uploading `dist/` with the right file types, printing the URL. The React page is already done. |
| [2. Minecraft](project2/) | **0.5 h** if the zip turns up, **3–4 h** if not | With the zip: unpack it, run `apply`, connect, `destroy`. Without it: EC2 instance and security group (port 25565), a startup script that installs Java and the server, settings as variables, writing seven missions. Add 0.5–1 h to translate the missions into German. |
| [3. AI camera](project3/) | **4–6 h**, plus **1–2 h** for Polly | Terraform for S3, the Lambda with its permissions and the upload trigger (~1.5 h). Lambda that calls Rekognition and writes labels as JSON (~1 h). Pi script that takes a C920 photo with `fswebcam` and uploads it with boto3 (~1 h). Gallery page that reads the JSON (~1–2 h). |
| [4. Room guardian](project4/) | **3–4 h** over USB, **+2 h** for Bluetooth | Nano sketch using its built-in gesture/proximity sensor (~1 h). Pi script that listens on serial and takes a photo (~1 h, reusing project 3's upload code). SNS topic and email subscription (~0.5 h). SNS can't attach files, so the email carries a temporary link to the photo (~0.5 h). |
| [5. Photo counter](project5/) | **0.5–1 h** | The Arduino program is done. Add "send `+` over serial" to the photo script and test it end to end. |
| [6. Cloud knob](project6/) | **5–8 h** | IoT thing, certificate and tightly scoped policy in Terraform (~1.5 h). Pi script using the AWS IoT SDK to sync `reported` and `desired` and send `SET` (~2 h). Web page (~2–4 h): this is the hard part, because the browser needs its own login to AWS. Either a Cognito identity pool with an MQTT WebSocket, or a simpler API Gateway + Lambda page that polls. |

**Total: about 14–22 hours**, or 17–26 h if project 2 has to be rebuilt.

## Biggest risks

- **Project 6's web page.** Browser login to IoT Core is the fiddliest part. A polling page with API Gateway + Lambda is safer if time is short.
- **Shared USB ports.** Projects 4, 5 and 6 each use an Arduino on USB. If several run at once, give each a fixed device name on the Pi so the scripts don't mix up ports (~0.5 h).
- **Dry run.** Plan another 1–2 h to run every project once from scratch, including `destroy` then `apply`, so nothing surprises you on the day.

## Suggested order

1 → 5 → 3 → 2 → 4 → 6

Project 5 is nearly free once project 3's photo script exists.
