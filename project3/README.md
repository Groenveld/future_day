# Project 3: "What does the AI see?" camera

**Zukunftstag project 3 of 4 · 1–2 hours · the main build**

The Raspberry Pi takes a photo and uploads it to S3. The upload triggers a Lambda function, which sends the photo to Amazon Rekognition. The labels Rekognition finds show up next to the photo in a web gallery.

Then comes the fun part: he tries to fool the AI with odd objects, unusual angles or disguises.

**The idea:** AI services are building blocks you can plug together, and they can be wrong.

## How it fits together

```
Pi camera ──photo──▶ S3 bucket ──triggers──▶ Lambda ──▶ Rekognition
                                               │
                                               ▼
                                         results ──▶ web gallery
```

## Optional extra

Amazon Polly turns the results into speech, so the Pi says out loud what it sees.

## To do

- Terraform for the S3 bucket, Lambda, permissions and gallery
- Lambda code that calls Rekognition and stores the results
- Pi script that takes the photo and uploads it
- gallery page
