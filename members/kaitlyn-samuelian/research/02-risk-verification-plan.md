# iOS Short-Form Intervention: Risk Verification and Experiment Plan

Oct 21, 2026 · @KAITLYN

Companion to the [feasibility investigation](https://claude.ai/artifact/PRKqt8XBPfxC2drbXZW4Q8). It does not repeat that report.

## Bottom line

The core finding survives a second, skeptical pass. iOS 27 documents full-display ScreenCaptureKit capture that continues in the background. But the first report was too optimistic in four places:

1. **Background life is shown only alongside audio.** Apple's iOS sample pairs `screen-capture` with the `audio` mode and an active microphone session. Nothing documents how long a screen-only stream keeps our app alive.
2. **There is no GPU in the background.** Metal docs say background apps can't schedule GPU work, and Core ML docs advise `cpuOnly` for apps that may run in the background. Inference runs on the CPU, which costs battery.
3. **Shields are less dependable in practice than in the docs.** Developers report shields that apply inconsistently from the background, stale shield content, and debug builds that behave differently from TestFlight. One Apple engineer says TestFlight "should have the same experience" yet asks for bug reports.
4. **App Store permission is a separate, unresolved risk.** Using the `screen-capture` background mode for monitoring rather than sharing may fail guideline 2.5.4, independent of whether it works.

**The first experiment to run:** a one-day *screen-only background survival and frame-access test* on iOS 27. If our app can't stay alive and receive readable frames of Reels for 30+ minutes, the whole native-detection branch (A) collapses. In that case the project pivots to the web, intent-gate and Screen Time branches, which already work today. Everything else depends on this result, and it is the cheapest test to run.

## Part 1: Re-verifying the consequential claims

Each claim is now graded on three separate questions: is it technically possible, is it reliable for everyday use, and is it permitted on the App Store. Evidence classes:

- **Confirmed:** Apple states it and it is shipping.
- **Documented, untested:** Apple states it, but we haven't seen it work for our use.
- **Inference:** our reasoning from documented behavior.
- **Unknown:** no evidence either way.
- **Prohibited/unavailable:** no public API, or the docs or guidelines rule it out.

| Claim | Evidence class | Possible? | Reliable daily? | App Store? | Source |
| --- | --- | --- | --- | --- | --- |
| ScreenCaptureKit exists on iOS 27 with a system picker | Documented, untested | Yes | n/a | Yes, for sharing and recording | [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit), [SCContentSharingPicker](https://developer.apple.com/documentation/screencapturekit/sccontentsharingpicker) (iOS 27.0) |
| Full-display capture includes other apps' content | Documented, untested (wording: "entire display") | Yes | Unknown | Yes | [iOS sample](https://developer.apple.com/documentation/screencapturekit/capturing-screen-content-on-ios) |
| Stream "survives backgrounding" with `screen-capture` | Documented, untested | Yes | **Unknown.** The sample also runs `audio` mode with a mic session, so screen-only survival is undocumented | **Unknown.** Guideline 2.5.4: background modes "for their intended purposes" | [UIBackgroundModes](https://developer.apple.com/documentation/bundleresources/information-property-list/uibackgroundmodes), [guidelines](https://developer.apple.com/app-store/review/guidelines/#software-requirements) |
| The stream can pause or stop on its own | Documented | n/a | Risk | n/a | `streamDidBecomeInactive`, `stream(_:didStopWithError:)`, `systemStoppedStream`, `userStopped` (iOS 27) |
| We can throttle the frame rate and choose the pixel format | **Prohibited/unavailable on iOS.** `minimumFrameInterval`, `queueDepth`, `pixelFormat`, `scalesToFit` and `updateConfiguration` are listed for macOS only; `width` and `height` are iOS 27 | We drop frames ourselves | Cost unknown | n/a | [SCStreamConfiguration](https://developer.apple.com/documentation/screencapturekit/scstreamconfiguration) symbol pages |
| Reels pixels are readable (not blacked out) | Inference | Probably | Unknown | n/a | FairPlay video is blacked out; apps can observe [`UIScreen.isCaptured`](https://developer.apple.com/documentation/uikit/uiscreen/iscaptured) and hide content |
| Core ML runs in the backgrounded app | Documented (CPU) | Yes, on CPU | Battery unknown | Yes | [MLComputeUnits](https://developer.apple.com/documentation/coreml/mlcomputeunits) ("use cpuOnly... if your app might run in the background"); [Metal background](https://developer.apple.com/documentation/metal/preparing-your-metal-app-to-run-in-the-background) (GPU `notPermitted`) |
| A shield written by our app covers an already-open app | Dev-reported | Yes | **Mixed reports** | Yes, with the entitlement | [717269](https://developer.apple.com/forums/thread/717269) (appears, stale content), [801172](https://developer.apple.com/forums/thread/801172) (inconsistent from background) |
| Unshield from a shield button works the same in TestFlight | Dev-reported problem | Yes | **Unreliable** in one report | Yes | [807934](https://developer.apple.com/forums/thread/807934) (DTS asks for an FB) |
| Family Controls distribution for app *and* each extension | Documented | Yes | n/a | Needs Apple approval per bundle ID | [Requesting the entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement) |
| View-level control inside native apps | Prohibited/unavailable | No | n/a | No (2.5.1) | Sandbox; first report |
| Instagram mobile web supports DMs inside WKWebView | Unknown | Probably | Unknown | 5.2.2 risk | DMs on web launched in 2020 ([TechRadar](https://www.techradar.com/news/you-can-now-get-at-your-instagram-dms-on-the-web)); mobile-web parity unverified |

## Corrections to the first report

Six statements in the [first report](https://claude.ai/artifact/PRKqt8XBPfxC2drbXZW4Q8) need softening or correcting.

1. **"The handoff problem may simply disappear."** This is true only if two untested facts hold: the main app stays alive in the background, and a background `ManagedSettingsStore` write reliably covers the foreground app. It is a hypothesis, not a finding.
2. **"Capture from the main app while backgrounded: Confirmed in docs."** Correction: documented with an audio session running. Screen-only background life is undocumented. We should not ship an always-on microphone session as a keep-alive trick. That would fail 2.5.4 and the user's trust.
3. **"No documented cap" on memory and CPU, implying room for a bigger model.** Correction: no *published* cap is not the same as no cap. Background apps are subject to system memory pressure. And the GPU is documented as unavailable in the background, so inference is CPU-bound.
4. **"Drop frames ourselves (keep 1 every 1 to 3 s)."** Still right, but iOS gives us no way to ask for fewer frames, so the system may still deliver and copy every frame. The cost of receiving frames we discard is unmeasured.
5. **Shield timing called "plausible".** Downgraded to "plausible but with reported flakiness". There are field reports of inconsistent background application, stale shield content, and debug-versus-TestFlight differences. Every shield experiment must also be run as a TestFlight build.
6. **Bypass via "detect the stop and shield on it".** This is an inference. We don't know if the app gets enough runtime after `userStopped` to write the store. Separately, the user can always stop capture from the system UI, so the watcher can never be the enforcement layer, only a signal.

One claim got *stronger*: the native view-level limit. Apple's own docs list no iOS API to enumerate apps or windows. `SCShareableContent`, `SCRunningApplication` and `SCDisplay` are macOS-only, so even with capture we get only pixels, never "which app is this".

## Part 2: Are these the right experiments, in the right order?

Mostly yes, with three changes: split experiment 1, move App Review risk earlier, and demote the ReplayKit fallback.

- **Split experiment 1 into two gates.** Gate 1a is survival: does the app stay alive and receive frames in the background with no audio session? Gate 1b is legibility: are Reels frames real pixels at a usable cost? Either one failing kills native detection, so both belong first.
- **Make experiment 2 more realistic.** Run the shield trigger from the backgrounded capture app, not from a foreground debug button, and run it in both debug and TestFlight builds. The forum evidence says those differ.
- **Pull classifier work (3) behind a cheaper question.** Before training anything, check whether trivial signals already separate the states. Full-screen motion plus swipe cadence may get most of the value with no dataset. Build a model only if that fails.
- **Keep the web client (4) in parallel, not after.** It is independent of the capture results and is the main fallback for every negative outcome, so its risk (login, DMs, terms) should be known early.
- **Demote ReplayKit (5).** It is deprecated, extension-only and memory-capped. Run it only if experiment 1a fails on iOS 27 *and* we still want native detection, or if the target users can't update.
- **Add a non-code experiment: App Review pre-check.** Before any polish, submit a minimal TestFlight external build that uses `screen-capture`. External testing requires Beta App Review. Also ask the question through Apple's developer support channels. A rejection here eliminates branch A for App Store distribution, though it doesn't kill it as a research prototype.

## The five uncertainties that decide which architectures are viable

These are ordered by how much of the design space each one can eliminate. U1 and U5 can each remove the native-detection branch on their own.

### U1. Does a screen-only capture app stay alive and see Reels?

1. **Unknown:**
   - whether an iOS 27 app with only `screen-capture` (no `audio`) keeps receiving frames for 30+ minutes while Instagram is foreground
   - what stops it: lock, calls, Low Power Mode, memory pressure
   - whether Reels frames contain real pixels
2. **APIs and rules:**
   - `SCContentSharingPicker`, `SCStream`, `SCStreamOutput` (`.screen`)
   - `SCStreamDelegate`: `streamDidBecomeInactive`, `didStopWithError`
   - `UIBackgroundModes` `screen-capture`, plus the error `missingBackgroundMode`
   - No special entitlement documented for iOS; the `missingEntitlements` error exists but isn't explained.
3. **Smallest experiment:**
   - Build a bare app: picker, then stream, logging every Nth frame's timestamp, mean luminance and a 64 px thumbnail hash to a file.
   - Run 4 scripted sessions: 30 min Reels, then a lock/unlock cycle, then an incoming call, then Low Power Mode.
   - Use Xcode's energy and memory gauges, and record battery percentage.
4. **Pass:**
   - ≥95% of 2-second windows have a frame across a 30-minute background Reels session
   - the stream resumes after unlock without user action
   - Reels frames are non-black and differ frame to frame
   - battery drain is ≤ about 8 percentage points per hour above an idle baseline (our threshold, to calibrate) **Fail:** the stream stops within 10 minutes in the background, or frames are black.
5. **Impact:**
   - Pass keeps branch A alive.
   - Partial pass (dies on lock) means A becomes "session mode": the user starts the watcher per scrolling session, a weaker but honest product.
   - Fail removes native detection on iOS 27.
6. **Difficulty:** low. About a day. Needs an iPhone on iOS 27, Xcode 27 and a paid developer account.
7. **Negative result:** eliminates continuous native detection. It does not eliminate the web or intent-gate branches, and an audio-session keep-alive is not an acceptable workaround.

### U2. Can the capture app trigger a shield fast and reliably?

1. **Unknown:**
   - latency from "classifier fires" to "shield visible over Instagram" when our app is backgrounded
   - whether that behaves the same in TestFlight
   - whether lifting the shield via `ShieldActionDelegate` is reliable
2. **APIs and rules:**
   - `AuthorizationCenter.requestAuthorization(for: .individual)` and `FamilyActivityPicker`
   - `ManagedSettingsStore().shield.applications`
   - `ShieldConfigurationDataSource`, `ShieldActionDelegate` (responses `.close`, `.defer`, `.none`)
   - The Family Controls entitlement, requested for the app and for each extension
3. **Smallest experiment:** reuse U1. After N frames, or on a timer, write the shield from the backgrounded app. Record a screen video with a visible clock to measure latency. Repeat 20 times in a debug build and 20 times in a TestFlight build.
4. **Pass:** shield latency ≤ 2 seconds at the median and ≤ 5 seconds at p95. ≥19 of 20 successes in both build types. Unshield works ≥19 of 20 times. **Fail:** inconsistent application, or long or variable delays.
5. **Impact:**
   - Pass means a detect-then-shield product is feasible.
   - Fail means detection can only *nudge* (a notification, still to be tested) or feed a slower intervention, such as tightening tomorrow's limit.
6. **Difficulty:** low to medium. 1 to 2 days, plus the entitlement setup.
7. **Negative result:** forces an alternative intervention, not the end of the branch. The alternatives are notifications, Live Activity nudges, or delayed policy changes.

### U3. Can cheap signals separate short-form use and compulsive scrolling?

1. **Unknown:** the accuracy of three signals across Reels, Shorts, TikTok, feed, DMs and long video, plus their CPU and battery cost in the background:
   - (a) frame-difference swipe cadence
   - (b) layout and OCR cues
   - (c) a small classifier
2. **APIs:**
   - Vision `VNRecognizeTextRequest` and image differencing on the CPU
   - Core ML with `computeUnits = .cpuOnly` in the background (GPU unavailable per Metal docs)
   - Create ML for the classifier
3. **Smallest experiment:**
   - Record 2 hours of labelled screen sessions from two people, saving 1 frame per second as small thumbnails with manual labels.
   - Evaluate (a) and (b) offline on a Mac first, then the best one live on device.
   - Train (c) only if (a) and (b) miss.
4. **Pass:** ≥90% precision for the short-form label on a held-out person, detection within ≤10 seconds of entering a short-form feed, and ≤5% CPU averaged. **Fail:** precision <80%, or the CPU cost makes U1's battery test fail.
5. **Impact:**
   - High precision allows strict interventions.
   - Moderate precision allows only soft nudges, because false shields while someone is messaging would destroy trust.
6. **Difficulty:** medium. 3 to 5 days, mostly data labelling.
7. **Negative result:** requires an alternative implementation (a better model, or more cues) rather than eliminating the branch, unless the cost is fundamentally too high.

### U4. Is a Reels-free web client good enough to be the useful path?

1. **Unknown:**
   - whether Instagram login (password, 2FA, "Continue with Facebook") works in `WKWebView`
   - whether mobile-web DMs are complete enough: media, voice notes, read receipts
   - how often DOM changes break Reels removal
   - the same questions for YouTube
2. **APIs and rules:**
   - `WKWebView`, `WKUserScript` at `.atDocumentStart`, `WKNavigationDelegate` for path blocking
   - `STWebpageController` for Screen Time integration
   - Guidelines 4.2 (minimum functionality) and 5.2.2 (third-party terms)
   - Note: Meta has deprecated Facebook Login in Android WebViews ([Meta](https://developers.facebook.com/blog/post/2021/06/28/deprecating-support-fb-login-authentication-android-embedded-browsers/)), so expect friction.
3. **Smallest experiment:**
   - Build a single-screen app with a web view on `instagram.com`, a script hiding Reels and Explore, and a navigation block for `/reels/`.
   - Use it as your only Instagram for 3 days, logging breakages.
   - Compare against Safari with a content-blocker-style CSS rule.
4. **Pass:** login works, DMs send and receive, zero Reels exposure over 3 days, ≤1 breakage. **Fail:** login is blocked, or DMs are unusable on mobile web.
5. **Impact:**
   - Pass makes "benefit-preserving path plus shielded native app" a viable architecture regardless of U1 to U3.
   - Fail pushes us to Safari extensions plus intent gating, or toward YouTube-first, where the web is stronger.
6. **Difficulty:** low. 1 day to build, 3 days to live with.
7. **Negative result:** platform-specific. It may kill Instagram-in-wrapper but not YouTube-in-wrapper.

### U5. Will Apple allow it?

1. **Unknown:**
   - whether App Review accepts the `screen-capture` background mode for on-device wellbeing monitoring (2.5.4, 2.5.14)
   - whether the Family Controls distribution request is approved for a self-control app with this design
   - wrapper acceptance under 4.2 and 5.2.2
2. **Rules:** [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) 2.5.1, 2.5.4, 2.5.14, 4.2, 4.10, 5.2.2; [Family Controls entitlement request](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement).
3. **Smallest experiment:**
   - File the Family Controls distribution request early; approval can take weeks, per forum reports.
   - Submit the U1 prototype to external TestFlight, which triggers Beta App Review, with honest review notes.
4. **Pass:** the entitlement is assigned and the beta is approved. **Fail:** rejection that cites background-mode misuse or privacy.
5. **Impact:** rejection doesn't stop a research prototype, a user study or Xcode or TestFlight-internal distribution, but it removes App Store shipping for branch A.
6. **Difficulty:** low effort but slow, with long calendar time. Start it in week 1.
7. **Negative result:** eliminates distribution, not research value. Approval in beta review doesn't guarantee approval at App Store review.

## Part 3: Three separate problems

Treating "detect Reels" as the goal hides the real target. Opening Reels once to watch a friend's clip is fine; 40 minutes of swiping is not. Each problem has different tools and different failure costs.

| Problem | What it means | Tools that can solve it on iOS | Strength of evidence | Cost of a false positive |
| --- | --- | --- | --- | --- |
| **1. Feed entry:** the user is in a short-form feed | A state | Native: screen capture + vision only. Web: URL path (`/reels/`, `/shorts/`), exact and free. App-level proxy: app opened (Shortcuts), time in app (DeviceActivity) | Web: confirmed. Native: unknown (U1, U3) | Low if the response is a nudge |
| **2. Compulsion:** the user is scrolling compulsively | A pattern over time: swipe cadence, session length, time of day, repeated re-opens, ignored nudges | Swipe cadence from frame differences or web scroll events; re-open counts from Shortcuts automations; daily totals from DeviceActivity; self-report check-ins | Mostly inference; needs U3 data | High if we block. Must be conservative |
| **3. Gentle intervention:** step in without breaking the useful parts | Response design | Shield (whole app, blunt), notification nudge, a shield with a "go to DMs" path into our web client, delayed policy changes (tomorrow's limit), friction ladders | Shields confirmed; nudges from a background app inferred | n/a |

**Implications.**

- The web path solves problem 1 exactly and problem 3 well: remove the feed, keep DMs. Problem 2 barely matters there, because the feed is gone.
- Native capture is the *only* way to observe problems 1 and 2 inside the real app. But its only strong response, a whole-app shield, is a poor fit for problem 3. So native detection pairs best with a *soft or deferred* response plus a hand-off to a good path.
- A design that needs no live detection is a legitimate competitor: Shortcuts open-gate plus DeviceActivity session thresholds plus web client. It handles problem 2 crudely (time and re-open counts) and problem 3 well. Any native-detection architecture must beat it, not just work.

## Alternatives and creative combinations

Screen capture is the most novel idea, but also the most fragile and the most policy-exposed. Several combinations deliver most of the experience with documented, shipping mechanisms.

1. **Intent-first gate plus web client (no capture).** Shield Instagram by default. Opening it, via the shield's primary button or a Shortcuts "app opened" automation, lands in our app.
   - Our app asks: "Messages" opens a DM-pinned web view; "Browse" grants a timed native unshield, with a DeviceActivity threshold re-shielding after N minutes.
   - Every piece is documented. one sec ships the gate pattern.
   - Weakness: the shield action can't open our app directly; `.openParentalControlsApp` is not certain to apply here (to test). Shortcuts setup adds friction.
2. **Session-scoped watcher.** Run capture only for a chosen window, for example "evenings" or "the next time I open TikTok", started from the gate screen in a single tap.
   - It avoids the always-on creepiness, battery and survival issues. It turns the system recording indicator into an honest "coach is on" signal.
   - Inference, and the most realistic way to use capture.
3. **Watcher as a measurement tool, not an enforcer.** Use capture for a 1-week baseline that tells users how much of their Instagram time is Reels. DeviceActivity can't say this. Then configure non-capture rules from it.
   - It aims at the "outside judge" goal from the doc, and needs no App Store approval for a study cohort (internal TestFlight).
4. **Safari as the default door.** A Safari Web Extension removes Reels and Shorts. ManagedSettings shields the native apps. The NE URL filter (iOS 26+) blocks `/reels/` and `/shorts/` paths for every WebKit view on the device, including in-app browsers.
   - The URL filter needs a PIR server, a real infrastructure cost (to evaluate).
5. **Delayed consequences.** Detection, whether from capture or crude signals, adjusts *tomorrow's* DeviceActivity limits or friction level instead of interrupting now. This avoids false-positive harm and the latency problem (U2), at the cost of a weaker in-the-moment effect.
6. **Physical or social commitment devices.** Brick-style NFC or a partner code to lift shields, layered on any branch. These are documented ManagedSettings flows. They answer the adult-bypass problem better than any API.

**Not worth pursuing:**

- an audio-session keep-alive for capture (policy and trust risk)
- a packet-tunnel "VPN" filter ([TN3120](https://developer.apple.com/documentation/technotes/tn3120-expected-use-cases-for-network-extension-packet-tunnel-providers))
- NE content filters for adults ([TN3134](https://developer.apple.com/documentation/technotes/tn3134-network-extension-provider-deployment))
- any private-API overlay

## Part 4: Ranked experiments

The ranking puts first the tests that can eliminate the most options for the least effort.

| Rank | Experiment | Resolves | Can eliminate | Effort | Prerequisites |
| --- | --- | --- | --- | --- | --- |
| 1 | Screen-only background survival + Reels legibility | U1 | Native detection (branch A) | \~1 day | iOS 27 iPhone, Xcode 27, paid account |
| 2 | Start the Family Controls distribution request + an external TestFlight submission of #1 | U5 | App Store path for A | Hours, then weeks of waiting | App ID, entitlement request |
| 3 | Web client: Instagram and YouTube login, DMs, Reels removal, a 3-day live trial | U4 | The Instagram web path (YouTube separately) | 1 + 3 days | Any iOS 17+ device |
| 4 | Shield from the backgrounded app: latency and reliability, debug vs. TestFlight | U2 | Real-time blocking (nudges remain) | 1–2 days | #1 passing; Family Controls dev capability |
| 5 | Cheap signals vs. classifier on a labelled 2-hour dataset | U3 | Strict interventions (nudges remain) | 3–5 days | #1 passing |
| 6 | Shield button routing: can `.openParentalControlsApp` or a Shortcut get users to our DM view? | Intent gate UX | Weakens alternative 1, doesn't kill it | \~half a day | Family Controls dev capability |
| 7 | ReplayKit fallback on iOS 26 | Legacy reach | Only legacy support | 1 day | Only if #1 fails or users can't update |

## The experiment to run first

Run **experiment 1: screen-only background survival plus Reels legibility**.

- **It has the highest elimination power.** It is the only test that can remove an entire architecture in a day. If it fails, U2 and U3 don't need running at all.
- **It is the least documented link.** Apple shows background capture only alongside an audio session. Every other link in branch A (shields, Core ML on the CPU) has at least some documentation or field evidence.
- **It is cheap and reusable.** The same small app becomes the harness for experiments 2, 4 and 5.
- **It is neutral about architecture.** Even a partial result (for example, survives until lock) leads to a concrete design (session-scoped watcher) rather than a dead end.

In the same week, start experiment 2's entitlement request, which only needs calendar time, and experiment 3, which is independent and is the fallback for every negative result.

## Decision tree

Each result narrows what the native layer can do. None of them ends the project, because B, C and D don't depend on capture.

&#91;embedded content: decision tree · experiments 1, 4, 5 in sequence; 3 and 2 in parallel\]

B = web client, C = intent gate and Screen Time thresholds, D = Safari extension (see the comparison below). The thresholds are the pass criteria from U1 to U5.

## Remaining research gaps

These can't be answered by reading docs; each needs a device, Apple, or users.

- **Capture lifecycle:**
  - What `streamDidBecomeInactive` means on iOS (lock? protected content?)
  - Whether the picker remembers consent
  - Whether the app can restart capture without the picker after it stops
- **Indicator UX:** the exact iOS 27 recording indicator and how users perceive an always-on one. This is a creepiness and retention risk.
- **Capture opt-out by apps:** whether Instagram, TikTok or YouTube observe `isCaptured` or `sceneCaptureState` and hide or blur content during capture. Some apps do this for privacy.
- **Background notifications:** whether a backgrounded capture app can post local notifications as nudges. Likely yes, but untested.
- **Shield routing:** whether `ShieldActionResponse.openParentalControlsApp` applies to individual-authorization apps and can open our app at a DM screen.
- **NE URL filter economics:** what a PIR server costs to run, and whether a self-hosted one is viable for a research prototype.
- **Platform terms:** whether Meta's and YouTube's terms permit a modifying client (guideline 5.2.2 requires permission on request).
- **Effectiveness:** whether any of these actually reduce compulsive use versus simple app limits. This needs the baseline-versus-intervention study design from the ideation doc.

## Architectures still in play

Four architectures remain open. They are compared here on what each one depends on, not ranked.

| Architecture | Detects feed entry | Detects compulsion | Keeps DMs etc. | Depends on | Biggest risk |
| --- | --- | --- | --- | --- | --- |
| **A. Native watcher + shield or nudge** (always-on or session-scoped) | Native, if U1 and U3 pass | Swipe cadence (U3) | Partly: the shield is whole-app | U1, U2, U3, U5 | Background survival and App Review |
| **B. Web client + shielded native apps** | Exact (URL) | Not needed: feed removed | Yes, if U4 passes | U4, 5.2.2 | Login, DM parity, platform terms |
| **C. Intent gate + Screen Time thresholds** | App open only | Time and re-open counts | Yes, via timed unshield | Shortcuts setup; shield routing | Crude: can't see Reels |
| **D. Safari extension (+ NE URL filter)** | Exact (URL) | Not needed | Yes, on web | Users choosing Safari; PIR server for the filter | Easy bypass to the native app |

These are layers, not rivals. B, C and D are documented today. A is the experimental layer that would make the product unique, and experiments 1 to 5 decide whether it can sit on top of them.

## Sources

Apple documentation (opened 2026-10-21):

- [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit) · [Capturing screen content on iOS](https://developer.apple.com/documentation/screencapturekit/capturing-screen-content-on-ios) · [SCContentSharingPicker](https://developer.apple.com/documentation/screencapturekit/sccontentsharingpicker) · [SCStreamConfiguration](https://developer.apple.com/documentation/screencapturekit/scstreamconfiguration) · [SCStreamDelegate](https://developer.apple.com/documentation/screencapturekit/scstreamdelegate) · [SCStreamError.Code](https://developer.apple.com/documentation/screencapturekit/scstreamerror/code) · [UIBackgroundModes](https://developer.apple.com/documentation/bundleresources/information-property-list/uibackgroundmodes)
- [Preparing your Metal app to run in the background](https://developer.apple.com/documentation/metal/preparing-your-metal-app-to-run-in-the-background) · [MLComputeUnits](https://developer.apple.com/documentation/coreml/mlcomputeunits) · [UIScreen.isCaptured](https://developer.apple.com/documentation/uikit/uiscreen/iscaptured)
- [Requesting the Family Controls entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement) · [ManagedSettingsStore](https://developer.apple.com/documentation/managedsettings/managedsettingsstore) · [ShieldActionResponse](https://developer.apple.com/documentation/managedsettings/shieldactionresponse) · [DeviceActivityCenter](https://developer.apple.com/documentation/deviceactivity/deviceactivitycenter)
- [NE URL filters](https://developer.apple.com/documentation/networkextension/url-filters) · [TN3134](https://developer.apple.com/documentation/technotes/tn3134-network-extension-provider-deployment) · [TN3120](https://developer.apple.com/documentation/technotes/tn3120-expected-use-cases-for-network-extension-packet-tunnel-providers)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

Developer reports and other sources:

- Forums: [717269](https://developer.apple.com/forums/thread/717269) (stale shield over an open app) · [801172](https://developer.apple.com/forums/thread/801172) (background shield consistency) · [807934](https://developer.apple.com/forums/thread/807934) (debug vs TestFlight, DTS reply) · [695651](https://developer.apple.com/forums/thread/695651) · [823431](https://developer.apple.com/forums/thread/823431)
- [Meta: Facebook Login in embedded browsers](https://developers.facebook.com/blog/post/2021/06/28/deprecating-support-fb-login-authentication-android-embedded-browsers/) · [TechRadar: Instagram DMs on the web](https://www.techradar.com/news/you-can-now-get-at-your-instagram-dms-on-the-web)
- Previous report: [feasibility investigation](https://claude.ai/artifact/PRKqt8XBPfxC2drbXZW4Q8)
