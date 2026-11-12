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

# Bucket names must be unique worldwide, so we add the AWS account number.
# It stays the same, so the address is the same again after destroy + apply.
data "aws_caller_identity" "me" {}

resource "aws_s3_bucket" "site" {
  bucket        = "zukunftstag-${data.aws_caller_identity.me.account_id}"
  force_destroy = true # lets `terraform destroy` delete it even with files inside
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

# Allow everyone on the internet to read the page.
resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket     = aws_s3_bucket.site.id
  depends_on = [aws_s3_bucket_public_access_block.site]
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.site.arn}/*"
    }]
  })
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
  }
}

resource "aws_s3_object" "files" {
  for_each     = fileset(local.site_path, "**")
  bucket       = aws_s3_bucket.site.id
  key          = each.value
  source       = "${local.site_path}/${each.value}"
  etag         = filemd5("${local.site_path}/${each.value}")
  content_type = lookup(local.mime_types, lower(element(split(".", each.value), length(split(".", each.value)) - 1)), "application/octet-stream")
}

output "website_url" {
  description = "Open this on your phone!"
  value       = "http://${aws_s3_bucket_website_configuration.site.website_endpoint}"
}
