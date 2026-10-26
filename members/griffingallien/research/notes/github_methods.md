# Other methods found on GitHub, for a $0 / no-Mac / no-Screen-Time-API wrapper (as of October 22, 2026)

Context: these notes look for free ways to block, redirect, filter and check social apps for a student building on Windows with Expo Go, no Mac and no paid Apple Developer account. Projects already covered in the other notes are left out (Slowth, SCInsta, SideStore, Shorts-Blocker, react-native-device-activity, No-YouTube-Shorts, HushGram, AntiReels). Every repo below was fetched and confirmed to exist. Star counts and push dates come from the GitHub API on October 22, 2026. I re-checked these myself: zevnda/hide-youtube-shorts, twohertz IG DM, yixi, NoScroll, Intention, and the Ollama pages for `qwen3-vl` and `d1`. Nothing here was installed or tested.

**Licenses, in plain words:**
- **MIT, Apache, Unlicense:** copying is fine if you keep the credit line.
- **GPL / AGPL:** copying their code into our app would force our app under the same license. Read them for ideas instead.
- **No license:** look, don't copy.

## 1. Sending people from the real apps into the wrapper

### Takeaway
Two free routes work with no special Apple permission:
- A Shortcuts "App is opened" automation that opens the wrapper's link.
- Replacing the real app's home-screen icon with one that opens the wrapper.

Both are friction, not a lock. The stronger free lock is the built-in Screen Time *settings* (App Limits with a friend's passcode), which is different from the paid Screen Time *developer API*.

### Cited Findings
- **yixi: a self-hosted One Sec alternative.** A Shortcut asks a small server whether to intercept. The server replies `pass` or a URL, and the Shortcut opens that URL. Pressing "open anyway" starts a server-side grace window so the automation doesn't loop. It runs free on a Cloudflare Worker. In its own words: "It is friction, not enforcement — the automation is one toggle away from off, on purpose." MIT, about 100★, pushed 2026-09-21 — [GitHub: Defiabell/yixi](https://github.com/Defiabell/yixi)
- **The 2-minute delay has no fix.** Apple reportedly skips "App is opened" automations for about 2 minutes after the phone is unlocked. No repo found a fix. The workaround is a home-screen icon (Shortcuts → Add to Home Screen) that opens the wrapper link, placed where the real app's icon used to be. That involves no automation at all.
- **BootUp: a "launch pass" kept in shared storage.** An App Intent reads the pass and either stays hidden or comes to the front (iOS 26) to break the loop. It also uses Screen Time shields, so building it yourself needs the paid entitlement. GPL-3.0, 5★, pushed 2026-07-18 — [GitHub: eliguzz/BootUp](https://github.com/eliguzz/BootUp)
- **NoScroll's fallback.** NoScroll documents a manual Screen Time App Limits path for when Apple doesn't grant the API. Its README also says: "A wrapper on its own enforces nothing — you'd just open Safari." — [GitHub: Blueturboguy07/noscroll](https://github.com/Blueturboguy07/noscroll)

## 2. Wrapper apps built like ours (to learn from)

| Repo | What's worth learning | License · ★ · last push |
|---|---|---|
| [twohertz/instagram-dm-only-for-ios-anti-doom-scrolling](https://github.com/twohertz/instagram-dm-only-for-ios-anti-doom-scrolling) ("IG DM") | Swift WKWebView wrapper that allows only `/direct/` plus the login pages. It cancels blocked page loads natively, blocks taps on blocked links, refuses in-page address changes, and re-checks twice a second. A free Apple ID works from Xcode but expires after 7 days. **Needs a Mac.** | MIT · 0★ · 2026 |
| [Blueturboguy07/noscroll](https://github.com/Blueturboguy07/noscroll) | Hiding rules are JSON data loaded remotely, with a cached and a built-in fallback, and signed. Each rule declares `expectMin`, the number of matches it should find, so the app can tell when a selector has broken. Instagram and YouTube, with iOS and Android versions. | AGPL-3.0 · 61★ · 2026-09-23 |
| [Marco-P-Keller/Quiet](https://github.com/Marco-P-Keller/Quiet) | CSS selectors match only links and accessibility roles, never class names. The daily limit is stored in the keychain so reinstalling doesn't reset it. | **No license** · 1★ · 2026-10-21 |
| [djui/asocial](https://github.com/djui/asocial) | CSS is injected at page start and scoped by the current path. Posts are hidden by their label text ("Suggested for you"). Redirects `/shorts/<id>` → `/watch?v=<id>` and `/reels/` → the inbox. | MIT · 1★ · created 2026-10-22 |
| [cristian200504/InboxOnly](https://github.com/cristian200504/InboxOnly) | iOS WebView that blocks Explore and Reels by matching link addresses. | No license · 0★ · Sep 2026 |

**Already in our app:** `src/lib/inject.ts` hooks `pushState`, `replaceState` and `popstate`, so in-page navigation is already reported. The ideas worth adding are an allowlist mode, using `expectMin`-style counts to warn when a filter breaks, and selectors that rely on link addresses and labels.

## 3. Hiding rules to try in `wrapper-app/src/lib/apps.ts`

Some lines in uBlock-style lists only work inside uBlock and will do nothing if injected as CSS: `:has-text()`, `:upward()`, `:matches-path()` and `+js()`. Plain `:has()` does work in iOS WebViews (Safari 15.4+).

**Mobile YouTube**
- Shorts button in the bottom bar: `ytm-pivot-bar-item-renderer:has(.pivot-shorts)`. We already use this. It also appears in zevnda's CSS and gijsdev's list.
- Shorts shelves: `ytm-reel-shelf-renderer` (we have this) and `grid-shelf-view-model:has(ytm-shorts-lockup-view-model)` (**new**). From [zevnda/hide-youtube-shorts `styles/shorts-selectors.css`](https://github.com/zevnda/hide-youtube-shorts), which is plain CSS, MIT, 113★, updated 2026-10-14.
- Single Shorts cards: `ytm-video-with-context-renderer:has(a[href*="/shorts/"])` and `ytm-rich-item-renderer:has(a[href*="/shorts/"])` (zevnda).
- Home-page Shorts section: `ytm-rich-section-renderer:has(ytm-shorts-lockup-view-model)`. This is a plain-CSS translation of gijsdev's `:upward` rule and is untested.
- Shorts tab on channel pages: `yt-tab-shape[tab-title="Shorts"]` — [gijsdev/ublock-hide-yt-shorts](https://github.com/gijsdev/ublock-hide-yt-shorts) (MIT, 2.5k★). Open issue #77 (October 2026) says some desktop search-page Shorts slip through.
- Redirect `/shorts/<id>` to `/watch?v=<id>` instead of blocking it — LockedIn-YT (AGPL, ideas only) and asocial (MIT).

**Instagram** (the mobile rules are thinner)
- Rules that match link addresses are the most likely to survive redesigns: `a[href="/explore/"]`, `a[href="/reels/"]`, `a[href*="/reel/"]`. This is what we already do.
- Reel cards in the feed: `article:has(a[href*="/reel/"])`, simplified from [InfectedDuck/ReelLess `site_guard.css`](https://github.com/InfectedDuck/ReelLess) (MIT).
- Following-only feed: redirect `/` to `/?variant=following` — [preziotte/not-for-you](https://github.com/preziotte/not-for-you) (MIT).
- Avoid rules built on auto-generated class names like `.xh8yej3`. They break constantly.

**TikTok** (no rules written for the mobile site were found)
- Redirect `/` and `/foryou` to `/following` (not-for-you).
- FocusTube strips language prefixes like `/en` from the address before checking it — [malekwael229/FocusTube](https://github.com/malekwael229/FocusTube) (MIT, 40★).
- Warning: while you scroll, the For You feed rewrites the address to `/@user/video/<id>`, so address checks alone can miss it (shbernal/tiktok-feed-blocker).

## 4. Free hiding in Safari itself (no app needed)

- **Userscripts** ([quoid/userscripts](https://github.com/quoid/userscripts)): a free App Store Safari extension that can run plain CSS files on chosen sites. The viki53 "Instagram Purified" gist has iPhone install steps, but it dates from July 2025.
- **uBlock Origin Lite:** free on the App Store and needs iOS 18.5+. Its release notes mention custom cosmetic filters for Safari.
- **AdGuard for iOS:** advanced rules are a premium feature, so it's the weakest fit for $0.
- This doesn't replace our app, but it closes the "just open it in Safari instead" loophole.

## 5. DNS blocking and supervision

- **DNS blocks whole domains only.** It can't block `/reels` or `/shorts`, and it affects the whole phone, so blocking instagram.com or youtube.com would also break our wrapper. It only helps for domains the wrapper doesn't use, for example blocking TikTok entirely.
  - Sources: [hagezi/dns-blocklists](https://github.com/hagezi/dns-blocklists) (GPL-3.0, 27.7k★), [M4jx/TikTokBlocklist](https://github.com/M4jx/TikTokBlocklist) (MIT, which warns that TikTok can get around DNS blocking) and [paulmillr/encrypted-dns](https://github.com/paulmillr/encrypted-dns) (Unlicense; profiles you can install from Safari, and delete just as easily).
- **pymobiledevice3 can supervise an iPhone from Windows.** [doronz88/pymobiledevice3](https://github.com/doronz88/pymobiledevice3) (GPL-3.0, 2.9k★) is a Windows-capable Python tool with commands to supervise a phone and install restriction profiles. On a supervised phone, profiles can't be deleted. **Supervising wipes the phone. Untested.**

## 6. Open-source AI "are you on task?" projects

No project does exactly what our app does: send a phone screenshot plus a stated goal to a local model and get a three-way answer. These solve parts of it:

| Repo | What it does | Model | License · ★ |
|---|---|---|---|
| [MaybeItsSoftware/intention](https://github.com/MaybeItsSoftware/intention) | Closest match. An AI coach makes you justify more time on blocked sites and apps. Browser extensions, Android, and an iOS app that uses Screen Time shields. | Anthropic, OpenAI/Groq or Gemini with your own key, or their hosted backend | MIT · 0★ |
| [ahmadkaouk/tabfit](https://github.com/ahmadkaouk/tabfit) | Checks every page against your current task, re-checking every 30 s. | Cloud | MIT · 0★ |
| [dgr8akki/intent-guard](https://github.com/dgr8akki/intent-guard) | Nudges you when you drift off task, and never sends banking, mail or password pages. | Cloud | MIT · 0★ |
| [jam3scampbell/ProctorAI](https://github.com/jam3scampbell/ProctorAI) | Desktop screenshots, with an optional local LLaVA "router" via Ollama checking first. | Claude, GPT or Gemini, plus Ollama | None · 416★ (last pushed 2025) |
| [ayushh0110/ScreenMind](https://github.com/ayushh0110/ScreenMind) | Fully local screen memory. Skips near-identical frames, and turning "thinking" off made it about 6× faster. | Gemma 4 via llama.cpp | MIT · 245★ |
| [JerryZLiu/Dayflow](https://github.com/JerryZLiu/Dayflow) | Turns screen recordings into a timeline of your day (macOS). | Ollama or LM Studio, or Gemini | MIT · 7.3k★ |

**Design ideas worth borrowing for our `/check` server:**
- **Three answers with confidence cut-offs** (tabfit). Block only when the model is at least 85% sure you're off task; "unsure" never blocks.
- **Reason first, verdict last.** Put the explanation before the verdict in the reply (awf, and a comment on its write-up), so the model can't decide first and justify afterwards.
- **Use a fixed JSON format** (Ollama's `format` field) and match exact values. ProctorAI's `'productive' in text` check counts "unproductive" as productive.
- **Treat page text as data, not instructions** (tabfit), so a web page can't talk the model into a verdict.
- **Cheap checks first:**
  - Address rules before the model.
  - Cache verdicts for each page.
  - Skip screenshots that haven't changed.
  - Send the page text along with the picture.
- **Avoid false alarms:** act only after two off-track results in a row, and offer an "it's part of my goal" button.
- **Wording from Intention's prompts:** "A FEED IS NOT A DESTINATION", and reasons must be "concrete and specific — a named task, not a mood."

## 7. Free models for the PC (Ollama)

The laptop has an RTX 5070 Ti and 32 GB of RAM.
- **`qwen3-vl:8b`:** 6.2 GB (the `4b` is 3.3 GB). Needs Ollama 0.12.7+. Good at reading screenshots and app screens. Confirmed on [ollama.com](https://ollama.com/library/qwen3-vl). **Try this first.**
- **`gemma4:e4b`:** about 6.6 GB. ScreenMind uses Gemma 4, and turning "thinking" off is much faster. Size reported by the search, not re-checked.
- **`d1:3b`:** 3.7 GB, from Liquid AI. A "decision model" that returns probabilities for set answers instead of writing text. It accepts images and uses a separate `/v1/systemone` endpoint. Confirmed on [ollama.com](https://ollama.com/library/d1). New and experimental, but a natural fit for on_track/unsure/off_track.
- For any model that "thinks", turn thinking off and keep the model loaded between checks.

## Gaps (searched for, not found)
- No open-source iPhone screen-recording detector besides Slowth.
- No image model or dataset for spotting Reels, Shorts or TikTok in screenshots. Since our app already knows the page address, simple address rules do that job for free.
- No fix for the 2-minute Shortcuts delay after unlocking.
- No maintained hiding rules for TikTok's mobile website.
