# ⛏️ Minecraft Server Missions

You are the boss of your own Minecraft server. It runs on a computer in a data
center in Frankfurt, Germany, and **you** tell it what to do with code.

For every mission you will do the same three things:

1. Change something in **`settings.auto.tfvars`** and save the file
2. Run **`terraform apply`** and type **`yes`**
3. Run **`./is-it-ready.sh`** and wait for ✅, then join in Minecraft

> ⚠️ Every `terraform apply` with new settings builds a **brand new server with
> a brand new world**. Anything you built before is gone. That's how the cloud
> works: servers are thrown away and rebuilt from the code.

---

## Mission 1: Start your server 🚀

Open `settings.auto.tfvars` and check that your Minecraft names are in **both** lists:

```
players   = ["samson8080", "yuosseftehking"]
operators = ["samson8080", "yuosseftehking"]
```

Only players in these lists can join, so strangers stay out.

Now start everything:

```
terraform init
terraform apply
```

Terraform shows what it will build. Type `yes`. After it finishes, run:

```
./is-it-ready.sh
```

When you see ✅, open Minecraft → **Multiplayer** → **Add Server**.
Server Address: **minecraft.groenveld.ch**. Join!

**Question:** Terraform printed a list of things it created. Can you find the
*instance*? That's the computer your server runs on.

---

## Mission 2: Your own server message 💬

Change `server_message` to something cool, for example:

```
server_message = "Enter if you dare!"
```

`terraform apply`, wait, and look at the server list in Minecraft.
Did your message show up?

**Bonus:** Minecraft colors! Put `§c` (red), `§a` (green), `§e` (yellow) or
`§b` (aqua) in front of words: `"§eWelcome to §cmy §bserver!"`

---

## Mission 3: Creative mode 🎨

Change `game_mode` to `"creative"`. Apply and join.

Now you can fly (press space twice) and you have every block in the game.
Build something huge in 5 minutes!

---

## Mission 4: A world that's all yours 🌍

Every Minecraft world comes from a **seed**. The same seed always makes the same world.

Set `world_seed` to any word, like your name or your favorite food:

```
world_seed = "pizza"
```

Apply and look around. Remember where you spawned.

Now `terraform apply` again **without changing anything**. What happens?
(Hint: Terraform only rebuilds things when the code changes.)

Then change the seed to a different word, apply, and compare.
**Is it the same world?**

---

## Mission 5: Weird worlds 🏔️

Try the different world types. One apply each:

- `world_type = "flat"`: everything is flat. Perfect for building cities.
- `world_type = "amplified"`: gigantic mountains up to the sky.
- `world_type = "large_biomes"`: every biome is 16× bigger.

Which one do you like best?

---

## Mission 6: You make the rules 👑

You are an **operator**, so you can use commands in the game. Press `T` and try:

```
/time set day
/weather clear
/give @s diamond 64
/gamemode creative
/summon pig
/tp @s ~ ~100 ~
```

Now make it hard: set `difficulty = "hard"`, `game_mode = "survival"`, and if
you're brave, `hardcore = true`. How long can you survive?

**Invite a friend:** add their Minecraft name to `players`, apply, and give them
the address.

---

## Mission 7: Turn it off 🛑

A server in the cloud costs money **every hour it runs**, even when nobody plays.
So when you're done:

```
terraform destroy
```

Type `yes`. Everything Terraform built is deleted: the computer, the world, the
address. Try to join in Minecraft. What happens?

Want it back? `terraform apply`, and 3 minutes later it's there again.
**That's the power of code that builds servers!**
