# Experiment 1-R26: ReplayKit Broadcast Upload Extension (iOS 26)

**Status:** planned, no code yet.
**Target:** iPhone on iOS 26.5.2, built with Xcode 26.1.1 on macOS Tahoe 26.3.1.
**Answers:** U1 (survival and Reels legibility) for iOS 26. See [shared protocols and metrics](../shared/README.md).

This is the first capture experiment because it runs on the hardware available today. It does **not** replace the iOS 27 path ([1-S27](../exp1-s27-screencapturekit/README.md)), which stays fully specified and runs once the toolchain is available.

Full reasoning: [iOS 26 / iOS 27 paths plan](../../research/03-ios26-ios27-paths-plan.md), Phases 2 and 3.

## Toolchain compatibility

From [Apple: Xcode versions and supported OSes](https://developer.apple.com/support/xcode):

| Tool | Version | Consequence |
| --- | --- | --- |
| Xcode 26.1.1 | iOS 26.1 SDK; on-device debugging for iOS 15 or later | Builds and debugs on the iOS 26.5.2 iPhone. Fine for 1-R26. |
| Xcode 26.1.1 | No iOS 26.4/26.5 APIs | Can't call `.openParentalControlsApp`, shield submenus or `TokenExpiryMessage`. Not needed here; only matters for experiment 6 (shield button routing), which needs Xcode 26.5+. |
| macOS Tahoe 26.3.1 | Xcode 26.5/26.6 need Tahoe 26.2+ | Xcode can be updated without a macOS update, if experiment 6 is wanted. |

The first device run may prompt Xcode to prepare the device or ask to enable Developer Mode. That's normal (Inference).

## How ReplayKit works for this

1. **Capturing while Instagram is foreground.** Documented. A Broadcast Upload Extension receives whole-screen `CMSampleBuffer`s in [`RPBroadcastSampleHandler`](https://developer.apple.com/documentation/replaykit/rpbroadcastsamplehandler)'s `processSampleBuffer(_:with:)`. The user starts it from [`RPSystemBroadcastPickerView`](https://developer.apple.com/documentation/replaykit/rpsystembroadcastpickerview) or Control Center. There is no programmatic start; Apple DTS answered "No" ([forum 839450](https://developer.apple.com/forums/thread/839450)).
2. **Where frames are processed.** The frames arrive in the extension process. The host app has no access to them ([Apple Platform Security](https://support.apple.com/guide/security/replaykit-security-seca5fc039dd/web)). All analysis runs in the extension, or the extension writes small derived data to an App Group for the app to read.
3. **Running while other apps are in use.** That's the extension's purpose. Dev-reported: it stops when the phone locks (WallHabit reviews, cited in Griffin's research branch), and it ends when the user taps the red indicator. `broadcastFinished()` and `finishBroadcastWithError(_:)` let us log why it stopped.
4. **Limits and requirements.**
   - **Memory:** about 50 MB for the extension (Dev-reported: [forum 837850](https://developer.apple.com/forums/thread/837850), [Fora Soft](https://www.forasoft.com/blog/article/how-to-implement-screen-sharing-in-ios-1193)). Exceeding it gets the extension killed.
   - **GPU:** may be unavailable in the extension, as for background apps (Inference). Plan for CPU.
   - **Protected content:** FairPlay video is blacked out ([`UIScreen.isCaptured`](https://developer.apple.com/documentation/uikit/uiscreen/iscaptured)). Whether Reels is affected must be tested.
   - **Permissions:** the system consent prompt when the broadcast starts. No special entitlement for capture itself.
   - **App Group:** needed for sharing data between the app and the extension.
   - **Family Controls:** not needed for 1-R26. Needed from 1-R26c on, and Apple says it must be requested for each extension that uses it ([Requesting the entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement)).
   - **Account:** assume a paid Apple Developer account. Free personal-team limits for App Groups and Family Controls are unverified.
   - **Deprecation:** ReplayKit broadcast classes are deprecated in the iOS 27 SDK. Xcode 26.1.1 shows no warning, and they run on iOS 26.

## What the proof of concept does

The smallest useful build: a host app with a broadcast button, plus an extension that logs. No ML, no Family Controls, no shield. It needs the fewest entitlements and produces the dataset for later steps.

1. The **host app** shows one `RPSystemBroadcastPickerView` with `preferredExtension` set to our extension, and lists recent runs read from the App Group.
2. The **extension** keeps one frame every 2 seconds and appends one line per kept frame to an App Group file, in the [shared frame log format](../shared/README.md#frame-log-format) (timestamp, frame size, mean luminance, 16×16 difference hash, extension memory footprint). When the broadcast ends it writes the stop reason.
3. **Optional thumbnails:** every 10 seconds, save a 224 px JPEG. Off by default because it captures private screens; on only for labelled sessions.

## Planned files (not created yet)

Everything stays inside this folder. Nothing is added until the code step is approved.

| File | Contents |
| --- | --- |
| `Exp1R26.xcodeproj` | Two targets. Created in Xcode on the Mac, then committed. |
| `HostApp/` | SwiftUI screen with the picker button and run list, plus `Info.plist` |
| `BroadcastExtension/SampleHandler.swift` + `Info.plist` | `RPBroadcastSampleHandler` subclass doing the throttled logging |
| `Shared/FrameLog.swift` | Log record type and writer, shared by both targets |
| `*.entitlements` (2) | App Group entitlement only |
| `analysis/summarize.py` | Reads a run's log: gaps, black-frame ratio, peak memory, stop reasons |
| `.gitignore` | Xcode-only ignores (`xcuserdata/`, `DerivedData/`, `*.xcuserstate`), since the root `.gitignore` has none |

## Setup steps (when the code step is approved)

1. In Xcode 26.1.1, create an iOS App project in this folder.
2. Add a Broadcast Upload Extension target.
3. Add the same App Group to both targets.
4. Set signing to the paid developer team for both targets.
5. Connect the iPhone, enable Developer Mode if prompted, and run the host app.

## Run protocol and pass criteria

Follow the [shared scripted session protocol](../shared/README.md#scripted-session-protocol). Pass for 1-R26:

- ≥95% of 2-second windows logged during the 30-minute Reels run
- Reels frames are non-black and change from frame to frame
- peak extension memory under 40 MB
- the exact cause of every stop is recorded

## Follow-up steps (each needs a separate go-ahead)

- **1-R26b:** add a tiny Core ML model or heuristic check to the extension, and measure CPU and memory under the ~50 MB cap.
- **1-R26c:** add Family Controls and try writing the shield from the extension. This settles the old "can the broadcast extension set a shield?" question ([forum 777206](https://developer.apple.com/forums/thread/777206) reports conflict). If it can't, the relays to test are: an App Group flag plus a Darwin notification (only reaches the app if it's already running), a local notification, or a pre-armed DeviceActivity threshold (counts all Instagram time, not Reels time).

## Risks

- **App Store:** in October 2026 an Apple DTS engineer called screen recording plus ML to detect the foreground app "fundamentally unsuitable" ([forum 837850](https://developer.apple.com/forums/thread/837850)). That doesn't stop the experiment, but it raises App Store risk for this path.
- **Prior art:** WallHabit and the open-source Slowth use the same ReplayKit approach (found on Griffin's research branch). Slowth is GPLv3: read it for ideas, don't copy code unless the team accepts GPL terms.

## Results

| Date | Build | Step | Coverage | Black frames | Peak memory | Battery Δ/h | Stop reason | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | Not run yet |
