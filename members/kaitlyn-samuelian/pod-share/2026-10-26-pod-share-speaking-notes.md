# My Pod Share: Speaking Notes

Oct 26, 2026 · Kaitlyn Samuelian

These are my notes for actually *talking* about my work. The full reference, with the research tables, file lists and timeline, is in [`2026-10-26-pod-share-preparation.md`](2026-10-26-pod-share-preparation.md). Where the two disagree, **these notes are the more careful version** (see Part 4).

How to use this:
- **Parts 1–3** are what I glance at while talking and demoing.
- **Parts 5–6** are for when someone asks a follow-up.
- **Part 8** is the one-page cheat sheet. Print it.

✏️ = something only I can fill in, because it isn't written down anywhere.

> **Naming heads-up.** **Approach A** is the screen-capture one and **Approach B** is the wrapper. I demo them in the *opposite* order (wrapper first), so the demos below are called **Demo 1 (wrapper)** and **Demo 2 (screen capture)** to avoid mixing them up.

---

## Part 1: Quick version (2–3 minutes)

### 1. Where we started

- ✏️ *How we got our pod, and one or two other problems we kicked around:* ______________________
- We landed on **short-form video**: Reels, Shorts, TikTok.
- ✏️ *Why it stuck for us (a personal line works best here):* ______________________

> "Our pod's question was basically: how do you keep the good parts of social media without the part that eats your whole night?"

### 2. The problem

- The goal **isn't** "less screen time". It's **keep messaging, friends' posts and useful info, and lose the compulsive scrolling.**
- Blocking Instagram doesn't work for that, because it blocks DMs too.

> "I actually need Instagram to message people. I don't need 45 minutes of Reels."

### 3. My first exploration

- I did a big ideation doc (60+ ideas, five "options" at the end).
- The one I got most excited about: **a phone app that notices when you're in short-form, right on the iPhone.**
- Before coding, I used Claude as a research partner to figure out what an iPhone actually allows.

### 4. What I learned about Apple

- **No iPhone app can change another app.** I can't remove the Reels tab from the real Instagram app. That's a hard rule, not something I just didn't figure out.
- Apple's Screen Time tools can block **all** of Instagram, but not one part of it.

> "That basically killed the simple version of my idea, so I had to find ways *around* it."

### 5. Approach A: watch the real app

- Use Apple's screen-broadcast feature (**ReplayKit**), the same thing screen-recording apps use, to *see* the real Instagram app while I use it.
- Keeps the real app. But it can only **watch**, not change anything.

### 6. Approach B: replace the app

- Inspired by an app called **SocialLite**: my own app that opens **Instagram's website** in a built-in browser I control, so I can remove Reels.
- Gives me real control, but it's the website, not the real app.

### 7. What I actually built and tested

- **Screen capture:** in a short test (~3 min of scrolling Reels), my app kept receiving **changing, non-black frames** from the real Instagram app, using **under 7 MB of memory**. It doesn't recognize Reels or do anything about them yet.
- **Wrapper:**
  - The Reels tab, Explore and profile Reels tabs are gone.
  - DMs (reading, sending and receiving texts), the feed, profiles and search work.
  - A Reel a friend sends plays, and scrolling into more Reels got blocked **in both of my test tries**.

### 8. What I learned and what's next

> "The biggest thing I learned is that **noticing a behavior inside an app is a totally different problem from building a place where that behavior can't happen.**"

- A keeps the real app, with little control. B gives lots of control but isn't the real app.
- **Next:**
  - Lock-screen and battery tests for A
  - Photo DMs and a few days of real use for B
  - Then figure out with the pod which direction matters most

---

## Part 2: Longer version (4–6 minutes)

*The same story with more "why". Pick what fits the time.*

### From the problem to the tech

**Brainstorming.**
- ✏️ *How our pod brainstormed (group call? shared notes? one meeting or several?):* ______________________
- What *is* written down: our early notes covered **"no bypass, watcher/checker, embedding vs. API calls, YouTube / X / Reddit / Facebook, and eliminating short-form."** Those are in my ideation doc.
- I took those notes and went wide. I organized ideas by kinds of ambition, from an article we'd read (Felix Rieseberg's), and ended with five combined options, A through E.

> "I tried to go broad first: browser extensions, AI digests, analyzing our own watch history, and a phone app that watches your screen."

**Why short-form stood out.**
- ✏️ *My own reason:* ______________________
- The framing I liked from my doc: the problem isn't social media, it's the **compulsion loop**: infinite feed + autoplay + algorithm + full-screen vertical video. Short-form is where that loop is strongest.

**Why blocking doesn't solve it.**
- Screen Time can block Instagram, but then my DMs are gone too.
- And a Reel a friend sends you is *social*. Swiping through 40 more isn't.
- One of my ideation ideas was literally **"Reels only via DMs"**, and that's what my wrapper ended up doing.

**Using Claude.**
- ✏️ *My Claude Project setup (name, what I put in it):* ______________________
- I had Claude:
  1. research what iOS allows, checking Apple's docs and developer forums
  2. do a **second, skeptical pass** on that research. It found six claims that were too optimistic.
  3. make a plan that fit my actual phone and laptop
- Every claim got labeled, like "Apple documents this", "developers report this", "we're guessing" or "unknown". That helped a lot.

> "The skeptical second pass was honestly the most useful part. It stopped me from building on assumptions."

**What I learned about Apple.**
- Every app is sealed in its own box (the **sandbox**). No app can read, change, draw over or tap inside another app.
- **Screen Time** can only cover a whole app, category or website.
- The only way to even *see* another app is **screen capture**, and that only gives you pixels.

**Why two approaches instead of picking one.**
- The research left exactly two ways to get close: **watch the real app** or **replace it with something I control**.
- Each had a big unknown that only a real test could answer. So I built a small test of each instead of guessing.
- **Why ReplayKit first:** the research liked Apple's newer **ScreenCaptureKit** (iOS 27). My phone is on iOS 26 and my Mac can't install the new tools yet. So I started with **ReplayKit**, and the iOS 27 version is fully planned and **still on the list**, not dropped.

### Approach A: screen monitoring

**What I imagined.** You use the real Instagram app. Something running in the background notices "she's been swiping Reels for 20 minutes" and responds the way you set it up: a nudge, a reality check, or pausing Instagram for a bit.

**Why keeping the real app is appealing.**
- You keep everything the real app has: notifications, posting, close friends.
- It could respond to **behavior** (non-stop swiping), not just "you opened Reels".
- In theory it could work on **any** app with short-form, since it looks at the screen, not at Instagram's code.

**How ReplayKit works, in my words.**
- I tap Apple's broadcast button and hit **Start Broadcast**. iOS makes the user do this every time; apps can't start it themselves.
- iOS then sends copies of the screen to a little separate program called a **Broadcast Upload Extension**, even while I'm in another app.
- A red indicator shows in the status bar the whole time.

**What I built.**
- A small app with the broadcast button and a list of past runs.
- The extension, which:
  - gets ~40–60 frames per second and **keeps one every 2 seconds**
  - for each kept frame, measures its **brightness** and a tiny **fingerprint** (a "difference hash") that changes when the picture changes
  - writes those numbers to a log, then **throws the frame away**
- No images saved, nothing sent anywhere.

**What my test showed** (Oct 22, about 2 min 51 s, mostly scrolling Reels in the real Instagram app):
- Frames came in steadily: 98% of 2-second windows had one, and there were no gaps.
- **No black frames**, and the fingerprint changed between most frames (72 of 83 pairs).
- **Under 7 MB of memory used.**

> "So what I can honestly say is: the extension kept getting real, changing frames while I scrolled Reels, and it was cheap on memory."

**What it hasn't shown yet** (be upfront):
- I never saved or looked at a frame, so I haven't *visually* confirmed what was in them. The numbers just say "real, changing picture".
- The run included the moments switching into Instagram, so not every frame was a Reel.
- Not tested:
  - locking the phone
  - switching between several apps
  - a phone call
  - a 30-minute run
  - battery use (the phone was charging)
- **It doesn't recognize Reels at all yet.** No detection code exists.
- **It doesn't do anything** (no nudge, no block).

**Recognizing vs. intervening are separate problems.**
- *Recognizing:* figuring out from pixels that this is Reels and that it's become compulsive swiping. Unbuilt.
- *Intervening:* even with perfect recognition, iOS only lets me **send a notification** or **block all of Instagram** with Screen Time. I can't close the Reel or remove the tab.

> "It's like a security camera. It can see everything, but it can't open or close any doors."

**What's next for A:** finish the reliability tests, try simple ways to tell Reels apart from other screens, then test whether any intervention works from the capture side.

**Where it might fall short:**
- Developers report it stops when the phone locks.
- The red indicator feels like being watched.
- Battery is unknown.
- Apple might not allow it on the App Store: an Apple engineer publicly called screen recording + ML detection "fundamentally unsuitable".
- **It doesn't put me in control.** The user can stop the broadcast any time, so it can be a coach, not a lock.

### Approach B: the Reels-free wrapper

**Finding SocialLite.**
- While researching, I found **SocialLite**. It's on the App Store and popular (4.8 stars, ~15K ratings). It promises "Keep the social. Lose the scroll."
- From its privacy policy and reviews, it *looks* like it shows the platforms' websites inside its own browser. That's my inference; they don't say exactly how.
- Other apps do similar things too, like **Dull**.

> "That made me think: if this works well enough that people actually use it, I should test the simpler route myself."

**How it works.**
- Apple has a web-page component called **WKWebView**, basically Safari's engine inside your own app.
- When Instagram's *website* runs inside *my* app, I'm allowed to change it.

> "The real Instagram app is someone else's apartment. The website running in my app is in *my* apartment, so I can rearrange the furniture."

**The tools I use:**
- **CSS:** hide any link whose address ends in `/reels/` or is `/explore/`. It matches the *address*, not the word "Reels", so it works in any language. (SocialLite apparently had to force English at one point.)
- **URL filtering:** my app checks every address the page goes to. It bounces `/reels/`, `/explore/` and profile Reels tabs to the DM inbox, but lets search through.
- **JavaScript:** a script runs on every Instagram page before it draws. It's what handles the Suggested Reels problem below.

**What works** (tested on my iPhone, Oct 24, plus my follow-up DM test):
- Login, staying logged in after closing the app
- DMs: opening, reading, **sending and receiving texts**
- Home feed, profiles, stories, search
- No Reels tab, no Explore, no Reels tab on profiles
- Links to other sites open in Safari
- A Reel a friend sent plays, and **scrolling into more Reels was blocked both times I tried it**

**The Suggested Reels bug** (my favorite part to tell):
1. Version 1 assumed each new Reel would change the page address, so blocking "Reel to a different Reel" would stop swiping.
2. Testing: I opened a friend's Reel from DMs, scrolled… and got more Reels. ❌
3. I added a "Recent pages" log. It showed the chat address, then **seven videos starting with no address change**. On screen it said **"Suggested"**.
4. So Instagram plays shared Reels in an overlay on top of the chat and feeds you algorithm Reels **without changing the address**. My address rules couldn't see it.
5. Version 2 watches videos instead: a full-screen video you **tapped** to open is allowed, and a different full-screen one that starts **without a tap** gets paused and you're sent back to the chat.
6. Retest: it worked both times, and browsing the feed and a profile afterward didn't trigger any false blocks.

> "That was the moment it felt like actual engineering. The test failed, I added a way to see what was happening, and the log told me something about Instagram I didn't know."

**What's missing or untested:**
- 🧪 Sending a **photo** in DMs: not tested.
- 🧪 **Reels mixed into the home feed:** not checked. They aren't full-screen, so my video rule probably wouldn't catch them.
- 🧪 Opening the `/reels/` page directly: blocked in the code, but I haven't tested it on the phone.
- 🧪 Whether feed videos still play normally: probably, but not checked directly.
- ❌ **No notifications.**
- ❌ Instagram's **"use the app"** prompt still shows.
- ❌ **Nothing stops me from opening the real Instagram app.**
- Long-term reliability: only one day of testing. The video rule is a guess-based heuristic (tap, then a quick scroll could slip past).

**What would make it useful long-term:**
- A few days of real use
- Settings for the rules
- Possibly using Screen Time to block the native app, so the wrapper is the easy door

### Why comparing them is interesting

> "Building both made something click for me: **detecting unwanted behavior inside an app that already exists is not the same as building an environment where that behavior just can't happen.**"

- **A** keeps the real Instagram, but I can only watch. My strongest move is blocking *everything*.
- **B** gives me precise control, but you give up the real app.
- **Neither is automatically better.** It depends on what users care about more: the real app, or Reels actually being gone.

**They could fit together:**
- The wrapper is the easy, Reels-free way in.
- The real app gets blocked or unlocked for a bit when you need it, for things like posting.
- The screen watcher only runs during those real-app sessions, as a referee.

That's an idea from my research. **I haven't built any of it.**

---

## Part 3: Live demo talking points

**Setup check:**
- Phone charged, Do Not Disturb on, Instagram muted, screen mirrored (QuickTime › New Movie Recording › pick the iPhone).
- A DM thread that's OK to show, with a friend's Reel in it.
- Open both apps the night before. Free developer builds expire after 7 days, and the screen-capture app's runs out **Oct 29**. If one won't open, plug into the Mac and hit ⌘R in Xcode.

### Demo 1: The Instagram wrapper (Approach B), my strongest demo

| Step | Do | Say | Point out |
| --- | --- | --- | --- |
| 1 | Open **Exp3Web** | "This is my app. Inside is Instagram's website, in a browser I control." | It looks like Instagram, with my bar at the bottom |
| 2 | Scroll the feed, open a profile | "The normal stuff still works: feed, profiles." | Useful features stay |
| 3 | Point at the tab bar and the profile tabs | "No Reels button, no Explore, and no Reels tab on profiles." | They're just gone, not greyed out |
| 4 | Tap **Search** | "Search still works. I block the Explore grid but keep search." | Precise, address-based rules |
| 5 | Tap **Messages**, open the thread | "DMs work. I've sent and received messages in here." | The whole point: keep the social part |
| 6 | Tap the friend's Reel | "A Reel a friend sends still plays." | "Reels only via DMs" |
| 7 | **Swipe up** to the next Reel | "Instagram tries to give me Suggested Reels… and it kicks me back to the chat." | The bounce |
| 8 | Tap **✋** | "This counts what got blocked, by type only, no usernames. And this 'Recent pages' list is how I found the bug." | Counter + diagnostic |
| 9 | (Talk) | Tell the Suggested Reels bug story (Part 2) in ~30 seconds | Debugging process |

**What this proves:** on my phone, on Instagram's current website, I can remove the main Reels entry points and stop scrolling from a shared Reel, while DMs and the feed work.

**What it doesn't prove:**
- that *every* way into Reels is blocked (feed Reels aren't checked)
- that it'll keep working when Instagram updates
- that anyone besides me would want to use it

**Short version (~1 min):** steps 1, 3, 5, 7, 8.

### Demo 2: ReplayKit screen capture (Approach A)

| Step | Do | Say | Point out |
| --- | --- | --- | --- |
| 1 | Open **Exp 1-R26** | "This is the other approach. It watches the real Instagram app instead of replacing it." | |
| 2 | Tap the round button → **Start Broadcast** | "iOS makes me start this myself, every single time. Apps can't start it on their own." | Permission, plus the red indicator |
| 3 | Switch to the **real Instagram** → Reels | "Now I'm in the actual Instagram app, not mine." | Real native app |
| 4 | Scroll for ~30 s | "A separate mini-program is getting the screen. It keeps one frame every 2 seconds, measures it and throws it away." | Nothing saved |
| 5 | Tap the red indicator → stop | | |
| 6 | Back to Exp 1-R26, pull down to refresh | "Here's the run: how much of the time it got frames, how many changed, how many were blank, how much memory it used." | The run row |
| 7 | (Talk) | "Changing, non-black frames mean it's getting a real picture of what's on screen, and it's cheap." | What the data means |
| 8 | (Talk) | "What it doesn't do: recognize Reels, or do anything about them. And even if it did, iOS would only let me nudge or block all of Instagram." | The limits |

⚠️ **Heads-up about the screen:** the run row says "Memory peak X of **~300 MB limit**". That label is **too strong**; the app's wording just wasn't careful. If someone notices it, say:

> "That's what iOS *reported* as available, not a tested limit. I haven't pushed it to see when it actually gets killed."

**What this proves:** the extension receives a steady stream of changing frames from the real Instagram app at low memory cost, for a short run.

**What it doesn't prove:**
- what's actually *in* the frames (not visually checked)
- that it survives locking or long sessions
- anything about recognizing or stopping Reels

**Short version (~45 s):** start the broadcast, 15 seconds of Reels, stop, show the run row, then say the two "doesn't" lines.

### If something breaks

| Problem | What to say / do |
| --- | --- |
| App won't open | "Free developer builds expire every 7 days. This is why." Re-run from Xcode if the Mac is there, or skip to backups |
| Logged out of Instagram in the wrapper | Log in live (it's fine to show), or skip |
| Suggested Reel *doesn't* get blocked | "This is a heuristic, and Instagram might have changed something since I tested. That's exactly the risk with this approach." Then show the results file |
| Instagram looks different | "This is the maintenance problem: the website changes and my rules have to keep up." |
| Broadcast won't start or stops | "That's the reliability question I still need to test." |
| Mirroring fails | Pass the phone around, or show the results files on GitHub |

**Backups to make the night before:**
- **Wrapper:** a screen recording (Control Center › Screen Recording).
- **Screen-capture app:** a screenshot of the run list. iOS's own screen recorder may not run during my broadcast, since both use ReplayKit (not tested).

---

## Part 4: What I corrected from the prep doc

The prep doc stays as it is. These notes use the more careful versions below.

1. **Memory.**
   - ❌ Prep doc: "the memory limit looked like ~300 MB, not ~50 MB."
   - ✅ Correct: **"The extension used under 7 MB in my test. The logs also reported roughly 300 MB available, but I haven't established the actual memory limit."**
   - Why: "available" is what iOS reported at that moment, with the phone plugged into Xcode. I never pushed memory up to see where it gets killed.
   - The app's own screen also labels this number a "limit" (see the Demo 2 heads-up).
2. **Screen-capture frames.**
   - ❌ Prep doc: "Instagram doesn't black out Reels during capture" / "Instagram doesn't hide Reels from capture."
   - ✅ Correct: **the extension received changing, non-black frames while I scrolled Reels.** No frame was saved or looked at, so the content isn't visually confirmed. The run also included moments of switching into Instagram.
   - This is not proof the system can recognize or interpret Reels.
3. **Wrapper blocking.**
   - ✅ Correct: version 2 blocked Suggested Reels **in two documented trials**. That's a promising first result, not proof every Reels entry point is covered.
   - Feed Reels, photo DMs, long-term reliability, notifications and native-app blocking are untested or unbuilt.
4. **Pod history.** Left as ✏️ blanks. Nothing was invented.
5. **Novelty.**
   - The prep doc's "potential novelty" for screen capture is too strong. **WallHabit** and the open-source **Slowth** already use the ReplayKit approach, according to Griffin's research.
   - SocialLite and Dull already do the wrapper.
   - The honest framing is "I'm testing these approaches myself to understand the tradeoffs", not "nobody's done this."

**Other things I noticed:**
- The prep doc's battery comparison for the wrapper ("likely close to normal browsing") is a guess. My script also checks videos once a second, and battery hasn't been measured for either app.
- The prep doc's Exp 1-R26 table says "Memory limit observed ≈ 300 MB". The same correction as #1 applies.
- Two READMEs in my workspace still say "no code yet": the workspace README and the 1-R26 README. My Exp3 results file and README still say DM sending is "not reported", even though I've since tested texts. All four are out of date.

---

## Part 5: Extra details, if someone asks

*Each topic has three parts: **Say it** (simple), **If they push** (more technical), and **In my build**.*

### Why iOS can't modify Instagram's interface
- **Say it:** "Every iPhone app lives in its own sealed box. No app can reach into another one and change it."
- **If they push:**
  - Apps run as separate processes in separate containers.
  - There's no public API to read another app's screen layout, inject code, draw over it or tap its buttons.
  - Android has AccessibilityService, which can read other apps' screens and press back. iOS has nothing like it.
  - App Review only allows public APIs. The only real ways around it are jailbreaking or a hacked, sideloaded copy of Instagram.
- **In my build:** that's why A only *watches* and B uses the *website*.

### ReplayKit and Broadcast Upload Extensions
- **Say it:** "It's Apple's livestreaming feature. When you start a broadcast, iOS sends the screen to a little helper program, even while you're in other apps."
- **If they push:**
  - The helper is an app extension: a separate process with its own memory budget.
  - Frames arrive one by one as video buffers.
  - The main app never sees the frames; Apple keeps them in the extension.
  - Only the user can start a broadcast, from Apple's button or Control Center.
  - It's deprecated in Apple's iOS 27 tools but still works on iOS 26.
- **In my build:** my extension is the helper. It shares a folder with the main app (an **App Group**) so it can leave a log the app can read.

### How frames are received and processed
- **Say it:** "iOS sends 40 to 60 frames a second. I keep one every two seconds, take a couple of measurements and throw it away."
- **If they push:**
  - For each kept frame, I average brightness over a 17×16 grid of cells.
  - Then I build a 16×16 **difference hash**: one bit per cell, saying "is it darker than its neighbor?"
  - If the hash changes, the picture changed. A blank frame gives all zeros.
  - Each measurement becomes one line in an NDJSON log, along with memory use and a heartbeat every 2 seconds, so I can tell "the screen was still" from "the extension died".
- **In my build:** `FrameRecorder.swift` does this, and `RunSummary.swift` turns the log into coverage, changed and blank counts.

### Why receiving frames ≠ detecting Reels
- **Say it:** "Getting the picture is step one. Knowing what's *in* the picture is a whole separate problem I haven't started."
- **If they push:** capture gives raw pixels only. It doesn't say which app or screen you're on. Turning pixels into "this is Reels" needs its own logic, and that logic has to be cheap enough to run constantly.
- **In my build:** nothing recognizes anything yet. The hash is groundwork.

### How we might recognize Reels
- **Say it:** "Probably start simple: Reels has a rhythm, where the whole screen changes every few seconds when you swipe. If that's not enough, train a small image model."
- **If they push:** three options, cheapest first:
  1. **Swipe rhythm** from frame changes. No machine learning, and it's closest to measuring *compulsive* scrolling.
  2. **Layout and text cues**, like Apple's text recognition reading "Reels", or the like/comment/share column on the right.
  3. **A small Core ML image classifier** trained on our own labelled screenshots.
  - Background apps can't use the GPU, so any model runs on the CPU, which costs battery.
  - Our research target: 90% precision on someone not in the training data.
- **In my build:** my logs already have the hash. Comparing Reels runs vs. DM runs is a cheap next experiment.

### Why detecting a Reel doesn't let us close it
- **Say it:** "Even if I know you're on a Reel, I can't press back or remove it. I can only send a notification or block all of Instagram."
- **If they push:**
  - There's no API to control another app.
  - Screen Time shields are whole-app.
  - On iOS 26, it's not even clear the extension is *allowed* to trigger a shield. Forum reports conflict.
- **In my build:** no intervention exists yet.

### How Screen Time shielding works
- **Say it:** "With your permission, an app can cover other apps with a 'blocked' screen. But only whole apps, categories or websites."
- **If they push:**
  - It uses three frameworks:
    - **FamilyControls**: permission (with Face ID) and Apple's app picker
    - **ManagedSettings**: the shields
    - **DeviceActivity**: schedules and time limits
  - Apps are opaque tokens, so the app never even learns app names.
  - It needs a special entitlement from Apple to ship.
  - For adults it's friction, not a lock: you can turn the permission off in Settings.
- **In my build:** not used yet in either app.

### What changes with iOS 27 ScreenCaptureKit
- **Say it:** "On iOS 27, the main app can capture the screen itself instead of a separate helper. So the same app could notice *and* block."
- **If they push:**
  - It needs the `screen-capture` background mode.
  - Apple only documents background capture alongside an audio session. Screen-only survival is undocumented.
  - And an Apple engineer said switching to ScreenCaptureKit "doesn't change" the App Store concern.
- **In my build:** fully planned (Exp 1-S27). It needs macOS 26.6+, Xcode 27 and an iOS 27 phone, which I don't have yet. It's kept, not dropped.

### What WKWebView is
- **Say it:** "It's Safari's engine as a piece you can put inside your own app."
- **If they push:**
  - The pages it loads run inside my app's process.
  - I get hooks for every navigation, I can inject scripts, and I can receive messages from the page.
  - Apple requires browsing apps to use WebKit, which is why SocialLite probably uses it too.
- **In my build:** `InstagramWebView.swift` sets it up.

### How injected JavaScript and CSS remove things
- **Say it:** "Before Instagram's page draws, my app slips in a little style rule and a script. The style rule hides Reels links, and the script watches videos."
- **If they push:**
  - It's a `WKUserScript` injected at document start.
  - The CSS rule `a[href$="/reels/"] { display: none }` hides any link ending in `/reels/`.
  - The script listens for videos starting to play, and also checks every second.
  - It reports only "allowed" or "blocked" back to the Swift side.
- **In my build:** `BlockReels.js`.

### URL filtering vs. visual detection
- **Say it:** "In the wrapper I can just *read* the address, so I know exactly where you are. In the screen watcher I only have pixels, so I'd have to *guess* from the picture."
- **If they push:**
  - URL rules are exact and free, but they only work in a browser I control, and only if the address actually changes.
  - Visual detection works on any app but is fuzzy and costs battery.
- **In my build:** the wrapper uses URL rules plus one visual-ish rule (is the video full-screen?).

### Why Suggested Reels broke version 1
- **Say it:** "Instagram's website shows Suggested Reels without changing the address, so my address rules never saw them."
- **If they push:**
  - Instagram's site is a **single-page app**: it rewrites the page without reloading. I already watched the address property to catch that.
  - But the Reel viewer is an overlay on the DM page, and the address just stays `/direct/t/…`.
- **In my build:** found with the "Recent pages" diagnostic: 7 video starts, 0 address changes.

### How version 2 handles it
- **Say it:** "Instead of the address, it watches for full-screen videos. If you tapped to open it, fine. If one starts without a tap, that's a swipe, so it pauses it and sends you back to the chat."
- **If they push:**
  - "Full-screen" means at least 80% of the visible height and 90% of the width, so feed and in-chat videos don't count.
  - "Tapped" means a tap within the last 4 seconds.
  - Blocking pauses the video, and the app reloads the chat, which closes the viewer.
  - Weak spot: a tap inside the viewer (like mute), then a quick swipe, could slip through.
- **In my build:** worked in 2 of 2 documented tries, with no false blocks afterward.

### Why the wrapper can't fully replace the app
- **Say it:** "It's the website, and the website just has less."
- **If they push:**
  - No notifications, so you could miss messages.
  - SocialLite users report missing story and video upload, close friends and photo editing.
  - Login quirks.
  - And Instagram keeps nudging you to "use the app".
- **In my build:** I haven't tested posting or photo DMs. The "use the app" prompt is still there.

### Privacy, permissions, performance, bypass and the App Store

| | A: screen capture | B: wrapper |
| --- | --- | --- |
| Privacy | Sees *everything* on screen. Mine measures and discards; nothing saved or sent. Still feels like being watched | Sees only Instagram pages. Holds your Instagram login cookies on the phone. My script never reads messages |
| Permissions | Manual start every time + red indicator | None special. Login happens on Instagram's own page |
| Performance | Unmeasured battery. 40–60 frames/s arrive even though I keep 1 per 2 s | Unmeasured. A normal web view plus a check once a second |
| Bypass | Stop the broadcast anytime | Just open the real Instagram app |
| App Store | High risk (Apple engineer: "fundamentally unsuitable") | Moderate. SocialLite ships, but Meta's terms and Apple's third-party content rule (5.2.2) apply |

Both are personal research builds installed from Xcode. **Neither is meant to ship as-is.**

---

## Part 6: Questions I might get

**Why two approaches?**
> "The research left two ways around Apple's rules, and each had an unknown I could only answer by trying it. Building small tests of both taught me more than picking one on paper."

**Why not just use Screen Time?**
> "It blocks all of Instagram, including DMs, and it can't even tell whether I'm in Reels or messages."

**How does SocialLite do something similar?**
> "From what's public, it shows the platforms' websites in its own browser and blocks the real apps with Screen Time. That last part is my inference from their privacy policy and reviews. Mine is the same basic idea, written from scratch. I never looked at their code. One difference: they apparently had to force English for their blocking to work, and I match link addresses instead of words."

**Which approach is more promising?**
> "Depends what 'promising' means. For something that works now, the wrapper, by far. For keeping the real app and understanding actual behavior, the screen watcher is more interesting, but it has way more unknowns. Honestly, I think they're best together."

**Why doesn't the screen watcher just block Reels?**
> "It can't. iOS doesn't let any app control another app. The most it could ever do is send a notification or block all of Instagram."

**Does it detect Reels yet?**
> "No. Right now it just proves it can get the screen frames cheaply. Recognizing Reels is the next step."

**How does the wrapper know what to block?**
> "Mostly by the page address: `/reels/` and `/explore/` get bounced, and links to those get hidden. Plus one video rule for Reels that show up without changing the address."

**Does messaging still work?**
> "Yes. I've opened, read, sent and received texts in it. I haven't tested sending a photo yet, and there are no notifications."

**Can people bypass it?**
> "Easily, right now. Just open the real Instagram. The fix would be blocking the real app with Screen Time, but adults can always turn that off, so it's friction, not a lock. Same with the screen watcher: you can stop it anytime."

**What if Instagram changes its website?**
> "Things could break, and it's already happened once: the Suggested Reels thing. Matching addresses is sturdier than matching text, and I built the 'Recent pages' log specifically to figure out what changed."

**What did you code vs. what Claude generated?**
> "Claude Code wrote most of the actual Swift and JavaScript. I set up the Xcode projects, signing and the shared folder. I ran everything on my phone, did the tests, reported what happened, and decided what to try next. The bugs and surprises came from my testing. Claude also helped with the research, and I had it critique its own first report."

✏️ *Adjust this to however you'd describe your part.*

**Most interesting thing you discovered?**
> "That Instagram's website quietly feeds you Suggested Reels on top of your DMs without the address changing. You'd never notice as a user, but it's exactly how the loop sneaks back in."

**Most difficult or surprising part?**
- *Difficult:* the Xcode setup. My Mac's disk filled up mid-setup, and deleting a simulator to make space broke building to my *real* phone.
- *Surprising:* how little memory the capture used (under 7 MB), and how much the research changed between the first report and the skeptical second one.

**How would you test whether it actually reduces scrolling?**
> "A baseline week using Instagram normally, measured with the phone's own Screen Time numbers, then a week or two with the tool. Plus a short questionnaire about regret or wellbeing. And check people still felt they got what they needed. That's from my ideation doc's 'outside judge' idea; I haven't run it."

**What would you work on next?**
> "For the wrapper: photo DMs and a few days of real use. For the screen watcher: lock-screen, long-run and battery tests, then see if Reels swiping has a recognizable rhythm in my logs."

---

## Part 7: Next steps and questions for the pod

### Approach A: screen capture

- **Immediate experiments** (no new code, just more runs):
  - lock and unlock
  - switching between several apps
  - an incoming call
  - Low Power Mode
  - a 30-minute unplugged run with battery % before and after
  - a run with Xcode disconnected
- **Short term:**
  - record separate Reels, feed and DM runs and compare the change rhythm, to see if Reels is distinguishable without ML
  - an opt-in session that saves a few thumbnails, so I can actually *see* frames
  - try a local notification from the extension
- **Longer term:**
  - a small on-device detector (heuristic first, Core ML if needed)
  - try a Screen Time shield, which needs Apple's entitlement and maybe a paid developer account
  - the iOS 27 ScreenCaptureKit version once I have the tools

### Approach B: wrapper

- **Immediate experiments:**
  - send a photo in DMs
  - check feed videos and Reels inside the home feed
  - test opening `/reels/` directly
  - use it as my only Instagram for 3 days and log what breaks
- **Short term:**
  - a "DMs only" mode
  - simple settings so people choose what's blocked
  - have a pod member or friend try it
- **Longer term:**
  - Screen Time blocking of the real app, so the wrapper is the default door
  - other platforms, like YouTube with Shorts sent to the normal player
  - Facebook, which connects to our group's Marketplace idea

### Combining them (long term, just an idea)

- The wrapper is the everyday way in.
- The real app gets short unlocks for posting.
- The watcher only runs during those unlocks.

Worth discussing; not worth building until both halves are more solid.

### Questions for the pod

1. Would *you* use a web version of Instagram if it meant no Reels? What would make you quit it?
2. Should we **remove** short-form completely, or only **step in** when scrolling turns compulsive?
3. How much does keeping the **real app** matter compared with Reels actually being gone?
4. Should my wrapper become the iPhone piece of our group's plan, or should we keep these as separate experiments?
5. What would convince *us* it actually works? What would we measure, and who would test it?

---

## Part 8: One-page cheat sheet

**Problem:** Keep the useful parts of social media (DMs, friends, info) without compulsive short-form scrolling.

**Why not just block Instagram:** Screen Time blocks the whole app, DMs included, and can't tell Reels from messages.

**My research process:**
- ideation (60+ ideas)
- Claude research on what iOS allows
- a skeptical second pass that caught six over-optimistic claims
- a plan matched to my real devices
- build small tests
- revise based on results

**The wall:** No iPhone app can change another app. I can *watch* Instagram or *replace* it, never edit it.

**Approach A (screen capture):** Apple's broadcast feature sends the real Instagram app's screen to a little helper program I wrote. It can watch, but it can only nudge or block all of Instagram, never remove a Reel.

**Approach B (wrapper):** My own app shows Instagram's *website* in a browser I control, with Reels and Explore removed. Precise control, but it's not the real app.

**What I've actually shown:**
- **A:** about 3 minutes of steady, changing, non-black frames while scrolling Reels, under 7 MB of memory. No detection or intervention yet.
- **B:** no Reels tab, Explore or profile Reels. DMs (read, send, receive texts), feed, profiles, stories and search work. Scrolling from a friend's Reel into Suggested Reels was blocked in 2 of 2 tries.

**Biggest limitation:**
- **A:** it can watch, but can't touch, and lock, battery and recognition are all untested.
- **B:** it isn't the real app (no notifications, gaps), and you can just open real Instagram.

**Biggest takeaway:** *Detecting a behavior inside someone else's app is a different problem from building a place where it can't happen.* The two might work best together.

**Next:**
- A: lock, battery and long-run tests, then try to recognize the Reels rhythm.
- B: photo DMs, a 3-day trial, settings, maybe Screen Time on the real app.

**Ask the group:**
1. Would you actually use a Reels-free web Instagram?
2. Remove short-form entirely, or only step in when it gets compulsive?

**Say carefully:**
- "~300 MB *available*", not "limit"
- "changing, non-black frames", not "it sees Reels"
- "blocked in 2 of 2 tries", not "always blocks"
- "others have tried this too", not "first ever"
