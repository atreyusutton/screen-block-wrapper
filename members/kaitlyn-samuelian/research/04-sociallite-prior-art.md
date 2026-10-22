# Prior Art: SocialLite

Oct 22, 2026 · @KAITLYN

Supplemental research. It records an existing product for later comparison and does **not** change our direction: Experiment 1-R26 (ReplayKit) remains the immediate priority, and the iOS 27 ScreenCaptureKit plan is unchanged. Builds on the [feasibility investigation](01-ios-feasibility-investigation.md), [risk verification plan](02-risk-verification-plan.md) and [iOS 26 / iOS 27 paths plan](03-ios26-ios27-paths-plan.md).

We have not installed or tested SocialLite. Everything below comes from public sources read on 2026-10-22.

## Bottom line

SocialLite is a shipping, popular version of what our reports call **architecture B plus C**: its own in-app browser that loads the social platforms' websites with Reels, Shorts, Explore and ads removed, plus Screen Time shields on the native apps that point users back to SocialLite.

- It is the clearest evidence so far that the "own the renderer" path works commercially and passes App Review, including the Family Controls distribution entitlement.
- It never sees inside the native Instagram or TikTok apps. It removes the feed where it controls the page, and shields the native app everywhere else.
- That leaves the space our capture experiments target open: observing behavior inside the real native apps, detecting compulsive scrolling rather than removing a tab, and measuring whether any of it works.

## Evidence labels

- **Developer-stated:** SocialLite's website, App Store description, release notes or privacy policy. This is what the company claims, not something we verified.
- **User-reported:** App Store reviews.
- **Inference:** our reasoning from the above.
- **Unknown:** no public evidence found.

## 1. What it solves and its main features

**Problem.** Endless short-form and algorithmic feeds. Tagline: "Keep the social. Lose the scroll." (Developer-stated, [sociallite.app](https://sociallite.app/))

**Product facts** ([App Store listing](https://apps.apple.com/us/app/socialliteapp/id6757661674), Developer-stated):

| Item | Value |
| --- | --- |
| App name | SocialLite-Block Reels&Shorts ("Stop Doomscrolling-Stay Social") |
| Seller | Sociallite LLC |
| Platforms | iPhone and iPad (iOS 17.0+), also Android, a Mac app, and a Chrome extension (beta) |
| Price | Free, with in-app purchases: Pro monthly and yearly tiers, and a Family plan |
| Account | Required. Sign in with Apple or Google, or phone number, email and password ([privacy policy](https://sociallite.app/privacy/)) |
| Size | 159 MB |
| Rating (US store) | 4.8 from about 15K ratings. The website claims "35K+" App Store ratings and "1 Million+" users, probably counted across stores and platforms (Inference) |
| First release | 1.0 on Jan 29. Latest seen: 3.1.5, about Oct 16. Release dates are shown without a year; the sequence suggests 2026 (Inference) |

**Platforms covered** (Developer-stated): Instagram, YouTube, Snapchat, Facebook, X, Reddit (added in 3.1.0). TikTok's link reads "coming soon".

**Blocked** (Developer-stated, App Store description): short-form video feeds, algorithmic recommendations, Explore and discovery pages, live streams, shopping tabs, ads and sponsored posts. Instagram home-feed filtering removes suggested posts and ads (1.3.1). "AI post filtering" and "repost filtering" were added in 3.1.5.

**Kept** (Developer-stated): direct messages, profiles the user visits, content friends send directly, and posting. The website's screenshots show Instagram with Home, Search, Messages and Profile only, and Snapchat with "Chat and Stories only".

**Other features**, from the release notes ([version history](https://apps.apple.com/us/app/socialliteapp/id6757661674?see-all=version-history)), Developer-stated:

- Screen Time app shielding with custom shield screens, including blocking whole app categories (1.3.1)
- **Post Mode:** unlock a native app for 10 minutes to post (1.3.1)
- Live Activity countdown in the Dynamic Island and on the Lock Screen (1.3.1)
- YouTube background audio and Picture-in-Picture (1.3.1)
- Routines (2.0.0), Sleep Mode and multiple accounts (3.1.0), and a focus mode (3.1.3)
- Push notifications for Instagram and Snapchat (3.1.2)
- An "hours saved" counter and per-app time today (website)
- Parent and school plans: parents can "configure content blocking settings and downtime schedules" for linked child accounts ([privacy policy](https://sociallite.app/privacy/))

## 2. How the iOS implementation works

**Embedded browser over the platforms' websites.** No source states it outright, but several point the same way:

| Evidence | Source | Label |
| --- | --- | --- |
| The app "stores cookies from third-party social media platforms to maintain your login sessions" and does "not access or transmit the contents of these cookies to our servers" | [Privacy policy](https://sociallite.app/privacy/) | Developer-stated |
| "We do NOT collect or access your social media passwords" | [Privacy policy](https://sociallite.app/privacy/) | Developer-stated |
| "SocialLite provides a focused browsing experience" | [App Store description](https://apps.apple.com/us/app/socialliteapp/id6757661674) | Developer-stated |
| The app "uses the social media's website to gain access"; another review calls it a "proxy Instagram" | [App Store reviews](https://apps.apple.com/us/app/socialliteapp/id6757661674) | User-reported |
| "Instagram blocking now works with devices set to other languages by forcing english within Sociallite" (1.2.1) | Release notes | Developer-stated |
| "Iphones with home buttons can now log in" (1.2.1); "improved login flow" (2.1.3) | Release notes | Developer-stated |
| The website's screenshot caption reads "Instagram running inside SocialLite" | [sociallite.app](https://sociallite.app/) | Developer-stated |

What we infer from that:

- **Most likely a `WKWebView` client.** Platform login cookies kept on the device, plus "browsing", is how an embedded web client works. App Review [2.5.6](https://developer.apple.com/app-store/review/guidelines/#software-requirements) requires apps that browse the web to use WebKit, so a `WKWebView` is the probable renderer (Inference).
- **It hides elements by matching their text.** Needing to "force English" for Instagram blocking to work suggests the hiding code finds elements by English labels such as "Reels", rather than only by URL or structure (Inference). This is fragile in exactly the way our report 01 warned about ("DOM churn").
- **YouTube background audio and Picture-in-Picture** are standard `WKWebView` and audio-session settings (Inference).
- **The blog's "system level" claim is marketing.** A blog post says SocialLite strips Reels "at the system level" ([blog](https://sociallite.app/blog/how-to-use-instagram-without-the-algorithm/)). That conflicts with the evidence above, and no public iOS API removes views inside another app (report 01). We read it as marketing language, not a technical description.

**Screen Time shields on the native apps** (Developer-stated, 1.3.1): "Block native apps and redirect to SocialLite with custom shield screens". Shipping this on the App Store requires the Family Controls distribution entitlement, so Apple has granted it to this app (Inference from Apple's [entitlement requirements](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement)). Exactly how the shield "redirects" users is not stated (see open questions).

**Unknown:** whether it uses `STWebpageController`, `WKUserScript`, network-level filtering, or any server-side component for notifications or AI filtering.

## 3. How it removes Reels/Shorts and keeps DMs

Inside its browser, SocialLite controls the page, so it can remove the Reels, Shorts, Explore and Spotlight tabs and their entry points while leaving Messages, Search, Profile and Stories (Developer-stated, from screenshots and the description). Two behaviors match what report 01 described for this approach:

- **One video, no feed.** A Reel a friend sends can be watched, but "you can't scroll to the next one" (Developer-stated). One user writes that after a sent Reel, "They take you right back to chat!" (User-reported). This is the "Reels only via DMs" idea (#6) from `kaitlyn-ideation.md`, shipped.
- **The native app becomes the high-friction path.** The real Instagram app is shielded. Posting, which the web version supports poorly, gets a timed 10-minute **Post Mode** unlock instead of a permanent exception (Developer-stated).

**Feature gaps reported by users** ([App Store reviews](https://apps.apple.com/us/app/socialliteapp/id6757661674)):

- No DM notifications while app blocking was on, which "caused me to miss clients' messages" (review dated Jul 8, before 3.1.2 added push notifications).
- Missing: "uploading videos to posts and story, close friends story, zooming/editing photos before posting, push notifications". Users go to "real Instagram" for these, which is what Post Mode is for.
- Some items "take a little bit of time to load".

## 4. Comparison with our approaches

SocialLite and our capture experiments answer different questions. SocialLite asks *"how do we give people a Reels-free Instagram?"* Our experiments ask *"can we see and respond to what happens inside the real Instagram app?"*

| | SocialLite (web client + shields) | Our iOS 26 path: ReplayKit (1-R26) | Our iOS 27 path: ScreenCaptureKit (1-S27) |
| --- | --- | --- | --- |
| Architecture in our reports | B (web client) + C (Screen Time) | A (native watcher), extension process | A (native watcher), main app |
| Sees inside native apps | No | Yes, as pixels | Yes, as pixels |
| Removes Reels at the view level | Yes, in its own browser | No. Can only detect, then nudge or shield the whole app | Same as 1-R26 |
| Keeps DMs | Yes, via web DMs (with reported gaps) | Yes. The real app is untouched unless we shield it | Same as 1-R26 |
| Detects *compulsive* use (swipe cadence, session length) | No evidence. Removes the feed instead | Possible (U3, untested) | Possible (U3, untested) |
| Works in apps it doesn't know | No: one integration per platform | Yes, in principle (format detection) | Yes, in principle |
| Handles platform logins and cookies | Yes. Login breakage is a known cost | No. We never touch accounts | No |
| Breaks when platforms change their web pages | Yes ("force English", login fixes) | Breaks when visual layouts change (model retraining) | Same |
| User effort | Use SocialLite instead of the native apps | Start a broadcast. Stops on lock (Dev-reported) | Start capture from the picker; background lifetime unknown (U1) |
| Privacy surface | Holds platform session cookies; account with phone or email; analytics | Screen pixels, processed on device and discarded | Same as 1-R26 |
| App Store status | Shipping, with the Family Controls distribution entitlement | High risk: DTS called capture plus ML "fundamentally unsuitable" ([forum 837850](https://developer.apple.com/forums/thread/837850)) | Same risk; ScreenCaptureKit "doesn't change" it per DTS |
| Maturity | 3.x release, large user base | Experiment, not built yet | Experiment, waiting on Xcode 27 |

**What this means for our plan:**

- SocialLite doesn't make 1-R26 or 1-S27 redundant. It can't answer U1–U3 because it never observes the native apps.
- It largely answers the product side of **U4** (is a Reels-free web client good enough?): yes for many users, with known gaps in posting, notifications and close-friends features. Our own U4 experiment would still need to measure login, DMs and breakage directly, since these are user reports.
- It offers partial evidence on **U5**: Apple has approved a wrapper-style client with Family Controls. That lowers our estimate of the guideline 4.2 and 5.2.2 risk for architecture B, and says nothing about the `screen-capture` risk for architecture A (Inference).

## 5. Limitations, and room to do something different

**SocialLite's limitations** (sources noted):

1. **Blind to the native apps.** If a user opens the native app during Post Mode, or any app SocialLite doesn't wrap, nothing sees what happens (Inference from the architecture).
2. **Feature parity depends on the web.** No video or story upload, no close friends, and earlier no notifications (User-reported). Post Mode is a workaround.
3. **Fragile page manipulation.** The language-forcing fix and repeated login fixes show selector and login breakage is real upkeep (Developer-stated).
4. **TikTok is missing.** It's "coming soon" (Developer-stated). TikTok is almost all short-form, so a web-client approach has little to keep there (Inference).
5. **Blocks without measuring.** It reports "hours saved", but we found no validated outcome measure, such as OS-reported screen time against a baseline or a questionnaire (Unknown, no evidence found).
6. **Privacy claims don't match the label.** The description says data stays on device and "never touches" its server. The App Store privacy label lists identifiers used for tracking, plus contact info and purchase data. One search result's copy of the listing showed "does not collect any data" (Developer-stated, conflicting; may differ by version or capture date).
7. **Account and subscription.** A SocialLite account is required, and Pro is a subscription (Developer-stated).
8. **Platform terms.** A modifying client of Instagram, YouTube and others depends on those platforms tolerating it (guideline [5.2.2](https://developer.apple.com/app-store/review/guidelines/#third-party-sites/services); Inference, no enforcement reports found).

**Where we could differ or do better:**

- **The watcher as referee** (report 01, alternative 6). A capture-based detector could notice short-form inside the *native* app, including during a Post Mode-style unlock, which a wrapper alone can't do.
- **Compulsion, not presence.** Respond to swipe cadence and session length (report 02, Part 3) instead of removing the feed outright, so a friend's Reel is fine and 40 minutes of swiping isn't.
- **Measurement as a product.** Use capture for a baseline week ("how much of your Instagram time is Reels?") and report outcomes with an outside judge (report 02, alternative 3, and ideation #23).
- **No account, no cookies.** A capture-based design never handles platform logins, which is a simpler privacy story to verify.
- **Format detection across apps**, including TikTok and future apps (ideation #43).
- **Complement rather than compete.** A hybrid could pair a SocialLite-style web client (the good path) with our detector (the referee). This is still only an idea for later and doesn't change current work.

## 6. Technical insights and open questions

**Insights worth keeping:**

- **Shield, then route to a good path** is a shipping pattern: native app shielded, custom shield screen, a timed unlock for posting, and a Live Activity countdown. This matches report 02's alternative 1 (intent-first gate plus web client).
- **A "one video, then back to chat" rule** keeps the benefit of shared Reels while removing the feed. Any detector we build should treat a single sent Reel differently from a swipe session.
- **Language affects web-page hiding.** Element hiding that depends on English labels breaks for other languages. If we ever build the U4 web client, prefer URL paths and structural signals over visible text.
- **Feature gaps cluster around posting and notifications**, not reading. That is where a web client needs a planned escape hatch.

**Open questions to investigate later** (all Unknown):

1. How does a SocialLite shield "redirect" to its app? Our reports note that a `ShieldActionDelegate` can't open apps. Does it use a notification, `.openParentalControlsApp`, a Shortcuts automation, or only text telling the user to open SocialLite? This bears on our experiment 6 (shield button routing).
2. How do the Instagram and Snapchat push notifications (3.1.2) work without a server? Background fetch with stored cookies, a server that polls on the user's behalf (which would conflict with "never touches our server"), or something else?
3. Is "AI post filtering" (3.1.5) on device or server-side?
4. Does it use `STWebpageController` so web usage counts in Screen Time?
5. How does it handle Meta login in an embedded browser, given Meta's restrictions on embedded browsers ([Meta](https://developers.facebook.com/blog/post/2021/06/28/deprecating-support-fb-login-authentication-android-embedded-browsers/))?
6. What accounts for the 159 MB app size: bundled models, assets, or a cross-platform framework?
7. How does the Android version work? Is it also a web client, or does it use AccessibilityService? This is out of scope for iOS, but useful for team comparison.
8. Has Meta, Google or Snap pushed back on it publicly?

**How to answer them cheaply, if we choose to later:** install the free tier on a test device and observe it without reverse-engineering. For example, check whether shielded-app taps open SocialLite, whether notifications arrive when the app is closed, and whether web usage appears in Screen Time. Not planned now.

## Related products already in our reports

[Dull](https://getdull.app/block-reels-iphone/) (own in-app browser for Instagram), [Short Video Hider](https://apps.apple.com/app/id6745738626) (Safari Web Extension), [Scrolless](https://apps.apple.com/us/app/social-media-blocker-scrolless/id6741134096), and one sec, Opal, ScreenZen and AppBlock (Screen Time shields). See [report 01](01-ios-feasibility-investigation.md#prior-art-and-how-it-works). SocialLite is the broadest of the web-client products we've found: more platforms, Screen Time integration, and Mac and Chrome versions.

## Sources

Read 2026-10-22.

- SocialLite: [website](https://sociallite.app/) · [privacy policy](https://sociallite.app/privacy/) (last updated June 6, 2026) · [desktop page](https://sociallite.app/desktop/) · [FAQ](https://sociallite.app/faq/) (answers did not load in our fetch) · [blog: using Instagram without the algorithm](https://sociallite.app/blog/how-to-use-instagram-without-the-algorithm/)
- Apple App Store: [SocialLite-Block Reels&Shorts](https://apps.apple.com/us/app/socialliteapp/id6757661674) (description, reviews, privacy label) · [version history](https://apps.apple.com/us/app/socialliteapp/id6757661674?see-all=version-history)
- Apple: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (2.5.6, 4.2, 5.2.2) · [Requesting the Family Controls entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement) · [Developer Forums 837850](https://developer.apple.com/forums/thread/837850)
- Meta: [Facebook Login in embedded browsers](https://developers.facebook.com/blog/post/2021/06/28/deprecating-support-fb-login-authentication-android-embedded-browsers/)
- No independent reviews, press coverage or technical teardowns of SocialLite turned up in our searches.
