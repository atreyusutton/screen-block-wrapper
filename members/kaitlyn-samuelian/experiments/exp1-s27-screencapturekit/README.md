# Experiment 1-S27: ScreenCaptureKit in the main app (iOS 27)

**Status:** fully specified, waiting on toolchain. **Active path. It has not been abandoned or replaced.**
**Target:** iPhone on iOS 27, built with Xcode 27, which needs macOS Tahoe 26.6 or later.
**Answers:** U1 (survival and Reels legibility) for iOS 27, then U2 (shield from the capturing app). See [shared protocols and metrics](../shared/README.md).

The iOS 26 ReplayKit experiment ([1-R26](../exp1-r26-replaykit/README.md)) runs first only because it works on today's devices. That is a reorder, not a replacement. ScreenCaptureKit is the current API, ReplayKit's broadcast classes are deprecated in the iOS 27 SDK, and a 1-R26 result doesn't predict a 1-S27 result. Both must be run.

Full research: [feasibility investigation](../../research/01-ios-feasibility-investigation.md) and [risk verification plan](../../research/02-risk-verification-plan.md). Everything below is preserved from those reports.

## Why this path matters

iOS 27 brought ScreenCaptureKit to iPhone. The **main app** can capture the full display and keep capturing while backgrounded, using the `screen-capture` background mode. If that holds up on a device:

- The process that sees the screen is our own app, not a separate extension.
- That same app holds the Family Controls authorization, so it can write `ManagedSettingsStore().shield.applications` the moment detection fires. The iOS 26 extension-to-app handoff problem goes away.
- The ~50 MB extension memory cap doesn't apply. The app budget is undocumented, though, and is still subject to system memory pressure.

It is the first public mechanism that could make "detect Reels in the real Instagram app" possible. We found no App Store app that does this, which may be our novelty or a sign of App Review risk.

## Requirements

| Requirement | Detail |
| --- | --- |
| macOS | Tahoe 26.6 or later (currently on 26.3.1, so an update is needed) |
| Xcode | 27 |
| Device | Physical iPhone on iOS 27. ScreenCaptureKit and FamilyControls don't run meaningfully in the Simulator. |
| Account | Paid Apple Developer account (free-team support for Family Controls is unverified) |
| Info.plist | `UIBackgroundModes` includes `screen-capture`. Without it, the stream fails with `SCStreamError.Code.missingBackgroundMode`. |
| Entitlements | None documented for capture on iOS. A `missingEntitlements` error exists but isn't explained. Family Controls (`com.apple.developer.family-controls`) is needed from the shield step on. |
| Builds | Run as an Xcode debug build first, then repeat in TestFlight. Entitlements and provisioning differ, and forum reports show different shield behavior. |

## How it works (documented)

From Apple's sample, [Capturing screen content on iOS](https://developer.apple.com/documentation/screencapturekit/capturing-screen-content-on-ios):

1. The app calls `SCContentSharingPicker.shared.present()`.
2. The person picks full-display capture.
3. The app receives an `SCContentFilter` and starts an `SCStream`, receiving frames through `SCStreamOutput` (`.screen`) as `CMSampleBuffer`s.
4. The app declares `screen-capture` in `UIBackgroundModes` "so the stream survives backgrounding for full-display capture".

Lifecycle signals: `SCStreamDelegate`'s `streamDidBecomeInactive` and `stream(_:didStopWithError:)`, with error codes `systemStoppedStream` and `userStopped`. The system or the user can end the stream at any time. Capture can only start from the system picker the user taps.

## API limits on iOS

- **No app or window list.** `SCShareableContent`, `SCRunningApplication` and `SCDisplay` are macOS-only. We get pixels, never "which app is this".
- **No frame-rate or format control.** `minimumFrameInterval`, `queueDepth`, `pixelFormat`, `scalesToFit` and `updateConfiguration` are macOS-only. `width` and `height` are available on iOS 27. We drop frames ourselves (keep 1 every 1–3 seconds) and set a small size. The system may still deliver and copy every frame, and that cost is unmeasured.
- **No GPU in the background.** Metal docs say background apps can't schedule GPU work, and the Core ML docs advise `cpuOnly` for apps that may run in the background ([MLComputeUnits](https://developer.apple.com/documentation/coreml/mlcomputeunits), [Metal background](https://developer.apple.com/documentation/metal/preparing-your-metal-app-to-run-in-the-background)). Inference is CPU-bound, which costs battery.
- **Protected content is blacked out.** FairPlay video and secure text fields. Reels normally isn't DRM-protected, but apps can watch [`UIScreen.isCaptured`](https://developer.apple.com/documentation/uikit/uiscreen/iscaptured) and hide content during capture.

## Corrections from the risk plan (keep these in mind)

1. **"The handoff problem may simply disappear"** is a hypothesis, not a finding. It holds only if the app stays alive in the background *and* a background `ManagedSettingsStore` write reliably covers the foreground app.
2. **Background life is documented only alongside audio.** Apple's iOS sample pairs `screen-capture` with the `audio` mode and an active microphone session. How long a **screen-only** stream keeps the app alive is undocumented. An audio-session keep-alive is not acceptable (guideline 2.5.4 and user trust).
3. **"No documented cap" is not "no cap."** Background apps face memory pressure, and inference runs on the CPU.
4. **Frame dropping is on us,** and receiving frames we discard has an unmeasured cost.
5. **Shield timing is "plausible but with reported flakiness."** Forum reports describe inconsistent background application ([801172](https://developer.apple.com/forums/thread/801172)), stale shield content ([717269](https://developer.apple.com/forums/thread/717269)), and debug-versus-TestFlight differences ([807934](https://developer.apple.com/forums/thread/807934)). Every shield test runs in both build types.
6. **"Detect the stop and shield on it" is an inference.** We don't know if the app gets enough runtime after `userStopped` to write the store. The user can always stop capture from system UI, so the watcher is a signal, never the enforcement layer.

## Experiment plan

### Step 1a: screen-only background survival (U1)

Build a bare app: picker, then stream, with `UIBackgroundModes = screen-capture` and **no** audio mode. Log every kept frame in the [shared frame log format](../shared/README.md#frame-log-format) (path `s27`). Run the [shared scripted session protocol](../shared/README.md#scripted-session-protocol): 30 minutes of background Reels, lock and unlock, an incoming call, Low Power Mode, and optionally overnight. Watch Xcode's energy and memory gauges.

Record: minutes until the first gap, every `SCStreamError` code and delegate callback, the status indicator, and battery percentage per hour.

### Step 1b: Reels legibility (U1)

On the same runs, check that Reels frames are real pixels (non-black, changing) at a usable cost.

**Pass (1a + 1b):** ≥95% of 2-second windows have a frame across the 30-minute background Reels session; the stream resumes after unlock without user action; Reels frames are non-black and differ frame to frame; battery drain ≤ about 8 percentage points per hour above idle.
**Fail:** the stream stops within 10 minutes in the background, or frames are black.

**Impact:** Pass keeps native detection alive on iOS 27. A partial pass (dies on lock) means "session mode", where the user starts the watcher per scrolling session. Fail removes continuous native detection on iOS 27 but doesn't affect the web, intent-gate or Safari branches.

Difficulty: low, about a day.

### Step 2: shield from the backgrounded capture app (U2)

Add FamilyControls `.individual` authorization (`AuthorizationCenter.requestAuthorization(for: .individual)`) and a `FamilyActivityPicker` for Instagram. After N frames or on a timer, write `store.shield.applications = [igToken]` **from the backgrounded app while Instagram is foreground**, not from a foreground debug button. Add `ShieldConfigurationDataSource` and `ShieldActionDelegate` (responses `.close`, `.defer`, `.none`) to test lifting the shield.

Record a screen video with a visible clock. Repeat 20 times in a debug build and 20 times in TestFlight. Also note whether the stream keeps running after the shield appears.

**Pass:** median latency ≤ 2 s, p95 ≤ 5 s; ≥19 of 20 successes in both build types; unshield works ≥19 of 20 times.
**Fail:** detection can only nudge (local notification, still to be tested) or drive slower interventions such as tightening tomorrow's limit.

Difficulty: low to medium, 1–2 days plus entitlement setup.

### Step 3: detection signals (U3)

Reuse the 1-R26 labelled dataset where possible; pixels of Reels look the same whichever API captured them. Run the best signal live in the app with Core ML set to `cpuOnly`. Thresholds are in the [shared metrics](../shared/README.md#u3-detection-quality).

### In parallel: App Review pre-check (U5)

- File the Family Controls distribution request early (forum reports say approval can take weeks), for the app and each extension.
- Submit the Step 1a prototype to external TestFlight, which triggers Beta App Review, with honest review notes.

A rejection removes App Store shipping for this path but not the research prototype, user study, or Xcode/internal TestFlight distribution. Beta approval doesn't guarantee App Store approval.

## App Store risk

- Guideline [2.5.4](https://developer.apple.com/app-store/review/guidelines/#software-requirements): background modes must be used "for their intended purposes". A wellbeing monitor that never streams or saves frames is a new use of `screen-capture` that Apple hasn't ruled on publicly.
- Guideline [2.5.14](https://developer.apple.com/app-store/review/guidelines/#software-requirements): consent plus a clear indicator when recording user activity. The system provides both.
- In October 2026 an Apple DTS engineer called screen recording plus ML to detect the foreground app "fundamentally unsuitable" and said switching to ScreenCaptureKit "doesn't change" that ([forum 837850](https://developer.apple.com/forums/thread/837850)). This raises App Store risk; it doesn't stop the experiment.

## Unresolved questions

These can't be answered by reading docs. Each needs a device, Apple, or users.

- How long a screen-only stream keeps the app alive, and what stops it: lock, reboot, low battery, calls, memory pressure.
- What `streamDidBecomeInactive` means on iOS (lock? protected content?).
- Whether the picker remembers consent, and whether the app can restart capture without the picker after a stop.
- The exact iOS 27 recording indicator, and how users perceive an always-on one.
- Whether Instagram, TikTok or YouTube observe `isCaptured` or `sceneCaptureState` and hide or blur content during capture.
- Whether a backgrounded app can use the Neural Engine (GPU is documented as unavailable).
- The cost of receiving frames we then discard.
- Whether a background `ManagedSettingsStore` write covers the app that's in the foreground right now, at once.
- Whether the app gets enough runtime after `userStopped` to write a shield.
- Whether a backgrounded capture app can post local notifications as nudges (likely, untested).
- Whether App Review accepts `screen-capture` for on-device wellbeing monitoring, and whether Family Controls distribution is approved for this design.

## Results

| Date | Build | Step | Coverage | Black frames | Battery Δ/h | Shield latency | Stop reason | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | Not run yet: needs macOS 26.6+, Xcode 27, iOS 27 iPhone |
