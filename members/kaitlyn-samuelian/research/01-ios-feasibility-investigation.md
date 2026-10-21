# iOS Short-Form Intervention: Technical Feasibility Investigation

Oct 21, 2026 · @KAITLYN

## Bottom line

We can get closer than the ideation doc assumed, but not all the way. No public API lets us block only the Reels view inside the real Instagram app. What iOS now allows is: watch the whole screen with the user's permission, recognize short-form locally, then interrupt by shielding the entire app for a while.

The biggest change since the doc was written is that **iOS 27 brought ScreenCaptureKit to iPhone**. The main app can now capture the full display and keep capturing while backgrounded (the `screen-capture` background mode). ReplayKit's broadcast extension classes are deprecated in iOS 27. If this behaves as documented, the hardest E1 question goes away: the process that sees the screen is our own app, and that same app can apply Screen Time shields itself. No extension handoff is needed.

What is still out of reach through public APIs:

- Reading another app's view hierarchy, or knowing which screen or tab is open in it.
- Drawing an overlay on top of another app, or pressing back or navigating inside it.
- Shielding a single tab, view, or URL path inside a native app. Shields are whole-app, whole-category, or whole-web-domain.

So the closest native experience is **"detect Reels, then a timed whole-app shield with a custom message"**. The user can still reach DMs after the cooldown, or instantly through a carve-out we design, such as a DM-only web view. View-level removal of Reels, with DMs untouched, is only possible where we control the renderer: Safari (Web Extension) or our own WKWebView.

**Evidence labels used below.** Documented: stated in Apple docs (linked). Dev-reported: Apple Developer Forums, vendor blogs or prior-art apps. Inference: our reasoning from documented behavior. Unverified: needs a device test. Every claim about iOS 27 ScreenCaptureKit on iPhone is new as of this autumn and should be treated as Documented but untested by us.

## What each framework actually does

Each framework does one narrow job. None of them sees inside another app, except screen capture, and screen capture only gives us pixels.

| Framework | iOS | What it gives us | Hard limit that matters here |
| --- | --- | --- | --- |
| [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit) | 27.0+ on iPhone | Full-display or in-app capture as `CMSampleBuffer` frames, chosen through the system [SCContentSharingPicker](https://developer.apple.com/documentation/screencapturekit/sccontentsharingpicker). Keeps running in the background with the [`screen-capture` background mode](https://developer.apple.com/documentation/bundleresources/information-property-list/uibackgroundmodes) (Documented). | The user starts it from the system picker. No app name or window list on iOS: `SCRunningApplication`, `SCShareableContent` and `minimumFrameInterval` are macOS-only per their docs pages. Pixels only. |
| [ReplayKit](https://developer.apple.com/documentation/replaykit) broadcast extension | 10–26 (deprecated 27) | Whole-screen frames in a separate extension process. [RPSystemBroadcastPickerView](https://developer.apple.com/documentation/replaykit/rpsystembroadcastpickerview) is deprecated in 27 ("Use ScreenCaptureKit SCContentSharingPicker instead"). [RPBroadcastSampleHandler](https://developer.apple.com/documentation/replaykit/rpbroadcastsamplehandler) is deprecated ("No longer supported"). | About 50 MB extension memory cap (Dev-reported, [Fora Soft](https://www.forasoft.com/blog/article/how-to-implement-screen-sharing-in-ios-1193)). The host app gets no access to the frames ([Apple Platform Security](https://support.apple.com/guide/security/replaykit-security-seca5fc039dd/web)). Only needed as a fallback for iOS 26 and earlier. |
| [FamilyControls](https://developer.apple.com/documentation/familycontrols) | 15+ (`.individual` 16+) | Authorization, plus [FamilyActivityPicker](https://developer.apple.com/documentation/familycontrols/familyactivitypicker) for choosing apps, categories and domains as opaque tokens. | Needs the `com.apple.developer.family-controls` entitlement, plus a distribution approval from Apple before App Store release. We never learn app names from tokens. |
| [ManagedSettings](https://developer.apple.com/documentation/managedsettings) | 15+ | [ShieldSettings](https://developer.apple.com/documentation/managedsettings/shieldsettings): shield apps, categories and web domains. Also `blockedApplications`, `denyAppRemoval`, and web content filtering. | The granularity is a whole app or a whole domain. Apple says the system "doesn't guarantee" your settings govern the device ([ManagedSettingsStore](https://developer.apple.com/documentation/managedsettings/managedsettingsstore)). |
| [ManagedSettingsUI](https://developer.apple.com/documentation/managedsettingsui) | 15+ | Custom shield title, icon, colors and buttons ([ShieldConfigurationDataSource](https://developer.apple.com/documentation/managedsettingsui/shieldconfigurationdatasource)). [ShieldActionDelegate](https://developer.apple.com/documentation/managedsettings/shieldactiondelegate) handles button taps. | Sandboxed extension: no network, no free-form UI. We can't put a DM inbox on a shield. |
| [DeviceActivity](https://developer.apple.com/documentation/deviceactivity) | 15+ | Schedules, plus per-app, category or domain time thresholds ([DeviceActivityEvent](https://developer.apple.com/documentation/deviceactivity/deviceactivityevent)) that wake a monitor extension. [DeviceActivityReport](https://developer.apple.com/documentation/deviceactivity/deviceactivityreport) renders usage. | Counts time an app is frontmost, never which view. The monitor extension has about a 6 MB memory cap (Dev-reported, [forum 823431](https://developer.apple.com/forums/thread/823431)). The report extension can't export data. |
| Core ML + Vision | all | On-device image classification, running in our own process. | It has to run in whichever process holds the frames. In iOS 27 that can be the main app, so the 50 MB extension cap no longer applies (Inference). |
| [WKWebView](https://developer.apple.com/documentation/webkit/wkwebview) + [WKUserScript](https://developer.apple.com/documentation/webkit/wkuserscript) | 8+ | Full DOM control over pages we load: hide, rewrite or redirect anything, and read the URL path. | Only pages inside our app. Login, feature parity and terms of service are third-party risks (App Review [5.2.2](https://developer.apple.com/app-store/review/guidelines/#third-party-sites/services), [4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality)). |
| [Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari-web-extensions) | 15+ | Content scripts on instagram.com and youtube.com in Safari: remove Reels and Shorts at the DOM level. | Safari only. Universal links push users into the native app. The user enables it in Settings. |
| [Screen Time framework](https://developer.apple.com/documentation/screentime) `STWebpageController` | 14+ | Our WKWebView reports web usage to Screen Time and gets blocked URLs occluded. | Makes our own browser a Screen Time citizen. It doesn't grant new control. |
| [NE URL filter](https://developer.apple.com/documentation/networkextension/url-filters) | 26+ | Full-URL allow/block for all WebKit and `URLSession` requests, system-wide, on consumer devices. | Needs a Bloom filter plus a Private Information Retrieval (PIR) server we host. Native apps with custom network stacks may bypass it. |
| [NE content filter](https://developer.apple.com/documentation/networkextension/content-filter-providers) | 9+ / 15+ | Flow-level allow/block. | Supervised devices only, or Screen Time *child* devices only ([TN3134](https://developer.apple.com/documentation/technotes/tn3134-network-extension-provider-deployment)). Not available to an adult blocking themselves. |
| Packet tunnel ("local VPN") | 9+ | Sees traffic volume. | Apple says not to use it as a content filter ([TN3120](https://developer.apple.com/documentation/technotes/tn3120-expected-use-cases-for-network-extension-packet-tunnel-providers)). A real App Review risk. |
| Shortcuts automations / App Intents | 13+ (auto-install 27) | "When app opens" triggers our intent. one sec reports that iOS 27 lets apps install automations through an import flow ([one sec](https://tutorials.one-sec.app/en/articles/10309122)). | Fires on app open or close only, never on a view change inside the app. |

## Capturing other apps' screens

Yes, continuous capture of other native apps is possible with explicit permission. It can only start from a system picker the user taps, and they can stop it at any time.

**iOS 27+: ScreenCaptureKit in the main app (Documented).** Apple's sample [Capturing screen content on iOS](https://developer.apple.com/documentation/screencapturekit/capturing-screen-content-on-ios) describes the flow:

1. The app calls `SCContentSharingPicker.shared.present()`.
2. The person picks full-display capture.
3. The app receives an `SCContentFilter` and starts an `SCStream`.
4. The app declares `screen-capture` in `UIBackgroundModes` "so the stream survives backgrounding for full-display capture".

If the background mode is missing, the stream fails with an explicit `SCStreamError.Code.missingBackgroundMode`. Other error codes, `systemStoppedStream` and `userStopped`, tell us the system or the user can end the stream at any time.

**iOS 26 and earlier: ReplayKit Broadcast Upload Extension (Documented, now deprecated).** The user starts it from `RPSystemBroadcastPickerView` or Control Center. Frames go to our extension process, not the app. The status bar shows a recording indicator (Dev-reported). On iOS 27 these classes are deprecated but reportedly still work.

### Still unverified, and decisive

- **How long the app keeps running.** Does the backgrounded app get frames for hours? What happens on screen lock, reboot, low battery, a phone call, or memory pressure? We have no documented time limit and no field reports yet.
- **Restarting.** After a stop, the user must re-open the picker (Inference from the picker-only API). It is unclear whether iOS 27 remembers consent.
- **What is blanked.** Protected content (FairPlay video, secure text fields) is blacked out. Instagram Reels is not normally DRM-protected, but we must check on a device. ReplayKit's doc says it is "incompatible with AVPlayer content".
- **Frame rate control.** `minimumFrameInterval` is listed for macOS only, so on iOS we would drop frames ourselves (keep 1 every 1 to 3 seconds) and set `width` and `height` small (both are available on iOS 27).
- **App Review.** Guideline [2.5.14](https://developer.apple.com/app-store/review/guidelines/#software-requirements) requires consent plus a clear indicator when recording user activity (the system provides both). Guideline [2.5.4](https://developer.apple.com/app-store/review/guidelines/#software-requirements) requires background modes to be used "for their intended purposes". A wellbeing monitor that never streams or saves frames is a new use of `screen-capture` that Apple hasn't ruled on publicly. This is a policy risk, separate from technical feasibility.

## Recognizing short-form on the device

This is plausible but unproven for our task. The tools exist and the visual signal is strong. Nobody has published accuracy numbers for exactly this problem.

**Why the signal is strong (Inference).** Short-form players share a distinctive layout, and IG Reels, YT Shorts and TikTok each use a stable layout of their own:

- full-bleed vertical video
- a right-edge column of like, comment and share icons
- a caption and author name at the bottom left
- an audio ticker
- no app chrome on top

The alternatives are lighter than a CNN, and can be combined:

1. **Image classifier.** Fine-tune MobileNetV3 or EfficientNet-Lite on downscaled frames (for example 224 px), using [Create ML](https://developer.apple.com/documentation/createml) or coremltools. Classes: short-form, feed, DMs, other.
2. **Layout heuristics with no ML.** Use [Vision](https://developer.apple.com/documentation/vision) text recognition (`VNRecognizeTextRequest`) to find the "Reels" tab label or Shorts title, plus pixel motion between frames (full-screen motion means video).
3. **Behavioral signal.** A short-form session looks like a full-screen content change every 3 to 20 seconds, which is the swipe cadence. Frame-to-frame differences can count swipes without any ML. This is closest to measuring *compulsive scrolling* rather than mere *presence in Reels*. It is the user's actual target.

**Constraints to measure.**

- Memory and CPU in the backgrounded app. The ScreenCaptureKit path has no documented cap. The ReplayKit fallback has a reported 50 MB cap, which a quantized 3 to 5 MB model plus Vision should fit (Inference, untested).
- Battery at 1 frame every 2 seconds.
- Whether a backgrounded app can use the Neural Engine or the GPU. We assume CPU fallback is possible; this is unverified.
- Robustness to app UI updates. Instagram redesigns can break heuristics, so keep the model retrainable.

**Privacy design.** Process frames in memory and discard them. Store only labels and timestamps. The airplane-mode demo from the doc still works. One caveat: the system recording indicator will make users feel watched, even though nothing leaves the phone.

## Getting from detection to a Screen Time intervention

On iOS 27 the handoff problem from the ideation doc may simply disappear. The main app holds both the frames and the Family Controls authorization, so it can write `ManagedSettingsStore().shield.applications` the moment the classifier fires.

&#91;embedded content: detection to shield · iOS 27 path vs. iOS 26 fallback\]

The top row is the main candidate. The dashed box marks the question from the doc that remains only for the iOS 26 fallback.

**What is documented.**

- Shields are applied by writing a `ManagedSettingsStore` from a process that has the Family Controls entitlement.
- Developers report that shields work when written from the main app or from the DeviceActivityMonitor extension ([forum 695651](https://developer.apple.com/forums/thread/695651)).
- The same thread warns to write from one process only. Store reads were inconsistent between the app and an extension.

**Still unverified.**

- Does a background ScreenCaptureKit app's `ManagedSettingsStore` write cover the app that is in the foreground *right now*, at once? Prior-art apps suggest yes (one sec and Opal shield after a timer), but we need to time it.
- On iOS 26, can a broadcast extension even hold the Family Controls entitlement? Entitlement coverage for extensions is murky. In [forum 777206](https://developer.apple.com/forums/thread/777206), an Apple engineer suggests extensions inherit it, and community replies disagree.
- The fallback relays, if the extension can't shield directly:
  - (a) The extension writes a flag to the App Group and posts a Darwin notification. This only reaches the main app if it is already running, because Darwin notifications don't launch apps (Inference).
  - (b) The extension posts a local notification, which needs a test.
  - (c) Pre-arm a DeviceActivity threshold. It counts all Instagram time, not Reels time.

**Design consequence.** Make iOS 27 the baseline for the screen-watching track. Treat iOS 26 as "time-based shields only" rather than spending weeks on extension IPC.

## Can we restrict just one view inside Instagram or YouTube?

No public API can do this inside a native third-party app. That is a hard restriction, not a gap in our research.

**Why.** Apps are sandboxed processes. iOS gives other apps no API to read or modify their view hierarchy, inject code, draw over them, or send them input. iOS has no equivalent of Android's AccessibilityService or `SYSTEM_ALERT_WINDOW`. The App Review [2.5.1](https://developer.apple.com/app-store/review/guidelines/#software-requirements) public-API rule rules out private workarounds. Jailbreak tweaks and MDM are the only routes, and neither fits consumer self-control. MDM is limited to organizations ([5.5](https://developer.apple.com/app-store/review/guidelines/#mobile-device-management)). Vendors who checked reach the same conclusion: AppBlock says it "cannot block specific features or sections within an app" on iPhone ([AppBlock](https://appblock.app/can-appblock-block-instagram-reels-youtube-shorts-or-snapchat-stories-on-iphone/)).

**The closest approximations, using real public mechanisms.**

| Mechanism | How close to "Reels only" | Status |
| --- | --- | --- |
| Detect Reels by screen capture, then a whole-app shield for N minutes | The trigger is Reels-specific; the penalty is whole-app | Plausible, needs testing |
| Short shield (for example 60 s) with a "Back to DMs" button that lifts it | Feels like a bounce out of Reels. It can't navigate Instagram to the DM tab, so the user re-opens Instagram | Plausible. The ShieldAction can lift the shield; it can't open apps (Dev-reported) |
| Nudge only: local notification "You've been in Reels 6 min" while staying in the app | Reels-specific and non-blocking | Plausible, needs testing from a backgrounded capture app |
| Shield `instagram.com` or `youtube.com` in Safari | Whole domain, not `/reels` | Confirmed feasible ([ShieldSettings.webDomains](https://developer.apple.com/documentation/managedsettings/shieldsettings)) |
| NE URL filter blocking `instagram.com/reels/*` and `youtube.com/shorts/*` | Path-level, but only for WebKit and `URLSession` traffic | Plausible for web. Unknown whether the native apps' traffic is affected. Probably not useful for native, because API calls don't use page URLs |
| DOM removal in Safari or our own WKWebView | True view-level removal | Confirmed feasible (prior art below) |

## Alternative architectures worth testing

True view-level control exists only where we own the renderer. The creative work is making that renderer the path of least resistance, while the native app becomes the high-friction path.

1. **Safari Web Extension (iOS 15+).** Content scripts strip Reels, Shorts and Explore on the web versions and redirect `/shorts/ID` to `/watch?v=ID`.
   - Confirmed feasible. [Short Video Hider](https://apps.apple.com/app/id6745738626) ships exactly this.
   - Weakness: users can leave via universal links (tapping "Open in app"), and it only helps people who already use Safari.
2. **Our own WKWebView client (the doc's E3).** Load `m.instagram.com` and `youtube.com`, and inject a `WKUserScript` at document start to remove Reels before paint.
   - Confirmed feasible. [Dull](https://getdull.app/block-reels-iphone/) does this and calls it "the only way iOS allows a third-party app to touch Instagram's UI".
   - Adding `STWebpageController` makes our browser report to Screen Time.
   - Risks: Instagram web DM support and login flows, Meta's terms of service ([5.2.2](https://developer.apple.com/app-store/review/guidelines/#third-party-sites/services)), and DOM churn.
3. **Split by intent.** Shield the native Instagram app. Our app offers a "DMs only" entry, either a web view pinned to `/direct/` with navigation outside it blocked, or deep links.
   - Inference: a web view pinned to one path can enforce this well.
   - Unknown: whether Instagram web DMs are complete enough on mobile.
4. **Intent-first gate (one sec model).** A Shortcuts "app opened" automation opens our app, which asks "DMs or browsing?". Then we either grant a short unshield or route to the web client.
   - Confirmed in prior art ([one sec](https://tutorials.one-sec.app/en/articles/10336706)).
   - Automations can't see Reels. They only mark the session start.
5. **Screen watcher plus graduated response (iOS 27).** The detector drives a ladder: nudge notification, then a 1-minute shield, then a 30-minute shield, then lockout until a partner code or NFC tag. It needs no web client and works across all apps, including future ones. Plausible, and the highest-value unknown.
6. **Hybrid: watcher as referee, web client as the good path.** The detector doesn't need to be perfect. It only decides when to escalate friction on the native app, while the web client stays always-available and Reels-free.
7. **Rejected for now.**
   - Local VPN or packet tunnel traffic guessing: Apple's [TN3120](https://developer.apple.com/documentation/technotes/tn3120-expected-use-cases-for-network-extension-packet-tunnel-providers) says not to use it as a content filter, and Instagram's traffic is TLS and mixed.
   - NE content filter: child or supervised devices only.
   - MDM and supervision: impractical for consumers, though possible for a lab study device.

**Bypass resistance, documented tools only.**

- Individual authorization requires Face ID or Touch ID to grant ([AuthorizationCenter](https://developer.apple.com/documentation/familycontrols/authorizationcenter)).
- `denyAppRemoval` and `blockedApplications` exist in [ApplicationSettings](https://developer.apple.com/documentation/managedsettings/applicationsettings).
- The anti-circumvention protections Apple documents (can't delete the app, can't sign out of iCloud) are stated for *child* authorization only ([FamilyControls](https://developer.apple.com/documentation/familycontrols)).
- An adult can always revoke our authorization in Settings, so strictness for adults is friction plus commitment devices (cooldown, partner code, NFC, deposit), never a lock.
- A partner holding a Screen Time passcode on the device is a common manual pattern. Child authorization targets under-18 family members, so it isn't an option for adults (Inference from the docs' wording).

## Prior art and how it works

Every shipping iOS product we found uses one of three documented mechanisms: Screen Time shields, a Safari extension, or its own browser. We found no App Store app that detects Reels inside the native Instagram app by screen capture. That may be our novelty, or a sign of App Review risk.

| Product | What the user gets | Mechanism | Source |
| --- | --- | --- | --- |
| [one sec](https://tutorials.one-sec.app/en/articles/10336706) | Breathing pause when opening an app; re-interventions and blocks | Shortcuts automations for app open and close, plus Screen Time shields for blocks. Its developer reports a 6 MB DeviceActivityMonitor limit | [setup on iOS 27](https://tutorials.one-sec.app/en/articles/10309122), [forum 823431](https://developer.apple.com/forums/thread/823431) |
| Opal, ScreenZen, AppBlock, Brick | Schedules, limits, friction, NFC unlock (Brick) | FamilyControls, ManagedSettings and DeviceActivity, whole-app shields. AppBlock says in-app sections can't be blocked | [AppBlock](https://appblock.app/can-appblock-block-instagram-reels-youtube-shorts-or-snapchat-stories-on-iphone/) |
| [Dull](https://getdull.app/block-reels-iphone/) | Instagram without Reels or Explore | Own in-app browser that strips the DOM before paint, with a live filter-rule loader | vendor page |
| [Short Video Hider](https://apps.apple.com/app/id6745738626) | Shorts and Reels hidden in Safari for YouTube, Instagram, Facebook and Reddit | Safari Web Extension, runs locally | App Store listing |
| [Scrolless](https://apps.apple.com/us/app/social-media-blocker-scrolless/id6741134096) | Social media blocker | Not verified | App Store listing |
| Android equivalents (doc's comparison) | In-app Reels blocking | AccessibilityService. No iOS equivalent exists | n/a |

The gap the doc identified still holds. Nobody combines Reels-specific detection in native apps with a benefit-preserving path, and iOS 27 ScreenCaptureKit is the first public mechanism that could make it possible.

## Audit of the ideation doc's claims

Most of Option E holds up. One central claim is outdated: that iOS screen watching must run in a ReplayKit extension. That changed with iOS 27.

| Claim in the doc | Verdict | Evidence |
| --- | --- | --- |
| E1: ReplayKit Broadcast Upload Extension captures the whole screen across apps | Outdated (true through iOS 26, deprecated in 27) | [RPBroadcastSampleHandler](https://developer.apple.com/documentation/replaykit/rpbroadcastsamplehandler) is deprecated in iOS 27; ScreenCaptureKit replaces it |
| E1: "\~50 MB extension memory limit" | Dev-reported for ReplayKit; irrelevant on the iOS 27 path | [Fora Soft](https://www.forasoft.com/blog/article/how-to-implement-screen-sharing-in-ios-1193) |
| E1: the user must start capture manually | Confirmed | Picker-only API on both stacks |
| E1: red indicator | Confirmed in spirit; the exact iOS 27 indicator is unverified | ReplayKit consent prompt per [Apple Platform Security](https://support.apple.com/guide/security/replaykit-security-seca5fc039dd/web); guideline 2.5.14 |
| E1: "can only notice; needs E2 to block" | Still true, but the handoff is likely trivial on iOS 27 | Main app owns both pieces |
| Unknown: can the broadcast extension trigger a shield directly? | Still unverified, now matters only for iOS 26 and earlier | [forum 777206](https://developer.apple.com/forums/thread/777206) |
| E2: shield chosen apps with a custom screen; DeviceActivity thresholds | Confirmed | [ShieldSettings](https://developer.apple.com/documentation/managedsettings/shieldsettings), [ManagedSettingsUI](https://developer.apple.com/documentation/managedsettingsui), [DeviceActivityEvent](https://developer.apple.com/documentation/deviceactivity/deviceactivityevent) |
| E2: can't target the Reels tab inside an app | Confirmed (hard limit) | No public API exists |
| E3: WKWebView with injected JS hides Reels | Confirmed feasible technically | [WKUserScript](https://developer.apple.com/documentation/webkit/wkuserscript); [Dull](https://getdull.app/block-reels-iphone/) |
| E3: "own snapshots + model with no indicator" | Plausible. `WKWebView.takeSnapshot` is in-process. But we read the URL and DOM directly, so a model is mostly unnecessary there | Inference |
| E3: native apps shielded so the wrapper is the only way in | Feasible, but it is friction, not a lock: an adult can revoke | [FamilyControls](https://developer.apple.com/documentation/familycontrols) (protections stated for child authorization) |
| E4: Safari Web Extension on iOS 15+ | Confirmed | [Safari web extensions](https://developer.apple.com/documentation/safariservices/safari-web-extensions) |
| E4: Shortcuts "when app opens" automation | Confirmed. iOS 27 adds app-assisted automation install | [one sec](https://tutorials.one-sec.app/en/articles/10309122) |
| E4: local VPN guessing Reels by traffic | Unsupported use and weak signal | [TN3120](https://developer.apple.com/documentation/technotes/tn3120-expected-use-cases-for-network-extension-packet-tunnel-providers) |
| Model: quantized MobileNet or EfficientNet-Lite of a few MB | Plausible; accuracy unproven | Needs our own dataset |
| Android: AccessibilityService + MediaProjection | Out of scope here; no iOS equivalent | n/a |
| API table (YouTube good; X, IG, TikTok no feed API) | Unverified this round | Not iOS-specific |

## Comparing the most promising approaches

No single approach wins on every axis. The screen watcher is the only one that touches the real native apps. The web client is the only one that removes Reels while keeping DMs. They complement each other rather than compete.

| Approach | User experience | Complexity | Reliability | Bypass resistance | Privacy | App Store feasibility |
| --- | --- | --- | --- | --- | --- | --- |
| A. iOS 27 screen watcher + timed shield | Real Instagram; Reels triggers a whole-app shield or nudge | High (ML, data, background life) | Unknown: stream lifetime and accuracy | Medium: the user can stop capture, but we can detect the stop and shield on it | Sensitive: full-screen frames, though on-device; the indicator feels creepy | Uncertain: a new use of the `screen-capture` mode (2.5.4) |
| B. Own web client (WKWebView) + native app shielded | Reels-free Instagram; native app behind friction | Medium | Medium: DOM churn and login breakage | Medium: only Screen Time revocation defeats it | Good: we see only the pages we load | Moderate risk: 4.2 wrapper and 5.2.2 third-party terms |
| C. Safari Web Extension | Reels-free web in Safari | Low | High for web | Low: the user can open the native app or switch browsers | Good | Low risk (shipping precedent) |
| D. Intent gate (Shortcuts) + shields | Pause and choose on open; short grants | Low to medium | High (proven by one sec) | Medium | Good | Low risk (precedent) |
| E. DeviceActivity thresholds only | Daily Instagram limit, not Reels-specific | Low | High | Medium | Best | Low risk |

A "hybrid" of A, B and D is the obvious candidate to evaluate later. We are not selecting one now.

## Feasibility matrix

Seven capabilities are confirmed. The make-or-break ones (background capture lifetime, accuracy, instant shielding) are plausible but untested.

| Capability | Classification | Works in native 3rd-party apps? | Basis |
| --- | --- | --- | --- |
| Shield a whole app or category with a custom screen | Confirmed feasible | Yes | ShieldSettings, ManagedSettingsUI docs |
| Time thresholds per app (DeviceActivity) | Confirmed feasible | Yes (time only) | DeviceActivityEvent docs |
| Shield a web domain in Safari | Confirmed feasible | n/a | ShieldSettings.webDomains |
| Remove Reels or Shorts in Safari via a Web Extension | Confirmed feasible | No | Docs + shipping app |
| Remove Reels in our own WKWebView client | Confirmed feasible | No | Docs + shipping app (Dull) |
| Intent gate on app open via Shortcuts automation | Confirmed feasible | Yes (open and close only) | one sec |
| Capture full display from the main app while backgrounded (iOS 27) | Confirmed in docs; untested by us | Yes (pixels) | ScreenCaptureKit sample, UIBackgroundModes |
| Capture stays alive for hours, across lock and app switches | Unknown / insufficient evidence | Yes | No docs or reports yet |
| Classify Reels, Shorts or TikTok frames accurately on device | Plausible but needs testing | Yes | Core ML, Vision; no published benchmark |
| Detect compulsive swiping from frame-change cadence | Plausible but needs testing | Yes | Inference |
| Background capture app writes a shield that covers the foreground app at once | Plausible but needs testing | Yes | ManagedSettings docs + prior-art behavior |
| Local notification from the background capture app | Plausible but needs testing | Yes | Inference |
| Broadcast extension (iOS 26 and earlier) writes shields directly | Unknown / insufficient evidence | Yes | Conflicting forum reports |
| App Review approval of capture-based wellbeing monitoring | Unknown / insufficient evidence | n/a | 2.5.4, 2.5.14; no precedent found |
| Path-level blocking (`/reels`) via NE URL filter | Plausible but needs testing (web only) | Probably no | NE URL filter docs (WebKit and URLSession only) |
| Know which app or view is frontmost without capture | Unsupported via public APIs | n/a | Opaque tokens; no app list on iOS |
| Restrict, hide or overlay one view inside Instagram or YouTube | Unsupported via public APIs | n/a | Sandbox; no accessibility or overlay API |
| Navigate another app (press back, open DMs tab) | Unsupported via public APIs | n/a | Same |
| Network content filter for an adult's own device | Unsupported (child or supervised only) | n/a | TN3134 |
| Uninstall-proof or revoke-proof lock for an adult | Unsupported; friction only | n/a | FamilyControls protections are child-only |

## Ranked experiments on a real iPhone

Run them in this order: each one can kill or unlock the next. All need a physical iPhone; ScreenCaptureKit and FamilyControls don't run meaningfully in the Simulator. Experiments 1 to 3 need iOS 27 and Xcode 27. Plan on a paid developer account, since free teams may not support the Family Controls capability (unverified). Do Xcode runs first, and note behavior again in a TestFlight build, since the entitlement and provisioning differ.

1. **Background capture survival (half a day).** A bare app with `UIBackgroundModes = screen-capture` presents `SCContentSharingPicker.shared.present()`, starts an `SCStream`, and logs a timestamp and the frame size every Nth frame to a file.
   - Steps: start capture, switch to Instagram, scroll Reels for 30 minutes, lock the phone, unlock, take a call, then leave it overnight.
   - Measure: minutes until the first gap, `SCStreamError` codes, the status indicator, whether Reels frames are visible or blank, and battery percentage per hour.
   - Kill criterion: the stream dies within minutes in the background.
2. **Shield from the capture app (half a day).** Add FamilyControls `.individual` authorization and a `FamilyActivityPicker` for Instagram. On a debug trigger, for example 10 frames after start, write `store.shield.applications = [igToken]` *while Instagram is foreground*.
   - Measure: latency until the shield covers Instagram, whether the stream keeps running after the shield, and lifting it from a ShieldAction button.
   - This settles the doc's E1+E2 question for iOS 27.
3. **Labelled frame dataset plus a baseline classifier (2 to 3 days).** Reuse experiment 1's logger to save downscaled frames (for example 224 px JPEGs) while you deliberately visit IG Reels, IG feed, IG DMs, YT Shorts, YT long video and TikTok.
   - Steps: train a Create ML image classifier, then run it in-process on live frames.
   - Measure: per-frame accuracy on a session held out from a different day or person, inference ms and memory, and a 3-frame majority-vote latency.
   - Also try the no-ML baseline: frame-diff swipe cadence plus Vision text recognition of the "Reels" label.
4. **Web client viability (1 day).** In a WKWebView, log in to `instagram.com`, inject a `WKUserScript` at `.atDocumentStart` that hides Reels and Explore links and blocks `/reels/` navigation, and pin a second web view to `/direct/inbox/`.
   - Measure: whether login works (including 2FA), whether DMs send, receive and show media, and whether Reels leaks through in-feed rows.
   - Repeat for `m.youtube.com` with a `/shorts/` to `/watch` redirect.
5. **iOS 26 fallback check (1 day, optional).** Use a Broadcast Upload Extension with the same classifier. Try `ManagedSettingsStore` writes from the extension, and try `UNUserNotificationCenter` local notifications from it.
   - Measure: entitlement or provisioning errors, whether the shield appears, and peak memory against the reported 50 MB cap.
   - Only worth it if the audience will include many devices not yet on iOS 27.

After experiments 1 to 3 we can say with evidence whether "detect Reels in the real Instagram app" is buildable. Experiment 4 tells us whether the benefit-preserving path is real.

## Sources

Apple documentation (opened 2026-10-21):

- [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit) · [Capturing screen content on iOS](https://developer.apple.com/documentation/screencapturekit/capturing-screen-content-on-ios) · [SCContentSharingPicker](https://developer.apple.com/documentation/screencapturekit/sccontentsharingpicker) · [UIBackgroundModes](https://developer.apple.com/documentation/bundleresources/information-property-list/uibackgroundmodes)
- [ReplayKit](https://developer.apple.com/documentation/replaykit) · [RPSystemBroadcastPickerView](https://developer.apple.com/documentation/replaykit/rpsystembroadcastpickerview) · [RPBroadcastSampleHandler](https://developer.apple.com/documentation/replaykit/rpbroadcastsamplehandler)
- [FamilyControls](https://developer.apple.com/documentation/familycontrols) · [AuthorizationCenter](https://developer.apple.com/documentation/familycontrols/authorizationcenter) · [FamilyActivityPicker](https://developer.apple.com/documentation/familycontrols/familyactivitypicker)
- [ManagedSettings](https://developer.apple.com/documentation/managedsettings) · [ManagedSettingsStore](https://developer.apple.com/documentation/managedsettings/managedsettingsstore) · [ShieldSettings](https://developer.apple.com/documentation/managedsettings/shieldsettings) · [ApplicationSettings](https://developer.apple.com/documentation/managedsettings/applicationsettings) · [ShieldActionDelegate](https://developer.apple.com/documentation/managedsettings/shieldactiondelegate)
- [ManagedSettingsUI](https://developer.apple.com/documentation/managedsettingsui) · [ShieldConfigurationDataSource](https://developer.apple.com/documentation/managedsettingsui/shieldconfigurationdatasource)
- [DeviceActivity](https://developer.apple.com/documentation/deviceactivity) · [DeviceActivityEvent](https://developer.apple.com/documentation/deviceactivity/deviceactivityevent) · [DeviceActivityReport](https://developer.apple.com/documentation/deviceactivity/deviceactivityreport)
- [Screen Time framework](https://developer.apple.com/documentation/screentime) · [WKUserScript](https://developer.apple.com/documentation/webkit/wkuserscript) · [Safari web extensions](https://developer.apple.com/documentation/safariservices/safari-web-extensions)
- [NE URL filters](https://developer.apple.com/documentation/networkextension/url-filters) · [Content filter providers](https://developer.apple.com/documentation/networkextension/content-filter-providers) · [TN3134](https://developer.apple.com/documentation/technotes/tn3134-network-extension-provider-deployment) · [TN3120](https://developer.apple.com/documentation/technotes/tn3120-expected-use-cases-for-network-extension-packet-tunnel-providers)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) · [ReplayKit security (Apple Platform Security)](https://support.apple.com/guide/security/replaykit-security-seca5fc039dd/web)

Developer reports and prior art:

- Forums: [695651](https://developer.apple.com/forums/thread/695651) (shields from an extension) · [777206](https://developer.apple.com/forums/thread/777206) (entitlements for extensions) · [823431](https://developer.apple.com/forums/thread/823431) (6 MB monitor limit)
- [Fora Soft: ReplayKit vs. ScreenCaptureKit on iOS 27](https://www.forasoft.com/blog/article/how-to-implement-screen-sharing-in-ios-1193)
- one sec: [Screen Time connection](https://tutorials.one-sec.app/en/articles/10336706) · [Shortcuts on iOS 27](https://tutorials.one-sec.app/en/articles/10309122)
- [Dull](https://getdull.app/block-reels-iphone/) · [Short Video Hider](https://apps.apple.com/app/id6745738626) · [AppBlock FAQ](https://appblock.app/can-appblock-block-instagram-reels-youtube-shorts-or-snapchat-stories-on-iphone/) · [Scrolless](https://apps.apple.com/us/app/social-media-blocker-scrolless/id6741134096)
