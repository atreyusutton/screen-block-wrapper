# Existing products that "remove Reels/Shorts/feeds" on iPhone, and how they actually work (as of Oct 20, 2026)

Research notes by a sub-researcher. Most product claims come from vendor pages and App Store listings, and many "comparison" blogs are written by competing apps (Dull, Fluid Friction, ScrollGuard, WallHabit). Treat those as marketing unless an independent source backs them up. App Store version dates were read in October 2026, and many listings show only relative dates or dates without a year.

Technique legend used below:
- (a) Safari Web Extension that hides elements on the mobile website, sometimes paired with blocking the native app
- (b) In-app browser / WKWebView "wrapper" that loads the website and injects CSS/JS
- (c) Screen Time API (FamilyControls / ManagedSettings / DeviceActivity) blocking of the whole app
- (d) Shortcuts personal automation ("when Instagram is opened")
- (e) VPN / DNS / content-filter network blocking
- (f) Modified or sideloaded app builds (tweaked IPAs, AltStore/SideStore, jailbreak tweaks)
- (g) The social app's own settings
- (h) A NEW technique found in this research: a ReplayKit screen-broadcast extension that records the screen continuously, runs an on-device classifier to spot Reels/Shorts in the *native* app, and then triggers a Screen Time shield or bounce-out

---

## Q1. Which products claim to remove Reels/Shorts/feeds on iPhone, and what technique does each one really use?

### Takeaway
No App Store product edits the native Instagram/YouTube/TikTok UI. The products fall into five groups:
1. Whole-app blockers that use Screen Time and/or Shortcuts: one sec, Opal, ScreenZen, Jomo, Freedom, AppBlock, Brick.
2. Safari Web Extensions that hide parts of the mobile website: Short Video Hider, SocialFocus, Slowth, Control Panel for Twitter, and many "Shorts blocker" apps.
3. WKWebView wrapper apps that load the website and filter it: Dull, UNDOOMED, SocialLite, Fluid Friction (iOS), and the ScrollGuard web app.
4. Shortcuts-based redirects that send the user from the native app to a filtered web view: ScrollGuard, ScrollJail.
5. Since mid-2026, screen-broadcast plus ML detection inside native apps: WallHabit, Slowth's optional "Real-time Blocking".

Sideloaded tweaks (SCInsta for Instagram, YTLite/uYouEnhanced for YouTube) are the only way to change the native UI itself, and they sit outside the App Store.

### Cited Findings

**Whole-app blockers: Screen Time (c) and Shortcuts (d)**
- **one sec (iOS):** Uses a Shortcuts personal automation to detect when a target app opens, then shows a "deep breath" intervention. The App Store listing says it does this "whenever you open one of the configured apps (Instagram, Twitter, YouTube…)" — [App Store](https://apps.apple.com/app/id1532875441)
- **one sec, Shortcuts signals:** Its help center says the Shortcuts automations "send signals to one sec for when you open or close a target app." Re-interventions, delayed interventions and blocks instead use "Apple's Screen Time technology to completely shield apps," which requires linking each target app to its Screen Time counterpart — [one sec help: Why connect target apps to Screen Time](https://tutorials.one-sec.app/en/articles/10336706)
- **one sec, setup pitfalls:** "Ask before running" must be off. An extra "Open App" action can cause an endless loop. one sec and Shortcuts must be on the Downtime "Always Allowed" list. Apple reportedly doesn't fire triggers for the first ~2 minutes after unlock — [one sec troubleshooting](https://tutorials.one-sec.app/troubleshooting/iphone-or-ipad-app-does-not-work-as-expected)
- **one sec Safari extension:** Works at the whole-site level. You enable it in Settings > Safari > Extensions and add a site such as instagram.com to get an intervention when the site opens. I found no evidence that it hides Reels inside the site — [one sec help: Setting up the Safari Extension (iOS)](https://feedback.one-sec.app/help/articles/9268177-setting-up-the-safari-extension-ios)
- **one sec "Remove In-App Distractions" is Android-only.** The developer says that on iPhone "right now there's unfortunately no way technically to build such a feature on iOS" (page undated) — [one sec tutorial: Remove In-App Distractions (Reels, Shorts, …) [Android]](https://tutorials.one-sec.app/en/articles/4071170)
- **ScreenZen:** Adds a pause/delay screen, wait times, cooldowns and daily open limits to whole apps. I found no source showing a Reels-only block on iOS. One review notes that Android needs extra permissions, including accessibility — [Nibble blog](https://nibble-app.com/blog/screenzen); [WhistleOut review](https://www.whistleout.com/CellPhones/Apps/screenzen-app-review)
- **Opal, staff position:** Opal staff said on the community forum that they cannot yet block "at this granular level" (Reels but not the rest of Instagram) and passed the request to engineers with no timeline — [Opal community thread](https://community.opal.so/t/i-would-like-to-be-able-to-block-a-feature-of-an-app-but-not-the-whole-app-ie-block-reels-but-not-the-whole-of-instagram/3783); [Opal subdomain-blocking request thread](https://community.opalapp.com/t/subdomain-blocking-tiktok-shorts-youtube-shorts-facebook-business-instagram-reels/1015)
- **Opal, how it blocks:** Competitor Dull says Opal "installs a VPN profile" and blocks apps at the network level, and that "Opal doesn't filter content." This comes from a competitor and is unverified. I found no Opal primary source on its mechanism — [Dull vs Opal](https://getdull.app/vs/opal/); [Dull roundup, April 2026](https://getdull.app/best-apps-limit-social-media-iphone/)
- **Jomo:** Blocks whole websites and apps through rule-based schedules (up to 49 websites, blocked "on all browsers"). Its docs warn that blocking a site like Facebook may also block related apps, and that Safari Private Browsing is disabled while websites are blocked. These are Screen Time web-content restrictions — [Jomo help](https://help.jomo.so/en/article/how-to-block-websites-on-your-iphoneipad-using-jomo-ly7jcr/)
- **Freedom (iOS):** Its YouTube guide has you grant Screen Time permission and add the YouTube *app* to a blocklist. That is whole-app blocking. I found no Freedom documentation for blocking youtube.com/shorts alone — [Freedom support](https://support.freedom.to/en/articles/7880639-how-to-block-youtube); [Freedom blog](https://freedom.to/how-to-block-youtube-on-an-iphone-or-ipad)
- **AppBlock (iOS):** Says plainly that it cannot block Reels, Shorts or Snapchat Stories on iPhone because "iOS doesn't give third-party apps that level of control." Its suggested alternatives are blocking the whole app, usage limits and open limits — [AppBlock FAQ](https://appblock.app/can-appblock-block-instagram-reels-youtube-shorts-or-snapchat-stories-on-iphone/)
- **Brick (physical NFC device):** Pairs with a free app. Selected apps, websites and notifications stay blocked until you tap the phone on the Brick again. Calls and texts stay available. Blocked apps remain on the home screen but show a message instead of opening, which matches a Screen Time shield. Price is $59 per Tom's Guide, and it supports iOS 17+ and Android 12+ — [Tom's Guide](https://www.tomsguide.com/phones/brick-review); [Man of Many](https://manofmany.com/tech/brick-app-blocker-review-analysis)
- **Brick hardware:** Described as "a simple magnet and an NFC chip," with no battery — [Alex Reviews Tech](https://alexreviewstech.com/brick-review-get-your-life-back-from-your-smartphone-maybe/)
- **Brick is whole-app only.** Nothing in these reviews suggests feature-level blocking, so Reels cannot be blocked separately from the rest of Instagram — [WhistleOut AU](https://www.whistleout.com.au/MobilePhones/Reviews/brick-review)
- **Clearspace, BlockSite:** Searches turned up no iOS documentation on Reels/Shorts-level features. See Gaps.

**(a) Safari Web Extensions that hide parts of the mobile website**
- **Short Video Hider ($0.99):** A Safari extension that hides Reels and Shorts on Instagram, YouTube, Facebook and Reddit, and redirects Shorts to the normal video player. "It doesn't do anything to the YouTube App." One listing aggregator shows about 500 downloads and a 3.8/5 rating — [App Store](https://apps.apple.com/app/id6745738626); [MWM Spark listing](https://spark.mwm.ai/en/apps/short-video-hider/6745738626)
- **SocialFocus: Hide Distractions:** A paid Safari extension that hides feeds, Shorts, Reels and Stories, with per-site toggles — [App Store](https://apps.apple.com/app/id1661093205)
- **No Reel for Instagram:** A Safari extension that filters Reels, Stories and "For You" content on instagram.com — [Privacy statement](https://guillaumeclaverie.notion.site/No-Reel-For-Instagram-Privacy-Policy-270f172736e28027b2aad86473e42673)
- **End Doomscroll:** A Safari extension that blocks YouTube Shorts and Instagram Reels — [App Store](https://apps.apple.com/cl/app/end-doomscroll/id6757344518)
- **ScrollGuard: Block Reels (iOS App Store listing):** Describes a Safari extension that hides feeds, Reels, Shorts, Stories, Explore and suggested posts on Instagram, Facebook, YouTube, X, TikTok (beta, added in v1.2.2), Reddit and LinkedIn. It is free with Pro IAPs ($3.99–$59.99) and rated 4.2/5 from 114 ratings. Reviewers note "no effect on native apps." Note the conflict with ScrollGuard's own blog, below — [App Store](https://apps.apple.com/us/app/scrollguard-block-reels/id6754183872)
- **YouTube-only Shorts extensions:**
  - Detoxify – Short Block YT: free; also hides recommendations and comments; "not compatible with the YouTube app" — [App Store](https://apps.apple.com/cz/app/detoxify-short-block-yt/id6740556197)
  - Block YT Shorts for Safari: $2.99 — [App Store](https://apps.apple.com/app/id6754257092)
  - Shorts Blocker for YouTube: $0.99; redirects Shorts to the regular player; Safari-only — [App Store](https://apps.apple.com/np/app/shorts-blocker-for-youtube/id6451330524)
  - No Shorts: Blocker for YouTube — [App Store](https://apps.apple.com/app/id6502996298)
- **Control Panel for Twitter (X):** A Safari extension for iPhone, iPad and Mac. It can hide the "For you" timeline and keeps you on "Following" if X tries to switch you back. It costs $4.99 on the App Store and is open source (MIT) by Jonny Buchanan ("insin") — [App Store](https://apps.apple.com/us/app/control-panel-for-twitter/id1668516167); [AlternativeTo](https://alternativeto.net/software/control-panel-for-twitter/about/); [Greasy Fork userscript](https://greasyfork.org/scripts/387773)
- **Unhook:** I found no Safari/iOS version of Unhook. Searches returned only other Safari Shorts blockers — [search context: Detoxify listing](https://apps.apple.com/cz/app/detoxify-short-block-yt/id6740556197)

**(b) WKWebView wrapper apps that load the website and filter it**
- **Dull ($3.99/mo, $14.99/yr or $59.99 lifetime; iOS 16+):** "Loads Instagram in its own browser" and strips the Reels tab, Reels rows, Explore and suggested posts "before the page draws." Feed, Stories, DMs, Search and notifications still work. Filters ship through App Store updates or a "live filter loader" because Instagram's DOM "changes every few weeks." It also covers YouTube, Facebook, X and Reddit. It admits that "Safari still shows Reels" and that blocks can break when Instagram changes its layout — [Dull](https://getdull.app/block-reels-iphone/)
- **UNDOOMED (launched v1.0 on Oct 10, 2025; v1.5.x in Sept–Oct 2026):**
  - Opens each network's mobile website "in its own private browser" and filters the page. The listing says it does not modify third-party apps, jailbreak, use a VPN or use Screen Time.
  - Supports Instagram, Threads, Reddit, Facebook, X, YouTube and LinkedIn, plus an Instagram "Messages Only" mode.
  - TikTok and Snapchat are listed but cannot be enabled because their web versions "expose too little to filter usefully."
  - Price $1.99–$2.99/mo or $29.99 lifetime; rated 4.3/5 from 107 ratings.
  - [App Store](https://apps.apple.com/app/id6751837079)
- **SocialLite:** On iPhone it works through its own browser and covers seven apps. Pro costs about $13/month or $60/year, per a competitor comparison — [Fluid Friction comparison](https://fluidfriction.app/blog/app-to-block-instagram-reels)
- **Fluid Friction (iOS):** Uses its own browser on iPhone and works inside Instagram's app on Android. Its FAQ says: "every Reels blocker, ours included, opens Instagram in its own browser with Reels removed." — [Fluid Friction comparison](https://fluidfriction.app/blog/app-to-block-instagram-reels); [Fluid Friction how-to](https://fluidfriction.app/blog/how-to-block-instagram-reels-iphone)
- **Less Is More – Hide Reels:** Claims to hide access to short videos. The technique isn't stated in the snippet I found — [App Store](https://apps.apple.com/app/id6751927411)
- **blockit: Block Shorts & Reels:** Exists on the App Store. I did not verify its technique — [App Store](https://apps.apple.com/us/app/blockit-block-shorts-reels/id1492879257)

**(d)+(b) Shortcuts redirect from the native app to a filtered web app**
- **ScrollGuard (blog, updated April 26, 2026):** Keep the native Instagram app installed for push notifications. A Shortcuts automation that fires when Instagram opens sends you "to a web app inside ScrollGuard," where Reels and Explore are filtered on-device. Guided setup takes 3–5 minutes. The blog says: "No app on your iPhone can see what another app is doing, overlay content on top of it, or modify its behavior." — [ScrollGuard blog](https://scrollguard.app/blog/how-to-block-instagram-reels-iphone)
  - **Conflict:** The App Store listing describes a Safari extension instead. ScrollGuard may offer both, but I could not confirm this — [App Store](https://apps.apple.com/us/app/scrollguard-block-reels/id6754183872)
  - A GeekNews/HN item said the Android version blocks inside native apps, while the iOS version needed "a different approach" and had a waitlist — [GeekNews](https://news.hada.io/topic?id=22590)
- **ScrollJail:** A free iOS Shortcut that intercepts apps like Instagram and Reddit when they open and asks for a reason before allowing or denying access — [PeerPush](https://peerpush.com/p/scrolljail)

**(h) Screen broadcast plus on-device classifier: the "native app" claim**
- **WallHabit (v1.1.4, July 2026):** Claims Reels blocking "inside the real Instagram and YouTube apps." When you land on Reels, "WallHabit detects it and instantly backs you out." The blog, dated Aug 3, 2026, gives no mechanism and calls it "the hardest feature we've ever shipped." It says DMs and Stories still work, and that the same approach has existed on Android for a while — [WallHabit blog](https://wallhabit.com/blog/disable-instagram-reels-on-ios/)
- **WallHabit user reviews (App Store, Aug–Oct 2026) reveal the mechanism:**
  - "The app works by broadcasting (sharing) your screen 24/7 and then analyzing it to know when to block content" (Sep 9)
  - "this app records your phone screen at all times while you have it enabled" (Oct 13)
  - "App will stop broadcasting screen every time I block my cell phone" (Aug 13), so the user must reopen the app to restart it
  - Rating is 3.4/5 from 35 ratings
  - [App Store reviews](https://apps.apple.com/us/app/wallhabit-block-shorts-reels/id6751423279?see-all=reviews&platform=iphone)
- **WallHabit on Android:** Uses an Accessibility Service to block Shorts and Reels — [Google Play](https://play.google.com/store/apps/details?id=com.wallhabit.app); [WallHabit "Is it safe?"](https://wallhabit.com/blog/is-wallhabit-safe-lets-see-how-it-works/)
- **Slowth (open source, GPLv3) implements the same technique.** Its README describes "Family Controls and an on-device screen-recording classifier" for native YouTube/Instagram apps:
  - The classifier runs in a ReplayKit Broadcast extension `SampleHandler`, which "owns clocks, locking, routing, grants and Shield writes."
  - It "blocks after three positive votes in the latest five inference frames" and "fails closed if the model cannot load or run."
  - The model is described as "experimental."
  - [Slowth README](https://raw.githubusercontent.com/skar404/slowth/main/README.md); [GitHub repo](https://github.com/skar404/slowth)
  - **Conflict:** A search-engine summary claimed Slowth's native blocking is whole-app only. The README itself (a primary source) describes the ReplayKit classifier in a `RealtimeShield/` target, so I trust the README.

**(f) Modified / sideloaded builds**
- **SCInsta:** An open-source tweak for the native Instagram app. It can hide the Reels, Feed, Explore and Create tabs, and builds as sideload, rootless or rootful (jailbreak). For sideloading, you inject it into a *decrypted Instagram IPA* using Theos, Cyan and Xcode. Releases are pinned to specific Instagram versions; v1.1.1 was tested on Instagram 418.2.0 — [SCInsta (SoCuul) release notes](https://newreleases.io/project/github/SoCuul/SCInsta/release/v1.1.0); [fork mirror](https://github.com/Arnvvch/SCInsta)
- **YouTube tweaks (YTLite Plus, uYouEnhanced):** Modified builds of the official YouTube app that users install through AltStore or SideStore. A Reddit user (Nov 2024) recommended YTLite Plus over uYouEnhanced. I did not confirm a "hide Shorts" toggle from a primary source — [r/sideloaded thread](https://redlib.ssps.io/r/sideloaded/comments/1gmfv8f/switch_to_ytlite_plus/lwp80nc/?context=3)
- **Sideloading constraints:**
  - Free-account sideloaded apps expire after 7 days. AltStore refreshes them through AltServer on a computer on the same Wi-Fi; SideStore refreshes them over the internet without a computer — [SideStore README](https://github.com/Spidy123222/SideStore/blob/develop/README.md); [AltStore FAQ](https://faq.altstore.io/altstore-classic/your-altstore)
  - Apple limits a free account to 3 sideloaded apps at once — [AltStore FAQ](https://faq.altstore.io/altstore-classic/your-altstore)
- **EU alternative marketplaces (AltStore PAL etc.):** Apps still need Apple notarization. If Apple revokes it, "distribution and use is automatically blocked" even for installed apps. Apple pulled alternative distribution for iTorrent without warning. I found no case of a modified Instagram or YouTube IPA being distributed through an EU marketplace — [ITC.ua](https://itc.ua/en/news/apple-blocks-apps-in-european-alternatives-to-the-app-store-how-does-it-work)

**(e) Network / DNS blocking**
- DNS works on hostnames and cannot see URL paths. Reels load from the same Instagram/CDN hosts as the rest of the app, so DNS can block "all of Instagram or nothing." A Pi-hole user who blocked every Instagram domain in the logs still had a working Instagram app on Android. NextDNS users report Reels still loading after Instagram is blocked. A Control D feature request for a Reels/Shorts DNS filter suggests none exists — [Pi-hole forum](https://discourse.pi-hole.net/t/blocking-instagram-on-mobile/15354); [NextDNS help](https://help.nextdns.io/t/83haxqh/instagram-not-being-blocked); [Control D feature request](https://docs.controld.com/discuss/6a15c6561c9454db81bd18d3)

**(g) The platforms' own settings**
- **YouTube:** Added a "Shorts feed limit" in October 2025, with 15 minutes as the minimum. A 0-minute option came in January 2026 through parental controls and later rolled out to all accounts, including adults (path: Settings > General > Time management > Shorts feed limit, on iOS and Android). Reports disagree on how complete it is: some say Shorts disappear from the home feed, others say it is a soft limit and Shorts can still appear in subscriptions and search. There is no equivalent on the desktop web — [MediaNama, Apr 2026](https://www.medianama.com/2026/04/223-youtube-option-turn-off-shorts-expands-time-controls/); [Tom's Guide](https://tomsguide.com/phones/youtube-now-lets-you-hide-shorts-completely-heres-how-to-turn-them-off); [MediaPost](https://www.mediapost.com/publications/article/414369/youtube-lets-users-remove-shorts-from-its-home-fee.html); [Smartprix](https://smartprix.com/bytes/youtube-finally-lets-users-turn-off-shorts-with-new-feed-limit-setting/)
- **Instagram:** Still has no setting that removes the Reels tab or turns Reels off in 2026. Users can hide the "Suggested Reels" carousel, mark content "Not interested," or use the Following feed, which resets on reopen — [Lilach Bullock guide, 2026](https://www.lilachbullock.com/remove-hide-reels-instagram-feed/); [ScrollGuard blog](https://scrollguard.app/blog/how-to-block-instagram-reels-iphone)
- **Recent Instagram changes don't remove Reels:** An Oct 19, 2026 roundup lists a test moving "Your algorithm" into the "For you" dropdown and an option to hide activity bubbles — [SocialBee](https://socialbee.com/blog/instagram-updates-news-features)

### Inferences
- The products split cleanly by technique:
  - "Blocker" brands (one sec, Opal, ScreenZen, Jomo, Freedom, AppBlock, Brick) can only gate the whole app, through Screen Time shields, Shortcuts interventions or website blocklists.
  - Every iOS product that removes *just* Reels/Shorts does it either on the website (Safari extension or WKWebView wrapper), or by watching the screen and bouncing the user out (ReplayKit plus classifier plus shield).
- Ads that imply "remove Reels from Instagram" on iPhone usually mean one of two things. Either you use Instagram through *their* browser or Safari instead of the Instagram app, or you let them record your screen continuously.
- TikTok and Snapchat Spotlight are poorly served on iOS. Their web versions are too limited to filter (UNDOOMED's own statement), so the realistic options are whole-app blocking or the experimental screen-classifier approach.
- The combination many vendors converge on is: block or redirect the native app (Screen Time shield or a Shortcuts automation), then send the user to a filtered web view.

### Gaps
- **Clearspace and BlockSite:** I found no primary documentation of any Reels/Shorts-level feature on iOS. Their iOS mechanism (likely Screen Time) is unverified.
- **Opal's actual blocking mechanism** (Screen Time API vs. a VPN profile) is unverified. The only claim found comes from a competitor.
- **Unhook:** I could not confirm whether any Safari/iOS version exists. It appears to be desktop-browser only.
- **TikTok For You, Snapchat Spotlight, X For You:** I found no Snapchat Spotlight-specific blocker on iOS. I did not verify TikTok's or X's in-app settings (e.g. whether X lets you default to "Following").
- **"Minimal" Instagram clients on the App Store:** None found beyond the wrapper apps listed. I did not check an Apple Developer Forums thread titled "Why Is 'App for Instagram º' Still Approved?" ([link](https://developer.apple.com/forums/thread/843614)).
- **Jailbreak availability:** I did not research whether a jailbreak exists for current iOS versions, so the "rootful/rootless" tweak paths may be irrelevant to most users.

---

## Q2. Does any product truly modify the native Instagram app UI on a non-jailbroken iPhone? If an ad implies it, what is really going on?

### Takeaway
No. On a stock iPhone, App Store apps cannot change another app's UI. The only "native app" Reels blocking available in 2026 records the screen and reacts after the fact: WallHabit and Slowth use a ReplayKit broadcast plus an on-device classifier plus a Screen Time shield or bounce-out. Actually removing the Reels tab from the native app requires a re-signed, tweaked IPA (SCInsta), which means sideloading and breaking Instagram's terms.

### Cited Findings
- **Vendors agree on the sandbox limit:**
  - ScrollGuard: "No app on your iPhone can see what another app is doing, overlay content on top of it, or modify its behavior." In contrast, Android accessibility services can detect on-screen content — [ScrollGuard blog](https://scrollguard.app/blog/how-to-block-instagram-reels-iphone)
  - Fluid Friction: "Apple does not let one app change another." — [Fluid Friction](https://fluidfriction.app/blog/app-to-block-instagram-reels)
  - AppBlock: iOS doesn't give "that level of control." — [AppBlock](https://appblock.app/can-appblock-block-instagram-reels-youtube-shorts-or-snapchat-stories-on-iphone/)
  - one sec: "no way technically to build such a feature on iOS." — [one sec](https://tutorials.one-sec.app/en/articles/4071170)
- **Screen Time works only at the app level.** It cannot block Reels specifically and can only limit Instagram as a whole app — [Dull](https://getdull.app/block-reels-iphone/); [Fluid Friction](https://fluidfriction.app/blog/how-to-block-instagram-reels-iphone)
- **WallHabit's "native" blocking is screen broadcasting.**
  - Reviews: it is "broadcasting (sharing) your screen 24/7 and then analyzing it"
  - The broadcast stops when the phone locks
  - [WallHabit App Store reviews](https://apps.apple.com/us/app/wallhabit-block-shorts-reels/id6751423279?see-all=reviews&platform=iphone)
  - The vendor blog mentions only "detects it and instantly backs you out" — [WallHabit blog](https://wallhabit.com/blog/disable-instagram-reels-on-ios/)
- **Slowth's README describes the full pipeline:** ReplayKit `SampleHandler`, a Core ML "SurfaceDetector" model, a 3-of-5 frame vote, and a Family Controls Shield write. The app list is held "in a privacy-protected token that the app itself cannot read." — [Slowth README](https://raw.githubusercontent.com/skar404/slowth/main/README.md)
- **Wrappers are browsers, not the native app.** Dull says it is "a different browser, not a modification of the Instagram app." — [Dull](https://getdull.app/block-reels-iphone/)
- **Wrappers lose native features.** WallHabit says web versions lack features such as posting with music and need a separate login — [WallHabit blog](https://wallhabit.com/blog/disable-instagram-reels-on-ios/)
- **Only tweaked IPAs change the native UI.** SCInsta hides tabs inside the real Instagram binary, but it must be injected into a decrypted IPA and sideloaded, or installed on a jailbroken device — [SCInsta release notes](https://newreleases.io/project/github/SoCuul/SCInsta/release/v1.1.0)

### Inferences
- **Caveats of the screen-broadcast approach, partly inferred from how ReplayKit and Screen Time work:**
  - It is reactive: Reels must appear on screen before the classifier fires.
  - It needs a continuous broadcast that the OS ends when the phone locks (confirmed by a user review), so the user must restart it.
  - It shows the system screen-recording indicator. This is inferred and not confirmed by a source.
  - It has battery and privacy costs.
  - The "back out" is most likely a Screen Time shield over the whole app, not a removed tab. Slowth's README confirms that "Shield writes" are part of the pipeline.
- **How to read "remove Reels from Instagram" ads on iPhone.** Expect one of four things:
  1. a separate browser/wrapper app;
  2. a Safari extension (where "Instagram" means instagram.com);
  3. a Shortcuts redirect from the app icon to a web view;
  4. screen-recording detection.

### Gaps
- No independent technical teardown (press or security researcher) of WallHabit's iOS implementation was found.
- No source confirmed how Apple App Review treats always-on broadcast-extension blockers, or whether such apps risk rejection.
- I could not confirm whether the screen-recording status indicator appears during these broadcasts, or the battery impact.

---

## Q3. How well do these work in practice (reviews, breakages, App Store issues)?

### Takeaway
Safari extensions and wrappers do work, but the web experience is worse:
- typing and DMs are slower;
- uploads and pinch-zoom are flaky;
- there are no push notifications unless the native app is kept;
- filters break whenever Meta or YouTube change their DOM.

Whole-app blockers are reliable but blunt (DMs get blocked too). The screen-broadcast approach is new, has a mediocre 3.4/5 rating, and has privacy complaints. Even the platforms' own settings (YouTube's 0-minute Shorts limit) are only partial.

### Cited Findings
- **ScrollGuard reviews:**
  - Praise: Instagram time dropped to "30 minutes to 1 hour."
  - Complaints: Instagram web is slow for typing and replying to messages; uploading after picking from the camera roll errors; pinch-to-zoom doesn't work; it has "no effect on native apps."
  - Version notes include fixes for sign-in windows (v1.2.2) and a RevenueCat bug that turned filters off (v1.2.4).
  - [ScrollGuard App Store](https://apps.apple.com/us/app/scrollguard-block-reels/id6754183872)
- **UNDOOMED reviews:**
  - The app "can be slow."
  - On Instagram, turning off suggestions also turns off Stories, which the developer calls a known limitation.
  - Facebook Marketplace messaging bounces to the Facebook app.
  - Push notifications are requested but not yet implemented.
  - Past fixes include X login, staying signed in, and Facebook sign-in from the Instagram view.
  - [UNDOOMED App Store](https://apps.apple.com/app/id6751837079)
- **Dull** says Instagram's DOM "changes every few weeks" and that blocks can break until an update ships. Its fix is a remote "live filter loader" — [Dull](https://getdull.app/block-reels-iphone/)
- **Slowth handles site redesigns with remote selectors.** CSS selectors and redirects load from a remote config "fetched with an ETag and a throttle, and checked on a 6h alarm," so sites can be fixed without an App Store update — [Slowth README](https://raw.githubusercontent.com/skar404/slowth/main/README.md)
- **WallHabit:**
  - Rated 3.4/5 from 35 ratings.
  - Privacy complaints about always-on screen recording.
  - The broadcast stops when the phone locks.
  - One user says it "stays unblocked even after the time limit you set."
  - Another says once a shortcut is created "it's impossible to access the app settings anymore."
  - [WallHabit reviews](https://apps.apple.com/us/app/wallhabit-block-shorts-reels/id6751423279?see-all=reviews&platform=iphone)
- **Short Video Hider:** About 500 downloads and a 3.8/5 rating per an aggregator — [MWM Spark](https://spark.mwm.ai/en/apps/short-video-hider/6745738626)
- **Brick:**
  - Reviewers found it effective because it adds physical friction; it works by exploiting your unwillingness to go find the Brick.
  - The co-founder says software-only Screen Time is "easy to bypass."
  - It is criticized as pricey for what the hardware is.
  - [Tom's Guide](https://www.tomsguide.com/phones/brick-review); [WhistleOut AU](https://www.whistleout.com.au/MobilePhones/Reviews/brick-review); [Alex Reviews Tech](https://alexreviewstech.com/brick-review-get-your-life-back-from-your-smartphone-maybe/)
- **Apple Screen Time** is criticized as bypassable via "Ignore Limit" and as locking the whole app — [WallHabit blog](https://wallhabit.com/blog/disable-instagram-reels-on-ios/)
- **Whole-app limits block DMs too** — [Fluid Friction](https://fluidfriction.app/blog/app-to-block-instagram-reels)
- **one sec's Shortcuts triggers are fragile:** "ask before running," endless loops, and no triggers in the first ~2 minutes after unlock — [one sec troubleshooting](https://tutorials.one-sec.app/troubleshooting/iphone-or-ipad-app-does-not-work-as-expected)
- **one sec has a help article on stopping users from deleting or disabling the automation,** which shows that self-bypass is a known problem — [one sec help: Prevent Deleting or Disabling Automations](https://feedback.one-sec.app/help/articles/0762381)
- **YouTube's 0-minute Shorts limit** is described by some outlets as "a soft limit that they can easily bypass," with Shorts still visible in subscriptions and search — [Smartprix](https://smartprix.com/bytes/youtube-finally-lets-users-turn-off-shorts-with-new-feed-limit-setting/); [Tom's Guide](https://tomsguide.com/phones/youtube-now-lets-you-hide-shorts-completely-heres-how-to-turn-them-off)
- **Sideloaded tweaks are pinned to specific app versions** ("use the tested Instagram version") and expire every 7 days on free accounts — [SCInsta v1.1.0 notes](https://newreleases.io/project/github/SoCuul/SCInsta/release/v1.1.0); [SideStore README](https://github.com/Spidy123222/SideStore/blob/develop/README.md)

### Inferences
- **The core maintenance burden for any web-based approach is selector drift.** Serious products have converged on remotely updatable selector configs (Dull, Slowth), which is a pattern a student team should copy.
- **Wrapper apps degrade the experience in predictable ways:**
  - login sessions and cookie persistence;
  - media upload;
  - typing performance;
  - no native push notifications.
- **Some vendors keep the native app installed purely for notifications,** for example ScrollGuard's Shortcuts redirect.

### Gaps
- **Reddit (r/nosurf, r/digitalminimalism, r/iOSProgramming):** Searches returned no threads specifically reviewing these iOS tools, so independent community sentiment is thin. Most evidence is App Store reviews.
- **Press coverage:** I found no major tech-press review (Verge, TechCrunch, 9to5Mac, MacStories) of the 2025–2026 Reels-blocker apps.
- **Breakage history:** I found no documented, dated incident where a specific Instagram web change broke a named extension.

---

## Q4. Are there open-source examples a student team could learn from?

### Takeaway
Yes. The best iOS reference is **Slowth** (GPLv3). It is a complete Xcode project with:
- a Safari Web Extension that uses remote CSS selectors;
- Family Controls integration;
- a ReplayKit + Core ML native-app detector.

Smaller references are **Control Panel for Twitter** (MIT, a mature Safari extension), **No-YouTube-Shorts** (a minimal Safari extension) and the **No Shorts** userscript. For the "modify the native app" path, **SCInsta** is an open-source Instagram tweak. Android-only examples (HushGram, FeurStagram, FocusGram) show the contrast.

### Cited Findings
- **Slowth** (github.com/skar404/slowth, GPLv3; about 5 stars, 32 commits when checked in Oct 2026).
  - Repo layout:
    - `WebExt/`: manifest, popup, content scripts, rules
    - `ExtensionIOS/`: Safari Web Extension native handler
    - `iOS/`: host app plus Family Controls
    - `RealtimeShield/`: ReplayKit detector plus bundled Core ML model
    - `data-model/`: Python ML tooling and dataset
    - `project.yml`: XcodeGen spec
  - Settings are shared through App Group `UserDefaults`.
  - The popup sends RPC to the background script, which uses native messaging.
  - Remote selector rules are cached on-device.
  - GPLv3 means any distributed derivative must also be GPLv3 with source available.
  - [Slowth repo](https://github.com/skar404/slowth); [README](https://raw.githubusercontent.com/skar404/slowth/main/README.md)
- **No-YouTube-Shorts:** A simple Safari extension that hides Shorts on YouTube, with no settings and no published releases — [GitHub](https://github.com/Guillaume351/No-YouTube-Shorts)
- **No Shorts userscript:** Free and open source. It runs in iOS Safari through the Userscripts Safari extension and hides Shorts shelves and cards — [OpenUserJS](https://openuserjs.org/scripts/mithatakbulut/No_Shorts)
- **Control Panel for Twitter:** MIT-licensed by insin (Jonny Buchanan). It ships as a userscript plus Safari, Firefox, Edge and Chrome extensions, and hides "For you," keeping you on "Following" — [Greasy Fork](https://greasyfork.org/scripts/387773); [AlternativeTo](https://alternativeto.net/software/control-panel-for-twitter/about/)
- **SCInsta:** Open-source Theos tweak for native Instagram that hides the Reels, Explore, Feed and Create tabs. It builds as sideload, rootless or rootful — [SCInsta release notes](https://newreleases.io/project/github/SoCuul/SCInsta/release/v1.1.0); [fork](https://github.com/Arnvvch/SCInsta)
- **Android contrast:**
  - HushGram: GPL-3.0; patches the Instagram APK on-device with Morphe Manager; hides Reels, Explore, suggested posts, ads and Meta AI; about 200 stars and 1,417 commits; targets Instagram 452.x — [HushGram](https://github.com/SysAdminDoc/HushGram); [issue #217, Oct 2026](https://github.com/SysAdminDoc/HushGram/issues/217)
  - FeurStagram: free and open source; removes the Reels tab on Android — [FeurStagram](https://jean-voila.github.io/FeurStagram/instagram-without-reels/)
  - FocusGram: open source, Android only — [Fluid Friction comparison](https://fluidfriction.app/blog/app-to-block-instagram-reels)
- **AntiReels:** A Firefox/Chrome browser extension, so desktop only — [GitHub](https://github.com/mxmxmarexmxm/AntiReels)

### Inferences
- **The cleanest App-Store-safe architecture for a student team, inferred from Slowth, Dull and UNDOOMED:**
  - a Safari Web Extension and/or a WKWebView with injected user scripts (`WKUserScript` at document start) that hide Reels/Explore selectors;
  - selectors fetched from a remote JSON config so they can be fixed quickly;
  - optionally, a Screen Time (FamilyControls) shield on the native Instagram app to stop bypass.
- **Licensing matters.** Copying Slowth code would force the project to be GPLv3. Control Panel for Twitter (MIT) is more permissive.

### Gaps
- I did not find an open-source iOS **WKWebView wrapper** specifically for Instagram. The wrapper products found (Dull, UNDOOMED, SocialLite) are closed source.
- I did not verify the licenses or maintenance status of the Shorts-Blocker (atick-faisal) and Clear-Space GitHub repos (Clear-Space is a Chrome extension).

---

## Q5. Which wrapper or third-party client apps were removed from the App Store or got into legal/ToS trouble, and why?

### Takeaway
The platforms actively police unofficial clients:
- Meta got The OG App pulled within about a day (2022), banned its developers, and sent a cease-and-desist to the open-source Barinsta.
- YouTube got Juno pulled in Oct 2024. Juno was explicitly "just a web view" that restyled CSS, which is the closest precedent to a student wrapper app. YouTube also got ProTube pulled in 2017.
- Twitter/X banned all third-party clients in Jan 2023.

Apple's relevant App Review rules are 5.2.2 (third-party content must respect the service's terms) and 4.2 (minimum functionality for web wrappers).

### Cited Findings
- **The OG App (Sept 2022):**
  - An ad-free Instagram client pulled from the App Store about a day after launch.
  - Meta confirmed "enforcement actions," citing its policy against unauthorized access and clones, and permanently banned the developers' personal Facebook and Instagram accounts.
  - The app had reverse-engineered Instagram's private API.
  - [Engadget](https://www.engadget.com/meta-cracks-down-on-og-app-instagram-client-005949126.html)
- **Apple's stated reason for removing The OG App:** Guideline 5.2.2 and unauthorized access to Instagram's service — [9to5Mac](https://9to5mac.com/2022/09/29/instagram-og-app-removed-from-app-store/); [TechCrunch](https://techcrunch.com/2022/09/29/meta-says-ad-free-instagram-client-the-og-app-breaks-its-rules/embed/)
- **Google Play followed** by removing The OG App — [TechCrunch, Oct 10, 2022](https://techcrunch.com/2022/10/10/google-removes-the-og-app-from-the-play-store-as-founders-think-about-next-steps/)
- **Barinsta (open-source Android Instagram client):** The developer received a cease-and-desist, took the repo down, and contacted the EFF and the Software Freedom Law Center. F-Droid declined to remove the app. This is a first-person account — [Barinsta info page](https://austinhuang.codeberg.page/barinsta.html)
- **Juno for YouTube (visionOS, removed Oct 1, 2024):**
  - The developer, Christian Selig, said it was "just a web view, and acts as little more than a browser extension that modifies CSS." It placed no extra logos and didn't block ads.
  - YouTube complained that it "does not adhere to YouTube guidelines" (modifying the web interface) and alluded to trademarks and iconography.
  - Apple removed it after the two sides didn't agree. Selig did not appeal.
  - Installed copies keep working until YouTube's site changes break them.
  - [Christian Selig](https://christianselig.com/2024/10/juno-removed/); [9to5Mac](https://9to5mac.com/2024/10/01/youtube-app-juno-apple-vision-pro-app-store/)
- **ProTube (iOS YouTube client, removed Sept 1, 2017):** Removed after repeated requests from YouTube, which objected to paid features such as background playback and audio-only mode that overlapped YouTube Red — [PhoneArena](https://www.phonearena.com/news/YouTube-client-ProTube-feels-the-heat-from-Google-removes-itself-from-the-App-Store_id97716); [iPhone in Canada](https://www.iphoneincanada.ca/2017/09/04/protube/)
- **Twitter/X (Jan 2023):**
  - Cut off Tweetbot, Twitterrific and others around Jan 12, 2023.
  - Then added a developer-terms clause banning any "substitute or similar service or product to the Twitter Applications."
  - Twitterrific was removed from the iOS and macOS App Stores.
  - [MacRumors](https://www.macrumors.com/2023/01/19/twitter-bans-third-party-apps/); [TechCrunch](https://techcrunch.com/2023/01/19/twitterrific-tweetbot-app-store-removal-twitter-api)
- **App Review rules for wrappers:** WebView apps are often rejected under Guideline 4.2 (minimum functionality) when they just mirror a website, with feedback like "similar to the general experience of using Safari." Guideline 5.2.2 rejections have hit Instagram-related apps that use the service in ways its terms don't support — [MobiLoud](https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper); [Apple Developer Forums](https://developer.apple.com/forums/thread/657506)
- **EU alternative distribution is not a safe harbor.** Apple can revoke notarization and block even installed apps, as with iTorrent — [ITC.ua](https://itc.ua/en/news/apple-blocks-apps-in-european-alternatives-to-the-app-store-how-does-it-work)

### Inferences
- **Two lines that triggered enforcement:**
  - using private or reverse-engineered APIs and logging in with Instagram credentials (The OG App);
  - complaints from the platform owner about modifying its web UI or using its branding (Juno).
- **Today's Reels-blocker wrappers are taking the same Juno-style risk.** They load the official website in a WebView and hide elements, and they have survived on the App Store so far (Dull, UNDOOMED, SocialLite, ScrollGuard). Survival appears to depend on the platform not complaining rather than on a clear rule.
- **Practical precautions for a student team, inferred:**
  - avoid platform logos and trademark-like names;
  - never handle the user's password yourself; let the user log in on the real instagram.com page inside the WebView;
  - don't block ads;
  - add enough original functionality (limits, stats, interventions) to pass Guideline 4.2.

### Gaps
- I found no dated case of a 2025–2026 Reels-blocker wrapper being removed from the App Store, or of a Meta legal action against one.
- Meta's current platform terms on automated or unofficial clients, and on WebView embedding of instagram.com, were not retrieved directly.
- The legal status of browser extensions that hide UI (e.g. the "Unfollow Everything" litigation) was not researched in this pass.
