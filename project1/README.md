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

`main.tf` does three things:

1. create an S3 bucket set up for static website hosting
2. upload the contents of `dist/`
3. print the website address so he can open it on his phone

```
npm run build
terraform init
terraform apply      # the site appears
terraform destroy    # the site is gone
terraform apply      # and it's back
```

Region: `eu-central-1`. The bucket is named `zukunftstag-<account number>`, so after `destroy` and `apply` the page is back at the **same address**: he just reloads it on his phone. The page is plain `http://`, which is fine for a phone browser.

Always run `npm run build` first. Without a `dist/` folder, Terraform uploads nothing and the page stays empty.
