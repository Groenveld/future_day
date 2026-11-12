"""A new photo arrived in photos/ -> ask Rekognition what it sees -> save the answer.

Writes:
  results/<photo name>.json   everything the AI found in this one photo
  results/index.json          the newest photos with their results, for the gallery
"""

import json
import os
import random
import time
import urllib.parse
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

BUCKET = os.environ["BUCKET"]
INDEX_KEY = "results/index.json"
KEEP_IN_GALLERY = 60

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition")

FEELINGS = {
    "HAPPY": "happy",
    "SAD": "sad",
    "ANGRY": "angry",
    "CONFUSED": "confused",
    "DISGUSTED": "disgusted",
    "SURPRISED": "surprised",
    "CALM": "calm",
    "FEAR": "scared",
}


def handler(event, context):
    for record in event["Records"]:
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])
        print(f"New photo: {key}")
        result = analyze(key)
        name = key.split("/", 1)[1].rsplit(".", 1)[0]
        put_json(f"results/{name}.json", result)
        add_to_index(result)
        print(result["sentence"])


def analyze(key):
    image = {"S3Object": {"Bucket": BUCKET, "Name": key}}

    labels = rekognition.detect_labels(Image=image, MaxLabels=12, MinConfidence=55)["Labels"]
    faces = rekognition.detect_faces(Image=image, Attributes=["ALL"])["FaceDetails"]
    texts = rekognition.detect_text(Image=image)["TextDetections"]

    result = {
        "photo": key,
        "time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "labels": [
            {"name": label["Name"], "confidence": round(label["Confidence"], 1)}
            for label in labels
        ],
        "faces": [describe_face(face) for face in faces],
        "text": [
            t["DetectedText"]
            for t in texts
            if t["Type"] == "LINE" and t["Confidence"] > 80
        ],
    }
    result["sentence"] = make_sentence(result)
    return result


def describe_face(face):
    emotion = max(face["Emotions"], key=lambda e: e["Confidence"])
    return {
        "age_low": face["AgeRange"]["Low"],
        "age_high": face["AgeRange"]["High"],
        "feeling": FEELINGS.get(emotion["Type"], emotion["Type"].lower()),
        "feeling_confidence": round(emotion["Confidence"], 1),
        "smiling": face["Smile"]["Value"],
        "glasses": face["Eyeglasses"]["Value"],
        "sunglasses": face["Sunglasses"]["Value"],
        "beard": face["Beard"]["Value"],
        "mustache": face["Mustache"]["Value"],
        "eyes_open": face["EyesOpen"]["Value"],
        "mouth_open": face["MouthOpen"]["Value"],
    }


def make_sentence(result):
    names = [label["name"] for label in result["labels"][:4]]
    if not names:
        parts = ["Hmm, I have no idea what this is!"]
    elif len(names) == 1:
        parts = [f"I see: {names[0]}."]
    else:
        parts = [f"I see: {', '.join(names[:-1])} and {names[-1]}."]

    faces = result["faces"]
    if len(faces) == 1:
        face = faces[0]
        parts.append(
            f"There is a face. I think this person is {face['age_low']} to "
            f"{face['age_high']} years old and looks {face['feeling']}."
        )
        if face["sunglasses"]:
            parts.append("Cool sunglasses!")
        elif face["glasses"]:
            parts.append("Nice glasses!")
        if face["beard"] or face["mustache"]:
            parts.append("And is that a beard?")
    elif len(faces) > 1:
        parts.append(f"I count {len(faces)} faces.")

    if result["text"]:
        parts.append(f"I can read: {result['text'][0]}.")

    return " ".join(parts)


def put_json(key, data, **conditions):
    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=json.dumps(data, indent=2).encode(),
        ContentType="application/json",
        CacheControl="no-cache",
        **conditions,
    )


def add_to_index(result):
    # Many photos can arrive at the same time. S3 only saves index.json if nobody
    # else changed it since we read it (IfMatch); otherwise we read it again and retry.
    for attempt in range(20):
        try:
            current = s3.get_object(Bucket=BUCKET, Key=INDEX_KEY)
            index = json.loads(current["Body"].read())
            condition = {"IfMatch": current["ETag"]}
        except s3.exceptions.NoSuchKey:
            index = []
            condition = {"IfNoneMatch": "*"}

        index = [entry for entry in index if entry["photo"] != result["photo"]]
        index.append(result)
        index.sort(key=lambda entry: entry["photo"], reverse=True)  # newest first

        try:
            put_json(INDEX_KEY, index[:KEEP_IN_GALLERY], **condition)
            return
        except ClientError as error:
            if error.response["Error"]["Code"] not in ("PreconditionFailed", "ConditionalRequestConflict"):
                raise
            time.sleep(random.uniform(0.05, 0.3) * (attempt + 1))
    raise RuntimeError("Could not update index.json")
