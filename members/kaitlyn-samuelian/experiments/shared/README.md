# Shared experiment protocols and metrics

These apply to every capture experiment, on both the iOS 26 path ([1-R26](../exp1-r26-replaykit/README.md)) and the iOS 27 path ([1-S27](../exp1-s27-screencapturekit/README.md)). Keeping one protocol and one set of thresholds means the two paths can be compared directly.

Sources: [risk verification plan](../../research/02-risk-verification-plan.md) (U1–U5, ranked experiments) and the [iOS 26 / iOS 27 paths plan](../../research/03-ios26-ios27-paths-plan.md) (Phase 3 run protocol).

## Evidence labels

Use these when writing up results, so a finding's strength is always visible:

- **Confirmed:** Apple states it and it is shipping, or we saw it work on our device.
- **Documented, untested:** Apple states it, but we haven't seen it work for our use.
- **Dev-reported:** Apple Developer Forums, vendor blogs or prior-art apps.
- **Inference:** our reasoning from documented behavior.
- **Unknown:** no evidence either way.
- **Prohibited/unavailable:** no public API, or the docs or guidelines rule it out.

## The five uncertainties

Every experiment exists to settle one or more of these. They are ordered by how much of the design space each can eliminate.

| ID | Question | Can eliminate |
| --- | --- | --- |
| U1 | Does the capture process stay alive in the background and see real Reels pixels? | Native detection (architecture A) |
| U2 | Can the capturing process trigger a Screen Time shield quickly and reliably? | Real-time blocking (nudges remain) |
| U3 | Can cheap signals (swipe cadence, layout/OCR cues) or a small classifier separate short-form use and compulsive scrolling? | Strict interventions (nudges remain) |
| U4 | Is a Reels-free web client (WKWebView) good enough to be the useful path? | The Instagram web path |
| U5 | Will Apple allow it (App Review, Family Controls distribution)? | App Store distribution of A, not research value |

## Scripted session protocol

Run the same script on every capture variant. Record the device, iOS version, build type (Xcode debug or TestFlight) and battery percentage at the start and end of each step.

1. **Idle baseline.** Phone unlocked with no capture running, for the same length of time as step 2. This gives the battery baseline.
2. **Reels run.** Start capture, switch to Instagram, scroll Reels for 30 minutes.
3. **Comparison states.** Instagram feed for 5 minutes, then Instagram DMs for 5 minutes.
4. **Lock and unlock.** Lock the phone, wait, unlock. Note whether capture resumes without user action.
5. **Incoming call.** Receive a call during capture.
6. **Low Power Mode.** Turn it on during capture.
7. **Longer survival (optional).** Leave capture running and note when and why it stops.

For every stop, record the exact cause the API reports (see each path's README for the callbacks and error codes) and what the user saw.

### Labelled sessions (for U3)

Only when building a dataset: record about 2 hours of labelled sessions from two people, keeping 1 frame per second as small thumbnails with manual labels. Cover IG Reels, IG feed, IG DMs, YT Shorts, YT long video, TikTok and other apps. Hold out one person's sessions, or a different day's, for testing.

Thumbnail saving captures private screens. It stays off by default and is turned on only for these labelled sessions.

## Metrics and pass/fail thresholds

The thresholds come from the risk plan. Battery is our own threshold and should be recalibrated after the first run.

### U1: survival and legibility (Experiment 1, both paths)

| Metric | Pass | Fail |
| --- | --- | --- |
| Frame coverage during the 30-minute background Reels run | ≥95% of 2-second windows contain a logged frame | Capture stops within 10 minutes in the background |
| Frame content | Reels frames are non-black and change from frame to frame | Frames are black or blank |
| Resume after unlock | Resumes without user action | Requires the user to restart capture (partial pass: "session mode") |
| Battery | ≤ about 8 percentage points per hour above the idle baseline | Clearly above that |
| Memory (iOS 26 extension only) | Peak under 40 MB, leaving headroom under the reported ~50 MB cap | Extension killed for memory |

Outcomes:

- **Pass** keeps the native-detection branch alive on that path.
- **Partial pass** (for example, dies on lock) turns it into a "session mode" watcher that the user starts per scrolling session.
- **Fail** removes continuous native detection on that path. It doesn't affect the web, intent-gate or Safari branches. An audio-session keep-alive is **not** an acceptable workaround (guideline 2.5.4 and user trust).

### U2: shield from the capturing process

| Metric | Pass |
| --- | --- |
| Latency from trigger to visible shield over Instagram | Median ≤ 2 s, p95 ≤ 5 s |
| Shield applies | ≥ 19 of 20 attempts, in both a debug build and a TestFlight build |
| Unshield from a `ShieldActionDelegate` button | ≥ 19 of 20 attempts |

Measure latency from a screen recording with a visible clock. Fail means inconsistent application, or long or variable delays. Detection then falls back to nudges or delayed policy changes.

### U3: detection quality

| Metric | Pass | Fail |
| --- | --- | --- |
| Precision of the short-form label on a held-out person | ≥ 90% | < 80% |
| Time to detect after entering a short-form feed | ≤ 10 s | — |
| Average CPU | ≤ 5% | Enough to fail U1's battery threshold |

Try the cheap signals first (frame-difference swipe cadence, Vision text cues). Train a classifier only if they miss. High precision allows strict interventions. Moderate precision allows only soft nudges, because a false shield while someone is messaging destroys trust.

### U4: web client

Pass: login works (including 2FA), DMs send and receive, zero Reels exposure over a 3-day live trial, and at most 1 breakage. Fail: login is blocked, or DMs are unusable on mobile web.

### U5: App Store

Pass: the Family Controls distribution entitlement is assigned and an external TestFlight beta is approved. Fail: rejection citing background-mode misuse or privacy. Rejection ends App Store shipping for branch A, not the research prototype. Start this in week 1; it takes calendar time.

## Frame log format

Both paths should write the same log so one analysis script reads either. One JSON object per line (NDJSON), appended for each kept frame (1 every 2 seconds):

| Field | Meaning |
| --- | --- |
| timestamp | When the frame was kept |
| frame size | Width and height of the delivered frame |
| mean luminance | Black-frame check |
| difference hash | 16×16 hash; changing values mean content is moving |
| memory footprint | The capturing process's memory at that moment |
| path | `r26` or `s27`, so runs can be compared |

When capture ends, append a final line with the stop reason. Field names and types get fixed when the code is written. Logs store derived numbers only, never frames, unless a labelled session has turned thumbnails on.

## What carries over between paths

Reusable whichever path produced it: this protocol and these thresholds, the log format and analysis script, the labelled dataset and any model trained on it, the Shield Configuration and Shield Action extensions plus the Family Controls setup, whether Reels pixels are legible at all, and the web client experiment.

Not reusable: the capture plumbing, the survival and lifecycle results, the memory budget, and any shield-from-extension finding. **A 1-R26 pass doesn't predict a 1-S27 pass, and vice versa.** Both must be run.
