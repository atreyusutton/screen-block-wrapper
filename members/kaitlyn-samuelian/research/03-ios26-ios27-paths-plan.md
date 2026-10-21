# Parallel iOS 26 and iOS 27 Paths: Preservation and Experiment 1 Plan

Oct 21, 2026 · @KAITLYN

Builds on the [feasibility investigation](https://claude.ai/artifact/PRKqt8XBPfxC2drbXZW4Q8) and the [risk verification plan](https://claude.ai/artifact/98ibhMG4VXmHL1cedArLXn). Nothing in the repository has been changed.

## Summary

Your current devices can run a real Experiment 1 today. On iOS 26 that means a ReplayKit Broadcast Upload Extension. Xcode 26.1.1 can debug on your iOS 26.5.2 iPhone, and Apple's table lists on-device debugging for "iOS 15 or later". The iOS 27 ScreenCaptureKit path stays as a separate, documented future folder.

The proposal only **adds new files inside a personal folder** on your `kaitlyn-dev` branch, following the `members/<name>/` pattern your teammates already use. No existing file is edited, moved or deleted.

Three things need you before anything changes:

1. **Your local Git state.** I could inspect only what's pushed to GitHub. Your Mac may have uncommitted work. Run the read-only commands in the "What exists today" section and paste the output.
2. **Approval of the folder layout** in "Proposed organization".
3. **One choice:** add files to `kaitlyn-dev` as it is (recommended), or first merge `main` into it. `kaitlyn-dev` is 8 commits behind `main`. A merge would add teammates' files to your branch, but it changes nothing on `main`.

One new caution. In October 2026 an Apple DTS engineer called screen recording plus ML to detect the foreground app "fundamentally unsuitable". He added that switching to ScreenCaptureKit "doesn't change" that ([forum 837850](https://developer.apple.com/forums/thread/837850)). That doesn't stop the experiment. It does raise the App Store risk for both the iOS 26 and iOS 27 capture paths.

## Phase 1: What exists today

The group repository is [atreyusutton/screen-block-wrapper](https://github.com/atreyusutton/screen-block-wrapper). I inspected it through a read-only clone of the pushed branches as of 2026-10-21. I made no checkout on your machine and no writes.

| Branch | Last commit | Files | Relation to `main` |
| --- | --- | --- | --- |
| `main` | 2026-10-19, Atreyu: "add Atreyu's approach for this week" | `README.md` (web app + Screen Time plan), `.gitignore`, `members/owen-mcmahon/` | n/a |
| **`kaitlyn-dev`** (yours) | 2026-10-19, you: "Create kaitlyn-ideation.md" | `README.md` (old short version), `.gitignore`, `kaitlyn-ideation.md` | 1 commit ahead, 8 behind (branched from `e5c1758`) |
| `griffingallien/ios-research` | 2026-10-20 | adds `docs/research/ios-social-media-blocking-workarounds.md` (200 lines) | 1 ahead |
| `atreyu/prototype` | 2026-10-19 | `members/atreyu-sutton/` scaffold | older base |
| `owen/workspace` | 2026-10-20 | merged into `main` as PR #1 | merged |

**What I can't see:** your Mac's working tree. Run these read-only commands in the repo folder and paste the output:

```bash
git status
git branch -vv
git stash list
git log --oneline origin/kaitlyn-dev..HEAD
```

**Research that lives outside the repo today:**

- the [feasibility investigation](https://claude.ai/artifact/PRKqt8XBPfxC2drbXZW4Q8)
- the [risk verification plan](https://claude.ai/artifact/98ibhMG4VXmHL1cedArLXn)
- this plan

They are safe as Claude Docs, but they aren't in Git yet.

**Files that could be affected by the proposal:**

- No existing file, under the recommended option.
- If you choose the merge, `README.md` on your branch would update to `main`'s version, and `members/owen-mcmahon/` would appear. Both are fast-forward-style additions from teammates. Your `kaitlyn-ideation.md` doesn't exist on `main`, so it can't conflict.
- The root `.gitignore` lacks Xcode entries (`xcuserdata/`, `DerivedData/`). The proposal adds a *nested* `.gitignore` inside your folder rather than editing the shared one.

**Worth knowing:** Griffin's research branch independently found two products that use the same ReplayKit approach, WallHabit and the open-source Slowth. Slowth is GPLv3, so we should read it for ideas but not copy code unless the team accepts GPL terms.

## Which experiments target iOS 26 and which iOS 27

Only the capture plumbing is version-specific. Everything downstream of "we have a frame" works on either path.

| # (risk plan rank) | Experiment | iOS 26 (your iPhone, Xcode 26.1.1) | iOS 27 (needs macOS 26.6+, Xcode 27, iOS 27 iPhone) |
| --- | --- | --- | --- |
| 1 | Capture survival + Reels legibility | **Yes:** ReplayKit Broadcast Upload Extension (variant "1-R26") | Yes: ScreenCaptureKit in the main app (variant "1-S27"), future |
| 2 | Family Controls entitlement request + external TestFlight | Yes (path-neutral) | Yes |
| 3 | Web client: login, DMs, Reels removal | Yes (path-neutral) | Yes |
| 4 | Shield from the capturing process | Yes, but harder: the writer would be the *extension* (entitlement per extension) | Yes: the main app writes the shield |
| 5 | Cheap signals vs classifier | Yes: the dataset can come from 1-R26 | Yes; the same dataset is reused |
| 6 | Shield button routing (`.openParentalControlsApp`) | Needs the iOS 26.5 SDK: **Xcode 26.5 or later**, not 26.1.1 | Yes |
| 7 | ReplayKit fallback | Becomes experiment 1-R26 itself | n/a |

The earlier plan ran ReplayKit (old #7) only as a fallback. With your hardware it becomes the *first* capture experiment. That's a reorder, not a replacement: 1-S27 stays specified and runs when an iOS 27 device and Xcode 27 are available.

## Proposed organization and preservation strategy

The proposal is one new personal folder, mirroring `members/owen-mcmahon/`. The two capture paths sit side by side, and shared assets live in their own folder so neither path owns them.

```text
kaitlyn-ideation.md                      (unchanged, stays at the root)
members/kaitlyn-samuelian/               (NEW)
  README.md                              workspace rules + index of everything below
  .gitignore                             Xcode-only ignores (xcuserdata/, DerivedData/, *.xcuserstate)
  research/
    01-ios-feasibility-investigation.md  Markdown export of the first report + link to the live doc
    02-risk-verification-plan.md         export of the second report
    03-ios26-ios27-paths-plan.md         export of this plan
  experiments/
    README.md                            status table: experiment, target iOS, state, result link
    shared/
      test-protocol.md                   scripted sessions (Reels 30 min, lock, call, Low Power Mode)
      metrics.md                         pass/fail thresholds from the risk plan
      frame-log-format.md                NDJSON schema both paths write
    exp1-r26-replaykit/                  iOS 26 path (build first)
      README.md                          plan, setup steps, results log
      (Xcode project added only after you approve the code step)
    exp1-s27-screencapturekit/           iOS 27 path (documented, future)
      README.md                          full spec from the risk plan; prerequisites (macOS 26.6+, Xcode 27, iOS 27 device)
```

**Preservation rules I'd follow:**

- Additive commits only, on `kaitlyn-dev`. No `reset`, `rebase`, force-push, file moves or renames.
- The Claude Docs stay the live versions. The repo copies are snapshots, dated in their headers.
- Before any commit, compare your local `git status` against `origin/kaitlyn-dev`. If they differ, stop and ask.
- Nothing goes to `main`. Sharing with the team happens later through a pull request you open, matching the team's README convention.
- If the merge option is chosen, it's a normal `git merge origin/main` (no rebase), done only after you confirm a clean working tree.

**How I'd make the commits.** I can push to your branch from this session (your account has push access), or you can pull a patch and commit yourself. Pushing from here never touches your Mac's working tree. You'd run `git pull` when ready.

## Phase 2: Your setup and the iOS 26 ReplayKit path

Your setup works for the iOS 26 path. Two limits apply: Xcode 26.1.1 can't use APIs added in iOS 26.4 and 26.5, and the iOS 27 path needs a macOS update before Xcode 27 will install.

**Toolchain compatibility** ([Apple: Xcode versions](https://developer.apple.com/support/xcode)):

| Tool | Your version | What Apple's table says | Consequence |
| --- | --- | --- | --- |
| Xcode 26.1.1 | SDK iOS 26.1; on-device debugging "iOS 15 or later" | Builds and debugs on your iOS 26.5.2 iPhone | Fine for Experiment 1-R26. Can't call iOS 26.4/26.5 APIs (`.openParentalControlsApp`, shield submenus, `TokenExpiryMessage`) |
| macOS Tahoe 26.3.1 | Xcode 26.5/26.6 need Tahoe 26.2+ | You can update Xcode without a macOS update | Optional: Xcode 26.5+ for experiment 6 |
| macOS Tahoe 26.3.1 | Xcode 27 needs **Tahoe 26.6 or later** | Not installable yet | The iOS 27 path needs a macOS update, Xcode 27, and an iOS 27 iPhone (your phone would need to update) |

The first device run may still prompt Xcode to prepare the device or enable Developer Mode. That's normal, not a version problem (Inference).

**ReplayKit on iOS 26, against your four questions:**

1. **Capturing while Instagram is foreground.** Documented. A Broadcast Upload Extension receives whole-screen `CMSampleBuffer`s in [RPBroadcastSampleHandler](https://developer.apple.com/documentation/replaykit/rpbroadcastsamplehandler)'s `processSampleBuffer(_:with:)`. The user starts it from [RPSystemBroadcastPickerView](https://developer.apple.com/documentation/replaykit/rpsystembroadcastpickerview) or Control Center. There is no programmatic start: Apple DTS answered "No" ([forum 839450](https://developer.apple.com/forums/thread/839450)). FairPlay video is blacked out ([UIScreen.isCaptured](https://developer.apple.com/documentation/uikit/uiscreen/iscaptured)). Whether Reels is affected must be tested.
2. **Processing frames locally.** Documented that the frames arrive in the extension. The host app has no access to them ([Apple Platform Security](https://support.apple.com/guide/security/replaykit-security-seca5fc039dd/web)). So all analysis runs inside the extension, or the extension writes small derived data (thumbnails, metrics) to an App Group for the app to read.
3. **Keeping it running while you use other apps.** That's the extension's purpose: it runs in its own process while other apps are frontmost. Dev-reported: it stops when the phone locks (WallHabit reviews, cited in Griffin's research), and it ends when the user taps the red indicator. `broadcastFinished()` and `finishBroadcastWithError(_:)` let us log why it stopped.
4. **Memory, background, permissions, entitlements.**
   - **Memory:** about 50 MB for the extension (Dev-reported: [forum 837850](https://developer.apple.com/forums/thread/837850), [Fora Soft](https://www.forasoft.com/blog/article/how-to-implement-screen-sharing-in-ios-1193)). Exceed it and the system kills the extension.
   - **GPU:** may be unavailable in the extension, as for background apps (Inference). Plan for CPU.
   - **Permissions:** the system consent prompt when the broadcast starts. No usage-description key beyond the extension's `Info.plist` setup. No special entitlement for capture itself.
   - **App Group:** needed for app↔extension sharing.
   - **Family Controls:** needed only from step 2 of the experiment (the shield). Apple says it must be requested for each extension that uses it ([Requesting the entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement)).
   - **Account:** a paid Apple Developer account is the safe assumption. Free personal teams have capability limits, which I haven't verified for App Groups or Family Controls.
   - **Deprecation:** ReplayKit broadcast classes are deprecated as of the iOS 27 SDK. Building with Xcode 26.1.1 shows no deprecation warning, and the classes still run on iOS 26.

## How the paths differ, and what carries over

The paths differ in *where the frames live*. Most results carry over, because the test protocol, metrics, dataset and classifier don't care which API delivered the pixels.

| Aspect | iOS 26: ReplayKit extension | iOS 27: ScreenCaptureKit in the app |
| --- | --- | --- |
| Who receives frames | Separate extension process | Our main app |
| Start | `RPSystemBroadcastPickerView` or Control Center | `SCContentSharingPicker` |
| Memory | About 50 MB (dev-reported) | App budget (undocumented) |
| Keeps running | By design while other apps are in use; stops on lock (dev-reported) | Only with `screen-capture` background mode; screen-only survival undocumented |
| Who writes the shield | The extension (entitlement per extension) or a relay via the App Group | The main app directly |
| API status | Deprecated in the iOS 27 SDK, works on iOS 26 | Current |
| Frame throttling | Drop frames in `processSampleBuffer` | Drop frames in the handler (no `minimumFrameInterval` on iOS) |

**Reusable from the iOS 26 work:**

- the test protocol and the pass/fail thresholds
- the NDJSON frame-log format and the analysis script
- the labelled thumbnail dataset, plus any signal heuristics or Core ML model trained on it. Same pixels, so Reels frames look the same either way.
- the Shield Configuration and Shield Action extensions, plus the Family Controls setup
- whether Reels frames are legible at all (Reels' content protection doesn't depend on the capture API)
- the web client experiment

**Not reusable:**

- the capture plumbing
- the survival and lifecycle results (different process model)
- the memory budget
- the shield-from-extension finding

So a 1-R26 pass doesn't predict a 1-S27 pass, and vice versa.

## Phase 3: The minimal iOS 26 proof of concept (1-R26)

The smallest useful build is a host app with a broadcast button plus a broadcast extension that logs. It has no ML, no Family Controls and no shield. It answers U1 (survival and legibility) for iOS 26 with the fewest entitlements, and it produces the dataset for later steps.

**What it does:**

1. The host app shows one `RPSystemBroadcastPickerView` with `preferredExtension` set to our extension, plus a list of the last runs read from the App Group.
2. The extension keeps one frame every 2 seconds. For each kept frame it appends one NDJSON line to an App Group file with these fields:
   - timestamp
   - frame size
   - mean luminance (black-frame check)
   - a 16×16 difference hash (frames changing means content is moving)
   - the extension's memory footprint
   - the stop reason when the broadcast ends
3. Optionally, every 10 seconds it saves a 224 px JPEG thumbnail. This is off by default, because it captures private screens. Turn it on only for labelled sessions.

**Files that would be added** (all inside `members/kaitlyn-samuelian/experiments/exp1-r26-replaykit/`, none elsewhere):

| File | Contents |
| --- | --- |
| `README.md` | Goal, setup steps in Xcode (targets, App Group, signing), run protocol, results table |
| `Exp1R26.xcodeproj` | Xcode project with two targets, created in Xcode on your Mac. Xcode project files are best generated locally, then committed |
| `HostApp/` (2 Swift files + `Info.plist`) | SwiftUI screen with the picker button and run list |
| `BroadcastExtension/SampleHandler.swift` + `Info.plist` | `RPBroadcastSampleHandler` subclass doing the throttled logging |
| `Shared/FrameLog.swift` | Log record type + writer, shared by both targets |
| `*.entitlements` (2) | App Group entitlement only |
| `analysis/summarize.py` | Reads the NDJSON a run produces: computes gaps, black-frame ratio, peak memory, stop reasons |

No existing file would need changes. The only shared-file question is the root `.gitignore`, which the nested `.gitignore` sidesteps.

**Run protocol** (from the risk plan, adapted):

- 30 minutes of Instagram Reels
- feed and DMs for 5 minutes each (for comparison)
- lock and unlock
- an incoming call
- Low Power Mode
- record battery percentage at start and end

**Pass:**

- ≥95% of 2-second windows logged during the 30-minute Reels run
- non-black, changing frames
- peak memory under 40 MB (headroom under the reported 50 MB)

We also note exactly what ends the broadcast.

**Next steps, each needing your go-ahead:**

- 1-R26b: add a tiny Core ML or heuristic check to the extension, to measure CPU and memory under the 50 MB cap.
- 1-R26c: add Family Controls and attempt the shield write from the extension. This answers the old "set shield here?" question.

**Plan order once approved:**

1. You paste your local `git status` and choose merge or no merge.
2. I commit the folder skeleton and the research exports to `kaitlyn-dev` as one additive commit, and you review it on GitHub.
3. You create the Xcode project locally from the README steps. Or I write the Swift files for you to drop in. Your call when we get there.

## Sources

- [Apple: Xcode versions and supported OSes](https://developer.apple.com/support/xcode) · [ReplayKit](https://developer.apple.com/documentation/replaykit) · [RPBroadcastSampleHandler](https://developer.apple.com/documentation/replaykit/rpbroadcastsamplehandler) · [RPSystemBroadcastPickerView](https://developer.apple.com/documentation/replaykit/rpsystembroadcastpickerview) · [UIScreen.isCaptured](https://developer.apple.com/documentation/uikit/uiscreen/iscaptured) · [Requesting the Family Controls entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement) · [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit) · [ReplayKit security](https://support.apple.com/guide/security/replaykit-security-seca5fc039dd/web)
- Apple Developer Forums: [837850](https://developer.apple.com/forums/thread/837850) (DTS: no foreground-app API; capture approach "fundamentally unsuitable"; ReplayKit deprecated in Xcode 27) · [839450](https://developer.apple.com/forums/thread/839450) (no programmatic broadcast start)
- [Fora Soft: ReplayKit vs ScreenCaptureKit](https://www.forasoft.com/blog/article/how-to-implement-screen-sharing-in-ios-1193) · [Slowth README](https://raw.githubusercontent.com/skar404/slowth/main/README.md) (GPLv3)
- Repository: [atreyusutton/screen-block-wrapper](https://github.com/atreyusutton/screen-block-wrapper), branches as of 2026-10-21; Griffin's `docs/research/ios-social-media-blocking-workarounds.md` on `griffingallien/ios-research`
