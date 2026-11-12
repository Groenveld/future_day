#!/bin/bash
# Run this on the Mac (in project3/) after `terraform apply`.
# It installs the camera program on the Raspberry Pi and gives the Pi its own AWS key.
#   ./pi/install-on-pi.sh          (uses `ssh pi`)
#   ./pi/install-on-pi.sh mypi     (any other ssh name)
set -euo pipefail
cd "$(dirname "$0")/.."
PI=${1:-pi}

echo "== Reading the Terraform outputs"
BUCKET=$(terraform output -raw bucket)
REGION=$(terraform output -raw region)
GALLERY=$(terraform output -raw gallery_url)
KEY_ID=$(terraform output -raw pi_access_key_id)
SECRET=$(terraform output -raw pi_secret_access_key)

echo "== Installing fswebcam + ffmpeg (camera), boto3 (AWS), pyserial (Arduino) and mpg123 (sound) on the Pi"
ssh "$PI" 'sudo apt-get update -qq && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq fswebcam ffmpeg python3-boto3 python3-serial mpg123 >/dev/null'

echo "== Copying the camera program"
ssh "$PI" 'mkdir -p ~/ai-camera'
scp -q pi/camera.py "$PI":ai-camera/camera.py
printf '{"bucket": "%s", "region": "%s", "gallery_url": "%s"}\n' "$BUCKET" "$REGION" "$GALLERY" \
  | ssh "$PI" 'cat > ~/ai-camera/config.json'

echo "== Giving the Pi its own key (profile [ai-camera] in ~/.aws/credentials)"
# The secret goes through stdin, so it never shows up in a command line
printf '%s\n%s\n' "$KEY_ID" "$SECRET" | ssh "$PI" 'python3 -c "
import configparser, os, sys
key_id, secret = sys.stdin.read().split()
os.makedirs(os.path.expanduser(\"~/.aws\"), mode=0o700, exist_ok=True)
path = os.path.expanduser(\"~/.aws/credentials\")
config = configparser.ConfigParser()
config.read(path)
config[\"ai-camera\"] = {\"aws_access_key_id\": key_id, \"aws_secret_access_key\": secret}
with open(os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), \"w\") as f:
    config.write(f)
"'

echo
echo "Done! On the Pi, run:"
echo "    cd ~/ai-camera && python3 camera.py"
echo "Gallery: $GALLERY   (login: $(terraform output -raw gallery_login))"
