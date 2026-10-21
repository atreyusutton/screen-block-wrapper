# Kaitlyn Samuelian — workspace

This folder is Kaitlyn's personal space in the Wrapper project. It holds the iOS research on detecting and interrupting short-form scrolling (Instagram Reels, YouTube Shorts, TikTok), and the experiments that test it on a real iPhone. Keeping it here means none of it collides with anyone else's files.

## Rules I follow so my edits don't affect the team

- I work on my own branch (`kaitlyn-dev`), never directly on `main`.
- Day-to-day work stays inside `members/kaitlyn-samuelian/`.
- Changes are additive: no moving, renaming or deleting existing files, and no `reset`, `rebase` or force-push.
- Anything that touches shared files outside this folder goes through a pull request so the team can review it before it reaches `main`.
- My earlier brainstorm, [`kaitlyn-ideation.md`](../../kaitlyn-ideation.md), stays where it is at the repo root.

## Research

Snapshots of three reports written on 2026-10-21. Each builds on the one before it.

| # | Report | What it answers |
| --- | --- | --- |
| 01 | [iOS feasibility investigation](research/01-ios-feasibility-investigation.md) | What iOS allows at all. No public API can block only the Reels view inside the native Instagram app. The closest native option is "detect short-form by screen capture, then shield the whole app". View-level removal is possible only where we own the renderer (Safari Web Extension or our own WKWebView). Includes the framework table, the feasibility matrix, prior art, and an audit of Option E from the ideation doc. |
| 02 | [Risk verification plan](research/02-risk-verification-plan.md) | A skeptical second pass. Corrects six over-optimistic claims, defines the five uncertainties (U1–U5) that decide which architectures survive, and ranks the experiments by how much each can rule out. |
| 03 | [iOS 26 / iOS 27 paths plan](research/03-ios26-ios27-paths-plan.md) | How to run Experiment 1 on the hardware I have today (iOS 26, ReplayKit) while keeping the iOS 27 ScreenCaptureKit path as a separate, fully specified experiment. Proposes this folder layout. |

The live versions of these reports are Claude Docs (linked inside each file). The copies here are snapshots and are not edited after they're added. Corrections go in a new dated file, never in place.

## Experiments

Both capture paths are kept. The iOS 26 path runs first only because it's the one my current devices support. The iOS 27 path is not a fallback and has not been dropped.

| Folder | Experiment | Target | Status |
| --- | --- | --- | --- |
| [`experiments/shared/`](experiments/shared/README.md) | Test protocol, metrics, pass/fail thresholds and log format used by both paths | Both | Documented |
| [`experiments/exp1-r26-replaykit/`](experiments/exp1-r26-replaykit/README.md) | 1-R26: capture survival + Reels legibility with a ReplayKit Broadcast Upload Extension | iOS 26.5.2 iPhone, Xcode 26.1.1 | Planned, ready to build |
| [`experiments/exp1-s27-screencapturekit/`](experiments/exp1-s27-screencapturekit/README.md) | 1-S27: the same test with ScreenCaptureKit in the main app | iOS 27 iPhone, Xcode 27, macOS Tahoe 26.6+ | Specified, waiting on toolchain |

No implementation code has been written yet.

## Folder layout

- `research/` — the three research reports (snapshots)
- `experiments/shared/` — protocol and metrics shared by every experiment
- `experiments/exp1-r26-replaykit/` — iOS 26 ReplayKit path
- `experiments/exp1-s27-screencapturekit/` — iOS 27 ScreenCaptureKit path
