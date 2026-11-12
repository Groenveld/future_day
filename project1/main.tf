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
  region = "eu-central-1"
}

# The folder with the finished site (made by `npm run build`).
variable "site_dir" {
  type    = string
  default = "dist"
}

# The bucket, HTTPS and the address are set up once in infra/ and always stay.
# This file only puts the website files into that bucket, so:
#   terraform destroy  -> the files are deleted and the website is gone
#   terraform apply    -> the files are uploaded again and the website is back
data "aws_caller_identity" "me" {}

data "aws_s3_bucket" "site" {
  bucket = "wikiverity-${data.aws_caller_identity.me.account_id}"
}

# Upload every file in dist/ with the right content type.
locals {
  site_path = "${path.module}/${var.site_dir}"
  mime_types = {
    html  = "text/html"
    css   = "text/css"
    js    = "text/javascript"
    json  = "application/json"
    svg   = "image/svg+xml"
    png   = "image/png"
    jpg   = "image/jpeg"
    jpeg  = "image/jpeg"
    gif   = "image/gif"
    webp  = "image/webp"
    ico   = "image/x-icon"
    txt   = "text/plain"
    woff  = "font/woff"
    woff2 = "font/woff2"
    mp3   = "audio/mpeg"
    wav   = "audio/wav"
    ogg   = "audio/ogg"
  }
}

resource "aws_s3_object" "files" {
  for_each     = fileset(local.site_path, "**")
  bucket       = data.aws_s3_bucket.site.id
  key          = each.value
  source       = "${local.site_path}/${each.value}"
  etag         = filemd5("${local.site_path}/${each.value}")
  content_type = lookup(local.mime_types, lower(element(split(".", each.value), length(split(".", each.value)) - 1)), "application/octet-stream")
}

output "website_url" {
  description = "Open this on your phone!"
  value       = "https://wikiverity.groenveld.ch"
}
