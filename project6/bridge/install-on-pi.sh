#!/bin/bash
# Run this on the Mac (in project6/) after `terraform apply`.
# Copies the bridge and the knob's certificate to the Raspberry Pi.
#   ./bridge/install-on-pi.sh          (uses `ssh pi`)
set -euo pipefail
cd "$(dirname "$0")/.."
PI=${1:-pi}

echo "== Installing paho-mqtt (cloud) and pyserial (Arduino) on the Pi"
ssh "$PI" 'sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq python3-paho-mqtt python3-serial >/dev/null'

echo "== Copying the bridge and the certificate"
ssh "$PI" 'mkdir -p ~/cloud-knob && chmod 700 ~/cloud-knob'
scp -q bridge/knob-bridge.py bridge/AmazonRootCA1.pem certs/knob-config.json certs/knob.cert.pem certs/knob.private.key "$PI":cloud-knob/
ssh "$PI" 'chmod 600 ~/cloud-knob/knob.private.key'

echo
echo "Done! On the Pi, run:"
echo "    python3 ~/cloud-knob/knob-bridge.py"
echo "Web page: $(terraform output -raw page_url)   (login: $(terraform output -raw page_login))"
