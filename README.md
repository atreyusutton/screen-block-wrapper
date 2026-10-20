# screen-block-wrapper

An anti-doomscrolling wrapper. Before you open Facebook, Reddit, or YouTube, you tell an AI agent what you're there to do. The agent agrees on a scope with you, then watches the session (URL checks plus periodic screenshots) and revokes access if you drift off-task.

## Goals for v1

| App | Allowed | Blocked |
|---|---|---|
| Facebook | Marketplace (and whatever else the session allows) | Reels, Watch, the infinite feed |
| Reddit | A specific task, e.g. "find a good ramen place in Boston" | Endless browsing of the front page or r/all |
| YouTube | Long-form videos that match the stated intent | Shorts, wandering through the recommendations sidebar |

## Is this plausible?

**Yes, but how much is possible depends on the platform.** The agent part (talk through an intent, then judge a screenshot against it) is very doable with current vision LLMs. The hard part is how much control the OS lets us have over *other* apps:

| Platform | Can we see the screen? | Can we block or kick the user out? | Verdict |
|---|---|---|---|
| **Desktop browser extension** (Chrome/Edge/Brave/Arc) | Yes. Full URL and DOM access, plus `chrome.tabs.captureVisibleTab` for screenshots | Yes. Redirect or close the tab, or overlay the page | **Easiest. Build here first** |
| **Android** | Yes. An `AccessibilityService` can read on-screen text and views; `MediaProjection` can take screenshots | Yes. Draw an overlay, or send the user to the home screen | **Very doable.** Apps like this already exist on Android |
| **iOS** | No. Apps can't see other apps' screens (ReplayKit needs the user to start a recording each time) | Only whole apps or domains, via the Screen Time API (`FamilyControls`) | **Hardest.** The workaround is the "wrapper" approach below |

### The "wrapper" approach (needed on iOS, works everywhere)

Instead of watching the real Facebook, Reddit, and YouTube apps, **we ship our own app that loads their mobile websites in WebViews**, and use OS-level blocking to lock the native apps. Inside our WebView we control everything: we see the URL, can inject JS to hide Reels and Shorts, and can screenshot our own view whenever we like.

Known risks:
- Google blocks sign-in inside embedded WebViews, so YouTube may only work logged out (or needs a workaround like an in-app browser tab).
- Facebook and Reddit occasionally push users toward their apps or change their markup, so CSS/JS hiding rules will need maintenance.
- iOS Screen Time / Family Controls needs a special entitlement that we have to request from Apple.

### Honest limitations
- This is a **commitment device, not a jail**. A determined user can uninstall it, switch browsers, or use a different device.
- Screenshots can contain private messages, so crop or redact before sending, and never store them.

## How enforcement works (cheap checks first, LLM last)

1. **Intent conversation.** The user explains what they want ("find a used desk on Marketplace under $100"). The agent pushes back if it conflicts with the user's own rules ("no short-form video") and produces a **session contract**: allowed and blocked content, plus a time limit.
2. **Deterministic URL rules (instant and free).** For example: block `youtube.com/shorts/*`, `facebook.com/reel/*`, and `facebook.com/watch*`, allow `facebook.com/marketplace/*`.
3. **DOM/text signals.** Hide the Reels and Shorts shelves and the recommendation feeds with injected CSS/JS.
4. **Periodic screenshot check.** Every N seconds (and on every navigation), send a screenshot plus the session contract to a vision model. It returns `{on_track: bool, reason, confidence}`.
5. **Revoke.** Give a warning first, then overlay or close the tab with a cooldown. The user can reopen the conversation with the agent to argue for more time.

## Recommended stack

One language, **TypeScript**, everywhere so the agent logic is shared:

| Layer | Choice | Why |
|---|---|---|
| **Phase 1: browser extension** | Chrome Manifest V3 extension (TypeScript, built with Vite or [WXT](https://wxt.dev)) | Covers all 3 sites on day one, fastest to iterate on |
| **Phase 2: mobile wrapper** | React Native + Expo with `react-native-webview`; native modules for Android `AccessibilityService` and iOS `FamilyControls` | Reuses the TS agent code; handles the WebView wrapper and native-app blocking |
| **Backend** | Small Node/TS API (e.g. Vercel Functions, Hono, or Express) | Keeps the API key off users' devices, stores session contracts, rate-limits checks |
| **Agent / vision model** | Claude via the official `@anthropic-ai/sdk` | Handles both the intent conversation and the screenshot judging |
| **Storage** | SQLite or Postgres (e.g. Neon) for users, rules, and session logs; **no screenshots stored** | |

### Model choice and rough cost

| Job | Model | Price (input / output per 1M tokens) |
|---|---|---|
| Intent conversation (reasoning, pushback) | `claude-opus-5-5` | $4 / $20 |
| Periodic screenshot checks (high volume) | `claude-opus-5-5` by default; `claude-haiku-5-5` if cost matters | $4 / $20 vs. $0.10 / $0.50 |

Back-of-envelope estimate: a screenshot is about 1.5–2k input tokens. One check every 30 s for an hour is about 120 checks, roughly **$1/hr on Opus 5.5** or about **$0.03/hr on Haiku 5.5**. The URL and DOM rules (steps 2–3) catch most violations for free, so screenshot checks can be infrequent.

## Suggested roadmap

1. **MVP:** Chrome extension with URL rules for the 3 sites, plus a popup where you state your intent.
2. Add the agent conversation and session contract (backend + Claude).
3. Add periodic screenshot checks and the revoke/cooldown flow.
4. Android wrapper app (WebViews plus accessibility-based blocking of the native apps).
5. iOS wrapper app (WebViews plus Screen Time blocking of the native apps).

## Getting started

```bash
git clone git@github.com:atreyusutton/screen-block-wrapper.git
cd screen-block-wrapper
```

## Collaborating

1. Create a branch for your work: `git checkout -b feat/my-change`
2. Commit and push: `git push -u origin feat/my-change`
3. Open a pull request on GitHub for review before merging into `main`.

## Team

Add your name below (one line each):

- Atreyu Sutton ([@atreyusutton](https://github.com/atreyusutton))
- Kaitlyn Samuelian
- Owen McMahon
