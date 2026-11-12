"""The web page's helper: reads the knob's device shadow and sets a new value.

  GET  /api/knob             -> {"value": 42, "desired": null, "pressed": ..., "updated": ...}
  POST /api/knob?value=70    -> asks the knob to go to 70 (sets "desired")
"""

import json
import os

import boto3

THING = os.environ["THING_NAME"]
iot = boto3.client("iot-data", endpoint_url=os.environ["IOT_ENDPOINT"])


def answer(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json", "Cache-Control": "no-store"},
        "body": json.dumps(body),
    }


def read_shadow():
    try:
        shadow = json.loads(iot.get_thing_shadow(thingName=THING)["payload"].read())
    except iot.exceptions.ResourceNotFoundException:
        return {"value": None, "desired": None, "pressed": None, "updated": None}
    state = shadow.get("state", {})
    reported = state.get("reported", {})
    meta = shadow.get("metadata", {}).get("reported", {}).get("value", {})
    return {
        "value": reported.get("value"),
        "desired": state.get("desired", {}).get("value"),
        "pressed": reported.get("pressed"),
        "online": reported.get("online"),
        "updated": meta.get("timestamp"),
    }


def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    if method == "GET":
        return answer(200, read_shadow())

    if method == "POST":
        raw = (event.get("queryStringParameters") or {}).get("value", "")
        if not raw.isdigit() or not 0 <= int(raw) <= 100:
            return answer(400, {"error": "value must be a number from 0 to 100"})
        iot.update_thing_shadow(
            thingName=THING,
            payload=json.dumps({"state": {"desired": {"value": int(raw)}}}).encode(),
        )
        return answer(200, read_shadow())

    return answer(405, {"error": "use GET or POST"})
