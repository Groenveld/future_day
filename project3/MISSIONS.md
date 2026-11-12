# 👁️ Missions: What does the AI see?

The Raspberry Pi is your camera. Every photo flies to the cloud, where an AI
called **Amazon Rekognition** looks at it and says what it sees. Then the answer
shows up on the Pi **and** in the gallery on your phone.

**Your goal: find out how smart the AI really is, and try to trick it!**

Start the camera on the Pi:

```
cd ~/ai-camera
python3 camera.py
```

Open the gallery on your phone: **https://ai-camera.groenveld.ch**

---

## Mission 1: Say hello 👋

Press Enter and smile into the camera.

- What did the AI find?
- How old does it think you are? Is it right?
- How sure is it (the % numbers)?

---

## Mission 2: Show it things 🎒

Hold up 5 different things, one photo each: a pen, a cup, a banana, a shoe, a phone…

**Which thing did it recognize best?** Which one did it get wrong?

---

## Mission 3: Make faces 😜

Try to make the AI think you're:

- 😡 angry
- 😲 surprised
- 😢 sad
- 😌 calm

Can you make it say **"scared"**?

---

## Mission 4: Disguise! 🥸

Put on sunglasses, a hat, a scarf, a fake moustache (draw one on paper!).

- Does it still find your face?
- Does it think you got older or younger?
- **Can you hide from the AI completely?** What do you have to cover?

---

## Mission 5: Fool the AI 🃏

This is the big one. Try to make it see something that isn't there:

- Show a **drawing** of a cat. Does it say "Cat"?
- Show a **photo on your phone** of a dog. Does it say "Dog" or "Phone"?
- Hold a toy animal. Real animal or toy?
- Hold something **upside down** or really close to the camera.
- Show only **half** of something.

Write down the funniest mistake the AI made!

---

## Mission 6: Can it read? 📝

Write a word in big letters on paper and hold it up. Does the AI read it?

- Try your handwriting vs. CAPITAL LETTERS
- Try writing a secret message 🤫
- Try writing upside down or in a mirror

---

## Mission 7: Let the robot talk 🔊

(Needs a speaker or a monitor with sound connected to the Pi.)

```
python3 camera.py --speak
```

Now the Pi says out loud what it sees, with a voice made by another AI
(**Amazon Polly**).

---

## Mission 8: Shake to shoot 🌀

The Arduino has a **gyroscope**: a sensor that measures how fast it turns.
Turn it into a remote control for the camera:

```
python3 camera.py --shake
```

Watch the meter: it shows how fast you're turning the Arduino in **degrees per
second**. Twist it past the `|` line (300 °/s) and 💥 the camera takes a photo!

- What's the fastest you can spin it?
- Can you trigger it **gently**? Why not?
- **Hacker bonus:** in `arduino/shake-trigger/shake-trigger.ino`, change
  `SHAKE_SPEED` to `150` and upload it again. What changes?

---

## Mission 9: Burst mode 📸📸📸

```
python3 camera.py --burst 10
```

10 photos, one every second. Move around, make 10 different faces, and see how
the AI's guesses change from photo to photo. Does it think you're the same age
in all of them?

---

## 🧠 What did you learn?

- AI doesn't *know* what things are. It guesses, and the % shows how sure it is.
- It can be wrong, and it can be tricked.
- The cloud is made of building blocks: **S3** stores the photo, **Lambda** runs
  your code when a photo arrives, **Rekognition** is the AI. Terraform
  connected them all with code!
