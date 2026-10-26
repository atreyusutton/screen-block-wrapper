# Griffin Gallien — workspace

This folder is my space in the Wrapper project. It holds my working iPhone version of Wrapper, the free AI that runs it, my research, and some explainer videos.

- Branch: `griffingallien/wrapper-app` (my earlier research is on `griffingallien/ios-research`)
- Everything I add stays inside `members/griffingallien/`. I don't change anyone else's files or `main`.

## What I built: Wrapper for iPhone

Before you can open Instagram, TikTok or YouTube, you have to tell an AI agent **why**. If it agrees, the app opens that site **inside Wrapper**, with the addictive parts (Reels, Shorts, For You) taken out, and keeps checking that you stay on what you said.

### How a session works

1. Open Wrapper and pick **Instagram**, **TikTok** or **YouTube**.
2. Tell the agent what you need it for. The agent:
   - **says yes** to a specific task ("find a pasta recipe I saved", "research how moving averages work"), with minutes that fit the task;
   - **asks one question** if it's vague ("I want to research something"), then decides. It never asks twice;
   - **says no** to "bored", "just scrolling" or anything on your own never-list.
3. The site opens inside Wrapper, already on your goal (a search for it, the right profile, or your DMs), with your filters on (see below).
4. Every **30 seconds**, Wrapper takes a picture of its own page, and the AI checks it against your goal. This isn't screen recording: Wrapper can only see what's inside itself, so it needs no recording permission.
   - Off task once: a warning, and it takes you back to where you started.
   - Off task twice: the session ends.
   - If the AI isn't sure four checks in a row, that counts as off task once.
   - No strikes in the first 30 seconds, since sites often load their home page first.
5. The session ends when you tap **I'm done**, the time runs out, or you get two strikes. If you set a wait between unlocks, it starts then.

The hard limits (minutes per day, minutes per unlock, the wait between unlocks) are enforced by the app's code, not by the AI, so you can't talk your way past them.

### What gets taken out

| App | Taken out | Still works |
|---|---|---|
| **Instagram** | The Reels tab, the next Reel when you scroll, and the Explore grid (swapped for search). Optional: the home feed | Search, profiles and DMs. A Reel you tap still plays |
| **TikTok** | The For You feed (swapped for a search for your goal), the next video when you scroll, Explore and LIVE | Search and profiles. A video you tap still plays |
| **YouTube** | Shorts. The home feed is skipped and opens a search for your goal. Optional: "up next" and comments | Search and full-length videos |

The "a video you tap plays, but not the next one" rule is **Kaitlyn's idea** from her Reels-free Instagram experiment. I rebuilt it in my app.

## The AI is free and runs on my PC

- The AI is **Qwen3-VL 8B**, a free model that can read screenshots. It runs on my own PC through **[Ollama](https://ollama.com)** (free) and takes about 2–4 seconds per answer on my graphics card.
- There's **no account, no API key and no cost**. Screenshots go from the phone to my PC over my home Wi-Fi and are never saved or sent to an AI company.
- The AI server prints **why** it made each decision, so you can see its reasoning.
- If the PC is off, the phone falls back to simple built-in rules, so the app still works, just less smart.

## Everyone sets their own rules

The **My rules** screen is personal; nobody else has to use my settings. You can set:

- minutes per day and minutes per unlock, for each app
- a wait between unlocks
- which parts of each app to hide
- reasons that are good for you, and reasons that never are
- rules in your own words, which the AI reads every time

For example, mine are: TikTok is for learning and everyday research (how-tos, cooking, meal prep), YouTube is for research (mostly trading), and Instagram is only for school messages until my homework is done.

## How it fits with the group

I think of the project as four layers, and each of us has built part of it:

| Layer | What it does | Who |
|---|---|---|
| **1. Front door** | You say why first, and the AI decides | Me (working, with the free AI). Aja's clickable demo shows the same idea for YouTube, Reddit and Marketplace |
| **2. Clean room** | The apps without the addictive parts | Me (Instagram, TikTok, YouTube), Kaitlyn's Reels-free Instagram, Atreyu's YouTube plan, Aja's one-result pages |
| **3. Referee** | Checks that you stay on task | Me (pictures of Wrapper's own page, no screen recording needed). Kaitlyn's version uses screen recording to watch the *real* apps outside her app |
| **4. Lock** | Keeps the real apps closed so you have to use Wrapper | Atreyu's plan: Screen Time settings with a friend's passcode (free) |

**The glue could be one shared AI server.** Mine already answers two questions over the network: "should this unlock be allowed?" (`/decide`) and "is this screen on task?" (`/check`). Kaitlyn's, Atreyu's or Aja's versions could ask the same server instead of each building their own.

## Status

Working on my iPhone (through Expo Go):

- [x] Asking the agent, with the free AI on my PC answering
- [x] Instagram: search, and a tapped Reel plays without the next one
- [x] TikTok: For You is skipped and opens a search
- [x] YouTube: Shorts hidden, home feed skipped
- [x] Screenshot checks every 30 seconds, with warnings and strikes
- [x] Big **I'm done** button that takes you back home

Next:

- [ ] Canvas check: once Canvas shows my homework is done, a free hour per app
- [ ] A "My channels" page for YouTube (newest videos from channels I pick, no recommendations)
- [ ] Use it away from home Wi-Fi (Tailscale, free)
- [ ] Share the AI server with the rest of the group

## Limits (being honest)

- **It only controls what happens inside Wrapper.** The real Instagram and TikTok apps are still on the phone. Closing them off needs the Lock layer: Screen Time settings with a friend's passcode (free), or Apple's Screen Time API, which needs a $99/year developer account and a Mac.
- **The PC has to be on, and the phone on the same Wi-Fi**, for the smart AI. Otherwise it uses the simple rules.
- **Websites change often**, so the hiding rules will need fixes now and then. TikTok's website is the most limited.
- **Google may block signing in to YouTube inside apps.** YouTube still works signed out.
- It runs through Expo Go for testing. It isn't an App Store app.
- It's a **commitment device, not a jail**: someone determined can always get around it.

## What's in this folder

- `wrapper-app/`: the app and the AI server. How to run it yourself is in [`wrapper-app/README.md`](wrapper-app/README.md).
- `videos/`: three short explainer videos (about 5 minutes each):
  - *Part 1 - The pieces*: Expo, the app, Ollama and the AI server
  - *Part 2 - Opening an app*: one session from start to finish
  - *Part 3 - The group*: how our projects fit together
- `research/`
  - `iOS social media blocking workarounds.md`: my research report (the same file as `docs/research/` at the top of the repo)
  - `notes/`: deeper notes (Screen Time API, existing products, workarounds, platform rules, the AI gate idea, ideas from GitHub)
  - `videos/`: two research videos (what iOS allows, and design ideas)

## Built with

Expo and React Native (TypeScript) for the app, `react-native-webview` for the in-app browser, Node.js for the AI server, and Ollama with Qwen3-VL for the AI. Everything is free.
