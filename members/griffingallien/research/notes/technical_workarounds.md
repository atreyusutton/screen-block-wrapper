# Non-Screen-Time technical mechanisms on iOS for blocking, filtering or observing other apps' content (as of October 2026)

Context for the report writer: iOS 27 shipped on September 14, 2026, for the same iPhones as iOS 26 (iPhone 11 and newer) — [MacRumors](https://macrumors.com/2026/09/09/apple-announces-ios-27-release-date/). The App Store Review Guidelines page fetched for these notes says "Last updated: October 16, 2026" — [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/). Version-specific changes are flagged inline as **[iOS 26]** or **[iOS 27]**.

## 1. WKWebView wrapper apps (load instagram.com / youtube.com / tiktok.com and inject CSS/JS)

### Takeaway
This is the most practical way for a student team to remove Reels or Shorts *inside* an experience it controls. It is technically simple, and paid App Store apps already ship it (Dull). The risks are policy and maintenance, not technology: guideline 5.2.2 requires you to be "specifically permitted" by the service's terms, all three platforms' terms forbid modifying their service, and Google blocks OAuth sign-in inside embedded web views.

### Cited Findings
- **Mechanism.** `WKUserScript` is the public WebKit API for "a script that the web view injects into a webpage." You add it to the `WKUserContentController` before creating the web view. It takes an injection time (document start or end), a main-frame-only flag, and optionally a `WKContentWorld`, which keeps your script isolated from the page's own scripts. Available since iOS 8 — [Apple WKUserScript docs](https://developer.apple.com/documentation/webkit/wkuserscript.md)
- **Apps doing this today.** Dull "loads Instagram in its own browser and removes Reels, Explore, and suggested posts before the page renders." It says iOS doesn't let third-party apps modify the official Instagram app, which is why it takes this approach. Feed, Stories, DMs, Search and notifications stay. It also covers YouTube, Facebook, X and Reddit; TikTok isn't mentioned. iOS 16+; 7-day trial, then $3.99/month, $14.99/year or $59.99 lifetime; distributed on the App Store; processing described as on-device — [Dull: Block Reels on iPhone](https://getdull.app/block-reels-iphone/)
- **Login.** Dull says users sign in to Instagram inside its browser with their normal credentials, the same way as in Safari (vendor claim) — [Dull](https://getdull.app/block-reels-iphone/); [Dull: Instagram without Reels](https://getdull.app/instagram-without-reels)
- **Maintenance burden.** Dull says blocks can break whenever Instagram changes its page structure, so it ships filter updates. It also offers a one-tap temporary bypass and a PIN lock with a 24-hour cooldown — [Dull](https://getdull.app/block-reels-iphone/)
- **Other App Store listings that may use a wrapper or similar approach:** "No Reel For Instagram" ($1.99, iOS 15+) hides Reels, Stories, Search/Discover, ads and suggested posts — [App Store](https://apps.apple.com/us/app/no-reel-for-instagram/id6752605548). "Block Reels - Less Is More" (free with IAP, iOS 17.6+) hides Reels and Explore, removes Stories, forces the Following view, hides like counts, and says it "fully runs locally." Its listing doesn't say how it works technically — [App Store](https://apps.apple.com/app/id6751927411)
- **Google sign-in in web views.** Google blocks OAuth requests from embedded web views. All embedded web views were blocked from September 30, 2021, and affected flows get a `disallowed_useragent` error. Google's stated reason is that the host app can "modify or intercept network requests" and potentially capture keystrokes or cookies. The recommended fix is the system browser, i.e. `ASWebAuthenticationSession` / `SFSafariViewController`, or AppAuth — [Google Developers Blog](https://developers.googleblog.com/en/upcoming-security-changes-to-googles-oauth-20-authorization-endpoint-in-embedded-webviews/); [Auth0](https://auth0.com/blog/google-blocks-oauth-requests-from-embedded-browsers); [Terra FAQ](https://docs.tryterra.co/faq/help-topics/data-api-sdk/mobile-sdk-setup-permissions-and-crashes/google-oauth-blocked-in-webview)
- **App Store Review Guidelines that apply** (quoted from the October 16, 2026 version) — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/):
  - **2.5.6:** "Apps that browse the web must use the appropriate WebKit framework and WebKit JavaScript."
  - **4.2:** an app must offer "features, content, and UI that elevate it beyond a repackaged website."
  - **4.2.2:** apps shouldn't primarily be "web clippings, content aggregators, or a collection of links."
  - **5.2.2:** "If your app uses, accesses, monetizes access to, or displays content from a third-party service, ensure that you are specifically permitted to do so under the service's terms of use. Authorization must be provided upon request."
  - **5.2.1:** don't use third-party trademarks without permission or ship "copycat representations, names, or metadata". This matters for app names like "...for Instagram".
  - **5.2.3:** no saving or downloading media from third-party sources such as YouTube without authorization. "Streaming of audio/video content may also violate Terms of Use."
  - **4.7:** covers HTML5/JS mini apps and makes the developer "responsible for all such software offered in your app." It is about mini apps, not wrappers.
  - **2.5.2:** apps may not download code that "introduces or changes features or functionality of the app." This is relevant if injected selectors or scripts are fetched remotely.
- **Instagram Terms of Use, section 4.2** — [Instagram Terms](https://www.facebook.com/help/instagram/581066165581870):
  - "You can't modify, translate, create derivative works of, or reverse engineer our products or their components"
  - no "accessing or collecting information in an automated way without our express permission"
  - "You can't do anything to interfere with or impair the intended operation of the Service"
- **YouTube Terms of Service** (effective December 15, 2023) — [YouTube ToS](https://www.youtube.com/static?template=terms). Users may not:
  - "alter, modify or otherwise use any part of the Service or any Content" except where expressly authorized
  - "circumvent, disable, fraudulently engage with, or otherwise interfere with any part of the Service"
  - "access the Service using any automated means (such as robots, botnets or scrapers)"
- **TikTok Terms of Service** (last updated July 15, 2026) — [TikTok ToS](https://www.tiktok.com/legal/page/us/terms-of-service/en):
  - bans scraping and "any automated system or software"
  - bans reverse engineering
  - bans actions that "interfere with, disable, or circumvent any restrictions, filters, controls or safety measures"
  - has no explicit clause on third-party clients

### Inferences
- **The technique is proven.** Dull, a paid App Store app, passing review suggests that a web wrapper with Reels or Shorts hidden by CSS/JS can get through review when it adds real features (lock, cooldown, multiple sites), which addresses 4.2. Approval isn't guaranteed, and 5.2.2 gives Apple grounds to reject or remove an app if Meta, Google or TikTok complain.
- **Hiding UI vs. modifying the service.** Hiding page elements client-side for one user arguably isn't "automated collection", but it plausibly falls under "modify" (Instagram, YouTube) and "interfere with intended operation." No platform grants the specific permission 5.2.2 asks for. Treat this as a ToS grey area with low enforcement risk for a personal or school project, not as cleared.
- **Login per platform:**
  - **Instagram:** username/password login on instagram.com should work in WKWebView (Dull's claim).
  - **YouTube:** sign-in goes through Google, so expect `disallowed_useragent` or a "browser not secure" block in a WKWebView. Logged-out viewing of m.youtube.com still works. A workaround is to sign in via `ASWebAuthenticationSession`, but cookies don't automatically transfer into a WKWebView's data store.
  - **TikTok:** the mobile web site heavily pushes the native app, so a TikTok wrapper is the weakest of the three.
- **The AI checkup fits this approach well.** The wrapper owns the DOM, so the app can observe exactly what is on screen (URL path, e.g. `/reels/`; element types; time per surface) without screen capture. That data is a rich, privacy-friendly signal for checking the user is doing what they said they would.
- **Use defensive selectors.** Bundle them in the binary. If they are fetched remotely, keep them as data (selector lists), not executable code, so the app stays within 2.5.2.

### Gaps
- Not verified: whether "Continue with Facebook" login on instagram.com works inside WKWebView in 2026. No source found on Meta's embedded-browser login policy for iOS.
- No source found on whether Apple has rejected or removed specific Instagram or YouTube wrapper apps under 5.2.2 in 2025–2026.
- Google's embedded web view policy sources date from 2021. No 2026 confirmation found, although nothing suggests it was relaxed.
- How "Less Is More" and "No Reel For Instagram" work technically isn't stated on their listings.

## 2. Safari Web Extensions on iOS (content scripts) and in-app browsers

### Takeaway
Safari Web Extensions can reliably hide Reels and Shorts on the *websites* in Safari, and several App Store apps do exactly this. They do nothing to the native Instagram, TikTok or YouTube apps, and they don't run in other apps' WKWebView-based in-app browsers. They are a good companion feature, not a wrapper.

### Cited Findings
- **Apps doing this today:**
  - **Short Video Hider** ($0.99): a Safari extension that hides Shorts and Reels UI and redirects Shorts to the normal video view. It covers YouTube, Instagram, Facebook and Reddit, and is enabled in Settings > Safari > Extensions. It warns that elements may "slip through until an update" — [App Store](https://apps.apple.com/app/id6745738626)
  - **Slowth:** free, open-source (GPL v3) for iOS and macOS. It hides or redirects short-video surfaces per site and has an optional strict mode that locks settings for 24 hours. Its selectors load from a remote config and are cached on-device, so site redesigns can be patched without an app update — [GitHub: skar404/slowth](https://github.com/skar404/slowth)
  - **SocialFocus: Hide Distractions:** hides components per site, such as Shorts on YouTube and Reels on Instagram — [App Store](https://apps.apple.com/app/id1661093205)
- **Guideline 4.4.2:** Safari extensions must "run on the current version of Safari" and "should not claim access to more websites than strictly necessary to function" — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Where blocking applies.** Content blockers apply in Safari and `SFSafariViewController` but not in `WKWebView`. A WebKit maintainer said in 2018 there were "no plans to expose system provided Content Blockers outside of Safari/SFSafariViewController" — [WebKit Bugzilla 190961](https://bugs.webkit.org/show_bug.cgi?id=190961); [Discourse thread](https://meta.discourse.org/t/ios-app-1-5-0-no-longer-allowing-content-blockers/117489?tl=zh)
- **Apple's direction.** Per a forum citation of WWDC23, "the future of browser customization lies in web extensions" — [Apple Developer Forums, Safari Services tag](https://developer.apple.com/forums/tags/safariservices?page=5)

### Inferences
- **Not in-app browsers.** Instagram and TikTok open links in their own in-app browsers. Those are typically WKWebView-based, so neither content blockers nor web extensions would apply there.
- **Shared code with a wrapper.** A Safari Web Extension can reuse the same CSS/JS selector logic as a WKWebView wrapper. A team could ship both from one codebase, and an individual (non-organization) developer account can ship it.
- **Little data for the AI layer.** An extension sees only Safari tabs on allowed sites, so it gives the checkup layer much less signal than a wrapper does.

### Gaps
- No primary Apple source found that confirms whether Safari *Web Extensions*, as opposed to content blockers, run inside `SFSafariViewController` on iOS 26 or 27. It is believed they don't, but this is unverified.
- Not verified which engine each social app's in-app browser uses in 2026.

## 3. Network Extension: content filters, packet tunnel/VPN, DNS, and the new URL filter

### Takeaway
On an unsupervised personal iPhone, the classic content filter (`NEFilterDataProvider`) and DNS proxy are unavailable outside Screen Time *child* devices or supervised/MDM devices. A packet-tunnel "local VPN" is available but needs an organization developer account under guideline 5.4.

Even when available, network-level tools can't selectively block Reels inside the native apps. Reels and feed media share the same CDN hostnames over TLS, and these tools see hostnames or SNI, not URL paths.

The new iOS 26 URL filter (`NEURLFilterManager`) works on consumer devices and matches full URLs. It needs a PIR server, applies only to WebKit and URLSession traffic, and doesn't support wildcards.

### Cited Findings
- **Deployment rules by provider type** (Apple TN3134, revised August 19, 2025) — [TN3134](https://developer.apple.com/documentation/technotes/tn3134-network-extension-provider-deployment.md):
  - **Content filter (iOS):**
    - iOS 9.0+: "supervised devices only"
    - iOS 15.0+: "apps using Screen Time APIs"
    - iOS 16.0+: "per-app on managed devices"
    - "In the Screen Time case, content filters are only supported on child devices." The user must be "signed in as an under 18 child member of an iCloud family," and the parent must authorize. Distribution requires the Family Controls entitlement.
  - **DNS proxy (iOS):** iOS 11.0+ "supervised devices only"; iOS 16.0+ "per-app on managed devices"
  - **Packet tunnel (iOS):** iOS 9.0+, app extension. Only "per-app mode requires managed device", so whole-device tunnels work on consumer devices.
  - **App proxy (iOS):** "managed devices only"
  - **URL filter [iOS 26]:** app extension, minimum iOS 26.0, no supervision restriction listed
- **What developers hit in practice.** On unsupervised, non-MDM iPhones, enabling `NEFilterDataProvider` fails with NEFilterErrorDomain code 1. Another developer got code 5 in production builds, with a message that filter configuration is only allowed via a profile, and installing that profile required MDM. Apple DTS said this is by design and pointed developers to URL filters (WWDC25 session 234) — [Apple Forums 827228](https://origin-devforums.apple.com/forums/thread/827228); [Apple Forums 775112](https://developer.apple.com/forums/thread/775112); [Apple Forums 815373](https://developer.apple.com/forums/thread/815373)
- **Guideline 5.4.** "Apps offering VPN services must utilize the NEVPNManager API and may only be offered by developers enrolled as an organization… Parental control, content blocking, and security apps, among others, from approved providers may also use the NEVPNManager API." Non-compliant apps "will be removed from the App Store and blocked from installing via alternative distribution" — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **URL filter [iOS 26]:**
  - "Network Extension URL Filter examines all URL requests sent via WebKit and the URLSession API… a performant yet privacy-preserving solution for both consumer and managed deployments."
  - It uses an on-device Bloom filter plus an off-device Private Information Retrieval (PIR) server that you host.
  - The configuration must be registered on the CloudKit Console "Identity & Trust" page.
  - Apps that don't use WebKit or URLSession must *voluntarily* call `NEURLFilter.verdict(for:)`.
  - Source: [Apple: URL filters](https://developer.apple.com/documentation/networkextension/url-filters.md)
- **Enabling the URL filter.** The user approves the filter, enters the device passcode and confirms in Settings. The prefilter refreshes every 45 minutes by default, and a "fail closed" option exists — [Apple: Filtering traffic by URL sample](https://developer.apple.com/documentation/networkextension/filtering-traffic-by-url.md)
- **No wildcards.** Neither the Bloom filter nor the PIR side supports wildcards or regular expressions. `urlParsingConfiguration` lets the app choose which URL components are parsed — [Apple NEURLFilterManager](https://developer.apple.com/documentation/networkextension/neurlfiltermanager.md); [WWDC25 session 234](https://developer.apple.com/videos/play/wwdc2025/234/)
- **Shared CDNs.** Instagram media (images, videos, stories) comes from shared CDN hosts (`*.cdninstagram.com`, `*.fbcdn.net`). DNS filters therefore block Instagram wholesale or break the feed, and DNS-level Reels-only blocking isn't offered (a Control D user had to request it as a feature) — [Netify: fbcdn.net](https://www.netify.ai/resources/domains/fbcdn.net); [NextDNS help](https://help.nextdns.io/t/35yyha3/facebook-not-blocked?r=p8y8acf); [Control D community](https://docs.controld.com/discuss/6a15c6561c9454db81bd18d3); [CleanBrowsing](https://cleanbrowsing.org/learn/how-to-block-instagram)
- **Apple's guidance on packet tunnels.** Apple publishes TN3120, "Expected use cases for Network Extension packet tunnel providers," and TN3134 tells developers to read it before building a packet tunnel — [TN3134](https://developer.apple.com/documentation/technotes/tn3134-network-extension-provider-deployment.md)

### Inferences
- **No selective Reels blocking in native apps.** A packet tunnel sees IP packets. For HTTPS it can read the TLS SNI hostname, and with plain DNS the queried names, but not URL paths or which video is a Reel. Feed videos and Reels come from the same CDN hosts, so selective blocking isn't feasible. Decrypting traffic (MITM) would need a user-installed root certificate. Meta and TikTok apps are widely believed to pin certificates, which would make them fail rather than be decrypted (this pinning claim isn't verified by a source here).
- **The URL filter probably doesn't reach the native apps.** Its full-URL matching could block `instagram.com/reels/...` in Safari or WebKit views, though the no-wildcard rule means you would block exact URLs or configure parsing to match a host+path form. Whether it sees in-app requests depends on those apps using URLSession. Large social apps commonly use custom networking stacks, so it probably doesn't (unverified). It also needs a hosted PIR server (Apple provides an open-source sample) and CloudKit registration — heavy for a student team, but possible.
- **Packet-tunnel blockers are all-or-nothing.** They can block or allow whole domains (e.g. during a "focus session") on consumer devices, but only from an organization-enrolled developer (D-U-N-S number), and Apple's TN3120 signals that non-VPN uses are disfavoured. Students on an individual account can't ship this to the App Store.
- **Usable as a timing signal.** The network layer could tell the AI checkup that Instagram's CDN was busy at 11pm, but not *what* was watched.

### Gaps
- TN3120's text wasn't fetched. Its exact wording on whether content filtering via a packet tunnel is "unsupported" is unverified.
- `NEDNSSettingsManager` (encrypted DNS settings, used by apps like NextDNS) isn't in the TN3134 tables, and its consumer-device availability wasn't re-verified this session.
- No source found confirming which networking stacks the Instagram, TikTok or YouTube iOS apps use, or their certificate-pinning status in 2026.
- No real App Store example found of an app that selectively blocks Reels at the network layer. The evidence points to none existing.
- A 2022 DTS suggestion to combine `NEFilterDataProvider` with Screen Time reportedly stopped receiving flows on iOS 16.1, with no confirmed fix — [Apple Forums 687333](https://developer.apple.com/forums/thread/687333)

## 4. ReplayKit Broadcast Upload Extension, and ScreenCaptureKit on iOS 27

### Takeaway
A broadcast extension is the only public iOS API that lets an app see pixels from *other* apps. It only runs while the user has manually started a broadcast through a system prompt, it has a roughly 50 MB memory ceiling, protected video records as black, and guideline 2.5.14 requires consent and a visible indicator.

Big players already ship it for AI screen understanding (Google's Gemini Live), so an "AI checkup" via short, user-started screen-sharing sessions is feasible and App Store-compatible. Continuous background surveillance isn't.

**[iOS 27]** ReplayKit's `RPBroadcastSampleHandler` is marked as ending at iOS 27, and Apple says ScreenCaptureKit (`SCContentSharingPicker`) replaces the broadcast extension starting in iOS 27.

### Cited Findings
- **Mechanism.** You subclass `RPBroadcastSampleHandler`, set `RPBroadcastProcessMode` to sample-buffer mode, and receive video and audio `CMSampleBuffer`s in `processSampleBuffer(_:with:)`. There are lifecycle callbacks (started, paused, resumed, finished), and `broadcastAnnotated(withApplicationInfo:)` with `RPApplicationInfoBundleIdentifierKey` exposes an app's bundle identifier. The doc metadata lists availability as **"iOS: 10.0.0 - 27.0.0"**, which suggests deprecation in iOS 27 — [Apple RPBroadcastSampleHandler](https://developer.apple.com/documentation/replaykit/rpbroadcastsamplehandler.md)
- **[iOS 27] Replacement.** An Apple engineer, in an accepted forum answer from June 2026: "ScreenCaptureKit will be used for screen sharing starting in iOS 27. You can use SCContentSharingPicker in place of the broadcast extension. Frames will flow through SCStreamOutput to your host app and will be written to SCRecordingOutput directly." The thread's title says "iOS 28", which is unreconciled — [Apple Forums 831465](https://developer.apple.com/forums/thread/831465)
- **[iOS 27] Availability.** `SCContentSharingPicker` lists availability iOS 27.0+, and Apple's docs say to always use the system-provided shared picker — [Apple SCContentSharingPicker](https://developer.apple.com/documentation/screencapturekit/sccontentsharingpicker.md). The Zoom Video SDK emits ReplayKit deprecation warnings in Xcode 27 betas — [Zoom dev forum](https://devforum.zoom.us/t/zoomvideosdk-emits-deprecation-warnings-around-replaykit-in-xcode-27/146197)
- **Memory limit.** About 50 MB, widely reported but not in official docs. "The memory usage limit for Broadcast Upload Extension is 50 MB" — [ZEGOCLOUD FAQ](https://www.zegocloud.com/docs/faq/ios-screen-sharing-crash). Larger iPad screens push extensions past 50 MB — [Apple Forums 651367](https://developer.apple.com/forums/thread/651367). Mitigations include downscaling to 720p or lower, hardware H.264 and 15–30 fps — [Fora Soft](https://www.forasoft.com/blog/article/how-to-implement-screen-sharing-in-ios-1193); [Twilio](https://github.com/twilio/twilio-video-ios/issues/16)
- **Protected content.** ReplayKit doesn't capture AVPlayer output. Recording a movie, for example in Netflix, "results in a black screen with just audio" — [Apple Forums 86521](https://developer.apple.com/forums/thread/86521)
- **Guideline 2.5.14.** "Apps must request explicit user consent and provide a clear visual and/or audible indication when recording, logging, or otherwise making a record of user activity. This includes any use of the device camera, microphone, screen recordings…" — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Real example: Gemini Live on iPhone.** It shares the screen with Google's cloud AI. The user taps a button, iOS asks them to confirm "Start Broadcast" with privacy warnings, and they stop "Screen Broadcasting" from the top-left status indicator. It has been available to free users since 2025 — [Tom's Guide](https://tomsguide.com/ai/google-gemini/gemini-live-is-free-for-iphone-users-heres-how-to-share-your-screen-and-camera); [9to5Mac](https://9to5mac.com/guides/gemini-live/); [Android Authority](https://www.androidauthority.com/gemini-live-screen-sharing-ios-3559523)
- **In-app vs. broadcast capture.** In-app capture shares only the current app, while broadcast capture keeps sharing when users switch to other apps — [LiveKit docs](https://docs.livekit.io/transport/media/screenshare/)
- **Academic precedent.** A 2026 Politecnico di Torino thesis on detecting TikTok doomscrolling did it on Android via Accessibility Services and proposed LLMs as a next step. It wasn't done on iOS — [PoliTo thesis](https://webthesis.biblio.polito.it/39948/)

### Inferences
- **Feasible design for the AI checkup.** The user starts a screen-share "check-in" session; the extension samples about one frame every few seconds, downscaled, and either:
  - runs a small Core ML/Vision classifier ("is this a full-screen vertical-video UI?") within the 50 MB budget, or
  - uploads occasional JPEGs to a cloud vision model, like Gemini Live does.

  On-device inference in 50 MB is tight. A tiny image classifier or Vision text recognition (OCR for "Reels" labels) is more realistic than a large model.
- **Limits:**
  - The user can stop the broadcast at any time from the status indicator.
  - The session doesn't auto-start (Shortcuts can't start a broadcast silently).
  - Black frames hide DRM video, though Reels and TikTok videos are generally not FairPlay-protected (unverified).
  - A cloud pipeline needs 5.1.1 consent, a privacy policy and per-frame API costs.
- **Plan for iOS 27.** Shipping on iOS 26 with ReplayKit is fine, but a team starting now should prototype with ScreenCaptureKit on iOS 27 and keep ReplayKit as a fallback for iOS 26 devices.
- **Background capture is unknown.** Whether ScreenCaptureKit on iOS captures other apps while the host app is in the background (which broadcast extensions allowed) is unconfirmed. This is critical to verify on device.

### Gaps
- No official Apple figure for the broadcast extension memory limit; the 50 MB figure comes from vendor and forum reports.
- Not verified: ScreenCaptureKit-on-iOS memory limits, background behaviour, whether system-wide capture persists across app switches, and the exact consent UI.
- No existing App Store app found that uses ReplayKit specifically to detect Reels or doomscrolling. App Review's stance on such an app is therefore untested; Gemini Live is the nearest precedent.
- Not verified whether Instagram, TikTok or YouTube mark any content as capture-protected (black in recordings).

## 5. Shortcuts personal automations, App Intents, Focus modes and Focus Filters

### Takeaway
The "App is opened" personal automation is the main non-Screen-Time hook blocker apps use. one sec uses it to run its own App Intent, which shows an intervention screen whenever Instagram or TikTok opens. It works, but the user must set it up manually per app, it intercepts app *launches* only (not Reels inside the app), and it is fragile across iOS updates.

Focus Filters only change your own app's behaviour.

**[iOS 27]** Shortcuts adds notification-based automation triggers.

### Cited Findings
- **How one sec does it.** The user goes to Shortcuts > Automation > new personal automation > App trigger, picks the target app and "Run Immediately", then creates a new shortcut with one sec's "Activate one sec (when app opens)" action and reselects the app ("The Automation won't run without this").
  - **[iOS 26]** The "Create New Shortcut" option only appears on the latest iOS 26 update.
  - Source: [one sec tutorial](https://tutorials.one-sec.app/en/articles/3034626); [one sec Intentional App Switching](https://feedback.one-sec.app/help/articles/1259797)
- **Notifications and prompts.** Turning off "Ask Before Running" removes the confirmation prompt. A separate "Notify When Run" toggle (iOS 15.4+) suppresses the banner — [Nerdschalk](https://nerdschalk.com/what-does-notify-when-run-mean-in-shortcuts-app-on-iphone/); [iGeeksBlog](https://www.igeeksblog.com/how-to-use-shortcuts-app-on-iphone-ipad/)
- **[iOS 26.6] Regression.** "When App Is Closed" automations reportedly fire when Control Center or Notification Center opens while the app stays in the foreground — [Apple Forums 841128](https://developer.apple.com/forums/thread/841128)
- **[iOS 27] New triggers.** Automations can run when a notification arrives, filtered by app and title/body text. Automations can also be shared, and the user must enable a shared automation — [MacStories: Deflector](https://www.macstories.net/ios/deflector-turns-ios-27-notification-triggers-into-a-shortcut-launcher/)
- **Vendor criticism.** Dull says Shortcuts automations "break on updates" — [Dull](https://getdull.app/block-reels-iphone/)
- **Focus Filters.** `SetFocusFilterIntent` (iOS 16+) is "an app intent that you use to adapt your app's behavior when Focus changes." It provides an `appContext` the system uses to adapt behaviour (e.g. notification filtering) for *that* app — [Apple SetFocusFilterIntent](https://developer.apple.com/documentation/appintents/setfocusfilterintent.md)
- **[iOS 27] Screen Time framework unchanged.** A third-party blocker developer reports that the iOS 27 developer framework used by Opal and one sec was "left essentially as it was," with DeviceActivity throttling unchanged. The new PermissionKit targets parent-approval flows — [Habit Doom blog](https://habitdoom.com/blog/ios-27-screen-time-changes) (third-party, weigh accordingly)

### Inferences
- **Fits the wrapper design.** An "App is opened (Instagram)" automation can immediately open the wrapper app via an App Intent or URL scheme, sending users to the filtered experience instead of the real app. This is the most practical bridge for a student team and needs no special entitlements.
- **Easy to bypass.** The user can delete the automation or toggle "Run Immediately" off. The app can't verify that the automation exists. There is no inside-app granularity: once Instagram is open, the automation can't see whether the user tapped Reels.
- **Notification triggers [iOS 27] are a minor extra.** They could act on Instagram or TikTok notification text, e.g. counting "new reel" notifications, but they don't reveal on-screen content.
- **Focus Filters can't hide content in other apps.** At most, the wrapper can change its own strictness when "Work" or "Study" Focus is on.

### Gaps
- No source quantifying how often "App is opened" automations break across iOS point releases.
- Not verified whether iOS 27 changed the "App is opened" trigger's behaviour or prompts.

## 6. MDM, supervised devices, Apple Configurator, Guided Access, Assistive Access

### Takeaway
Supervision unlocks the powerful tools: the system-wide content filter, DNS proxy, app restrictions and Single App Mode. But supervising requires erasing the iPhone and enrolling it with Apple Configurator from a Mac, and selling MDM-based apps on the App Store is restricted to enterprises, schools and government, with limited parental-control exceptions. It is a viable lab and demo setup for a student team, not a consumer product.

Guided Access and Assistive Access are lock-down accessibility modes and can't remove Reels inside an app.

### Cited Findings
- **Supervision setup.** Devices can be supervised only "before activation, before Setup Assistant first appears on a new or fully erased device." Unsupervising erases all content and settings. Supervision enables restrictions and Single App Mode — [Apple Configurator 2 User Guide: Supervise devices](https://support.apple.com/ar-ae/guide/apple-configurator-2/apd9e4f64088/mac); [Apple: Unsupervise](https://support.apple.com/ar-ae/guide/apple-configurator-2/cadbf9b585/mac); [iMazing guide](https://imazing.com/guides/how-to-supervise-iphone-ipad)
- **What supervision unlocks.** Content filter providers and DNS proxy providers work on supervised devices, and per-app variants on managed devices (iOS 16+) — [TN3134](https://developer.apple.com/documentation/technotes/tn3134-network-extension-provider-deployment.md)
- **[iOS 26] URL filter via MDM.** URL filters can also be configured through MDM with the `WebContentFilter` payload (`FilterURLs`, `URLFilterParameters`) — [Apple: Filtering traffic by URL](https://developer.apple.com/documentation/networkextension/filtering-traffic-by-url.md)
- **Guideline 5.5.** MDM apps "must request this capability from Apple" and "may only be offered by commercial enterprises, educational institutions, or government agencies, and in limited cases, companies using MDM for parental control services or device security" — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Single App Mode.** It is described as similar to Guided Access, but without the passcode prompt to exit (secondary source) — [Kiosk Group support](https://support.kioskgroup.com/article/608-using-apple-configurator-for-deployment-management)

### Inferences
- **Feasible only as a self-managed demo.** A student could supervise their *own test iPhone* with Apple Configurator (free on Mac) and run a supervised-only `NEFilterDataProvider` to show deeper network filtering in a demo. It still can't see URL paths inside TLS, so it doesn't solve Reels.
- **Guided Access** (a standard iOS accessibility feature) locks the phone to one app until a passcode is entered. It could lock the user *into* the wrapper app for a study session, but it is manual and per-session. *General knowledge, not verified by a fetched source this session.*
- **Assistive Access** (iOS 17+) replaces the home screen with a simplified set of chosen apps behind a passcode-protected exit. Including only the wrapper app, and not Instagram, is a crude "Instagram-without-Reels" setup for highly motivated users. *General knowledge, not verified this session.*

### Gaps
- The Apple support page fetched for Assistive Access didn't include the article body, so details (third-party app support, exit method) are unverified.
- No source on whether self-supervising a personal device affects warranty or iCloud features. It doesn't, as far as is generally known, but this is unverified.

## 7. Sideloading, EU alternative marketplaces (DMA), and jailbreak tweaks

### Takeaway
Modified Instagram clients with Reels removed exist and work: SCInsta has "hide reels", "disable scrolling reels" and a reel-count limit. They require a jailbreak or TrollStore, or sideloading a *decrypted* Instagram IPA re-signed with your own certificate.

That route breaches Instagram's terms ("modify… reverse engineer"), redistributing the IPA is copyright infringement, it risks account action, and it hands your Instagram login to a third-party build. EU alternative marketplaces still require Apple notarization, which Apple can revoke. This isn't a defensible path for a school product.

### Cited Findings
- **What SCInsta does.** SCInsta (GPL-3.0, fork of SoCuul/SCInsta, based on BHInstagram) features include:
  - hiding the explore posts grid, suggested posts and reels in the feed
  - hiding the Reels or Explore tabs
  - "disable scrolling reels" and limiting how many reels you can view ("anti-doomscrolling")
  - disabling video autoplay and confirming likes/follows

  It was tested on Instagram 418.2.0. Installation is a prebuilt tweak for jailbroken or TrollStore devices, or, on standard devices, building an IPA from a decrypted Instagram IPA with the cyan/ipapatch tools. The README contains no ban warnings — [GitHub: Arnvvch/SCInsta](https://github.com/Arnvvch/SCInsta)
- **Instagram Terms 4.2:** "You can't modify, translate, create derivative works of, or reverse engineer our products or their components" — [Instagram Terms](https://www.facebook.com/help/instagram/581066165581870)
- **Account risk.** Secondary sources say Instagram acts against users of third-party apps, with penalties from temporary limits to permanent suspension. These are low-quality SEO sources with no tweak-specific evidence — [Grand Ave Housing (AeroInsta)](https://grandavehousing.calpoly.edu/news/aeroinsta-is-it-safe-to)
- **EU notarization.** Apps distributed through EU alternative marketplaces still need Apple notarization (baseline malware and "function as promised" checks), and revoking it blocks installation and use. Example: Apple revoked iTorrent's notarization on AltStore PAL in 2025, later citing sanctions-related rules — [iGeeksBlog](https://www.igeeksblog.com/apple-pulls-itorrent-altstore-pal-eu/); [9to5Mac](https://9to5mac.com/?p=1016010); [ITC.ua](https://itc.ua/en/news/apple-blocks-apps-in-european-alternatives-to-the-app-store-how-does-it-work)
- **Guidelines also bind alternative distribution.** 5.4 and 5.5 violations lead to apps being "blocked from installing via alternative distribution" — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Inferences
- **Technically the best result.** Hooking the real app's Objective-C/Swift classes removes Reels perfectly, but it relies on an unsigned/re-signed decrypted Meta binary. That rules it out for App Store or notarized EU distribution, since a modified Instagram couldn't pass notarization's IP and "function as promised" expectations without Meta's permission.
- **Security and ethics.** A sideloaded client sees the user's Instagram credentials and session, and a jailbreak weakens the device's security model. For a school project this is worth discussing as a contrast, not as something to build.
- **Free sideloading is impractical.** Without a paid developer account, free provisioning profiles expire after 7 days (a well-known limit, not re-verified this session).

### Gaps
- No reliable 2026 evidence on whether Meta detects SCInsta-style tweaks or bans accounts for them. Only low-quality sources were found.
- No source found on a modified Instagram, YouTube or TikTok client being submitted to or rejected from an EU alternative marketplace.
- Equivalent tweaks for YouTube (e.g. uYouEnhanced, which can hide Shorts) and TikTok weren't researched in detail this session.

## 8. Contrast: Android Accessibility Service apps

### Takeaway
On Android, a Shorts or Reels blocker can use the AccessibilityService API to read other apps' on-screen UI trees in real time and press "back" when a Reels or Shorts view appears. Google Play allows this for non-accessibility apps with an in-app disclosure, affirmative consent and a Play Console declaration. iOS has no equivalent API for third-party apps, which is why iOS solutions must wrap, redirect or capture pixels instead.

### Cited Findings
- **Google Play policy:**
  - "permits the use of the AccessibilityService API for a wide range of applications"
  - only true accessibility tools may set `isAccessibilityTool`
  - non-tools need an in-app prominent disclosure that "must require affirmative user action for consent", a Play Console declaration (API level 31+) and a demo video
  - "Any use of the Accessibility API that enables an app to autonomously initiate, plan, and execute actions or decisions is strictly prohibited"; deterministic, rule-based automation is allowed
  - "Deceptive and non-declared uses… may result in a suspension"
  - Source: [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/10964491)
- **Policy history.** In 2017 Google threatened to remove non-accessibility uses, then paused enforcement to evaluate "responsible and innovative" uses — [Engadget](https://www.engadget.com/2017/11/13/google-cracks-down-accessibility-features/); [Android Authority](https://androidauthority.com/accessibility-services-policy-pause-821357)
- **Example apps:**
  - The open-source Shorts-Blocker detects YouTube Shorts and Instagram Reels screens via accessibility and navigates back. It requests no internet permission — [GitHub: atick-faisal/Shorts-Blocker](https://github.com/atick-faisal/Shorts-Blocker)
  - BlockShorts describes accessibility as "the only way Android allows an app to detect what's on screen in another app and dismiss it" — [BlockShorts privacy policy](https://jet-turner-79b.notion.site/BlockShorts-Privacy-Policy-35603bd185b2808cb5efec80c87b6638)
- **Academic example.** A 2026 thesis used Android Accessibility Services to detect TikTok doomscrolling and proposed LLM analysis as future work — [PoliTo thesis](https://webthesis.biblio.polito.it/39948/)

### Inferences
- **Why iOS differs.** iOS sandboxing gives third-party apps no API to inspect another app's view hierarchy. Guideline 2.5.1 requires public APIs used "for their intended purposes" ([Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)), so private-API introspection would be rejected. iOS's accessibility features (VoiceOver etc.) are system-only.
- **Hybrid option.** If the student project has an Android companion, the "AI checkup" can be far richer there: accessibility events give text and UI structure, with no screen capture needed.
- **Possible Play policy risk.** An LLM-driven checkup that *autonomously decides* to act inside other apps could fall under Play's "autonomously initiate, plan, and execute actions" prohibition. Rule-based "if Reels then back" is explicitly fine.

### Gaps
- Current enforcement stats for Play accessibility declarations from digital-wellbeing apps weren't found.

## 9. Overall feasibility map for a student "wrapper + AI checkup" app

### Takeaway
The realistic stack for a student team with a standard $99/year individual Apple developer account:
1. **(a)** a WKWebView wrapper with injected CSS/JS hiding Reels, Explore and Shorts (core feature)
2. **(b)** an optional Safari Web Extension sharing the same selectors
3. **(c)** a Shortcuts "App is opened" automation that redirects the native Instagram or TikTok app to the wrapper
4. **(d)** an opt-in, user-started screen-share session (ReplayKit on iOS 26; ScreenCaptureKit on iOS 27) for the AI checkup, plus in-wrapper telemetry as the main checkup signal

Network-level filtering, MDM and sideloading are either unavailable on consumer devices, unable to target Reels, or ToS-violating.

### Cited Findings
- Wrapper precedent on the App Store — [Dull](https://getdull.app/block-reels-iphone/)
- Safari extension precedent — [Short Video Hider](https://apps.apple.com/app/id6745738626); [Slowth](https://github.com/skar404/slowth)
- Shortcuts-redirect precedent — [one sec tutorial](https://tutorials.one-sec.app/en/articles/3034626)
- Screen-share-to-cloud-AI precedent — [Tom's Guide on Gemini Live](https://tomsguide.com/ai/google-gemini/gemini-live-is-free-for-iphone-users-heres-how-to-share-your-screen-and-camera)
- Content filter / DNS proxy restricted to supervised, managed or child devices — [TN3134](https://developer.apple.com/documentation/technotes/tn3134-network-extension-provider-deployment.md)
- VPN-style blockers require organization enrollment — [Guideline 5.4](https://developer.apple.com/app-store/review/guidelines/)
- MDM apps restricted to enterprises, schools and government — [Guideline 5.5](https://developer.apple.com/app-store/review/guidelines/)
- [iOS 27] ReplayKit broadcast giving way to ScreenCaptureKit — [Apple Forums 831465](https://developer.apple.com/forums/thread/831465)

### Inferences
Summary table (assessments by the researcher, based on the findings above):

| Mechanism | Sees/blocks inside Instagram, TikTok, YouTube native apps? | Works on unsupervised iPhone? | App Store OK? | Special requirements | Student feasibility |
|---|---|---|---|---|---|
| WKWebView wrapper + WKUserScript | Only on the *web* versions it hosts; full DOM visibility | Yes | Yes with real added value (4.2), but 5.2.2/ToS grey area | None beyond standard account | **High** (main risks: selector breakage, Google login block, ToS) |
| Safari Web Extension | Web versions in Safari only; not native apps or in-app browsers | Yes | Yes (4.4.2) | None | **High** (companion feature) |
| NEFilterDataProvider | Hostnames/flows only, no URL paths in TLS | No (supervised, MDM, or Screen Time child device only) | Yes for eligible cases | Family Controls entitlement or supervision | **Low** |
| Packet tunnel (local VPN) | Hostnames/SNI only; Reels share CDN hosts with feed | Yes | Only from organization-enrolled devs (5.4) | Organization account (D-U-N-S) | **Low–Medium** (whole-app blocking only) |
| DNS proxy | Domain names only | No (supervised) | Yes for eligible cases | Supervision | **Low** |
| URL filter [iOS 26] | Full URLs for WebKit/URLSession traffic; probably not native social apps | Yes | Yes | PIR server + CloudKit registration; no wildcards | **Medium** for Safari/web; **Low** for native apps |
| ReplayKit broadcast / ScreenCaptureKit [iOS 27] | Pixels of whatever is on screen while the session runs | Yes, but user must start it each time | Yes, with 2.5.14 consent and indicator | ~50 MB extension memory (ReplayKit); API transition in iOS 27 | **Medium** (good for opt-in AI check-ins, not continuous) |
| Shortcuts "App is opened" automation | Detects launch only; can redirect to the wrapper | Yes | Yes (App Intents) | User sets it up manually | **High** (fragile, bypassable) |
| Focus Filters | Own app only | Yes | Yes | None | Low relevance |
| Supervision/MDM/Configurator | Enables filters/restrictions; still no in-app Reels visibility | Requires erase + supervision | MDM apps restricted (5.5) | Mac + Apple Configurator; device wipe | **Demo only** |
| Guided/Assistive Access | Locks to chosen apps; no in-app filtering | Yes | N/A (system features) | User configures | Low (manual) |
| Jailbreak/sideloaded tweaks (SCInsta) | Yes, removes Reels in the real app | Needs jailbreak/TrollStore or re-signed decrypted IPA | No | Decrypted IPA, signing certificate | **Not recommended** (ToS, copyright, security) |
| Android AccessibilityService (contrast) | Yes, reads UI tree of other apps | N/A | Allowed on Play with disclosure + declaration | Play declaration | High on Android; no iOS equivalent |

- **Core design implication.** The AI checkup on iOS works best when the *wrapper itself* is the instrument (it knows URLs, surfaces and dwell time). Occasional user-initiated screen-share check-ins can verify behaviour outside the wrapper. Fully passive, continuous verification of native-app use isn't possible on iOS without Screen Time APIs (out of scope here, covered by other researchers).

### Gaps
- None of the conclusions in the table were tested on a device in this session. In particular, the URL filter's reach into native apps and ScreenCaptureKit's background behaviour on iOS 27 need hands-on verification.
