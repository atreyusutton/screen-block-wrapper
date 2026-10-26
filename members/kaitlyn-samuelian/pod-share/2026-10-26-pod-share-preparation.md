# Pod Share Preparation: Short-Form Scrolling on iOS

Oct 26, 2026 · Kaitlyn Samuelian · `screen-block-wrapper`, branch `kaitlyn-dev`

This is my reference and speaking guide for this week's pod share. The first part is what I need **during class**: a summary, a speaking flow, and the demo plan. Everything after that is the detailed background for answering questions.

Everything here is based on files in the repo, my test results and the Git history. Where something isn't written down anywhere, it says **✏️ FILL IN** or **❓ Unknown**.

### Status labels used throughout

| Label | Meaning |
| --- | --- |
| ✅ **Demonstrated** | I ran it on my iPhone and it worked, with written results |
| ⚠️ **Partly demonstrated** | Worked in a limited test; the full test hasn't been run |
| 🧪 **Implemented, untested** | The code exists but I haven't confirmed the behavior on a device |
| 📋 **Planned** | Written up as a plan or spec; no code |
| 🔍 **Research only** | Comes from documentation, forums or other products, not my own tests |
| ❓ **Unknown** | No evidence yet |

---

## Quick reference (use this in class)

### The project in one sentence

> We're trying to keep the useful parts of social media (messaging friends, seeing their posts, looking things up) while removing or interrupting the compulsive short-form scrolling, like Instagram Reels, instead of just blocking the whole app.

### My two approaches in one sentence each

- **Approach A, the screen watcher:** with my permission, a helper app watches the screen while I use the **real** Instagram app, so it could eventually recognize Reels and step in.
- **Approach B, the Reels-free wrapper:** my own iPhone app shows **Instagram's website** inside a built-in browser that I control, so I can remove Reels and Explore while keeping DMs, the feed and search.

### Status at a glance

| What | Status | Evidence |
| --- | --- | --- |
| Ideation (69 ideas, Options A–E) | ✅ Done | [`kaitlyn-ideation.md`](../../../kaitlyn-ideation.md), Oct 19 |
| iOS research: 4 reports | ✅ Done | [`research/`](../research/), Oct 21–22 |
| **A:** iOS 26 ReplayKit capture app (Exp 1-R26) | ⚠️ Built, runs on my iPhone, 1 short test passed | [Session 1 results](../experiments/exp1-r26-replaykit/results/2026-10-22-session1.md), Oct 22 |
| **A:** capture survives lock, app switches, 30 min, battery | ❓ Not tested yet | Same file, "Still to test" |
| **A:** recognizing Reels (detection) | 📋 Not built | No ML or heuristics in the code |
| **A:** stepping in (notification or shield) | 📋 Not built | No Family Controls in the code |
| **A:** iOS 27 ScreenCaptureKit version (Exp 1-S27) | 📋 Fully specified, kept, not built | [1-S27 README](../experiments/exp1-s27-screencapturekit/README.md); needs Xcode 27 and iOS 27 |
| **B:** Reels-free Instagram wrapper (Exp 3) | ✅ Version 2 works on my iPhone for most checks | [Session 1 results](../experiments/exp3-webview-instagram/results/2026-10-24-session1.md), Oct 24 |
| **B:** sending and receiving text DMs | ✅ Works | Tested by Kaitlyn after session 1; not yet in the results file |
| **B:** sending a photo in a DM | ❓ Not tested | Checklist item 5 |
| **B:** blocking the native Instagram app | 📋 Not built | Listed under "Later steps" |

### Suggested speaking flow (~5 minutes, then demo)

| # | Beat | Time | Key line |
| --- | --- | --- | --- |
| 1 | Where we started | 30 s | "Our pod's question: keep the good parts of social media without the compulsive scrolling." |
| 2 | Why blocking isn't enough | 30 s | "I need Instagram to message people, but I don't need 45 minutes of Reels." |
| 3 | Research with Claude | 45 s | "Before writing code, I used Claude to figure out what iOS even allows." |
| 4 | The iOS wall | 45 s | "No iPhone app can reach inside Instagram and remove the Reels tab. That's a hard rule." |
| 5 | Two ways around it | 30 s | "Either watch the real app's screen, or replace the app with a version I control." |
| 6 | What I built and tested | 1 min | Exp 1-R26 result + Exp 3 result (then demo) |
| 7 | Tradeoffs | 30 s | "One keeps the real app but can only notice. The other actually removes Reels but isn't the real app." |
| 8 | Next and feedback | 30 s | Ask the pod the 2–3 questions from Section 10 |

### Demo at a glance (details in Section 8)

1. **Exp3Web (wrapper), the main demo.** No Reels tab or Explore. Open DMs, then open a Reel a friend sent. Scroll down and get bounced back to the chat. Show the ✋ counter and "Recent pages".
2. **Exp 1-R26 (screen capture), optional, about 1 minute.** Start the broadcast and scroll Reels in the real Instagram app for about 30 seconds. Stop it, then show the run summary.
3. **Backup:** the results files on GitHub, plus screenshots and screen recordings made the day before.

### Don't claim

- ❌ "It detects Reels." The capture app only **measures** frames. It doesn't recognize anything yet.
- ❌ "It blocks Reels in the real Instagram app." Nothing I've built touches the native app.
- ❌ "It keeps working when the phone locks / all day / without draining the battery." Not tested.
- ❌ "Sending photos works in the wrapper." Sending and receiving text DMs is confirmed; photos haven't been tested.
- ❌ "It uses AI." There's no model in either app yet.
- ❌ "It's ready for the App Store." Both approaches have real policy risks (Section 4F, 5E).

### ✏️ Before class checklist

- [ ] Fill in the pod background in Section 1 (marked ✏️).
- [ ] Open both apps on the iPhone the night before. Free developer builds expire after 7 days: Exp1R26's expires **Oct 29**. Exp3Web was installed Oct 24, so its expiry is probably around Oct 31 (inference). If an app won't open, plug in and press ⌘R in Xcode.
- [ ] Check that Instagram is still logged in inside Exp3Web.
- [ ] Pick a DM thread that's OK to show on a projector, with a Reel a friend sent you in it.
- [ ] Optional: send a test photo in Exp3Web so you can update the last "not tested" DM item honestly.
- [ ] Make backup screen recordings (Section 8G).
- [ ] Know your allotted time: ✏️ FILL IN ___ minutes.

---

## Section 1: How we got here (project background and ideation)

### 1.1 The pod and the early conversations

✏️ **FILL IN** (none of this is documented in the repo):
- When and how our pod was formed, and who's in it.
  - The repo's team list on `main` names Atreyu Sutton, Kaitlyn Samuelian, Owen McMahon and Aja Kimsey.
  - Griffin Gallien has a research branch (`griffingallien/ios-research`). Check whether Griffin is in our pod.
- Other problem areas we talked about before settling on this one.
- The moment or reason we chose short-form scrolling.

**What is documented** is the pod's framing question, at the top of my ideation doc (Oct 19):

> "How do we keep the benefits of social media apps (connection, information, learning, community) without the drawbacks (compulsive short-form scrolling), in a way that's customizable and can't be easily bypassed?"

The ideation doc also records what our early pod notes covered: **"no bypass, watcher/checker, embedding vs. API calls, YouTube / X / Reddit / Facebook, and eliminating short-form."** Those notes are where many later ideas came from, including:
- the "watcher vs. checker" modes (idea #3)
- "no bypass" (the bypass ladder, #9)
- "embedding vs. API" (the platform feasibility table in section 7)

The repo was created on **Oct 19** (Atreyu's initial commit). The same evening, Atreyu added a feasibility analysis and a shared plan to the main README, and I committed my ideation doc.

### 1.2 The problem we're actually trying to solve

Reducing screen time and our goal are different:

| "Reduce screen time" | Our goal |
| --- | --- |
| Fewer minutes on the phone | Fewer minutes in the **compulsive loop**, with the useful parts kept |
| Usually means blocking the whole app | Means separating the parts of the app |
| Success = lower Screen Time number | Success = less regret, and people still get what they came for |

My ideation doc reframes the project from a noun ("a screen blocker") to a verb:

> "Helping people get what they came for from social media, and then leave, on purpose."

and, more pointedly:

> "Separating the *value* of social apps (friends, info, learning, community) from the *compulsion loop* (infinite feed + autoplay + variable reward + vertical video)."

That second framing suggests short-form video may be a **symptom**. The real engine is *infinite + algorithmic + autoplay* (ideation idea #22: "Challenge the assumption").

### 1.3 Why blocking whole apps isn't ideal

- **Instagram is a messaging app too.** Someone might genuinely need it to message friends, coordinate plans or reply to a club group chat, and not want to lose 45 minutes to Reels.
- **Blocking punishes the useful part along with the harmful part.** If Instagram is blocked, your DMs are blocked too. The research found existing blockers say this openly: AppBlock states it "cannot block specific features or sections within an app" on iPhone ([report 01](../research/01-ios-feasibility-investigation.md#can-we-restrict-just-one-view-inside-instagram-or-youtube)).
- **People work around blunt blocks.** If the block costs too much (missing a friend's message), people turn it off. My ideation doc puts it as: "Blocking invites rebellion. Boredom doesn't." (#20).
- **A shared Reel is different from a Reels binge.** Watching the one funny clip your friend sent is social. Swiping through 40 more is the problem. Ideation idea #6, **"Reels only via DMs"**, captures this. My wrapper app later implemented exactly that rule.

### 1.4 How the idea evolved in my ideation doc

I wrote a deliberately broad list: 69 numbered ideas organized with Felix Rieseberg's four kinds of ambition (speed, altitude, depth, range). It closes with five candidate combinations:

| Option | Idea | What it would build |
| --- | --- | --- |
| A | Practical build | Browser extension that hides Shorts/Reels, plus rules and reality checks |
| B | High-altitude build | AI "daily edition" digest so you never open the apps |
| C | Research-heavy build | Analyze our own watch history, predict binges |
| D | Mashup | A + regret minimizer + short→long redirect |
| **E** | **On-device build** | **Phone app that watches the screen with a tiny local model, plus a wrapper app, plus Screen Time blocking** |

**Option E is where my work went.** Option E's insight was that *web extensions only work in the browser, but the addiction mostly happens in native phone apps*. It listed four iOS approaches:
- **E1:** screen broadcast + tiny model
- **E2:** Screen Time shield
- **E3:** wrapper app
- **E4:** lighter hooks such as Shortcuts automations

My two approaches map directly onto it:

- **Approach A = E1 (+ E2 later):** watch the real app's screen.
- **Approach B = E3 (+ E2 later):** wrapper app with Reels removed.

The doc itself already said E3 + E2 is "the safety net" if screen-watching fights us. That turned out to be a good call (Section 4F).

### 1.5 Where the group's shared plan went

So I can place my work alongside the group's:

- **The shared plan on `main`** (Atreyu, Oct 19) is a **web app + Screen Time** design. You tell an AI agent what you're there to do, it agrees on a "session contract", and it revokes access if you drift.
  - It covers YouTube, Reddit and Facebook Marketplace.
  - It rates iOS as the "hardest" platform and suggests a native WebView "wrapper" as a later phase.
- **Aja's prototype** (branch `aja-workspace`, Oct 25) is a clickable web demo of that intent-gate flow.
- **Griffin's research** (branch `griffingallien/ios-research`, Oct 20) surveyed how existing "no Reels" products work on iPhone. It reached the same core conclusion as my research: the products *replace* Instagram, they never edit it.
- **My work** focused on the part the shared plan marked hardest: **iOS, and Instagram in particular**. That covers both the native app (Approach A) and the native WebView wrapper (Approach B).

---

## Section 2: My research and exploration using Claude

### 2.1 How I used Claude

✏️ **FILL IN / VERIFY:** the name of my Claude Project and what I put in it (for example, the ideation doc as context). The repo shows that the three main reports were written with Claude on **Oct 21** and live as Claude Docs (each repo copy links to its live version). The SocialLite report was written on Oct 22. The repo doesn't record the Project setup itself.

I used Claude in three ways:

1. **Research partner (Claude Project/Docs).** I asked what iOS actually allows, had it check Apple's documentation and developer forums, and had it compare existing apps. Each report labels every claim by evidence strength: Documented, Dev-reported, Inference or Unknown.
2. **Skeptical reviewer.** The second report exists to **challenge the first one**. It found six claims that were too optimistic and corrected them.
3. **Building partner (Claude Code in VS Code).** From Oct 22 on, Claude Code wrote the Swift and JavaScript for both experiments. My part of the work:
   - Created the Xcode projects and set up signing and the App Group.
   - Ran everything on my iPhone and performed the tests.
   - Reported results back (often as screenshots), and we debugged together. A disk-space crisis and the "Suggested Reels" bug (Section 5C) are two examples.

   Being upfront about this split is better than overclaiming. The interesting part of the process was the research → test → revise loop.

### 2.2 The research reports and their key findings

| # | Report | Date | Key findings |
| --- | --- | --- | --- |
| 01 | [iOS feasibility investigation](../research/01-ios-feasibility-investigation.md) | Oct 21 | **No public iOS API can block only the Reels view inside the native Instagram app.** The closest native option is "detect Reels by screen capture, then shield the whole app." True removal is possible only where we own the renderer (Safari extension or our own WKWebView). iOS 27 brings ScreenCaptureKit to iPhone, which could make the main app the capturer. Includes a framework table, feasibility matrix, prior art, and an audit of Option E. |
| 02 | [Risk verification plan](../research/02-risk-verification-plan.md) | Oct 21 | A skeptical second pass. Corrected six over-optimistic claims (below). Defined **five uncertainties, U1–U5**, that decide which designs survive. Split the problem into **feed entry vs. compulsion vs. gentle intervention**. Ranked experiments by how much each could rule out. |
| 03 | [iOS 26 / iOS 27 paths plan](../research/03-ios26-ios27-paths-plan.md) | Oct 21 | My phone runs iOS 26.5.2 and my Mac can't install Xcode 27 yet. So the first capture experiment became the iOS 26 **ReplayKit** version, with the iOS 27 version kept as a separate, fully specified experiment. Also flagged an Apple engineer calling capture-plus-ML detection "fundamentally unsuitable" (App Store risk). |
| 04 | [SocialLite prior art](../research/04-sociallite-prior-art.md) | Oct 22 | SocialLite, a popular shipping app, is essentially "own browser + Screen Time shields." It proves the wrapper approach can pass App Review. It never sees inside native apps, so the screen-watching question stays open. |

**The five uncertainties (U1–U5)** became the backbone of every experiment:

| ID | Question | If the answer is "no"… |
| --- | --- | --- |
| U1 | Does screen capture stay alive in the background and see real Reels pixels? | Native detection is dead |
| U2 | Can the capturing process trigger a Screen Time shield quickly and reliably? | Only nudges are left |
| U3 | Can cheap signals or a small model tell short-form scrolling apart from other use? | Only soft nudges are safe |
| U4 | Is a Reels-free web client good enough to be the useful path? | The Instagram wrapper path is dead |
| U5 | Will Apple allow it (App Review, Family Controls approval)? | No App Store, but still a valid research prototype |

**The six corrections in report 02** (a good example of the process being iterative):

1. "The handoff problem may disappear on iOS 27": that's a hypothesis, not a finding.
2. Background capture on iOS 27 is documented only *alongside an audio session*. Screen-only survival is undocumented.
3. "No documented memory cap" doesn't mean "no cap". Also, the GPU isn't available to background apps, so any model runs on the CPU and costs battery.
4. iOS gives no way to ask for fewer frames, so the app has to drop them itself, at an unknown cost.
5. Shield timing was downgraded to "plausible but with reported flakiness".
6. "Detect when the user stops capture and shield then": unproven. The user can always stop capture, so **the watcher can be a signal but never the enforcement**.

### 2.3 Existing products we looked at

From reports 01 and 04, plus Griffin's branch:

| Product | How it works | What it can't do |
| --- | --- | --- |
| one sec | Shortcuts automation on app open → breathing pause; Screen Time shields | Can't see Reels; only knows "Instagram opened" |
| Opal, ScreenZen, AppBlock, Brick | Screen Time whole-app shields, schedules, NFC unlock (Brick) | Block DMs along with Reels |
| Short Video Hider | Safari Web Extension | Doesn't affect the native apps |
| Dull | Own in-app browser that strips Reels before the page draws | Not the native app |
| **SocialLite** | Own browser + Screen Time shields on native apps + 10-minute "Post Mode" | Blind to the native app; web feature gaps (posting, notifications) |
| WallHabit, Slowth (open source, GPLv3) | ReplayKit screen recording + detection (per Griffin's research) | Reported to stop when the phone locks; App Store risk |

**The gap our research identified:** nobody we found combines *Reels-specific detection in the native app* with a path that *keeps the benefits*. Report 01 also notes that no App Store app we found detects Reels inside native Instagram by screen capture: "That may be our novelty, or a sign of App Review risk." (Griffin later found WallHabit, which apparently does something like this, so "novel" needs care.)

### 2.4 How the research narrowed things down, and kept options open

The research **ruled out**:
- editing Instagram's interface (impossible via public APIs)
- local-VPN traffic guessing (Apple says not to)
- network content filters (child or supervised devices only)
- any private-API trick

It **kept open** four architectures, which report 02 calls *layers, not rivals*:

| Report's label | What it is | My experiment |
| --- | --- | --- |
| **A** | Native watcher + shield or nudge | Exp 1-R26 (iOS 26), Exp 1-S27 (iOS 27) |
| **B** | Web client + shielded native apps | Exp 3 (wrapper) |
| C | Intent gate (Shortcuts) + Screen Time thresholds | Not built (closest to the group's main plan) |
| D | Safari extension | Not built |

So my **Approach A and B match the reports' architecture A and B**.

### 2.5 The iterative loop

1. **Ideated** broadly. Option E looked like the most exciting option, with a "tiny model watching the screen."
2. **Researched feasibility** (report 01). Editing Instagram is impossible, but capture + shield might work, especially on iOS 27.
3. **Stress-tested it** (report 02). Six claims were too optimistic. Defined U1–U5 and decided to test survival before building any AI.
4. **Hit a practical constraint** (report 03). My devices are on iOS 26, so I reordered to ReplayKit first while preserving the iOS 27 plan.
5. **Built and tested** Exp 1-R26 (Oct 22). Capture worked on a short run. A research assumption was challenged: the memory limit looked like about 300 MB, not the 50 MB we expected.
6. **Found SocialLite** (Oct 22) and researched it. It's proof that the wrapper approach ships.
7. **Built the wrapper** (Oct 24). Version 1 missed a way into Reels, a diagnostic showed why, and version 2 fixed it.

---

## Section 3: Understanding the iOS challenge

### 3.1 Sandboxing: why we can't touch Instagram's interface

**Simple version.** Every iPhone app lives in its own sealed box. Our app can't look inside Instagram's box, can't change anything in it, can't draw on top of it and can't press its buttons.

**Analogy.** Think of an apartment building. Each app is a locked apartment. You can't walk into your neighbor's apartment and move their furniture (remove the Reels tab). The building manager, **Screen Time**, can lock a whole apartment's front door for a while. It can't lock just one room inside.

**Technical detail for questions:**
- Apps are separate processes with separate file containers.
- iOS gives no public API to:
  - read another app's view hierarchy
  - inject code into it
  - draw over it
  - send it touches
- iOS has no equivalent of Android's AccessibilityService (which can read other apps' screens and press "back") or Android's draw-over-other-apps permission.
- App Review guideline 2.5.1 requires public APIs only, so private tricks get rejected.
- The only ways to actually modify Instagram are jailbreaking or a modified, sideloaded copy of the app. Both are outside the App Store and against Instagram's terms.

**So we can't "just remove the Reels tab" in the native app.** That's a hard platform rule, not a gap in our research.

### 3.2 Screen Time APIs: what they can and can't do

Apple's Screen Time APIs are really three frameworks:

| Framework | What it does | Limit |
| --- | --- | --- |
| **FamilyControls** | Asks the user (with Face ID) for permission; shows Apple's app picker | We only get opaque "tokens", never app names. Needs a special entitlement from Apple for App Store release |
| **ManagedSettings** | **Shields** (covers with a block screen) chosen apps, categories or websites | Whole app, whole category or whole domain. **Never one tab or screen inside an app** |
| **DeviceActivity** | Schedules and time thresholds ("after 20 minutes in Instagram today…") | Counts time the app is open, not which part of the app |

Plus **ManagedSettingsUI** to customize the shield screen (title, icon, buttons). The shield is "a poster", as Griffin's research put it: you can't put a DM inbox on it.

**Key point:** Screen Time can block *Instagram*, but it can't block *Reels*. It also can't tell whether you're in Reels or DMs.

For adults, it's also **friction, not a lock**: an adult can always revoke the permission in Settings. The strongest anti-bypass protections are documented only for child accounts.

### 3.3 ReplayKit and ScreenCaptureKit: seeing the screen

The **only** public way for an app to see what other apps show is screen capture, the same feature used for screen recording, livestreaming and screen sharing in video calls.

| | ReplayKit Broadcast Upload Extension | ScreenCaptureKit |
| --- | --- | --- |
| iOS versions | iOS 10–26 (deprecated in the iOS 27 SDK) | iOS 27+ on iPhone (new this year) |
| Who gets the frames | A separate mini-program (an "extension") that iOS runs on its own | Our main app |
| How it starts | User taps a system button and "Start Broadcast" | User picks from a system picker |
| Can it start automatically? | No (Apple engineer: "No") | No |
| Memory | Reported ~50 MB cap; **I measured ~300 MB available** (Section 4D) | App budget, undocumented |
| Keeps running in the background? | Yes, by design. Reported to stop when the phone locks | Only with the `screen-capture` background mode. Screen-only survival undocumented |
| Indicator | Red status-bar indicator while running | System indicator (exact look on iOS 27 unverified) |

**What capture gives you:** pixels only. It doesn't say "this is Instagram" or "this is the Reels screen". You'd have to figure that out from the image yourself.

**Analogy:** capture is like a **security camera** pointed at the screen. It can see everything, but it can't touch anything.

### 3.4 WKWebView: a browser inside our own app

**WKWebView** is Apple's web-page component, built on the same engine as Safari, that any app can put on its screen. Instagram has a mobile website (`instagram.com`) that includes the feed, profiles, stories, search and DMs.

**Why this changes everything:** when Instagram's *website* runs inside *our* app, the page is in **our** apartment, not Instagram's. So we're allowed to:

- **watch every address** the page goes to and cancel the ones we don't want
- **inject our own JavaScript and CSS** into every page before it draws
- **hide or change any element**
- **decide what happens with links** (open outside sites in Safari, block `instagram://` links that would jump to the native app)

**The difference from modifying the native app:** we're not changing Instagram's app at all. We're building our *own* Instagram viewer out of their website. The tradeoff is that it's the website, which has fewer features than the app (Section 5E).

### 3.5 Recognizing short-form content vs. preventing access

These are two separate problems, and confusing them is the most common mistake.

| | Recognizing ("is this a Reel?") | Preventing ("you can't watch this Reel") |
| --- | --- | --- |
| In the native app | Possible in principle, via screen capture + image analysis. **Not built yet** | **Impossible to do precisely.** We can only shield *all* of Instagram, or send a notification |
| In our wrapper | Easy: we can read the address and the page | Easy: we just don't show it, or bounce the user away |

**Example:** even if Approach A perfectly detects "you've been swiping Reels for 6 minutes", the best it can do is:
- (a) send a notification ("you've been in Reels 6 min"), or
- (b) shield the entire Instagram app for a while, which also blocks DMs.

It can't close the Reel, press back, or remove the tab.

Report 02 breaks this into **three separate problems**:

1. **Feed entry:** the user is in a short-form feed (a *state*).
2. **Compulsion:** the user is scrolling compulsively (a *pattern over time*: swipe rhythm, session length, time of day).
3. **Gentle intervention:** stepping in without breaking the useful parts.

The wrapper solves 1 and 3 well, and 2 barely matters there because the feed is gone. The screen watcher is the *only* way to observe 1 and 2 inside the real app, but its strongest response (a whole-app shield) is a poor fit for 3.

### 3.6 Why these limits led to two approaches

The sandbox leaves exactly two ways to get anywhere near "Reels-free Instagram" on iPhone:

1. **Watch from outside.** Keep the real app and observe its pixels (Approach A). You get the real experience but can only notice and nudge, or block everything.
2. **Replace it from inside.** Show Instagram inside a renderer we control (Approach B). You get precise removal, but in a web version instead of the real app.

---

## Section 4: Approach A, detecting short-form content inside native apps

### A. The idea

**From the user's side:** you use the **real Instagram app** normally. A helper app, running with your permission, notices when you go into Reels, or when the scrolling turns compulsive, and responds the way you've chosen. It might send a gentle nudge, show a reality check ("25 minutes of Reels tonight"), or pause Instagram for a while.

**Why that could be more valuable than a separate browser:**
- You keep the real app: notifications, posting, stories, close friends, everything.
- Nothing needs to change in how you use your phone.
- It could respond to **behavior** (40 minutes of swiping) instead of banning a feature (watching one Reel a friend sent is fine).
- In principle it could recognize short-form in **any** app (TikTok, YouTube Shorts, future apps), because it looks at the *format* on screen, not at one app's code (ideation idea #43).

### B. How it would work

| Step | What happens | Status |
| --- | --- | --- |
| 1. Permission | User taps the system broadcast button, then "Start Broadcast" | ✅ Demonstrated (Exp 1-R26) |
| 2. Receive frames while another app is open | Extension gets screen frames while Instagram is in front | ✅ Demonstrated on a short run (2 min 51 s); ❓ lock, calls, long runs untested |
| 3. Analyze frames on the phone | Extension measures each kept frame: brightness, a tiny "fingerprint" hash, memory use | ⚠️ Measurement only. Nothing is *recognized* yet |
| 4. Detect Reels vs. something else | Options: frame-change rhythm (swipes), text recognition (e.g. the word "Reels"), or a small Core ML image classifier | 📋 Not built. Research says try the cheap signals before any ML |
| 5. Recognize scrolling patterns | A short-form session looks like a full-screen change every 3–20 seconds. The frame hash could count those | 📋 Not built (the hash is the groundwork) |
| 6. Intervene | Local notification, or a Screen Time shield on all of Instagram | 📋 Not built. ❓ Whether the extension can even trigger a shield on iOS 26 is unknown (conflicting forum reports) |

**What's limited by iOS no matter what:** we only get pixels (never "which app" or "which screen"), the user must start capture manually every time, and the strongest response is whole-app.

### C. iOS 26 vs. iOS 27

| | **1-R26: ReplayKit (iOS 26)** | **1-S27: ScreenCaptureKit (iOS 27)** |
| --- | --- | --- |
| Folder | [`exp1-r26-replaykit/`](../experiments/exp1-r26-replaykit/) | [`exp1-s27-screencapturekit/`](../experiments/exp1-s27-screencapturekit/) |
| Status | ⚠️ Built and run once | 📋 Fully specified, not built |
| Frames arrive in | A separate extension process | The main app |
| Who could shield Instagram | The extension (if it can hold the entitlement) or a relay to the main app | The main app directly. The "handoff problem" may disappear (hypothesis) |
| API status | Deprecated in the iOS 27 SDK, still works on iOS 26 | Current |
| Needs | What I have: Xcode 26.1.1, iPhone on iOS 26.5.2 | macOS Tahoe 26.6+ (I'm on 26.3.1), Xcode 27, an iPhone on iOS 27 |

**Why start with ReplayKit?** It runs on the hardware I have today. Report 03 calls this "a reorder, not a replacement."

**What ScreenCaptureKit would change:**
- The app that sees the screen is the same app that holds the Screen Time permission, so detecting and shielding could happen in one place.
- No separate extension with its own memory budget.
- The big unknown becomes whether a *screen-only* background app stays alive. Apple documents it only alongside an audio session, and an always-on microphone as a keep-alive trick is explicitly ruled out (policy and trust).

**What's reusable between the two:**
- the test protocol and pass/fail thresholds ([shared README](../experiments/shared/README.md))
- the NDJSON log format (both write the same fields, tagged `r26` or `s27`)
- whether Reels pixels are readable at all (Instagram's content protection doesn't depend on the capture API)
- any labelled screenshot dataset, signal heuristic or model
- the Screen Time shield extensions, when built
- the web client experiment

**Not reusable:** the capture plumbing, the survival and lifecycle results, the memory budget, and any "shield from the extension" finding. A pass on one doesn't predict a pass on the other.

**Why both are preserved:** ReplayKit is what I can test now, but it's deprecated. ScreenCaptureKit is the future API, and it may solve the handoff problem. Neither result predicts the other. The 1-S27 README says at the top: "Active path. It has not been abandoned or replaced."

### D. What I've actually built and tested (Exp 1-R26)

**Files and components** (all in [`exp1-r26-replaykit/Exp1R26/`](../experiments/exp1-r26-replaykit/Exp1R26/), about 550 lines of Swift):

| File | Target | What it does |
| --- | --- | --- |
| `Exp1R26/ContentView.swift` | Host app | Screen with Apple's broadcast button (`RPSystemBroadcastPickerView`, mic off), a list of past runs, and a Share button for the log |
| `Exp1R26/RunSummary.swift` | Host app | Turns a run's log into numbers: coverage, blank frames, changed frames, longest gap, peak memory, memory limit |
| `BroadcastExtension/SampleHandler.swift` | Extension | Receives video frames from ReplayKit (audio ignored) and hands them to the recorder |
| `BroadcastExtension/FrameRecorder.swift` | Extension | Keeps **1 frame every 2 seconds** and drops the rest. For each kept frame: mean brightness and a 16×16 **difference hash** (a tiny fingerprint that changes when the picture changes). Logs memory use and a heartbeat every 2 s |
| `BroadcastExtension/FrameLogWriter.swift` | Extension | Appends one JSON line per event to a file in the shared App Group folder |
| `BroadcastExtension/FrameLog.swift` | **Both** | The shared log format (events: started, frame, heartbeat, paused, resumed, finished) |
| `*.entitlements` | Both | App Group `group.com.kaitlynsamuelian.Exp1R26`, so the app can read what the extension wrote |

**Privacy design:** pixels are read in place, then thrown away. No images, no audio and nothing over the network. The app's footer says so on screen.

**Does it build and run?** ✅ Yes. Xcode debug build on my **iPhone 16 Pro, iOS 26.5.2**, signed with a free Personal Team.

**Has capture been tested on a physical iPhone?** ✅ Yes, once. **Run 1, Oct 22** (run `894040B1`): I started the broadcast from the app, scrolled Instagram Reels, and stopped from the status bar. Results ([session 1](../experiments/exp1-r26-replaykit/results/2026-10-22-session1.md); raw log [`2026-10-22-run1.ndjson`](../experiments/exp1-r26-replaykit/results/2026-10-22-run1.ndjson), 170 lines, numbers only):

| Measure | Result | Pass criterion | Verdict |
| --- | --- | --- | --- |
| Duration | 2 min 51 s | 30 min for the full test | **Short run** |
| Coverage of 2-second windows | 98% | ≥ 95% | Pass |
| Longest gap | 2.0 s | — | No dropouts |
| Frames received | 8,161 (~40–60 per second); kept 84 | — | Steady stream |
| Frame size | 884×1920 | — | Scaled down from the screen |
| Changed frames | 72 of 83 pairs | Frames change | Pass |
| Blank (black) frames | 0 | Non-black | Pass |
| Peak memory | 6.9 MB | < 40 MB | Pass |
| Memory limit observed | ≈ 300 MB | (research expected ~50 MB) | **Surprise** |
| How it ended | `broadcastFinished` (I stopped it) | Stop cause recorded | Pass |
| Battery | Not measured (phone was charging) | ≤ ~8 points/hour | **Not tested** |

**Findings:**
1. **Instagram doesn't black out Reels during capture.** Frames were real and changing.
   - Caveat: no image was saved, so nobody has *looked* at a captured frame. The numbers show real, changing content.
   - Confirmed for this Instagram version on this date.
2. **The memory limit looked like ~300 MB, not ~50 MB.** If that holds with Xcode disconnected, there's far more room for an on-device model than planned. Not yet confirmed.
3. A normal stop logs a "paused" ~2.6 s before "finished", so one pause right before a finish isn't an interruption.
4. ReplayKit sends ~40–60 frames per second and we drop ~99% of them. Measuring 1 every 2 s cost almost nothing.

**Problems I hit:**
- **The Mac's disk filled up (118 MB free)** in the middle of creating the extension target. That left the project half-written and caused a "Multiple commands produce Info.plist" error. Fixed by recreating the template files and unticking `Info.plist`'s target membership.
- **Deleting the iOS Simulator runtime to free space broke device builds too.** Xcode 26 needs it even for a real iPhone. Re-downloading it twice at once created an unusable duplicate.
- **Free Personal Team works**, including App Groups, but builds expire after 7 days (this one on Oct 29).

**What's still missing:**
- ❓ Lock/unlock, switching between several apps, incoming call, Low Power Mode
- ❓ A 30-minute unplugged run with battery measurement
- ❓ The memory limit with Xcode closed
- 📋 Any recognition (heuristic or ML): 1-R26b
- 📋 Any intervention (notification or Family Controls shield): 1-R26c
- 📋 The offline analysis script (`analysis/summarize.py`). The app computes the summary instead.
- 📋 Visually confirming frames (an opt-in labelled thumbnail session)

### E. Strengths of Approach A

- **Works with the real native app.** Nothing changes about how you use Instagram.
- **Keeps the original experience:** notifications, posting, close friends, everything the website lacks.
- **Could work across apps.** Detecting the short-form *format* on screen could cover TikTok, YouTube Shorts and apps that don't exist yet, with no per-app integration. A wrapper needs one integration per platform, and TikTok has almost nothing to keep on the web.
- **Measures behavior, not just presence.** It could tell "watched one Reel a friend sent" from "40 minutes of swiping" by counting the swipe rhythm.
- **Personal and context-aware:** respond differently at 11pm vs. 3pm, or nudge first and shield only later.
- **Measurement as a product.** Even with no blocking at all, a week of capture could tell you "62% of your Instagram time is Reels." Screen Time can't tell you that.
- **Simpler privacy story in one way:** it never handles your Instagram login or cookies.
- **Potential novelty.** SocialLite and similar apps don't observe native apps. Griffin found a few that do (WallHabit, Slowth), so it's not unexplored, but it's rare.

### F. Limitations and risks

| Risk | Detail | Evidence |
| --- | --- | --- |
| **Background reliability** | Reported to stop when the phone locks. Untested by me for lock, calls or long sessions | Dev-reported; ❓ |
| **Manual start every time** | No app can start capture by itself. After a stop, the user has to tap again | Documented + Apple engineer: "No" |
| **Permission and creepiness** | A red recording indicator stays on. "An app that watches your screen" needs a very clear privacy story, even when nothing leaves the phone | Report 01 |
| **Privacy** | Frames include DMs, passwords and everything else on screen. My design measures and discards; a real detector must too | Design |
| **Memory, CPU, battery** | ~40–60 frames per second arrive even though we keep 1 every 2 s. Background apps can't use the GPU, so a model would run on the CPU. Battery is **unmeasured** | Report 02; ❓ |
| **Detection accuracy** | No published benchmark for "is this a Reel?" Needs our own data. Instagram redesigns could break it | ❓ U3 |
| **False positives** | Wrongly shielding Instagram while someone is messaging would destroy trust. Report 02: moderate accuracy allows only soft nudges | Report 02 |
| **Whole-app shield only** | Detecting a Reel doesn't let us remove that Reel. The strongest response also blocks DMs | Hard iOS limit |
| **Can't reach the shield from the extension?** | On iOS 26 it's unknown whether the extension can hold the Family Controls entitlement | Conflicting forum reports |
| **App Store** | In Oct 2026 an Apple DTS engineer called screen recording + ML to detect the foreground app "fundamentally unsuitable" and said ScreenCaptureKit "doesn't change" that. Background-mode rules (2.5.4) add risk | [Forum 837850](https://developer.apple.com/forums/thread/837850) |
| **Bypass** | The user can stop capture any time from the status bar. The watcher can never be the enforcement, only a signal | Report 02 |

**The core point:** detecting a Reel doesn't mean we can remove that Reel from Instagram. The best possible native response is a nudge or a whole-app pause.

### G. What comes next for Approach A

In order, cheapest and most decisive first:

1. **Finish the U1 tests with the existing app (no new code):** lock/unlock, multiple app switches, call, Low Power Mode, a 30-minute unplugged Reels run with battery % before and after, then a run with Xcode closed to check the memory limit.
2. **Cheap-signal check (almost no new code):** record separate runs of Reels, the home feed and DMs, then compare the difference-hash change rhythm in the logs. If Reels scrolling has a distinct rhythm, detection might not need ML at all. (Inference: the hash is already logged, but nobody has analyzed it this way yet.)
3. **1-R26b:** add a tiny heuristic or Core ML check inside the extension and measure CPU and memory.
4. **1-R26c:** try an intervention.
   - (a) A local notification from the extension (untested).
   - (b) A Family Controls shield. Needs the entitlement; whether a free Personal Team supports it is unverified.
5. **1-S27** once I can get macOS 26.6+, Xcode 27 and an iOS 27 iPhone.

**Evidence that would make it worth continuing:**
- Survives a 30-minute run at ≥ 95% coverage
- Battery cost ≤ ~8 points/hour
- Cheap signals tell Reels from DMs with ≥ 90% precision
- At least one intervention (even just a notification) works from the capture process

**Findings that would make me reconsider:**
- Capture dies on every lock or app switch. That would make it a "session mode" coach you start each time, not an always-on watcher.
- Battery drain is clearly too high.
- Reels can't be told apart from other video reliably.
- No intervention route works from the extension.
- A firm App Review rejection, which would stop distribution but not the research.

---

## Section 5: Approach B, the SocialLite-inspired Instagram wrapper

### A. Where the inspiration came from

The wrapper idea was already in my ideation doc (#67, Option E3), and report 01 found products that do it (Dull). On Oct 22 I researched **SocialLite** ([report 04](../research/04-sociallite-prior-art.md)), which made it concrete.

**What SocialLite publicly says it does** (developer-stated):
- "Keep the social. Lose the scroll." Instagram, YouTube, Snapchat, Facebook, X and Reddit with short-form feeds, Explore, recommendations and ads removed.
- Keeps DMs, profiles, content friends send you, and posting.
- A Reel a friend sends plays, but "you can't scroll to the next one." One user wrote: "They take you right back to chat!"
- Screen Time shields on the native apps, plus a 10-minute **Post Mode** unlock for posting.
- 4.8 stars from ~15K US ratings; free with Pro subscriptions; iOS 17+.

**What I inferred about how it works** (not confirmed; I never installed or reverse-engineered it):
- **Probably a WKWebView browser** loading the platforms' websites. Its privacy policy says it stores platform cookies to keep you logged in. Reviews call it a "proxy Instagram". Apple requires browsing apps to use WebKit.
- **It probably hides elements by their English text.** A release note says Instagram blocking now works in other languages "by forcing english." That suggests its code looks for labels like "Reels". So I designed mine to match **addresses, not text**.
- Its blog's claim of stripping Reels "at the system level" is marketing. It conflicts with every piece of technical evidence.

**Why it mattered:** SocialLite is evidence that a wrapper + Screen Time app can pass App Review (it has Apple's Family Controls distribution entitlement), and that people will actually use one. It doesn't make Approach A redundant, because it never sees the native app.

**Preservation note:** I didn't copy any SocialLite code and didn't assume access to its internals. My wrapper is written from scratch from Apple's public APIs.

### B. How this approach works

**Plain version:** instead of changing Instagram's app, I built my own iPhone app that contains a browser. The browser opens Instagram's website. Because I own the browser, I decide what it shows and where it's allowed to go.

**The architecture** (`Exp3Web`, one app target, no extensions):

```text
┌──────────── Exp3Web (my app) ───────────┐
│  WKWebView showing https://instagram.com │
│    ├─ BlockReels.js injected at page     │
│    │   start: hides links (CSS) and      │
│    │   watches full-screen videos (JS)   │
│    └─ reports "allowed"/"blocked" ───┐   │
│  WebController (Swift)               ▼   │
│    ├─ address guard (watches every URL)  │
│    ├─ link rules (Safari / block app)    │
│    └─ BlockLog (counts by category)      │
│  Bottom bar: Back · Messages · Search · ✋│
└──────────────────────────────────────────┘
```

**The techniques, explained:**

- **WKWebView:** Safari's engine, embedded in my app (Section 3.4).
- **JavaScript injection:** a `WKUserScript` runs my script **at document start**, on every Instagram page, before the page draws, so blocked elements never flash on screen.
- **CSS / DOM manipulation:** the page is a tree of elements (the **DOM**). A CSS rule like
  ```css
  a[href$="/reels/"] { display: none !important; }
  ```
  means "any link whose address ends in `/reels/`, don't show it." That one rule removes the Reels tab *and* every profile's Reels tab, in any language.
- **URL interception:** before each navigation, iOS asks my app "allow or cancel?" (`decidePolicyFor`). I cancel blocked addresses and send the user to the DM inbox.
- **Dynamic content (single-page app):** Instagram's website changes pages *without* loading a new page; it just rewrites the address. My navigation check never sees those changes, so the app also **observes the web view's `url` property**, which updates on every address change, and runs the same rules there.

**The filtering rules, with concrete examples:**

| Address | Decision | Why |
| --- | --- | --- |
| `instagram.com/reels/` | ❌ Bounce to DMs | The Reels feed |
| `instagram.com/explore/` | ❌ Bounce to DMs | The Explore grid |
| `instagram.com/explore/search/` | ✅ Allowed | Search stays useful |
| `instagram.com/somefriend/reels/` | ❌ Bounce to DMs | A profile's Reels tab |
| `instagram.com/reel/ABC123/` | ✅ Allowed | One Reel someone sent you |
| `/reel/ABC123/` → `/reel/XYZ789/` | ❌ Counted as a swipe | Moving straight from one Reel to another |
| `instagram.com/direct/inbox/` | ✅ Allowed | DMs |
| A link to another website | Opens in Safari | Keep the wrapper focused |
| `instagram://…` (open the native app) | ❌ Cancelled | Would leave the wrapper |
| `facebook.com` | ✅ Allowed | The login flow may pass through it |

**The "Suggested Reels" rule (version 2).** Instagram plays a shared Reel in an overlay **on top of the DM chat, without changing the address**, and loads "Suggested" Reels as you scroll. Address rules can't see that, so the script watches videos instead:
- A video is "full-screen" if it fills at least 80% of the visible height and 90% of the width. Feed posts and in-chat videos don't count.
- A full-screen video that starts **within 4 seconds of a tap** is allowed: that's the Reel you opened.
- A **different** full-screen video that starts **without a tap** is paused. The app counts "Scrolled to another Reel" and reloads the chat, which closes the viewer.
- It's a heuristic. A tap inside the viewer (like mute) followed by a quick scroll could slip through.

**Why this is possible here but not in the native app:** the website runs inside *my* app's process, so I can change it. The native Instagram app runs in its own sandbox, which I can't touch (Section 3.1).

**Privacy design:**
- Passwords are typed into Instagram's own page, and my script never reads forms, messages or page content.
- The only thing the script reports to the app is "allowed" or "blocked" for full-screen videos.
- Block counts are stored by category only. The "Recent pages" diagnostic shows page *shapes* with usernames and IDs replaced by `{id}`, kept in memory only.
- Nothing is sent anywhere by my code.

### C. What I've actually built and tested (Exp 3)

**Project structure** ([`exp3-webview-instagram/Exp3Web/Exp3Web/`](../experiments/exp3-webview-instagram/Exp3Web/Exp3Web/), about 470 lines of Swift and JavaScript):

| File | What it does |
| --- | --- |
| `InstagramWebView.swift` | `WebController`: creates the web view, injects the script, runs the address guard, handles links and new-window requests, reacts to "blocked" video messages |
| `BlockReels.js` | CSS that hides Reels and Explore links; the full-screen video rule |
| `BlockLog.swift` | Counts blocks by category (saved), plus an in-memory "Recent pages" list with IDs removed |
| `ContentView.swift` | The screen: web view + bottom bar (Back, Messages, Search, ✋ count) and the "Kept out" sheet with counts, recent pages and Reset |
| `Exp3WebApp.swift` | App entry point |

**Tested on Oct 24** (iPhone 16 Pro, iOS 26.5.2, Xcode debug build, my own Instagram account). [Full results](../experiments/exp3-webview-instagram/results/2026-10-24-session1.md):

| # | Check | Result |
| --- | --- | --- |
| 1 | Log in | ✅ (2FA not reported) |
| 2 | Still logged in after closing and reopening the app | ✅ |
| 3 | DM inbox opens; a thread opens and messages show | ✅ |
| 4 | Send a text DM, receive one | ✅ (tested after session 1; not yet in the results file) |
| 5 | Send a photo in a DM | ❓ **Not tested** |
| 6 | No Reels tab or Explore visible | ✅ |
| 7 | Profile Reels tabs | ✅ Hidden |
| 8 | A Reel a friend sent plays once; scrolling to more is blocked | ❌ in version 1 → ✅ **in version 2** (blocked 2 of 2 tries, no false blocks) |
| 9 | Home feed, a profile, stories | ✅ |
| 10 | Search | ✅ |
| 11 | Links to other websites open in Safari | ✅ (tested from a profile link) |
| — | "Use the app" prompt from Instagram | Shown inside the web view; not handled |

**The debugging story (good to tell):**
1. Version 1 assumed each new Reel would change the address. Testing showed I could still scroll from a friend's Reel into more Reels.
2. I added a "Recent pages" diagnostic. It showed the DM thread address, then **7 videos starting with no address change**, under a "Suggested" label.
3. Finding: Instagram's mobile site opens shared Reels in an overlay and feeds you algorithmic Reels without changing the page address.
4. Version 2 watches full-screen video playback instead. Retest: a friend's Reel played (allowed), scrolling got blocked and bounced me back to the chat, reopening the friend's Reel still worked, the block happened again on a second try, and browsing the feed and a profile afterward caused zero false blocks.

**Answers to the specific questions:**

- **Are Reels actually hidden or blocked?**
  - The Reels tab, Explore and profile Reels tabs: ✅ hidden.
  - Scrolling from a shared Reel into Suggested Reels: ✅ blocked (2/2).
  - Reels that appear *inside the home feed* as normal posts: ❓ not checked. They aren't full-screen, so the video rule wouldn't catch them.
- **Can direct Reels links still be accessed?**
  - A single shared Reel: **yes, on purpose** (the "Reels only via DMs" rule).
  - The Reels feed address `/reels/`: blocked in code 🧪. But no on-device test specifically opened that address (the app has no address bar), and the session's counter showed zero "Reels feed" blocks.
- **Do DMs work?** Reading: ✅ (inbox and threads). Sending and receiving text messages: ✅. Sending a photo: ❓ not tested.
- **Which Instagram features remain?** Confirmed: login, DMs (reading, sending and receiving text), home feed, profiles, stories, search, outside links. Not confirmed: sending photos, whether feed videos play normally (the log showed no false blocks, but small videos aren't logged), posting, notifications.

**Bugs, limits and incomplete features:**
- "Use the app" prompt still appears.
- The video rule is a heuristic (tap-then-quick-scroll gap).
- No notifications (the README notes `WKWebView` has no web push).
- Nothing stops me from just opening the native Instagram app.
- Free-team build expires every 7 days.
- No settings: the rules are fixed in code.
- Optional 3-day "only Instagram" trial: not done.

### D. Strengths of Approach B

- **Fast to build.** Version 1 and version 2 were built and tested in one day (Oct 24). One app target, no extensions, no special entitlements.
- **Precise control over what's visible.** It actually *removes* Reels; it doesn't just notice them.
- **Easy to target specific sections** by address: keep `/explore/search/`, block `/explore/`.
- **No continuous screen recording:** no red indicator, no frames of your private screens.
- **Low battery and complexity cost** compared with processing 40–60 frames per second. (Battery hasn't been measured, but it's a normal web view plus one script that runs once a second.)
- **A straightforward demo.** You can see Reels missing, and you can watch the bounce happen.
- **Shipping precedent:** SocialLite, Dull and others are on the App Store.
- **Implements an ideation idea exactly:** #6, "Reels only via DMs."

### E. Limitations of Approach B

| Limitation | Detail |
| --- | --- |
| **Not the real app** | It's Instagram's website in my wrapper. The look, speed and features differ |
| **Website ≠ app** | SocialLite users report missing video/story upload, close friends and photo editing. I haven't tested posting at all |
| **Login** | Worked for me (no 2FA tested). Meta has restricted Facebook Login in embedded browsers before, and Google blocks sign-in in embedded web views (relevant if we add YouTube) |
| **Notifications** | None, so you could miss messages. SocialLite reviewers complained about exactly this |
| **Instagram changes its website** | Addresses or page structure can change without notice. My rules match addresses (more stable than text), but the "Suggested" overlay shows that new patterns appear. The "Recent pages" diagnostic exists to catch this |
| **Easy bypass** | Just open the native Instagram app. Fixing that needs Screen Time shields (Family Controls entitlement; not built) |
| **Policy** | App Review 5.2.2 (third-party content and services) and Meta's terms. Fine as a personal research prototype; real risk if distributed |
| **Less flexible than detection** | It removes features rather than responding to *behavior*. It can't tell a mindful 5 minutes from a binge, and it needs one integration per platform (TikTok has little to keep on the web) |
| **Blind to everything outside it** | If you open the native app, nothing sees what happens |

### F. What comes next for Approach B

**Quick improvements (hours to a day):**
- Test sending a photo in a DM (checklist 5); confirm feed videos play.
- Check whether Reels show up inside the home feed.
- Try the optional 3-day trial and log breakages.
- A "DMs only" mode that blocks everything outside `/direct/`.
- Simple settings: toggles for Explore, feed and shared Reels.

**Medium (days):**
- Handle the "use the app" prompt (fragile, depends on page structure).
- Filter Reels that appear in the home feed.
- `STWebpageController`, so time in the wrapper shows up in Screen Time.
- Add a second platform: `m.youtube.com` with `/shorts/ID` → `/watch?v=ID` (ideation #2). Facebook would also connect to the group's Marketplace gap, which the main README notes "a native WebView can load."

**Larger or speculative:**
- **Shield the native Instagram app** with Family Controls so the wrapper becomes the default door. This needs the entitlement and possibly a paid developer account.
- Notifications for DMs (unclear how without a server; even SocialLite's method is unknown).
- **Combine with Approach A**: the wrapper as the good path, the screen watcher as the referee for the native app (Section 6).

**Test before expanding:** checklist item 5 (photos), a multi-day trial, and whether the rules survive Instagram updates for a week or two.

---

## Section 6: Comparing Approach A and Approach B

| Dimension | **A: Screen watcher (native)** | **B: Reels-free wrapper** |
| --- | --- | --- |
| Core idea | Watch the real app's screen; recognize and respond | Replace the app with Instagram's website in a browser I control |
| User experience | Real Instagram, unchanged; red recording indicator; (future) nudges or pauses | Instagram's website in my app, minus Reels and Explore; bottom bar |
| Architecture | Host app + Broadcast Upload Extension + App Group (iOS 26); single app (iOS 27) | One app: WKWebView + injected script + address guard |
| iOS APIs | ReplayKit (`RPSystemBroadcastPickerView`, `RPBroadcastSampleHandler`); later ScreenCaptureKit, Core ML/Vision, FamilyControls/ManagedSettings | WebKit (`WKWebView`, `WKUserScript`, `WKNavigationDelegate`, script messages); later FamilyControls |
| Current status | ⚠️ Capture + measurement only; one 2:51 run | ✅ Version 2 working prototype |
| What works today | Receiving real, changing Instagram Reels frames while Instagram is in front; low memory | Login, DMs (read, send, receive text), feed, profiles, stories, search; Reels and Explore gone; scrolling from a shared Reel blocked |
| Main limitations | Can't remove Reels, only notice; whole-app shield only; lock/battery unknown; no detection yet | Not the real app; website gaps; no notifications; easy to bypass via the native app |
| Development complexity | High: extension, memory limits, detection, intervention handoff | Low–medium: one target, some JavaScript |
| Time to usable prototype | Capture logger in ~1 day (with setup problems). Detection + intervention: ❓ days to weeks | Working version in ~1 day |
| Privacy | Sees *everything* on screen (processed and discarded); indicator feels like being watched | Sees only pages it loads; holds Instagram login cookies on the device |
| Battery and performance | ❓ Unmeasured. 40–60 frames/s delivered; CPU-only inference later | ❓ Unmeasured; likely close to normal browsing (inference) |
| Customization | High in principle: time, behavior, per-app, graduated responses | Medium: per-section rules by address; settings not built |
| Bypass resistance | Low as enforcement: the user can stop capture any time | Low alone (open the native app); medium with a native-app shield |
| Preserves messaging | Fully (the real app), unless we shield the whole app | Text DMs ✅ (read, send, receive); photos ❓; no notifications |
| Targets Reels specifically | Detection could be Reels-specific; the *response* can't be | Yes, precisely |
| Works across multiple apps | Potentially any app, by format | One integration per platform |
| App Store feasibility | High risk: DTS called it "fundamentally unsuitable"; background-mode rules | Moderate risk: 5.2.2 and Meta's terms, but shipping precedent (SocialLite) |
| Novelty / room to grow | Rare; behavior detection, measurement, cross-app | Crowded (SocialLite, Dull), but a solid base to build on |

### The tradeoff in plain language

- **Approach A is the ambitious one.** It keeps the real Instagram and could understand *behavior*, not just block a tab. But it can only *see*, never *touch*. Even perfect detection ends in "send a nudge" or "pause all of Instagram". Its reliability, battery cost and App Store chances are all open questions.
- **Approach B is the practical one.** It actually removes Reels today, and DMs, feed and search still work. But you're no longer using the real app. Some features are missing, there are no notifications, and nothing stops you from opening the native app.
- **Put simply:** A is a security camera that can see everything but can't open or close any doors. B is a different building where the Reels room was never built.

### Could they work together?

Yes. The research suggested exactly this. Report 01 calls it "**watcher as referee, web client as the good path**":

1. The wrapper (B) is the easy, always-available, Reels-free way to message and browse.
2. The native app is shielded by default, with timed unlocks for things the website can't do (like SocialLite's Post Mode).
3. The screen watcher (A) only runs during those native sessions, or in a "session mode" you start yourself. If it sees Reels or compulsive swiping, it nudges or ends the unlock early.

The detector doesn't need to be perfect in that design, because it only decides when to add friction. This is still only an idea; nothing of it is built.

---

## Section 7: My actual progress, in order

Grounded in the Git history (`git log --all`) and the dated files.

| Date | What happened | Evidence |
| --- | --- | --- |
| ✏️ before Oct 19 | Pod formed; initial conversations; notes on "no bypass, watcher/checker, embedding vs API, YouTube/X/Reddit/Facebook, eliminating short-form" | ✏️ FILL IN; notes summarized in the ideation doc |
| Oct 19 | Repo created (Atreyu). I added myself to the team list. Atreyu added the feasibility analysis and the "web app + Screen Time" plan; Owen and Aja set up workspaces | Commits `455b45e`, `e5c1758`, `6b896a1`, `c8e9032`, `4f5041d` |
| Oct 19 | **I committed my ideation doc**: 69 ideas, Options A–E, a feasibility table and a scoring rubric | `5c7a634` |
| Oct 20 | Griffin pushed iOS research on how "no Reels" products work | `3d99279` (`griffingallien/ios-research`) |
| Oct 21 | **Research with Claude:** feasibility investigation, risk verification plan, iOS 26/27 paths plan | Reports 01–03 (dated Oct 21) |
| Oct 21 | **Set up my GitHub workspace**: research snapshots, shared protocol and metrics, both capture experiment plans | `fea1351` |
| Oct 22 | **SocialLite research** | `3ba433f` (report 04) |
| Oct 22 | **Started iOS development.** Built Exp 1-R26 in Xcode with Claude Code; fought a full disk and a missing Simulator runtime; first device run at 14:49 (2:51 of Instagram Reels, all checkable criteria passed) | `759ff52`, session 1 results |
| Oct 24 | **Built the wrapper (Exp 3).** Version 1 tested (most checks pass; Suggested Reels leak); diagnostic found the overlay; version 2 fixed it and was retested | `7ead110`, session 1 results |
| Oct 25 | (Teammate) Aja pushed a clickable intent-gate web prototype | `45b44dc` (`aja-workspace`) |
| Oct 26 | This prep document | This file (not committed) |

**What this timeline shows:** about two days of research and planning came before any code. The code itself was then built in two focused days, and each built experiment was tested on a real device and written up with honest pass/fail results.

---

## Section 8: Demo preparation

### A. What I can demo successfully

| Demo | Confidence | Why |
| --- | --- | --- |
| Exp3Web: no Reels tab or Explore; DMs open; feed, profile, search | High | Tested ✅ Oct 24 |
| Exp3Web: open a friend's Reel → scroll → bounced to chat; ✋ counter and Recent pages | High–medium | Tested ✅ 2/2 in version 2. Depends on Instagram not changing its site since Oct 24 |
| Exp3Web: outside link opens in Safari | Medium–high | Tested ✅ once |
| Exp 1-R26: start broadcast, scroll Reels, stop, show the run summary | Medium–high | Tested ✅ once. The run-summary screen is built for exactly this |

### B. What to avoid claiming or attempting live

- Don't **lock the phone** during the capture demo hoping it survives. That's untested and reportedly fails. (If you want to be bold, say "this is the test I haven't run yet" and try it. A failure is still a real result.)
- Don't **send a photo** live unless you've tested it beforehand. (Sending a text DM is tested, if you want to show it.)
- Don't say the capture app **detects** or **blocks** anything.
- Don't type a `/reels/` address expecting a bounce. There's no address bar, and it hasn't been tested on the device.
- Don't open your **real DM inbox** on a projector without checking what's visible.

### C. What to have ready

| Item | Notes |
| --- | --- |
| iPhone 16 Pro, charged | Both apps installed: **Exp 1-R26** and **Exp3Web**. Instagram app installed and logged in |
| Mac + USB cable | In case a build expired (re-run with ⌘R in Xcode 26.1.1) |
| Xcode projects | `experiments/exp1-r26-replaykit/Exp1R26/Exp1R26.xcodeproj` and `experiments/exp3-webview-instagram/Exp3Web/Exp3Web.xcodeproj` |
| Showing the phone screen | **QuickTime Player** › File › New Movie Recording › click the arrow next to the record button › choose the iPhone as the camera. Test this beforehand |
| Safe DM thread | One with a Reel a friend sent, and nothing private on screen |
| Phone settings | Do Not Disturb on (no notifications on the projector); Instagram muted |
| Browser tabs (backup) | The two results files and this document on GitHub (`kaitlyn-dev` branch) |
| Simulator runtime | Xcode needs the iOS platform component even for device builds. If Xcode says "iOS 26.1 is not installed", go to Xcode › Settings › Components and download it the day before, not in class |

### D. Best order

1. **Wrapper first**, because it's the most visual and the most reliable.
2. **Screen capture second**, because it's quicker and builds on "here's the other way to do it."
3. **Close** on the tradeoff and the questions for the pod.

### E. Step-by-step walkthrough

**Part 1: Exp3Web (about 2–3 minutes)**

| Step | Do | Say |
| --- | --- | --- |
| 1 | Open **Exp3Web** | "This is my own app. Inside is Instagram's *website*, in a browser I control." |
| 2 | Show the home feed and the tab bar | "Notice there's no Reels button and no Explore. They're hidden by a one-line CSS rule that matches the link *address*, so it works in any language." |
| 3 | Open a profile; show there's no Reels tab | "Even profiles' Reels tabs are gone, same rule." |
| 4 | Tap **Search** (bottom bar) | "Search still works. I block the Explore grid but keep `/explore/search/`." |
| 5 | Tap **Messages**; open the safe thread | "DMs work. That's the whole point: keep the social part." |
| 6 | Tap the Reel your friend sent | "A Reel a friend sends still plays. That's an idea from my ideation doc: Reels only through DMs." |
| 7 | **Scroll down** to the next Reel | "But Instagram tries to feed me 'Suggested' Reels. The app catches that and bounces me back to the chat." |
| 8 | Tap the **✋** button; show counts and Recent pages | "This counts what got blocked, by category only, with no usernames. Here's how I debugged it: version 1 missed this, because Instagram shows Suggested Reels without changing the address. This log showed seven videos starting with no page change, so version 2 watches full-screen video instead." |

**Part 2: Exp 1-R26 (about 1–2 minutes)**

| Step | Do | Say |
| --- | --- | --- |
| 1 | Open **Exp 1-R26** | "This is the other approach. Instead of replacing Instagram, it watches the real app's screen." |
| 2 | Tap the round broadcast button → **Start Broadcast** | "iOS makes me start this myself, every time. No app can start it on its own. That red indicator stays on while it runs." |
| 3 | Switch to the **real Instagram app** → Reels; scroll ~30 s | "Now I'm in the actual Instagram app. A separate mini-program is receiving the screen. It keeps one frame every two seconds, measures it and throws it away." |
| 4 | Stop from the red status-bar indicator | |
| 5 | Return to Exp 1-R26; pull to refresh; show the new run | "Coverage, frames changed, memory used. My first full run was 98% coverage, zero black frames, under 7 MB of memory. So Instagram doesn't hide Reels from capture." |
| 6 | | "What it *doesn't* do yet: recognize Reels, or do anything about it. And even if it did, iOS would only let me nudge or pause all of Instagram. I can't remove the Reel." |

**Part 3: Close (30 s).** "So one approach keeps the real app but can only watch. The other actually removes Reels but isn't the real app. Here's what I'd love your take on…" (→ Section 10).

### F. Technical details worth pointing out briefly

- The sandbox rule: "no app can edit another app."
- CSS matching by **address, not text**, unlike SocialLite's reported "force English" fix.
- Instagram changing pages without changing the address (single-page app + the Suggested overlay).
- ReplayKit delivers ~40–60 frames per second; we keep 1 every 2 s.
- The memory surprise: ~300 MB available vs. the ~50 MB the research expected.

### G. Backup options if a live demo fails

| If… | Then… |
| --- | --- |
| An app won't open ("no longer available" or untrusted) | Plug in, open the project in Xcode, press ⌘R (needs the Mac and cable) |
| Instagram logged out in Exp3Web | Log in live (fine to show), or skip to backups |
| The Suggested-Reels bounce doesn't trigger | Say so honestly. It's a heuristic, and Instagram may have changed. Show the results table instead |
| Projection fails | Pass the phone around, or show the GitHub results |
| Everything fails | Walk through the [Exp 3 results](../experiments/exp3-webview-instagram/results/2026-10-24-session1.md) and [Exp 1-R26 results](../experiments/exp1-r26-replaykit/results/2026-10-22-session1.md) |

**Make backups the day before:**
- **Exp3Web:** record a short video with iOS's built-in Screen Recording (Control Center).
- **Exp 1-R26:** built-in Screen Recording also uses ReplayKit, so recording the broadcast demo with it might not work at the same time (inference). Instead, record with QuickTime from the Mac, or take screenshots of the run summary.

---

## Section 9: Speaking notes for the pod share

### 9.1 Short version (about 4–6 minutes, ~700 words)

*Adjust by cutting the bracketed parts if you're short on time.*

> **Where we started.** Our pod started with a pretty big question: how do we keep the good parts of social media, like messaging friends, seeing what people are up to and learning things, without the compulsive scrolling? We kept coming back to short-form video: Reels, Shorts, TikTok. ✏️ *[one line about how our pod landed on this]*
>
> **Why not just block it?** The obvious answer is "block Instagram." But I actually need Instagram. It's how I message a lot of people. What I don't need is 45 minutes of Reels at midnight. Blocking the whole app throws away the useful part with the harmful part. So the real goal was: *remove or interrupt the scrolling, keep the messaging.*
>
> **Researching first.** I wrote a long ideation doc with something like 69 ideas, and the one I got most excited about was a phone app that watches your screen and recognizes Reels with a tiny on-device model. Before coding anything, I used Claude as a research partner to figure out what iPhones actually allow. I had it check Apple's documentation, and then I had it do a second, skeptical pass that tried to poke holes in the first one. That second pass found six things we'd been too optimistic about.
>
> **The iOS wall.** The big finding: no iPhone app can reach inside Instagram and remove the Reels tab. Every app is sealed in its own box. Apple's Screen Time tools can lock a whole app, but not one part of it. So "Instagram without Reels" is impossible in the *real* app.
>
> **Two ways around it.** That leaves two options. One: *watch* the real app from the outside, using screen capture, like a screen-recording app. Two: *replace* the app with my own version of Instagram, using Instagram's website inside a browser I control. I built a test version of each.
>
> **What I built: the screen watcher.** The first one uses Apple's screen-broadcast feature. I start it, switch to the real Instagram app, and a separate mini-program receives the screen. It keeps one frame every two seconds, measures it and throws it away. In my first test, almost three minutes of scrolling Reels, it got 98% coverage, no blacked-out frames, and used under 7 MB of memory. So Instagram doesn't hide Reels from capture. [Fun surprise: the research said these mini-programs only get about 50 MB of memory; mine reported about 300.] But it doesn't *recognize* Reels yet, and I haven't tested whether it survives locking the phone or how much battery it uses.
>
> **What I built: the wrapper.** The second one is my own app that shows Instagram's website with the Reels tab and Explore removed. DMs, the feed, profiles and search all still work. A Reel a friend sends still plays, but if you try to scroll into more Reels, it bounces you back to the chat. [My first version missed that, because Instagram loads "Suggested" Reels without changing the page address, so I added a log to see what was happening and changed it to watch for full-screen videos instead.] Sending and receiving messages works too; I just haven't tested sending a photo yet.
>
> **The tradeoff.** The screen watcher keeps the real app and could someday notice *behavior*, like 40 minutes of swiping. But it can only watch. Even if it detects a Reel, iOS only lets it send a notification or pause all of Instagram. The wrapper actually removes Reels today, but it's not the real app: no notifications, some missing features, and you could just open the real Instagram. They might work best together: the wrapper as the easy path, with the watcher as a referee when you use the real app.
>
> **What's next and what I'd love from you.** Next I want to stress-test both: lock the phone during capture, measure battery, and test sending photos in the wrapper. I'd love your take on a few questions. Would you actually use a web version of Instagram if it meant no Reels? And should we block short-form entirely, or only step in when scrolling turns compulsive?

### 9.2 Detailed talking points for discussion

**On why this is hard on iOS**
- Sandboxing: apps can't read, change, draw over or tap inside other apps. Android has AccessibilityService; iOS has nothing like it.
- Screen Time works at the level of whole apps, categories or websites, never a tab. And Screen Time can't tell whether you're in Reels or DMs.
- The only way to "see" other apps is screen capture, and that gives you pixels only, with a manual start every time.

**On using Claude**
- Research, then a skeptical review of that research, then a plan matched to my actual hardware.
- Evidence labels on every claim, so I knew what was documented, what was just forum reports, and what was our own inference.
- Claude Code wrote the Swift and JavaScript. I did the Xcode setup, device testing, and reported results, and we debugged together. My testing caught real things: the memory surprise, and the Suggested Reels leak.

**On Approach A's details**
- Two versions: ReplayKit (iOS 26, what I have) and ScreenCaptureKit (iOS 27, needs new tools). Both are kept, because neither result predicts the other.
- The ~300 MB memory figure might be because the phone was attached to Xcode. That needs a retest.
- The difference hash already logged could become a swipe-rhythm detector without any machine learning.
- App Store risk: an Apple engineer publicly called this kind of detection "fundamentally unsuitable."

**On Approach B's details**
- It matches by address, not by visible text, so it doesn't break in other languages.
- Instagram's site is a single-page app: addresses change without page loads, so the app watches the URL property directly.
- The video rule: a full-screen video within 4 s of a tap is allowed; one that starts without a tap gets blocked.
- SocialLite proves this kind of app can pass App Review and get Screen Time permission from Apple.

**On honesty and limits**
- One short capture run, one day of wrapper testing. These are proofs of concept, not products.
- Nothing has been tested with anyone but me.

---

## Section 10: Questions for my pod

**On user acceptance**
1. Would you use a **web version** of Instagram inside another app if it meant no Reels? What would make you give up and open the real app?
2. Which missing feature would be a dealbreaker: notifications, posting stories, close friends, something else?
3. How would you feel about an app with a **permanent recording indicator** that watches your screen, even if nothing ever leaves the phone?

**On philosophy**
4. Should we **remove short-form entirely**, or only **step in when scrolling becomes compulsive**? Is watching one friend's Reel fine? What about five?
5. Is preserving the **real native app** essential, or is "Instagram, minus the bad parts, in a different app" good enough?
6. Block, slow down, or nudge? Which kind of intervention would you actually respect instead of turning off?

**On scope and fit with the group plan**
7. Our shared plan focuses on an AI intent gate for YouTube, Reddit and Facebook Marketplace. Should my Instagram wrapper become the iOS piece of that, for example the "native WebView wrapper" the README mentions for Facebook?
8. Given our timeline, should we commit to one approach, or keep the wrapper as the main path and the screen watcher as a research stretch?
9. Could the two approaches work together (wrapper as the good path, watcher as the referee)? Is that worth the complexity?

**On testing with real people**
10. What would we need to test with real users? A week of baseline Screen Time, then a week with the tool? Self-reported regret?
11. Who in the pod (or among our friends) would try the wrapper as their only Instagram for 3 days?
12. What would count as success? Fewer minutes, less regret, or "I still got everything I needed"?

---

## Section 11: Quick reference

### 11.1 Glossary

| Term | Simple meaning | How it relates to our project |
| --- | --- | --- |
| **App sandboxing** | Each iPhone app lives in its own sealed container and can't see or change other apps | The reason we can't remove the Reels tab from the real Instagram app |
| **ReplayKit** | Apple's framework for screen recording and live broadcasting | Approach A on iOS 26: how Exp 1-R26 receives screen frames. Deprecated in the iOS 27 SDK |
| **Broadcast Upload Extension** | A mini-program that iOS runs separately to receive the screen during a broadcast | In Exp 1-R26, this is where the frames arrive. Our main app never sees them |
| **ScreenCaptureKit** | Apple's newer screen-capture framework; on iPhone from iOS 27 | Approach A on iOS 27 (Exp 1-S27): the main app could receive frames *and* apply shields |
| **App Group** | A shared folder that an app and its extensions can both read and write | How the broadcast extension passes its log to the Exp 1-R26 app |
| **WKWebView** | Apple's web-page component (Safari's engine) that apps can embed | Approach B: shows Instagram's website inside Exp3Web |
| **JavaScript injection** | Running your own script inside a web page you load | `BlockReels.js` is injected at the start of every Instagram page in Exp3Web |
| **DOM / DOM manipulation** | The tree of elements a web page is made of; changing or hiding them | The CSS rule hides any link ending in `/reels/` |
| **Single-page app** | A website that changes "pages" without actually reloading | Why Exp3Web watches the web view's address property, not just page loads |
| **SwiftUI** | Apple's toolkit for building app screens in Swift | Both apps' screens (run list, bottom bar, "Kept out" sheet) |
| **Core ML** | Apple's framework for running machine-learning models on the device | Planned for detection (1-R26b). **Not used yet** |
| **FamilyControls** | Screen Time permission and the app picker | Needed before we can shield Instagram. Not built yet |
| **ManagedSettings** | Screen Time's "shields": block screens over whole apps, categories or websites | The only way to "step in" on the native app, and only for the whole app |
| **DeviceActivity** | Screen Time schedules and time limits | Could trigger after N minutes in Instagram, but can't tell Reels from DMs |
| **Difference hash (dHash)** | A tiny fingerprint of an image that changes when the picture changes | Logged for each kept frame in Exp 1-R26; groundwork for counting swipes |
| **NDJSON** | A file with one JSON record per line | The frame log format both capture versions write |
| **Free Personal Team** | Apple's free developer signing | Both apps run on it; builds expire after 7 days |
| **Proof of concept** | A minimal build that answers "can this work at all?" | Both experiments are proofs of concept, not products |

### 11.2 Likely questions and answers

**"Isn't this just SocialLite?"**
The wrapper is the same *type* of app, and SocialLite proves people use it and Apple allows it. I wrote mine from scratch to test whether it works, and I match addresses instead of English text. The screen watcher is something SocialLite can't do, because it never sees the native app.

**"Why not just use Screen Time?"**
Screen Time blocks all of Instagram, including DMs. It can't block only Reels, and it can't even tell whether you're in Reels.

**"Can't you just delete the Reels tab with code?"**
Not in the real app. iOS doesn't let any app modify another app. The only ways are jailbreaking or a modified, sideloaded copy of Instagram, both against Instagram's terms and outside the App Store.

**"Is the screen watcher spying on me? Where do the screenshots go?"**
Nowhere. It keeps one frame every two seconds, computes a few numbers (brightness, a tiny fingerprint), and throws the frame away. No images are saved, and nothing is sent over the network. The red indicator still makes it *feel* like surveillance, which is a real design problem.

**"Does it use AI?"**
Not yet. Neither app has a model. The research recommends trying simple signals first, like the rhythm of full-screen changes when you swipe, before training a model.

**"Does it work when the phone is locked?"**
Unknown. That's my next test. Other developers report that ReplayKit broadcasts stop when the phone locks.

**"What about battery?"**
Not measured yet. My first run was on a charging phone. The 30-minute unplugged test is planned.

**"Will Apple allow it on the App Store?"**
- **Wrapper:** probably possible, since SocialLite is on the App Store, but it depends on platform terms (guideline 5.2.2).
- **Screen watcher:** high risk. An Apple engineer publicly called this approach "fundamentally unsuitable."
- **Both:** fine as research prototypes installed from Xcode.

**"Can't someone just open the real Instagram app?"**
Yes, right now. The fix is a Screen Time shield on the native app, so the wrapper becomes the easy path. But an adult can always undo Screen Time permissions, so it's friction, not a lock.

**"What happens when Instagram changes its website?"**
The rules may break. Address-based rules are more stable than text-based ones, and the "Recent pages" log helps diagnose what changed. Version 1 already broke on a pattern I didn't anticipate, and version 2 fixed it.

**"How does it know a Reel from a normal video?"**
In the wrapper: by address, plus "is this video full-screen, and did you tap to open it?" In the screen watcher: it doesn't, yet.

**"Why are there two versions of the screen watcher?"**
iOS 26 uses ReplayKit, which my phone supports today. iOS 27 uses ScreenCaptureKit, which needs tools I don't have yet but might let one app both detect and shield. Results from one don't predict the other, so both are kept.

**"Why iPhone and not Android?"**
Android allows much more: apps can read other apps' screens and press "back". iPhone is the hard case, and it's the phone I have.

**"How much of this did Claude write?"**
Claude helped with the research reports, and Claude Code wrote most of the code. I set up the Xcode projects and signing, ran and tested everything on my phone, reported what happened, and decided what to try next. The bugs we found came from my device testing.

**"Is this against Instagram's terms?"**
Possibly, for a distributed modifying client. That's why it's a personal research prototype on my own account and isn't distributed.

---

## Appendix: file map

```text
kaitlyn-ideation.md                         ideation (Oct 19), repo root
members/kaitlyn-samuelian/
  README.md                                 workspace index (note: written before any code; says "no code yet")
  research/01–04                            the four research reports
  experiments/shared/README.md              U1–U5, test protocol, thresholds, log format
  experiments/exp1-r26-replaykit/           Approach A, iOS 26
    README.md                               plan (note: status line still says "planned, no code yet")
    Exp1R26/                                Xcode project: host app + BroadcastExtension
    results/2026-10-22-session1.md          run 1 write-up  ← current status
    results/2026-10-22-run1.ndjson          raw log (numbers only)
  experiments/exp1-s27-screencapturekit/    Approach A, iOS 27 (spec only)
  experiments/exp3-webview-instagram/       Approach B
    README.md                               how it works, checklist, results
    Exp3Web/                                Xcode project
    results/2026-10-24-session1.md          v1 + v2 test write-up  ← current status
  pod-share/2026-10-26-pod-share-preparation.md   this file
```

Naming note:
- "1-R26" and "1-S27" are two versions of **experiment 1**: capture survival.
- "Exp 3" is the third experiment folder, the independent wrapper approach. The reports number their ranked experiments differently: the web client is "experiment 4" in report 01 and "rank 3" in report 02.
