# Wrapper (griffingallien's version)

An iPhone app that opens Instagram, YouTube and TikTok *inside itself*, but only after you tell an agent what you need them for. Inside, the parts you've switched off (Reels, Shorts, the For You feed and so on) are hidden. Every 30 seconds the app checks what you're viewing, and it ends the session if you drift off task.

Built with Expo, so it runs on an iPhone from a Windows PC. No Mac is needed for this version.

## Run it on your iPhone

1. Install **Expo Go** from the App Store.
2. On the PC, in this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Put the phone on the same Wi-Fi as the PC, then scan the QR code in the terminal with the iPhone Camera app.
   - If Windows asks whether Node.js may use the network, allow it on private networks.
   - If the phone can't connect, try `npx expo start --tunnel`.

## How it works

| Screen | File | What it does |
|---|---|---|
| Home | `src/app/index.tsx` | Your apps, minutes used today, recent sessions |
| My rules | `src/app/rules.tsx` | Each person's own restrictions: limits, what to hide, good/never reasons, rules in their own words |
| Ask to open | `src/app/ask/[app].tsx` | Chat with the agent. Hard limits (daily minutes, max unlock, cooldown) are enforced in code, not by the AI |
| Session | `src/app/session/[app].tsx` | The app's website in a WebView with your filters, a countdown, and the on-task checker |

- `src/lib/apps.ts`: per-app filters (CSS that hides sections, and pages that are blocked or redirected to a search for your goal).
- `src/lib/inject.ts`: script that runs inside the page to report page changes and what's on screen.
- `src/lib/agent.ts`: the agent. Without a server it's a **stand-in** (simple rules). Set an AI server address in My rules and it switches to the free AI on your PC, which also gets a screenshot of the page with each check.
- `server/`: the free AI server that runs on your PC (see below).

## Free AI on your PC

The agent's "brain" can run on your own PC for free, using [Ollama](https://ollama.com) and a free model that can read screenshots. Nothing is sent to an AI company, and screenshots never leave your home network.

1. Install **Ollama** from ollama.com (free) and open it.
2. Download the model once (about 6 GB):
   ```bash
   ollama pull qwen3-vl:8b-instruct
   ```
3. Start the server from this folder, and leave it running:
   ```bash
   npm run server
   ```
   It prints an address like `http://192.168.4.80:8787`.
4. On the phone, go to **My rules → AI server address**, type that address, and tap **Test connection**.

Each unlock decision and screen check is printed in the server window with the reason, so you can see why the agent decided what it did. The phone shows the same reason. If the server is off or unreachable, the app falls back to the stand-in rules.

To try a different model, set `MODEL` before starting, e.g. `$env:MODEL='qwen3-vl:4b-instruct'; npm run server` in PowerShell (smaller and faster, less accurate).

## Limits of this version

- It filters the **websites**, not the real apps. Blocking the real Instagram/TikTok apps needs Apple's Screen Time API, which means a paid Apple Developer account and a Mac with Xcode (cloud builds only work after Apple approves the app). The free alternative is the built-in Screen Time *settings* (App Limits with a friend's passcode) or a Shortcuts automation that sends the real app to this one.
- There's no screen recording. The app only takes pictures of its own built-in browser, which is why it needs no recording permission.
- Sites change their layout often, so the hiding rules in `apps.ts` will need updates. TikTok's website is the most limited.
- YouTube works signed out (Google blocks sign-in inside apps).

## Next steps

- [x] Free AI server for the agent (`server/`, runs on the PC with Ollama)
- [x] Test the AI server's answers on real sessions and tune its instructions (`server/judge.ts`)
- [x] Test each app's filters on a real phone and fix the selectors (ideas in `../research/notes/github_methods.md`)
- [ ] Real app blocking with Screen Time via EAS Build

The research behind this is in `docs/research/ios-social-media-blocking-workarounds.md` at the repo root.
