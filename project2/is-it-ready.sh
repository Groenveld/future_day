#!/bin/bash
# Asks the Minecraft server "are you there?" every 10 seconds, like the game does
# in the server list, and stops as soon as it answers.
#   ./is-it-ready.sh                (uses the address from terraform output)
#   ./is-it-ready.sh 1.2.3.4        (or any address you give it)

cd "$(dirname "$0")"
ADDRESS=${1:-$(terraform output -raw server_address 2>/dev/null)}
if [ -z "$ADDRESS" ]; then
  echo "No server yet. Run: terraform apply"
  exit 1
fi

echo "Waiting for $ADDRESS ..."
until python3 - "$ADDRESS" <<'PYTHON_END'
import json, socket, struct, sys

def varint(n):
    out = b""
    while True:
        byte = n & 0x7F
        n >>= 7
        out += bytes([byte | (0x80 if n else 0)])
        if not n:
            return out

def read_varint(s):
    n = shift = 0
    while True:
        byte = s.recv(1)
        if not byte:
            raise ConnectionError("closed")
        n |= (byte[0] & 0x7F) << shift
        shift += 7
        if not byte[0] & 0x80:
            return n

host = sys.argv[1]
try:
    s = socket.create_connection((host, 25565), timeout=5)
    data = varint(0) + varint(-1 & 0xFFFFFFFF) + varint(len(host)) + host.encode() + struct.pack(">H", 25565) + varint(1)
    s.sendall(varint(len(data)) + data + b"\x01\x00")  # handshake + status request
    read_varint(s); read_varint(s)
    length = read_varint(s)
    raw = b""
    while len(raw) < length:
        chunk = s.recv(length - len(raw))
        if not chunk:
            raise ConnectionError("closed")
        raw += chunk
    status = json.loads(raw)
except Exception:
    sys.exit(1)

motd = status.get("description", "")
if isinstance(motd, dict):
    motd = motd.get("text", "")
print(f"\n✅ The server is ready!")
print(f"   Address: {host}")
print(f"   Version: Minecraft {status['version']['name']}  (your game needs the same version)")
print(f"   Players: {status['players']['online']}/{status['players']['max']}")
print(f"   Message: {motd}")
PYTHON_END
do
  echo "$(date +%H:%M:%S)  not ready yet..."
  sleep 10
done
