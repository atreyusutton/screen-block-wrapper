# screen-block-wrapper

An anti-doomscrolling wrapper. Before you open Facebook, Reddit, or YouTube, you tell an AI agent what you're there to do. The agent agrees on a scope with you, then watches the session (URL checks plus periodic screenshots) and revokes access if you drift off-task.

## Goals for v1

| App | Allowed | Blocked |
|---|---|---|
| Facebook | Marketplace (and whatever else the session allows) | Reels, Watch, the infinite feed |
| Reddit | A specific task, e.g. "find a good ramen place in Boston" | Endless browsing of the front page or r/all |
| YouTube | Long-form videos that match the stated intent | Shorts, wandering through the recommendations sidebar |

## Chosen approach: web app + Screen Time

Instead of an extension, we build a **web app** that the user's OS-level blocker (Screen Time on iPhone and Mac, Digital Wellbeing or Family Link on Android) whitelists, while the real Facebook, Reddit, and YouTube apps and sites are blocked. All content goes through our app, so the agent sees exactly what the user is about to open.

### What works in a web app, per site

| Site | Can we iframe the real site? | Plan |
|---|---|---|
| **YouTube** | Only the embed player (`youtube-nocookie.com/embed/<id>`); the homepage, search, and Shorts can't be framed | Build our own YouTube UI. Search through the **YouTube Data API v3**, drop Shorts (duration ≤ 3 min), have the agent check each video's title, channel, and description against the session contract, then play it in the embed player. There's no recommendations feed, so there's nothing to fall into. **Very doable.** |
| **Reddit** | No (`X-Frame-Options` blocks it) | Let the agent do the browsing: "find a ramen place in Boston" → the agent searches Reddit (web search restricted to `reddit.com`, or the Reddit API), reads the threads, and returns a summary with the top picks. The user never scrolls. Reddit's API now requires registering an app and may need approval. |
| **Facebook Marketplace** | No, and there's no public Marketplace API | **The gap in this approach.** Options: a time-boxed Screen Time exception for `facebook.com/marketplace` that the agent tells the user to unlock, or wait for the native wrapper app (a native WebView can load Facebook). |

### Screen Time setup
- **Block:** the YouTube, Facebook, and Reddit apps (App Limits, or Content & Privacy → Apps).
- **Websites:** set "Allowed Websites Only" and allow our app's domain plus the YouTube player domains (`youtube-nocookie.com`, `googlevideo.com`, `ytimg.com`). **This needs testing first.** We don't yet know whether Screen Time's web filter blocks embedded iframes from non-allowed domains.
- **Passcode:** have a groupmate or friend set the Screen Time passcode so the user can't just turn it off.

### Why we mostly don't need screenshots now
A web page can't screenshot a cross-origin iframe. But because every video and search goes through our backend, the agent judges **metadata** (video title, channel, description, duration, search query) instead of pixels. That is cheaper, faster, and more reliable. If we need screenshots later, the browser's screen-capture API (`getDisplayMedia`, desktop only, the user approves it each session) can take periodic frames.

### Stack for this approach
- **Next.js (App Router) on Vercel**, in TypeScript. Server routes keep the API keys secret.
- **Claude** (`@anthropic-ai/sdk`) for the intent conversation and for judging each piece of content against the session contract.
- **YouTube Data API v3** for search and video details. The free quota is 10,000 units a day, and each search costs 100 units, so we get **about 100 searches a day** per project unless we request more.
- **YouTube IFrame Player API** to play videos and detect when one ends (so the user goes back to our UI, not YouTube's autoplay).
- A database (e.g. Neon Postgres) for users, session contracts, and logs.

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

## Atreyu's approach this week

**iPhone: lock everything down except our site.**
- Screen Time blocks every distracting app and sets Safari to "Allowed Websites Only". The only allowed site is our web app (plus the YouTube player domains it needs).
- **YouTube** works only inside our site: search there, Shorts are filtered out, and videos play in the embedded player.
- **Reddit** isn't reachable directly. Our site pulls the relevant posts and either shows an **AI summary** (e.g. "best ramen spots in Boston, according to r/boston") or shows the posts in our own **minimal Reddit viewer**, with no feed and no infinite scroll.
- **Facebook** stays fully blocked on iPhone for now.

**Computer: allow the three sites directly, with short-form banned.**
- Our web app runs here too, but YouTube, Reddit, and Facebook can also be opened directly.
- Short-form content is blocked: YouTube Shorts and Facebook Reels/Watch.
- Every other distracting site stays blocked.

**Open questions to check this week:**
- Does an embedded YouTube video still play on iPhone when Screen Time blocks `youtube.com`?
- Mac Screen Time blocks whole domains, so it can't block only `/shorts`. Blocking short-form on the computer will probably need a small browser extension or content-blocker rules (e.g. uBlock Origin filters).
- Reddit data source: use the official Reddit API, since scraping is against Reddit's terms and can get blocked.

## Suggested roadmap

1. **Spike:** confirm a YouTube embed plays on our site while Screen Time blocks `youtube.com` (Safari on an iPhone and a Mac).
2. **MVP:** Next.js app with the agent conversation, session contract, and YouTube search + playback (Shorts filtered, every video checked by the agent).
3. Reddit "agent does the browsing" mode.
4. Facebook Marketplace: time-boxed unlock flow.
5. Later: native wrapper apps (Android, then iOS) for full Facebook support and stronger blocking.

## Team

Add your name below (one line each):

- Atreyu Sutton ([@atreyusutton](https://github.com/atreyusutton))
- Kaitlyn Samuelian
- Owen McMahon
- Aja Kimsey
- Griffin Gallien
