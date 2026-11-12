# Your own Minecraft server (Java Edition) in AWS.
#   terraform apply    -> starts a computer in Frankfurt and installs the server
#   terraform destroy  -> deletes it again (so it stops costing money)
#
# The settings you are supposed to change are in settings.auto.tfvars.

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1" # Frankfurt, close to Switzerland = less lag
}

# ---------- Settings (change them in settings.auto.tfvars) ----------

variable "server_message" {
  type    = string
  default = "Welcome to my server!"
}

variable "game_mode" {
  type    = string
  default = "survival"
  validation {
    condition     = contains(["survival", "creative", "adventure", "spectator"], var.game_mode)
    error_message = "game_mode must be survival, creative, adventure or spectator."
  }
}

variable "difficulty" {
  type    = string
  default = "normal"
  validation {
    condition     = contains(["peaceful", "easy", "normal", "hard"], var.difficulty)
    error_message = "difficulty must be peaceful, easy, normal or hard."
  }
}

variable "world_seed" {
  type    = string
  default = ""
}

variable "world_type" {
  type    = string
  default = "normal"
  validation {
    condition     = contains(["normal", "flat", "amplified", "large_biomes"], var.world_type)
    error_message = "world_type must be normal, flat, amplified or large_biomes."
  }
}

variable "hardcore" {
  type    = bool
  default = false
}

variable "pvp" {
  type    = bool
  default = true
}

variable "max_players" {
  type    = number
  default = 10
}

variable "players" {
  type    = list(string)
  default = []
}

variable "operators" {
  type    = list(string)
  default = []
}

# ---------- Settings for grown-ups ----------

# "latest" = the newest Minecraft release (what the Minecraft Launcher plays by default).
# The server and the game must have the same version, e.g. "26.3".
variable "minecraft_version" {
  type    = string
  default = "latest"
}

# t4g.medium: 2 CPUs, 4 GB memory, about 0.04 USD per hour
variable "instance_type" {
  type    = string
  default = "t4g.medium"
}

# The server gets this name in your Route 53 zone. Set to "" to only use the IP address.
variable "domain" {
  type    = string
  default = "minecraft.groenveld.ch"
}

variable "zone_name" {
  type    = string
  default = "groenveld.ch"
}

# ---------- The computer ----------

# The newest Amazon Linux for ARM processors (cheaper than Intel)
data "aws_ssm_parameter" "amazon_linux" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

# The firewall: only Minecraft (port 25565) may come in
resource "aws_security_group" "minecraft" {
  name        = "minecraft-server"
  description = "Minecraft Java Edition"

  ingress {
    description = "Minecraft"
    from_port   = 25565
    to_port     = 25565
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description      = "Minecraft (IPv6)"
    from_port        = 25565
    to_port          = 25565
    protocol         = "tcp"
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Lets a grown-up open a terminal on the server without SSH keys:
#   aws ssm start-session --target <instance id>
resource "aws_iam_role" "minecraft" {
  name = "minecraft-server"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.minecraft.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "minecraft" {
  name = "minecraft-server"
  role = aws_iam_role.minecraft.name
}

resource "aws_instance" "minecraft" {
  ami                    = data.aws_ssm_parameter.amazon_linux.value
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.minecraft.id]
  iam_instance_profile   = aws_iam_instance_profile.minecraft.name

  root_block_device {
    volume_size = 16
    volume_type = "gp3"
  }

  # The install script. It runs once, when the computer starts for the first time.
  user_data = templatefile("${path.module}/install-minecraft.sh.tftpl", {
    minecraft_version = var.minecraft_version
    memory_mb         = 3072
    properties = {
      "motd"              = var.server_message
      "gamemode"          = var.game_mode
      "force-gamemode"    = "true"
      "difficulty"        = var.difficulty
      "level-seed"        = var.world_seed
      "level-type"        = "minecraft\\:${var.world_type}"
      "hardcore"          = tostring(var.hardcore)
      "pvp"               = tostring(var.pvp)
      "max-players"       = tostring(var.max_players)
      "white-list"        = tostring(length(concat(var.players, var.operators)) > 0)
      "enforce-whitelist" = tostring(length(concat(var.players, var.operators)) > 0)
      "online-mode"       = "true"
      "spawn-protection"  = "0"
      "view-distance"     = "10"
    }
    players   = distinct(concat(var.players, var.operators))
    operators = var.operators
  })

  # Changed settings = a brand new server
  user_data_replace_on_change = true

  tags = {
    Name = "minecraft-server"
  }
}

# A fixed IP address, so the address stays the same after every apply
resource "aws_eip" "minecraft" {
  domain   = "vpc"
  instance = aws_instance.minecraft.id
  tags = {
    Name = "minecraft-server"
  }
}

# ---------- The name minecraft.groenveld.ch ----------

data "aws_route53_zone" "main" {
  count        = var.domain == "" ? 0 : 1
  name         = var.zone_name
  private_zone = false
}

resource "aws_route53_record" "minecraft" {
  count   = var.domain == "" ? 0 : 1
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = var.domain
  type    = "A"
  ttl     = 60
  records = [aws_eip.minecraft.public_ip]
}

# ---------- What gets printed at the end ----------

output "server_address" {
  description = "Type this into Minecraft: Multiplayer -> Add Server"
  value       = var.domain == "" ? aws_eip.minecraft.public_ip : var.domain
}

output "ip_address" {
  value = aws_eip.minecraft.public_ip
}

output "please_wait" {
  value = "The server needs about 3 minutes to install and build the world. Run ./is-it-ready.sh to see when it is ready."
}

output "instance_id" {
  value = aws_instance.minecraft.id
}
