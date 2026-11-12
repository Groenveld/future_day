# ============================================================
#   YOUR MINECRAFT SERVER SETTINGS
#   Change something here, save, then run:   terraform apply
#
#   Every apply builds a BRAND NEW server with a BRAND NEW world.
#   (Anything you built in the old world is gone!)
# ============================================================

# The text players see under the server name in the server list
server_message = "Welcome to my server!"

# survival  = collect, craft, survive
# creative  = fly and build with unlimited blocks
# adventure = you can't break or place blocks
# spectator = fly through walls and just watch
game_mode = "survival"

# peaceful, easy, normal or hard   (peaceful = no monsters at all)
difficulty = "normal"

# The world seed decides what the world looks like.
# The same seed always makes the same world. Any word or number works!
# Leave it empty ("") for a random world.
world_seed = ""

# normal       = the usual world
# flat         = completely flat, perfect for building
# amplified    = HUGE crazy mountains
# large_biomes = every biome is 16 times bigger
world_type = "normal"

# Hardcore: if you die, you can't respawn. Ever. (true or false)
hardcore = false

# Can players hurt each other? (true or false)
pvp = true

# How many players can be online at the same time
max_players = 10

# Who is allowed to join? Write the exact Minecraft names.
# If this list is empty, ANYBODY on the internet can join!
players = ["samson8080", "yuosseftehking"]

# Operators can use commands like /time set day or /gamemode creative.
# (Operators are allowed to join automatically.)
operators = ["samson8080", "yuosseftehking"]
