# Experiment 3: Reels-free Instagram web client (WKWebView)

**Status:** working prototype (version 2). See [results](results/2026-10-24-session1.md).
**Target:** iPhone on iOS 26.5.2, built with Xcode 26.1.1. Any iOS 17+ device would work.
**Answers:** U4 ("Is a Reels-free web client good enough to be the useful path?"). See [shared protocols and metrics](../shared/README.md#u4-web-client).

This is a **third, independent approach**. It doesn't replace the screen-capture experiments ([1-R26](../exp1-r26-replaykit/README.md), [1-S27](../exp1-s27-screencapturekit/README.md)). The approaches answer different questions:

- **Screen capture** asks: can we *see* what happens inside the real Instagram app?
- **This experiment** asks: can we *remove* Reels while keeping DMs, by owning the page Instagram is shown in?

The research reports describe them as layers: the web client is the "good path", and the screen watcher is the "referee" for the native app. See [report 01](../../research/01-ios-feasibility-investigation.md#alternative-architectures-worth-testing) (alternatives 2, 3 and 6), [report 02](../../research/02-risk-verification-plan.md#u4-is-a-reels-free-web-client-good-enough-to-be-the-useful-path) (U4) and [report 04](../../research/04-sociallite-prior-art.md) (SocialLite, a shipping product built this way).

## How it works

Our app shows `https://www.instagram.com` in a `WKWebView`. You log in once, and the login cookies stay on the iPhone. These layers keep Reels out:

1. **Address guard (Swift, `InstagramWebView.swift`).** The app watches every address the page goes to and bounces blocked ones to the DM inbox.
   - Blocked: `/reels/` (the Reels feed), any profile's `…/reels/` tab, and `/explore/` (the Explore grid).
   - Allowed: `/explore/search/` and other `/explore/…` pages (search, hashtags, places), and a single `/reel/<id>/` or `/reels/<id>/`. Moving straight from one Reel address to another counts as scrolling and is blocked.
   - Instagram's website changes pages without full reloads (a "single-page app"), so the guard observes `WKWebView.url`, which updates on every address change, not only on page loads.
2. **Scrolled-to Reels (page script, `BlockReels.js`).** Instagram opens a shared Reel in an overlay player on top of the DM thread and loads "Suggested" Reels as you scroll, **without changing the address** (found in session 1). So the script watches full-screen videos instead.
   - A full-screen video that starts within 4 s of a tap is allowed: the Reel you opened.
   - A different full-screen video that starts without a tap is paused, and the app reloads the chat, which closes the viewer.
   - "Full-screen" means at least 80% of the visible height and 90% of the width, so feed posts and in-chat videos aren't affected.
   - It's a heuristic: a tap inside the viewer (such as mute) followed by a quick scroll could slip through.
3. **Hidden entry points (CSS from the same script, injected at page start).** Links whose address ends in `/reels/`, or is exactly `/explore/`, are hidden, so those buttons never show.
   - Matching is by **address, not by text**. SocialLite had to force English because its blocking depended on labels (report 04).
4. **Everything else is untouched:** DMs (`/direct/…`), feed, profiles, posts, stories and search. The bottom bar adds Back, Messages, Search and a ✋ counter.

Links to other websites open in Safari. Links that try to open the Instagram app are blocked. Pages that ask for a new window open in the same view.

Instagram's addresses and page structure change without notice, so these rules may need updating. The ✋ screen's "Recent pages" list (page types and video decisions only, kept in memory) helps diagnose what changed.

## Privacy

- Passwords are typed into Instagram's own page. Our script adds a style rule and watches video playback; it never reads form fields, messages or page content. It reports only "allowed" or "blocked" for full-screen videos.
- Cookies stay in the app's own web storage on the iPhone.
- The app counts blocked navigations by **category only** (for example "reels feed"). It never stores usernames, message threads or URLs. The "Recent pages" diagnostic shows page types with IDs replaced by `{id}`, in memory only.
- Nothing is sent anywhere by our code.

This is a personal research prototype, not for distribution. Shipping a modifying client would raise Meta's terms and App Review [5.2.2](https://developer.apple.com/app-store/review/guidelines/#third-party-sites/services) (report 01).

## Setup (Xcode 26.1.1)

1. File › New › Project › iOS › **App**.
   - Product Name `Exp3Web`, Team: Personal Team, Organization Identifier `com.kaitlynsamuelian`
   - SwiftUI, Swift, Testing System None, Storage None
2. Save in this folder (`exp3-webview-instagram/`) with **"Create Git repository" unchecked**.
3. Optional, to avoid a crash if "Take Photo" is chosen in an upload dialog: Exp3Web target › **Info** › add **Privacy - Camera Usage Description**.
4. No extension, App Group or extra capability is needed.

## Test checklist (U4)

Run on the iPhone, logged in to your own Instagram account.

| # | Check | Pass |
| --- | --- | --- |
| 1 | Log in (username and password, 2FA if enabled) | Logged in |
| 2 | Close the app fully, reopen | Still logged in |
| 3 | Open the DM inbox, open a thread | Messages show |
| 4 | Send a text DM; receive one from a friend | Both work |
| 5 | Send a photo in a DM | Works (or note what fails) |
| 6 | Look for the Reels tab and Explore | Not visible |
| 7 | Reach Reels another way (a profile's Reels grid, a link) | Bounced to DMs |
| 8 | Open a Reel a friend sent in DMs | Plays; scrolling to the next is blocked and returns to the chat |
| 9 | Home feed, a profile, a post, stories | Work |
| 10 | Tap a link to another website | Opens in Safari |

**3-day live trial (optional):** use it as your only Instagram. Pass per the shared README: login works, DMs send and receive, zero Reels exposure, at most 1 breakage.

Also record: whether Instagram shows "use the app" prompts, any Reels that appear inside the home feed, and how long a blocked Reels page is visible before the bounce.

## Comparison with the capture experiments

| | Exp 3 (web client) | Exp 1-R26 / 1-S27 (screen capture) |
| --- | --- | --- |
| Removes Reels | Yes, inside our app | No; can only detect, then nudge or shield |
| Sees the native Instagram app | No | Yes, as pixels |
| Bypass | Open the native app (unless it's shielded with Family Controls) | User stops capture |
| Notifications | None (no web push in `WKWebView`) | Native app unchanged |
| Maintenance | Breaks when Instagram changes its website | Breaks when visual layouts change |
| Build effort | 1 app target, ~150–250 lines | App + extension + App Group |

## Later steps (not in this prototype)

- A "DMs only" mode that blocks everything outside `/direct/`.
- Filtering Reels that appear inside the home feed.
- Shielding the native Instagram app with Family Controls (may need a paid developer account).
- `STWebpageController`, so time in our web view counts in Screen Time.

## Results

| Date | Build | Checks passed | Notes |
| --- | --- | --- | --- |
| 2026-10-24 | Version 1, Xcode debug | 1–3, 6, 7, 9–11 | Scrolling from a friend's Reel reached Suggested Reels (address doesn't change) |
| 2026-10-24 | Version 2, Xcode debug | 8 added | Scrolled-to Reels blocked twice, no false blocks. 4–5 (sending DMs, photos) not yet reported; "use the app" prompt still shown |

Details: [session 1 results](results/2026-10-24-session1.md).
