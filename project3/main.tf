# "What does the AI see?" camera
#
#   Pi camera --photo--> S3 bucket --triggers--> Lambda --> Rekognition
#                                                   |
#                                                   v
#                                     results --> web gallery (https://ai-camera.groenveld.ch)
#
# terraform apply    -> builds everything (CloudFront takes 5-15 minutes the first time)
# terraform destroy  -> deletes everything again, photos included

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

# CloudFront only accepts certificates from us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

variable "domain" {
  type    = string
  default = "ai-camera.groenveld.ch"
}

variable "zone_name" {
  type    = string
  default = "groenveld.ch"
}

# Photos and results are deleted automatically after this many days
variable "keep_photos_days" {
  type    = number
  default = 30
}

data "aws_caller_identity" "me" {}

data "aws_route53_zone" "main" {
  name         = var.zone_name
  private_zone = false
}

# ======================================================================
#  1. The bucket: photos/ (from the Pi), results/ (from the Lambda), index.html
# ======================================================================

resource "aws_s3_bucket" "camera" {
  bucket        = "ai-camera-${data.aws_caller_identity.me.account_id}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "camera" {
  bucket                  = aws_s3_bucket.camera.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "camera" {
  bucket = aws_s3_bucket.camera.id

  rule {
    id     = "delete-old-photos"
    status = "Enabled"
    filter {
      prefix = "photos/"
    }
    expiration {
      days = var.keep_photos_days
    }
  }

  rule {
    id     = "delete-old-results"
    status = "Enabled"
    filter {
      prefix = "results/photo-"
    }
    expiration {
      days = var.keep_photos_days
    }
  }
}

# Only CloudFront may read the bucket
resource "aws_s3_bucket_policy" "cloudfront_only" {
  bucket = aws_s3_bucket.camera.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.camera.arn}/*"
      Condition = {
        StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.gallery.arn }
      }
    }]
  })
  depends_on = [aws_s3_bucket_public_access_block.camera]
}

# The gallery page
resource "aws_s3_object" "gallery" {
  bucket        = aws_s3_bucket.camera.id
  key           = "index.html"
  source        = "${path.module}/gallery/index.html"
  etag          = filemd5("${path.module}/gallery/index.html")
  content_type  = "text/html; charset=utf-8"
  cache_control = "no-cache"
}

# ======================================================================
#  2. The Lambda: a new photo arrives -> ask Rekognition -> save the results
# ======================================================================

data "archive_file" "analyze" {
  type        = "zip"
  source_file = "${path.module}/lambda/analyze.py"
  output_path = "${path.module}/.build/analyze.zip"
}

resource "aws_iam_role" "analyze" {
  name = "ai-camera-analyze"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "analyze_logs" {
  role       = aws_iam_role.analyze.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "analyze" {
  name = "ai-camera-analyze"
  role = aws_iam_role.analyze.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["rekognition:DetectLabels", "rekognition:DetectFaces", "rekognition:DetectText"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = "s3:GetObject"
        Resource = ["${aws_s3_bucket.camera.arn}/photos/*", "${aws_s3_bucket.camera.arn}/results/*"]
      },
      {
        Effect   = "Allow"
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.camera.arn}/results/*"
      },
      {
        # Lets the Lambda see "file not found" instead of "access denied" for a missing index.json
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.camera.arn
      },
    ]
  })
}

resource "aws_lambda_function" "analyze" {
  function_name    = "ai-camera-analyze"
  role             = aws_iam_role.analyze.arn
  runtime          = "python3.13"
  architectures    = ["arm64"]
  handler          = "analyze.handler"
  filename         = data.archive_file.analyze.output_path
  source_code_hash = data.archive_file.analyze.output_base64sha256
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      BUCKET = aws_s3_bucket.camera.id
    }
  }
}

resource "aws_cloudwatch_log_group" "analyze" {
  name              = "/aws/lambda/${aws_lambda_function.analyze.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_permission" "s3" {
  statement_id   = "s3-new-photo"
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.analyze.function_name
  principal      = "s3.amazonaws.com"
  source_arn     = aws_s3_bucket.camera.arn
  source_account = data.aws_caller_identity.me.account_id
}

resource "aws_s3_bucket_notification" "new_photo" {
  bucket = aws_s3_bucket.camera.id

  dynamic "lambda_function" {
    for_each = [".jpg", ".jpeg", ".png"]
    content {
      lambda_function_arn = aws_lambda_function.analyze.arn
      events              = ["s3:ObjectCreated:*"]
      filter_prefix       = "photos/"
      filter_suffix       = lambda_function.value
    }
  }

  depends_on = [aws_lambda_permission.s3]
}

# ======================================================================
#  3. The gallery website: https://ai-camera.groenveld.ch (with a password)
# ======================================================================

resource "random_password" "gallery" {
  length  = 8
  special = false
  upper   = false
}

locals {
  gallery_user = "camera"
}

resource "aws_acm_certificate" "gallery" {
  provider          = aws.us_east_1
  domain_name       = var.domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for o in aws_acm_certificate.gallery.domain_validation_options : o.domain_name => o
  }
  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 300
}

resource "aws_acm_certificate_validation" "gallery" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.gallery.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

resource "aws_cloudfront_origin_access_control" "camera" {
  name                              = "ai-camera"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "no_cache" {
  name = "Managed-CachingDisabled"
}

# Asks for a username and password before showing anything (the photos are private!)
resource "aws_cloudfront_function" "password" {
  name    = "ai-camera-password"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-JS
    function handler(event) {
      var auth = event.request.headers.authorization;
      if (auth && auth.value === "Basic ${base64encode("${local.gallery_user}:${random_password.gallery.result}")}") {
        return event.request;
      }
      return {
        statusCode: 401,
        statusDescription: "Unauthorized",
        headers: { "www-authenticate": { value: 'Basic realm="AI camera"' } }
      };
    }
  JS
}

resource "aws_cloudfront_distribution" "gallery" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "What does the AI see?"
  default_root_object = "index.html"
  aliases             = [var.domain]
  price_class         = "PriceClass_100"

  origin {
    origin_id                = "s3"
    domain_name              = aws_s3_bucket.camera.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.camera.id
  }

  default_cache_behavior {
    target_origin_id       = "s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.no_cache.id
    compress               = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.password.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.gallery.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "gallery" {
  for_each = toset(["A", "AAAA"])
  zone_id  = data.aws_route53_zone.main.zone_id
  name     = var.domain
  type     = each.key

  alias {
    name                   = aws_cloudfront_distribution.gallery.domain_name
    zone_id                = aws_cloudfront_distribution.gallery.hosted_zone_id
    evaluate_target_health = false
  }
}

# ======================================================================
#  4. A key for the Raspberry Pi: it may ONLY upload photos, read results and talk
# ======================================================================

resource "aws_iam_user" "pi" {
  name = "ai-camera-pi"
}

resource "aws_iam_user_policy" "pi" {
  name = "ai-camera-pi"
  user = aws_iam_user.pi.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.camera.arn}/photos/*"
      },
      {
        Effect   = "Allow"
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.camera.arn}/results/*"
      },
      {
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.camera.arn
      },
      {
        Effect   = "Allow"
        Action   = "polly:SynthesizeSpeech"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_access_key" "pi" {
  user = aws_iam_user.pi.name
}

# ======================================================================
#  What gets printed at the end
# ======================================================================

output "gallery_url" {
  value = "https://${var.domain}"
}

output "gallery_login" {
  description = "Username / password for the gallery"
  value       = "${local.gallery_user} / ${nonsensitive(random_password.gallery.result)}"
}

output "bucket" {
  value = aws_s3_bucket.camera.id
}

output "region" {
  value = "eu-central-1"
}

output "pi_access_key_id" {
  value = aws_iam_access_key.pi.id
}

output "pi_secret_access_key" {
  value     = aws_iam_access_key.pi.secret
  sensitive = true
}
