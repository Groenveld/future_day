# Project 1: His own website

**Zukunftstag project 1 of 4 · about 30 minutes · warm-up**

He builds his own web page, and Terraform puts it on the internet in an S3 bucket. He opens it on his phone. Then he runs `terraform destroy` to make it disappear and `terraform apply` to bring it back.

**The idea:** code can create infrastructure.

## The page

The page is a React app made with Vite. It starts from the Vite React template and is built up following the book *The Road to React*, up to the section "Props Handling (Advanced)".

```
npm install
npm run dev      # open http://localhost:5173
npm run build    # writes the finished site to dist/
```

## Putting it online

The site lives at **https://wikiverity.groenveld.ch**. It is set up in two parts.

### 1. The permanent part: `infra/` (set up once, already done)

`infra/main.tf` creates everything that stays:

- a private S3 bucket, `wikiverity-<account number>`, that only CloudFront may read
- an HTTPS certificate for `wikiverity.groenveld.ch` (AWS Certificate Manager, checked through DNS)
- a CloudFront distribution that serves the bucket over HTTPS (`http://` is redirected to `https://`)
- DNS records in the `groenveld.ch` Route 53 zone pointing `wikiverity.groenveld.ch` at CloudFront

```
cd infra
terraform init
terraform apply      # takes 5-15 minutes because of CloudFront
```

Leave this running. Creating or deleting CloudFront is slow, which would spoil the demo.

### 2. The demo part: `main.tf`

`main.tf` only uploads the contents of `dist/` into that bucket. This is the part he runs:

```
npm run build
terraform init
terraform apply      # the site appears
terraform destroy    # the site is gone (the files are deleted)
terraform apply      # and it's back
```

Each step takes a few seconds, and the address never changes, so he just reloads the page on his phone. CloudFront caching is switched off, so changes show up right away.

Always run `npm run build` first. Without a `dist/` folder, Terraform uploads nothing and the page stays empty.

### Taking it all down after the Zukunftstag

```
terraform destroy              # the website files
cd infra && terraform destroy  # bucket, CloudFront, certificate, DNS name
```

Region: `eu-central-1` (the certificate is in `us-east-1`, because CloudFront requires that).
