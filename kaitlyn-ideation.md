# Kaitlyn's Ideation: Beating Short-Form Addiction (Without Losing What's Good)

> **The question from our pod:** How do we keep the benefits of social media apps (connection, information, learning, community) without the drawbacks (compulsive short-form scrolling), in a way that's customizable and can't be easily bypassed?

This is a deliberately long list. The goal is breadth first. We'll narrow it down together later.

I organized it using the four kinds of ambition from Felix Rieseberg's post *"How to be more ambitious: A tutorial for humans with models"*:

- **Speed**: the same thing, faster. (Skipped. Building a blocker faster isn't the interesting part.)
- **Altitude**: the goal behind the goal. What do people actually want from these apps?
- **Depth**: how an expert would attack it. Real data, real methods, a real outside judge.
- **Range**: borrowing from other fields (casinos, nutrition, public health, finance, security, etc.).

---

## 0. Reframe first: nouns → verbs

The article suggests swapping nouns for verbs, a trick from *The Art of Innovation*. Our project isn't "a screen blocker." It's:

> **"Helping people get what they came for from social media, and then leave, on purpose."**

Or, more pointed:

> **"Separating the *value* of social apps (friends, info, learning, community) from the *compulsion loop* (infinite feed + autoplay + variable reward + vertical video)."**

That second framing matters. It suggests **short-form may be a symptom**. The real engine is *infinite + algorithmic + autoplay*. Several ideas below test that.

---

## 1. Straight from our notes (expanded)

Our notes covered: no bypass, watcher/checker, embedding vs. API calls, YouTube / X / Reddit / Facebook, and eliminating short-form.

1. **Short-form stripper (browser extension).** Hide the Shorts shelf and tab on YouTube, Reels on Instagram/Facebook web, the video tab on X, and the video feed on Reddit. Uses CSS plus a `MutationObserver`, because these sites load content dynamically. Per-platform toggles make it customizable. *Most feasible thing on this list.*
2. **Shorts → normal player redirect.** Rewrite `youtube.com/shorts/ID` to `youtube.com/watch?v=ID`. Same video, but no swipe-to-next. You still get the video a friend sent you, minus the slot machine.
3. **Watcher mode vs. Checker mode (user picks).**
   - *Watcher*: never blocks. It logs what you watched and when, then shows you a reflection ("47 Shorts between 11pm–1am").
   - *Checker*: actively intervenes (blocks, delays, prompts).
   - *Hybrid*: watches for a week, then suggests rules based on what it saw.
4. **Embed-only YouTube wrapper.** Our own site that plays YouTube only through the iframe embed. You search or pick from subscriptions, it plays, and nothing else shows: no sidebar, no autoplay, no recommendations.
5. **"Clean client" via APIs.** Pull your subscriptions and subreddits through official APIs and render them **chronologically and finite**, ending with "You're caught up." (See the feasibility table in section 7. Some platforms make this hard or expensive.)
6. **Reels only via DMs.** You can't browse Reels, but you can open one a friend sent you. That keeps the social part (sharing a funny clip) and kills the feed.
7. **One unified wrapper feed.** A single app that pulls YouTube + Reddit + X + Facebook into one feed under *your* rules. One place to set limits instead of four.
8. **Rule engine for customization.** "If short-form AND after 10pm → block." "Allow Reddit, but only r/learnprogramming and r/cooking." "YouTube allowed, Shorts never." Rules could be presets, or written in plain English and turned into rules by an AI.
9. **The "no bypass" ladder.** Let users choose how hard they want it, from soft to hard:
   1. Friction: a 10-second breathing screen before opening
   2. Cooldown: changing a rule takes 24 hours to take effect
   3. Partner lock: a friend holds the unlock code
   4. Physical key: an NFC tag or object you have to physically tap to unlock
   5. Money on the line: break your rule and $5 goes to a cause you dislike (the stickK/Beeminder model)
   6. OS-level lock: device management profile / Screen Time passcode held by someone else

---

## 2. ALTITUDE: the goal behind the goal

*The article asks: "What do you want to happen next? What's the goal beyond the goal?"* Felix went from "fix this crash" to "keep our apps crash-free." Our version goes from "block Reels" to something bigger:

10. **Regret minimizer.** After each session, one tap: *"Worth it?"* 👍/👎. Over time the tool learns which sessions you regret (time, app, mood, what came before) and intervenes **only on those**. The real goal is less regret, not fewer minutes.
11. **Intent-first entry.** Before the app opens, you type or say why you're there ("check if Maya posted the party pics," "find a pasta recipe"). The wrapper shows only content that matches the intent, then nudges you out once it's satisfied.
12. **The agent scrolls so you don't have to.** An AI agent goes through your feeds and sends a daily or weekly digest of what actually mattered: friends' life updates, news in your field, the one great video. You never open the app. *Highest altitude: keep all the benefit, spend zero feed time.*
13. **Replace the need, not the app.** Short-form fills specific needs: boredom, loneliness, avoidance, wind-down, procrastination. Detect which one is likely (time, location, what you were doing) and offer a matched substitute. Bored on the bus: a podcast queue. Lonely at 11pm: "text one of these 3 friends." Can't sleep: a wind-down audio.
14. **Outcome dashboard, not screen-time dashboard.** Stop measuring minutes. Measure "people you talked to," "things you learned," "things you made." Screen time becomes a secondary stat.
15. **Self-tuning rules ("keep me healthy").** Like "keep our apps crash-free": the user states an outcome ("under 30 min of short-form a day, never after midnight"), and the system tightens or loosens its own rules each week to hit it.
16. **Kill the occasion, not the app.** Ask what *moments* trigger scrolling (waiting in line, in bed, right after waking up, after a stressful class) and design for those moments specifically, e.g. a lock-screen widget that appears in line at the coffee shop.

---

## 3. DEPTH: do it the way a field expert would

*From the article: use the instruments real experts use, start from raw data, challenge assumptions, produce new knowledge, and use an outside judge.*

17. **Raw data, not vibes.** Use Google Takeout (YouTube watch history), Instagram/Facebook "Download Your Information," and phone Screen Time exports. Analyze our *own* pod's real data to find binge patterns: time of day, session length, the first video in a binge.
18. **Find the earliest binge signal.** Build a simple model that predicts "this session is about to become a 45-minute binge" from the first 1–3 minutes. Train it on some weeks of history and **test it on weeks it hasn't seen**. That's the outside judge, and an actual research result.
19. **Counter every dark pattern.** List the persuasive design patterns these apps use and build one counter-mechanism for each:

    | Dark pattern | Counter-mechanism |
    |---|---|
    | Infinite scroll | Hard stop + "You're caught up" |
    | Autoplay | Click-to-play only |
    | Variable reward (slot machine) | Predictable, finite, chronological feeds |
    | Pull-to-refresh | Refresh only on a schedule (e.g. 3×/day) |
    | Notification badges | Batched digest notifications |
    | Streaks / FOMO | Hide counts and streaks |
    | Vertical full-screen immersion | Shrink the video, show a clock overlay |

20. **Make it less rewarding instead of blocking it (degradation).** Grayscale, a lower frame rate, muted by default, or a **swipe tax**: each next video takes 1s longer to load than the last. Blocking invites rebellion. Boredom doesn't.
21. **Tapering, not cold turkey.** Short-form allowance drops 10% per week, like a medical taper. The system picks the curve.
22. **Challenge the assumption.** We *believe* short-form is the problem. Test it: compare chronological short-form vs. algorithmic long-form (YouTube autoplay rabbit holes). Is it the length, the algorithm, or the autoplay? Whatever we find should shape what we build.
23. **Real measurement (outside judge).** Run a mini study with the pod and friends: a 1-week baseline, then 2 weeks with the tool. Measure OS-reported screen time (not self-report) plus a validated questionnaire, such as the Bergen Social Media Addiction Scale. Then the result isn't us grading ourselves.
24. **Use the real behavior-science toolkit.** Implementation intentions ("When I get in bed, I put my phone on the charger across the room"), commitment devices, temptation bundling (Reddit only while on the treadmill), and BJ Fogg's behavior model (motivation × ability × prompt): reduce ability, remove prompts.
25. **Unreasonable goal (the article says to set one).** "Zero short-form minutes, while users rate the remaining social-media value at **≥90%** of before." Aim for that and see how close we get.

---

## 4. RANGE: borrow from other fields

*The article's tip: "Assemble the crew." Who would humanity send in? Don't role-play them; do what they do.*

| Field | What they'd bring | Idea |
|---|---|---|
| **Casino regulation** | UK gambling sites must show "reality checks" and allow deposit limits | 26. **Reality-check pop-ups**: "You've been scrolling 25 min. Here's what you watched." Plus user-set "loss limits" on minutes. |
| **Nutrition science** | Food labels | 27. **Nutrition label for your feed**: "Today: 62% strangers, 20% outrage, 8% friends, 10% ads. 340 'calories' (minutes)." |
| **Public health / harm reduction** | Meet people where they are; no forced abstinence | 28. **Safer scrolling**: no shame and no blocking. Defaults make the healthy path the easy path (e.g. auto-quit at a set time, morning lockout). |
| **Pharmacology** | Dosing and tapering | 29. **Prescribed dose**: "10 Shorts, 2×/day, not after 10pm," tapering over time (see #21). |
| **Personal finance** | Budgets, envelopes, interest | 30. **Attention budget**: weekly allowance of "scroll tokens"; unused tokens roll over or turn into a reward. Overspend and you "borrow with interest" from tomorrow. |
| **Security engineering** | Threat modeling | 31. **Treat your 1am self as the attacker.** Write an actual threat model for "no bypass": what does a determined user try (incognito, second browser, uninstalling the extension, a different device)? Layer defenses: extension + DNS + OS lock + audit log sent to a friend. |
| **Journalism / editing** | The front page, a finite edition | 32. **The daily edition**: your feeds arrive as a "newspaper" each morning, edited and finite. When you finish it, it's done. |
| **Architecture / urban planning** | Speed bumps, desire paths | 33. **Friction design**: put speed bumps on the bad paths and remove friction from the good ones (e.g. messaging friends is 1 tap, the Reels tab is 4 taps plus a delay). |
| **Accessibility tech** | Transforming media into other formats | 34. **Text-ify short-form**: convert any Reel/Short into a 2-line text summary from its transcript. You get the info or joke in 5 seconds, without the hook. |
| **DJ / music** | A set has a beginning, middle, and end | 35. **Curated sets**: 15-minute finite playlists of short-form, curated by friends or by you, that end on purpose. |
| **Sleep science** | Wind-down, circadian rhythms | 36. **Sunset mode**: after 10pm the feed gets dimmer, slower, and grayer until it fades out. |
| **Montessori / parenting** | The "prepared environment" | 37. **Prepared home screen**: a launcher or new-tab page that surfaces your goals, books, and friends first. Social apps are present but quiet. |
| **Religion / Sabbath traditions** | Communal, scheduled rest | 38. **Pod Sabbath**: a shared group off-period (e.g. Sunday mornings) that everyone's tool enforces together, with social reinforcement. |
| **Game design** | Loops, rewards, quests | 39. **Flip the loop**: real-world quests earn feed time. But **watch out**: streaks can become a new addiction. Have the "red team" check it. |
| **Law / contracts** | Witnessed commitments | 40. **Self-contract with witnesses**: sign a digital contract and pick two friends as witnesses who get notified if you break it. |
| **Short seller / red team** | Hunting for weaknesses | 41. **Red-team our own tool**: have someone in the pod spend an hour trying to bypass each prototype. Whatever they break, we fix. |

---

## 5. Completely different / undiscussed directions

42. **Network-level blocking (router / DNS).** Use Pi-hole or NextDNS for the whole household. Harder to bypass than an extension. *Catch:* Reels share Instagram's domain, so this is all-or-nothing per app. It works better as a "hard mode" layer.
43. **Format detection instead of app detection.** Short-form is a *format* (vertical, under 60s, autoplay, swipe). Detect the format on *any* site or app (e.g. Android screen-reading or a browser content script that checks video aspect ratio) and intervene. That covers future apps too.
44. **Android "back-out" bot.** Android's AccessibilityService can detect when you're on the Reels/Shorts screen inside the real app and automatically press "back." *Caveat:* Google Play reviews accessibility-permission use strictly, so this may only work as a sideloaded/demo build.
45. **iOS Screen Time API version.** Apple's FamilyControls / ManagedSettings / DeviceActivity frameworks can shield whole apps and websites with a custom block screen. They *can't* target just the Reels tab inside Instagram, so we'd pair them with "use Instagram on the web, where our extension works."
46. **AI co-viewer.** An assistant that notices patterns while you watch: *"You've watched 6 clips about the Roman Empire. Want the 20-minute version that actually explains it?"* It turns a binge into curiosity.
47. **Short → long converter.** Detect the topic of the shorts you binge and build you a long-form "deep dive" queue on that topic. Same interest, healthier format.
48. **Create before you consume.** Before the feed opens, make one thing: a journal line, a photo, a sentence of your project, a text to a friend.
49. **Earn scroll with movement.** Steps or workouts (from Apple Health / Google Fit) unlock feed minutes.
50. **Future-self interrupts.** Record short videos of *yourself* explaining why you want to cut back. They get inserted into the feed every 10 minutes, so your own voice breaks the spell.
51. **Cost meter.** Show the time spent as something tangible: "That was 2.1 hours = 1 movie, 60 book pages, or $32 at your hourly wage."
52. **Opt-in social transparency.** Pod members can see each other's short-form minutes (opt-in). Mild social pressure, plus a "minutes reclaimed" leaderboard. (Careful: a leaderboard is itself a game mechanic. See #39.)
53. **Bored button.** One big button (widget or extension icon) that gives a random, short, offline thing to do, based on what you've said you enjoy.
54. **Values-based feed re-ranker.** Where APIs allow (Reddit, YouTube; Bluesky custom feeds are a working example of this concept), re-rank your feed by *your* stated values: "more friends, less outrage, more learning."
55. **Dumbphone companion mode.** The phone becomes "messages, maps, music, camera" by default. Social apps live only on the laptop, behind our wrapper.
56. **Shared-screen / co-watching only.** Short-form only works when watched *with* someone (both phones paired nearby). That makes it social again instead of isolating.
57. **Classroom / campus edition.** Deploy for a dorm floor or a class with group goals. That's institutional buy-in and a real test population.
58. **Teen + parent edition.** Teens set their own rules (autonomy). Parents see only "on track / off track," not content (privacy).
59. **Policy track (not a tool, an argument).** The EU's Digital Services Act already requires very large platforms to offer at least one feed option not based on profiling. We could write a policy brief or campaign for a **"short-form off" switch** as a similar right. That's the highest altitude: change the default for everyone.
60. **Creator-side angle.** Tools for *creators* to publish long-form-first or "finite series." Change the supply, not just the demand.
61. **Speculative design / art piece.** A provocative demo, like a "nutrition-facts printer" that prints a receipt of your weekly feed, to get people talking.
66. **On-device screen watcher (phone app + tiny local model).** Instead of a web extension, a phone app watches what's *on screen* and uses a small AI model running entirely on the phone to recognize short-form (vertical, full-screen, swipe-style video) in **any** app, including native TikTok, Instagram, and YouTube, and apps that don't exist yet. Screenshots never leave the phone. Builds on #43 (format detection), #44 (Android back-out bot), and #46 (AI co-viewer). *Android:* screen-reading permission (AccessibilityService) and/or screen capture (MediaProjection). *iOS:* system screen broadcast (ReplayKit) + Core ML, paired with Screen Time shields to block. See **Option E**.
67. **Wrapper app (the literal "screen-block wrapper").** Our own phone app that opens Instagram, YouTube, X, Reddit, etc. *inside* an in-app browser where we control everything: hide Reels/Shorts with injected code, run the local model on what's shown, add reality checks. Then block the native apps with Screen Time (iOS) or similar (Android) so the wrapper is the only way in. The most practical iOS route. See **Option E**.
68. **Detect-and-shield with Screen Time (iOS).** Apple's Screen Time frameworks (FamilyControls / ManagedSettings / DeviceActivity) let our app block chosen apps with a custom shield screen, either after a time threshold or when our screen watcher (#66) spots short-form. This is how iOS "steps in," since it can't press back or draw over apps. See **Option E**.
69. **Lightweight iOS hooks.** Three add-ons that don't need screen access: Option A's extension running in mobile Safari (Safari Web Extensions), a Shortcuts automation that opens our app whenever Instagram opens (pause / intent-first), and a local VPN that guesses Reels from heavy video traffic. See **Option E**.

---

## 6. Moonshots (unreasonable on purpose)

The article says to pick unreasonable goals and act like they're reasonable:

62. **Keep 100% of the value, cut 100% of the compulsion.** Fully agent-mediated social media (#12 taken to the extreme): you only ever see what an agent judged worth your time.
63. **Personal "binge forecast."** A weather-forecast-style prediction each morning ("70% chance of a late-night scroll storm") with preventive suggestions, validated on held-out data.
64. **Platform-independent protocol.** An open standard ("robots.txt for attention") that apps could adopt to respect user-set limits. Our tool is the reference implementation.
65. **Build the healthy alternative network.** A tiny social app for our pod where feeds are finite, chronological, friends-only, and short-form doesn't exist. Then prove people prefer it.

---

## 7. Reality check: platform feasibility

*Verify current terms before committing. APIs and pricing change often.*

| Platform | Embedding | API to read feeds | Browser-extension manipulation | Notes |
|---|---|---|---|---|
| **YouTube** | ✅ Easy (iframe embed) | ✅ YouTube Data API v3, free with a daily quota | ✅ Very doable | Best platform for us. Shorts → `/watch` redirect works. |
| **Reddit** | ⚠️ Post embeds exist | ⚠️ Free tier for small non-commercial use with rate limits; paid at scale (since 2023) | ✅ Doable | Good for "clean client" or re-ranker ideas. |
| **X (Twitter)** | ⚠️ Post embeds | ❌ Reading timelines needs a paid tier | ✅ Doable | Extension route is realistic; API route is expensive. |
| **Facebook / Instagram** | ⚠️ Post embeds | ❌ No API to read your home feed or others' Reels | ✅ Web only (hide the Reels tab, etc.) | Native app can't be touched except by OS-level blocking or Android accessibility. |
| **TikTok** | ⚠️ oEmbed | ❌ Display API is limited to a user's own videos (Research API is for academics) | ✅ Web only | Basically all short-form. Block or degrade only. |

**Takeaway:** "Embed vs. API" from our notes mostly resolves to: **YouTube and Reddit can go the API/embed route. Everything else needs the browser-extension or OS-level route.**

### Prior art to check (so we differentiate, not duplicate)

Unhook and DF Tube (hide YouTube recommendations/Shorts), News Feed Eradicator, one sec (breathing delay), Opal / ScreenZen / Freedom / Cold Turkey (blockers), Brick (physical NFC unlock). Most of these **block**. Few of them **keep the benefits** (#6, #12, #32, #34, #47). That's our gap.

---

## 8. How we might score these

Score each idea 1–5:

| Criterion | Question |
|---|---|
| **Keeps the good** | Do users still get connection / info / learning? |
| **Kills the loop** | Does it actually reduce compulsive short-form use? |
| **Bypass-resistance** | How hard is it for 1am-me to get around? |
| **Customizable** | Can different people tune it to themselves? |
| **Buildable** | Can we demo it within our timeline? |
| **Novel** | Is it different from Unhook / Opal / one sec? |
| **Measurable** | Can an *outside judge* show it worked? (#23) |

---

## 9. My suggested combos (starting points for discussion)

**Option A, the practical build:** #1 Short-form stripper + #2 Shorts redirect + #8 Rule engine + #9 bypass ladder + #26 reality checks. A solid, demoable extension. Measured with #23.

<details open>
<summary><b>What Option A entails</b></summary>

**What the user experiences**
- They install a browser extension (Chrome first, Firefox later).
- YouTube looks normal, except the Shorts shelf and Shorts tab are gone. If a friend sends a Shorts link, it opens in the regular player with no swipe-to-next.
- Instagram, Facebook, X, and Reddit on the web have their Reels / video tabs hidden. Messages, friends' posts, and search still work.
- A settings page lets them toggle each platform and write rules ("YouTube Shorts: never," "Reddit: only r/cooking after 9pm").
- When they're in an allowed feed too long, a **reality-check** pop-up appears: "You've been here 25 min. Here's what you watched. Keep going / Take a break."
- They choose a **strictness level** at setup, e.g. "changing my rules takes 24 hours" or "my friend gets a code they need to approve changes."

**How it works (tech)**
- **Content scripts** run on each site. They inject CSS to hide elements and use a `MutationObserver` to keep hiding them as the page loads new content.
- **URL redirect:** `declarativeNetRequest` (or a content script) rewrites `/shorts/ID` to `/watch?v=ID`.
- **Rule engine:** rules are stored as JSON in `chrome.storage` and checked on each page load (`{platform, contentType, timeWindow, action}`).
- **Timers:** a background service worker tracks active time per site and triggers the reality checks.
- **Bypass ladder:** settings edits are queued with a delay, or locked behind a code sent to a friend. Disabling or uninstalling the extension can notify that friend (e.g. via a small backend or email).

**What we'd build (components)**
1. Per-platform content scripts (YouTube, Instagram, Facebook, X, Reddit)
2. Shorts redirect
3. Options page + rule editor
4. Time tracker + reality-check overlay
5. Strictness settings (delay / partner lock)

**Demo:** Open YouTube and Instagram side by side, with and without the extension. Show a Shorts link opening in the normal player. Trigger a reality check live.

**How we measure it (#23):** 1 week baseline → 2 weeks with the extension. Compare OS screen time and a short questionnaire before and after.

**Risks / limits:** Only works in the browser, not the native phone apps. Sites change their HTML often, so selectors break and need upkeep. Similar tools exist (Unhook, News Feed Eradicator), so our differentiator is **all platforms in one place + rules + bypass ladder + reality checks**.

**Effort:** 🟢 Lowest. Very buildable; a basic version could work in about a week.

</details>

**Option B, the high-altitude build:** #12 Agent digest + #32 Daily edition + #34 Text-ify. "Get the value of social media without opening it." Most novel; uses AI meaningfully.

<details open>
<summary><b>What Option B entails</b></summary>

**What the user experiences**
- They connect their accounts / tell it what they follow (YouTube subscriptions, subreddits, specific creators, friends) and what they care about ("friends' life updates," "AI news," "cooking").
- They **stop opening the apps**. Instead, once (or twice) a day they get a **"Daily Edition"**: a short, finite page like a newspaper front page, in the app or by email.
- The edition has sections, e.g. *Friends* · *Your interests* · *The one video worth watching today* · *Skipped for you (47 posts)*.
- Any short-form video included is **text-ified**: a 1–2 line summary from its transcript ("Guy explains why airplane windows are round: pressure stress concentrates at corners"). Tap to watch only if you really want to.
- At the bottom: **"That's everything. You're done."**

**How it works (tech)**
- **Collect:** pull content from APIs where possible (YouTube Data API for subscriptions, Reddit API for subreddits). For platforms without a feed API, fall back to links the user forwards in, RSS where it exists, or manually pasted links.
- **Text-ify (#34):** get the transcript (YouTube captions, or speech-to-text on the audio) and have an AI model summarize it in 1–2 lines.
- **Rank / filter:** an AI model (e.g. Claude) scores each item against the user's stated interests and values, and picks the top N.
- **Assemble (#32):** generate the edition as a static page or email on a schedule (cron job).

**What we'd build (components)**
1. Account / source connection (start with YouTube + Reddit only)
2. Fetcher that pulls new items daily
3. Transcript + summarizer pipeline
4. AI ranking against the user's interests
5. Daily Edition page / email template
6. Feedback buttons ("more like this / less like this") that tune the ranking

**Demo:** Show a real person's normal YouTube + Reddit feeds (hundreds of items), then show the 5-minute Daily Edition our tool made from the same content.

**How we measure it:** Ask users to rate "how much of the value of social media did you still get?" (aiming for ≥90%, #25) and compare their time spent in the native apps before and after.

**Risks / limits:** API limits and costs (X and Instagram basically won't work; see section 7). AI costs per summary. Users might still open the apps out of habit, so it pairs well with Option A as a backstop. Need to handle privacy carefully since we'd be reading people's feeds.

**Effort:** 🟡 Medium. The YouTube + Reddit version is doable; covering every platform is not.

</details>

**Option C, the research-heavy build:** #17 Raw data + #18 Earliest binge signal + #10 Regret minimizer. Produces *new knowledge* about our own habits, with a real held-out test.

<details open>
<summary><b>What Option C entails</b></summary>

**What the user experiences**
- **Phase 1 (research):** Pod members (and willing friends) download their own data: Google Takeout for YouTube watch history, Instagram/Facebook "Download Your Information," phone Screen Time screenshots/exports. We get insights back like "Your binges usually start between 11pm–1am, right after a Short about X, and last 52 min on average."
- **Phase 2 (tool):** A **regret minimizer** asks after each session: "Was that worth it? 👍/👎." It learns which sessions you regret and, using the binge-prediction model, **steps in early only on sessions likely to become regretted binges.** Good sessions are left alone.

**How it works (tech)**
- **Data pipeline (#17):** Python scripts that parse the exported JSON/HTML files into one table: timestamp, platform, video/post, duration, content type (short vs. long).
- **Define a "binge":** e.g. a session of 30+ minutes or 20+ short videos with no break longer than 2 min.
- **Prediction model (#18):** using only the first 1–3 minutes of a session (time of day, day of week, first content type, how long since the last session, etc.), predict whether it becomes a binge. Start simple (logistic regression / decision tree).
- **Outside judge:** train on some weeks and **test on weeks the model hasn't seen**. Report accuracy honestly, even if it's mediocre; that's still a real finding.
- **Regret minimizer (#10):** a simple extension or app that logs sessions, asks the 👍/👎 question, and combines that label with the prediction to decide when to intervene.

**What we'd build (components)**
1. Data donation instructions + parsing scripts
2. Analysis notebook (charts of each person's patterns)
3. Binge-prediction model + held-out test results
4. Regret-check prompt (in the extension or as a phone shortcut)
5. Intervention logic: "if likely binge AND likely regretted → nudge"

**Demo:** Present real (anonymized) charts of our own habits, the prediction results on unseen weeks, and a live run of the regret prompt + intervention.

**How we measure it:** The model's accuracy on held-out data is the outside judge for the research part. For the tool part: did regretted-session minutes go down while 👍 sessions stayed the same?

**Risks / limits:** Data exports can take days to arrive, so **request them now**. Small sample size (just our pod). Exports may not include everything we want (e.g. exact Reels watch durations). Privacy: keep the data local and anonymize anything we present.

**Effort:** 🟡 Medium. More data science than app building; good if the pod likes analysis and wants a strong "we discovered something" story.

</details>

**Option D, the mashup:** Option A as the foundation + #10 regret minimizer + #47 short→long converter. Blocks the bad, redirects interest into the good, and learns over time.

<details open>
<summary><b>What Option D entails</b></summary>

**What the user experiences**
- Everything in **Option A** (short-form hidden, Shorts redirected, rules, bypass ladder, reality checks).
- **Plus the regret minimizer (#10):** after sessions, a quick 👍/👎. Over time, the reality checks get smarter: they show up when you tend to regret it and stay quiet when you don't.
- **Plus the short→long converter (#47):** when you hit a blocked Short/Reel, or after you've watched several clips on one topic, instead of just "Blocked," you see: "Looks like you're into *Roman history*. Here's a 20-minute video that actually explains it." The urge gets redirected into something you'd feel good about.

**How it works (tech)**
- **Foundation:** the Option A extension.
- **Regret minimizer:** session logging + 👍/👎 prompt stored locally. At first, simple rules (e.g. "you thumbs-downed 4 of your last 5 sessions after 11pm → turn on stricter checks after 11pm"). Optional upgrade: a small model like in Option C.
- **Short→long converter:** take the blocked video's title/description (or transcript), have an AI model extract the topic, then search the YouTube Data API for a highly rated long-form video (e.g. 10–40 min) on that topic and show it on the block screen.

**What we'd build (components)**
1. Everything from Option A
2. Session logger + regret prompt
3. Rule-adjusting logic based on regret history
4. Topic extractor (AI) + YouTube long-form search
5. A friendly "redirect" block screen instead of a plain "blocked" page

**Demo:** Click a Short → it's blocked, but the screen suggests a great long-form video on the same topic. Then show a "week view" where the tool tightened rules on the times the user regretted, and left good times alone.

**How we measure it:** Same study as Option A (#23), plus: % of redirected suggestions actually clicked, and change in 👎 sessions over time.

**Risks / limits:** The biggest scope of the four, so we'd build Option A first and add the other parts in stages. AI/API costs for topic extraction and search. Long-form can also become a rabbit hole, so the redirect should be one video, not a new feed.

**Effort:** 🟠 Medium-high. Very doable if staged: **Week 1–2: Option A → Week 3: regret minimizer → Week 4: short→long converter.**

</details>

**Option E, the on-device build:** #66 On-device screen watcher + #67 Wrapper app + #68 Screen Time detect-and-shield + #69 Lightweight iOS hooks (+ #26 reality checks, #9 bypass ladder). A phone app with a tiny local AI model that recognizes short-form on screen and steps in, entirely on the phone. Works on the native apps, not just the web.

<details open>
<summary><b>What Option E entails</b></summary>

**The core idea**

Web extensions only work in the browser, but the addiction mostly happens in **native phone apps**. Option E moves the "watcher/checker" from our notes onto the phone itself. A **tiny AI model running locally** looks at what's on screen and decides "this is short-form," so it works no matter which app you're in. Because the model runs on the phone, **nothing you look at is ever uploaded**, which is the whole privacy pitch.

Android and iOS allow very different things. Android lets an app watch the screen and step in directly. iOS is much more locked down, so there are **four iOS approaches (E1–E4)**, ranging from "truest to the original idea" to "simplest add-ons." We can pick one or combine them.

---

**What the user experiences (any variant)**
- They install the app, grant permissions once, and pick their rules ("max 15 min of short-form a day," "none after 11pm").
- They use their phone normally, including the real Instagram/TikTok/YouTube apps (or, in E3, our wrapper).
- After a while in a short-form feed, the app steps in: a reality-check screen, a "you've hit your limit" screen, a block, or (Android only) it automatically backs out of the Reels/Shorts feed.
- Regular use (DMs, friends' posts, long videos, search) is untouched, because the model only reacts to the *format*.

---

**On Android** (very doable, one approach covers it)
- **AccessibilityService** (screen-reading permission): reads the on-screen layout as text/structure (e.g. "a view called `reels_viewer` is on screen"). Cheap and reliable, and it can press "back" for you.
- **MediaProjection** (screen-capture permission): grabs downscaled screenshots every few seconds for the vision model. Shows a persistent "screen is being captured" notification.
- **Best design:** use accessibility signals as the main detector and the vision model as a backup / for apps we haven't hard-coded.
- **Intervene:** draw an overlay on top of the app, or trigger "back."

---

**On iOS: four approaches**

**E1: Screen broadcast + tiny model** *(closest to the original idea)*
- iOS lets apps capture the **whole screen across all apps** through a **ReplayKit Broadcast Upload Extension**, the same feature screen-recording and streaming apps use.
- The user starts it once from Control Center, or from a button in our app. It keeps running while they use TikTok, Instagram, and so on.
- **Core ML** runs the tiny model on those frames, on the phone. The extension has a tight memory limit (roughly 50MB), so the model must be very small. A compressed image classifier (a few MB) fits.
- **Catches:** red recording indicator in the status bar; the user has to start it manually (and again if it stops, e.g. after a restart); App Store review might push back. For a **class demo**, though, it really works.
- On its own, E1 can only *notice* (and possibly send a notification, which we'd need to verify). To actually **block**, pair it with E2.

**E2: Detect, then block with Screen Time**
- iOS can't press "back" or draw over other apps for us, but Apple's **Screen Time frameworks (FamilyControls / ManagedSettings)** let our app **shield** the apps the user picked (e.g. Instagram is blocked for 30 min, with our custom block screen).
- **Combined with E1:** the screen watcher sees short-form for 5 minutes → our app shields the chosen social apps for 30 minutes.
- **Unknown to test early:** whether the broadcast extension can trigger the shield directly, or has to hand off to our main app. That needs a quick prototype, and it decides whether E1 + E2 is viable.
- **Even without screen watching**, Screen Time can trigger after a set amount of time in an app (**DeviceActivity** thresholds, e.g. "after 20 min in Instagram today → shield it"). It just can't tell Reels from the main feed.
- This is also where the **bypass ladder (#9)** lives on iOS: unshielding can require a cooldown or a friend's code.

**E3: Wrapper app** *(most practical on iOS; fits our repo name 👀)*
- They open **our** app instead of Instagram/YouTube/X/Reddit. Inside, they get the real websites, minus Reels/Shorts, plus our rules and reality checks.
- An in-app browser (**WKWebView** on iOS / **WebView** on Android) loads the platforms' mobile websites.
- We inject JavaScript to hide Reels/Shorts tabs and video feeds (same logic as Option A's extension, reused).
- Because it's our own app, we can snapshot what's shown and run the local model with **no recording indicator and no memory limits**, e.g. to catch short-form that slips past our hiding code.
- The native apps are **blocked using E2's Screen Time shields**, so the wrapper is the only way in. That's the "no bypass" from our notes.
- **Catches:** mobile websites are worse than the native apps (some features missing, logins can be finicky). Users can still use a laptop, so the wrapper is strongest on the phone.

**E4: Other iOS hooks** *(lighter add-ons; none of them see the screen)*
- **Safari Web Extensions** work on iPhone (since iOS 15). Option A's extension code could also run in mobile Safari, covering web use on the phone for little extra work.
- **Shortcuts automations:** "When Instagram opens → run my shortcut," which opens our app first. The one sec app uses this kind of trigger to show a pause screen. Good for a pause or intent-first (#11), but it can't see what's on screen, and the user has to set the automation up themselves.
- **Local VPN (Network Extension):** runs on the phone and sees which servers it talks to (traffic is encrypted, so domains and amounts only, not content). A burst of heavy video traffic from Instagram's or TikTok's servers *probably* means Reels. It's a rough guess, not exact, but it needs no screen access and can also block domains.

---

**How the four fit together**
- **Truest version of the idea:** E1 + E2 (screen broadcast + Core ML model + Screen Time shield).
- **Most practical / shippable:** E3 + E2 (wrapper app + native apps blocked).
- **Add-ons:** E4 fills gaps (Safari extension for mobile web, Shortcuts for a pause screen, VPN as a rough extra signal).
- **Strong pitch:** support both platforms, with Android using its screen-reading permission (AccessibilityService) and iOS using E3 + E2 (or E1 + E2 if the prototype works). The local model and privacy story are the same on both.

---

**The tiny local model**
- **Task:** a simple image classifier: *"short-form feed"* vs. *"everything else"* (optionally per platform). Not a chatbot; a classifier is far smaller and faster.
- **Training data:** we take a few hundred to a few thousand screenshots ourselves (Reels, Shorts, TikTok vs. DMs, feeds, long videos, other apps) and label them.
- **Model:** start from a small pretrained mobile model (e.g. MobileNet / EfficientNet-Lite family) and fine-tune it on our screenshots. Shrink it (quantize) to a few MB.
- **On-phone runtime:** **Core ML** (iOS) / **TensorFlow Lite, now called LiteRT** (Android).
- **Efficiency:** run on a tiny downscaled frame every 2–3 seconds, not every frame, to save battery.
- **Outside judge:** report accuracy on a **held-out set** of screenshots the model never trained on, ideally from a person whose phone wasn't in the training set.

**What we'd build (components)**
1. Screenshot dataset + labeling + trained, compressed model
2. Phone app shell + onboarding (permissions, rule setup)
3. **Screen watching:** Android accessibility/screen-capture service and/or iOS broadcast extension (E1)
4. **Wrapper:** in-app browser + injected hiding scripts (E3)
5. Intervention layer: overlays / back-out (Android), Screen Time shields (E2, iOS)
6. Optional add-ons (E4): Safari extension, Shortcuts automation, local VPN
7. Rules, reality checks (#26), and bypass ladder (#9)
8. Local-only usage log + simple stats screen

**Suggested build order**
1. **Week 1:** collect + label screenshots, train the model, check accuracy on held-out images (it can run on a laptop first).
2. **Week 2:** get it running on a phone. Android is fastest to prototype; on iOS, start with E3 (wrapper), and build a quick throwaway test of whether E1 can trigger E2's shield.
3. **Week 3:** interventions + rules + Screen Time blocking (E2).
4. **Week 4:** polish, mini user study, demo prep. Stretch: E1 (iOS screen broadcast) if the test worked, and/or E4 add-ons.

**Demo:** Open the **real** Instagram app on a phone, scroll Reels, and watch our app catch it within seconds, without any internet connection (turn on airplane mode to *prove* it's local). Then show the DMs still work fine.

**How we measure it**
- *Model:* accuracy on held-out screenshots (the outside judge).
- *Tool:* same study as Option A (#23): baseline week vs. weeks with the app, using OS-reported screen time plus a short questionnaire.
- *Practicality:* battery impact over a day (Settings → Battery shows per-app usage).

**Risks / limits**
- **Platform rules:** Google Play is strict about accessibility permissions; the App Store may push back on screen broadcasting. For a class project, a sideloaded Android build / TestFlight or Xcode-installed iOS build is fine.
- **Battery** if the model runs too often.
- **Creepiness factor:** "an app that watches your screen" needs a clear privacy story: on-device only, no screenshots saved, airplane-mode demo.
- **Native development:** needs Swift (iOS) and/or Kotlin (Android) skills, plus some ML. The most technically demanding option.

**Effort:** 🔴 High, but the most novel and has the best demo. To lower the risk, **E3 + E2 (wrapper + Screen Time blocking) is the safety net**: even if the screen-watching parts fight us, a wrapper app + native-app blocking is a solid project on its own.

</details>

### Quick comparison

| | A: Practical | B: High-altitude | C: Research | D: Mashup | E: On-device |
|---|---|---|---|---|---|
| **Core idea** | Hide & limit short-form | Get the value without opening the apps | Understand & predict our own binges | Block, redirect, and learn | Local AI spots short-form on screen, in any app |
| **Main thing built** | Browser extension | AI digest pipeline | Data analysis + model + small tool | Extension + AI redirect | Phone app + tiny on-device model (+ wrapper) |
| **Uses AI?** | No (optional) | Heavily | Lightly (simple model) | Moderately | Yes, on-device vision model |
| **Works on phone apps?** | No (web only) | Yes, indirectly (you skip the apps) | Analysis yes; tool mostly web | No (web only) | **Yes, directly** (Android fully; iOS via broadcast or wrapper) |
| **Novelty** | Low–medium | High | Medium–high | Medium–high | High |
| **Effort** | 🟢 Low | 🟡 Medium | 🟡 Medium | 🟠 Medium-high | 🔴 High |
| **Best if our pod likes…** | Shipping something solid | AI + product thinking | Data + research | A bit of everything | Mobile dev + ML + a wow demo |

---

## 10. Open questions for the pod

- Who's the user? Us (college students)? Teens? Anyone?
- Desktop, phone, or both? (Phone is where the problem is, but the browser is where we have the most control.)
- How strict is "no bypass"? Is user-chosen strictness (#9) enough, or do we want it truly locked?
- Block, degrade, or redirect? Pick our philosophy.
- Do we want to use AI (Claude) in the product itself, or just to help us build it?
- What's our outside judge? How will we *prove* it works?

---

## Bonus: prompt to deepen any idea (adapted from the article)

> I want a deeper version of this idea, not a bigger one. Before rewriting it: (1) say what a top professional in digital wellbeing / behavioral science / HCI would do here that I'm not asking for; (2) name the rawest material they would start from instead of what's already been digested for me; (3) name the specific methods and tools they would use; (4) say what, other than you or me, would show the result is right. Then rewrite my idea to ask for exactly that.
