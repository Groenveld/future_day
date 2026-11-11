# Project 2: His own Minecraft server

**Zukunftstag project 2 of 4 · about 45 minutes · the fun part**

Terraform starts an EC2 instance in AWS, installs a Minecraft server on it and prints the server's IP address. He connects with Minecraft, then changes settings such as the game mode or the world seed and redeploys.

**The idea:** a server is just a computer somewhere else, and code can set it up.

## What's in it

The project was built as `minecraft-on-aws.zip` and has:

- a settings file he can edit (game mode, world seed, …)
- seven missions for him to work through

The zip isn't in this folder yet. Unpack it here.

## Running it

```
terraform init
terraform apply      # starts the server and prints the IP
# edit the settings, then:
terraform apply      # redeploys with the new settings
terraform destroy    # shuts it down at the end, so it stops costing money
```

## Open question

- Should the missions be in German?
