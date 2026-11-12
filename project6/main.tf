# Cloud knob: a knob on an Arduino, synced with AWS IoT Core and a web page.
#
#   knob --USB--> Pi (knob-bridge.py) --MQTT--> IoT Core device shadow <-- Lambda <-- web page
#                                                                            https://knob.groenveld.ch
#
# terraform apply    -> builds everything (CloudFront takes 5-15 minutes the first time)
# terraform destroy  -> deletes everything again

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

variable "domain" {
  type    = string
  default = "knob.groenveld.ch"
}

variable "zone_name" {
  type    = string
  default = "groenveld.ch"
}

variable "thing_name" {
  type    = string
  default = "cloud-knob"
}

data "aws_caller_identity" "me" {}
data "aws_region" "current" {}

data "aws_route53_zone" "main" {
  name         = var.zone_name
  private_zone = false
}

data "aws_iot_endpoint" "data" {
  endpoint_type = "iot:Data-ATS"
}

locals {
  thing_arn  = "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.me.account_id}:thing/${var.thing_name}"
  topic_arn  = "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.me.account_id}:topic/$aws/things/${var.thing_name}/shadow"
  filter_arn = "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.me.account_id}:topicfilter/$aws/things/${var.thing_name}/shadow"
}

# ======================================================================
#  1. The device in IoT Core: a thing, its certificate and what it may do
# ======================================================================

resource "aws_iot_thing" "knob" {
  name = var.thing_name
}

# The "passport" of the Pi: whoever has this certificate + key is the knob
resource "aws_iot_certificate" "knob" {
  active = true
}

# The knob may ONLY connect as itself and talk about its own shadow
resource "aws_iot_policy" "knob" {
  name = "${var.thing_name}-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "iot:Connect"
        Resource = "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.me.account_id}:client/${var.thing_name}"
      },
      {
        Effect   = "Allow"
        Action   = ["iot:Publish", "iot:Receive"]
        Resource = "${local.topic_arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = "iot:Subscribe"
        Resource = "${local.filter_arn}/*"
      },
    ]
  })
}

resource "aws_iot_policy_attachment" "knob" {
  policy = aws_iot_policy.knob.name
  target = aws_iot_certificate.knob.arn
}

resource "aws_iot_thing_principal_attachment" "knob" {
  thing     = aws_iot_thing.knob.name
  principal = aws_iot_certificate.knob.arn
}

# The certificate files for the Pi (kept out of git by .gitignore)
resource "local_sensitive_file" "certificate" {
  content         = aws_iot_certificate.knob.certificate_pem
  filename        = "${path.module}/certs/knob.cert.pem"
  file_permission = "0600"
}

resource "local_sensitive_file" "private_key" {
  content         = aws_iot_certificate.knob.private_key
  filename        = "${path.module}/certs/knob.private.key"
  file_permission = "0600"
}

resource "local_file" "bridge_config" {
  filename = "${path.module}/certs/knob-config.json"
  content = jsonencode({
    endpoint   = data.aws_iot_endpoint.data.endpoint_address
    thing_name = var.thing_name
  })
}

# ======================================================================
#  2. The Lambda behind the web page: read the shadow / set "desired"
# ======================================================================

data "archive_file" "api" {
  type        = "zip"
  source_file = "${path.module}/lambda/api.py"
  output_path = "${path.module}/.build/api.zip"
}

resource "aws_iam_role" "api" {
  name = "${var.thing_name}-api"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "api_logs" {
  role       = aws_iam_role.api.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "api" {
  name = "${var.thing_name}-api"
  role = aws_iam_role.api.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["iot:GetThingShadow", "iot:UpdateThingShadow"]
      Resource = local.thing_arn
    }]
  })
}

resource "aws_lambda_function" "api" {
  function_name    = "${var.thing_name}-api"
  role             = aws_iam_role.api.arn
  runtime          = "python3.13"
  architectures    = ["arm64"]
  handler          = "api.handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      THING_NAME   = var.thing_name
      IOT_ENDPOINT = "https://${data.aws_iot_endpoint.data.endpoint_address}"
    }
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 7
}

# Only CloudFront may call this URL (it signs every request)
resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "AWS_IAM"
}

resource "aws_lambda_permission" "cloudfront_url" {
  statement_id  = "cloudfront-url"
  action        = "lambda:InvokeFunctionUrl"
  function_name = aws_lambda_function.api.function_name
  principal     = "cloudfront.amazonaws.com"
  source_arn    = aws_cloudfront_distribution.knob.arn
}

resource "aws_lambda_permission" "cloudfront_invoke" {
  statement_id  = "cloudfront-invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "cloudfront.amazonaws.com"
  source_arn    = aws_cloudfront_distribution.knob.arn
}

# ======================================================================
#  3. The web page: https://knob.groenveld.ch (with a password)
# ======================================================================

resource "aws_s3_bucket" "page" {
  bucket        = "cloud-knob-${data.aws_caller_identity.me.account_id}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "page" {
  bucket                  = aws_s3_bucket.page.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "cloudfront_only" {
  bucket = aws_s3_bucket.page.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.page.arn}/*"
      Condition = {
        StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.knob.arn }
      }
    }]
  })
  depends_on = [aws_s3_bucket_public_access_block.page]
}

resource "aws_s3_object" "page" {
  bucket        = aws_s3_bucket.page.id
  key           = "index.html"
  source        = "${path.module}/web/index.html"
  etag          = filemd5("${path.module}/web/index.html")
  content_type  = "text/html; charset=utf-8"
  cache_control = "no-cache"
}

resource "random_password" "page" {
  length  = 8
  special = false
  upper   = false
}

locals {
  page_user = "knob"
}

resource "aws_acm_certificate" "knob" {
  provider          = aws.us_east_1
  domain_name       = var.domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for o in aws_acm_certificate.knob.domain_validation_options : o.domain_name => o
  }
  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 300
}

resource "aws_acm_certificate_validation" "knob" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.knob.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "${var.thing_name}-s3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_control" "lambda" {
  name                              = "${var.thing_name}-lambda"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "no_cache" {
  name = "Managed-CachingDisabled"
}

# Sends the browser's query string and headers on to the Lambda, but not the Host header
data "aws_cloudfront_origin_request_policy" "all_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_function" "password" {
  name    = "${var.thing_name}-password"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-JS
    function handler(event) {
      var auth = event.request.headers.authorization;
      if (auth && auth.value === "Basic ${base64encode("${local.page_user}:${random_password.page.result}")}") {
        return event.request;
      }
      return {
        statusCode: 401,
        statusDescription: "Unauthorized",
        headers: { "www-authenticate": { value: 'Basic realm="Cloud knob"' } }
      };
    }
  JS
}

resource "aws_cloudfront_distribution" "knob" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Cloud knob"
  default_root_object = "index.html"
  aliases             = [var.domain]
  price_class         = "PriceClass_100"

  origin {
    origin_id                = "page"
    domain_name              = aws_s3_bucket.page.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  origin {
    origin_id                = "api"
    domain_name              = replace(replace(aws_lambda_function_url.api.function_url, "https://", ""), "/", "")
    origin_access_control_id = aws_cloudfront_origin_access_control.lambda.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "page"
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

  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = "api"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = data.aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_except_host.id

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
    acm_certificate_arn      = aws_acm_certificate_validation.knob.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "knob" {
  for_each = toset(["A", "AAAA"])
  zone_id  = data.aws_route53_zone.main.zone_id
  name     = var.domain
  type     = each.key

  alias {
    name                   = aws_cloudfront_distribution.knob.domain_name
    zone_id                = aws_cloudfront_distribution.knob.hosted_zone_id
    evaluate_target_health = false
  }
}

# ======================================================================
#  What gets printed at the end
# ======================================================================

output "page_url" {
  value = "https://${var.domain}"
}

output "page_login" {
  description = "Username / password for the web page"
  value       = "${local.page_user} / ${nonsensitive(random_password.page.result)}"
}

output "iot_endpoint" {
  value = data.aws_iot_endpoint.data.endpoint_address
}

output "thing_name" {
  value = aws_iot_thing.knob.name
}
