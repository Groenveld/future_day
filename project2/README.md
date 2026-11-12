# Project 2: His own Minecraft server

**Zukunftstag project 2 of 4 · about 45 minutes · the fun part**

Terraform starts a computer (EC2) in Frankfurt, installs a Minecraft **Java
Edition** server on it and gives it the address **minecraft.groenveld.ch**.
He connects with Minecraft, then changes settings such as the game mode or the
world seed and redeploys.

**The idea:** a server is just a computer somewhere else, and code can set it up.

## What's in it

| File | What it is |
|---|---|
| `settings.auto.tfvars` | **The file he edits:** game mode, difficulty, seed, world type, players… |
| `MISSIONS.md` | Seven missions for him to work through |
| `main.tf` | The Terraform code (computer, firewall, fixed IP, DNS name) |
| `install-minecraft.sh.tftpl` | The script that installs Java + Minecraft when the computer boots |
| `is-it-ready.sh` | Pings the server every 10 seconds until it answers like the Minecraft server list does |

## Running it

```
terraform init
terraform apply      # starts the server (about 1 min) and prints the address
./is-it-ready.sh     # waits until Minecraft is installed and the world is built (about 3 min)
# edit settings.auto.tfvars, then:
terraform apply      # replaces the server with a new one with the new settings
terraform destroy    # shuts it down at the end, so it stops costing money
```

In Minecraft: **Multiplayer → Add Server → `minecraft.groenveld.ch`**.

## Before the day

- **Put his Minecraft name** in `players` and `operators` in `settings.auto.tfvars`.
  With empty lists, anybody on the internet who finds the server can join.
- **Same version:** the server installs the newest Minecraft release (26.3 on
  2026-11-12). If his launcher plays an older version, set `minecraft_version`
  in `settings.auto.tfvars`, e.g. `minecraft_version = "1.21.4"`.
- **Do a test run** (apply, join, destroy) so nothing surprises you on the day.
- Starting the server means accepting the [Minecraft EULA](https://aka.ms/MinecraftEULA)
  (the install script writes `eula=true`).

## Good to know

- **Every apply with changed settings = a new world.** `user_data_replace_on_change`
  replaces the instance. The fixed IP (Elastic IP) and DNS name stay the same,
  so the server list entry in Minecraft keeps working.
- **Cost:** t4g.medium ≈ 0.04 USD/h, plus the Elastic IP ≈ 0.005 USD/h and
  16 GB disk. A whole day is well under 1 USD. `terraform destroy` stops it all.
- **Looking inside the server:** no SSH. Use Session Manager:
  `aws ssm start-session --target $(terraform output -raw instance_id)`
  (needs the Session Manager plugin), then
  `sudo tail -f /var/log/cloud-init-output.log` or `sudo journalctl -u minecraft -f`.
  Without the plugin: `aws ec2 get-console-output --instance-id $(terraform output -raw instance_id) --latest`.
