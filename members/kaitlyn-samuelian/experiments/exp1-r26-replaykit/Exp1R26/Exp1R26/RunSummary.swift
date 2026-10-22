//
//  RunSummary.swift
//  Exp1R26
//

import Foundation

/// What one broadcast run looked like, computed from its log lines.
/// The pass/fail thresholds these feed are in experiments/shared/README.md.
struct RunSummary: Identifiable {
    let id: String
    let start: Date
    let end: Date
    let framesKept: Int
    let framesReceived: Int
    /// Frames that are dark and almost featureless, as a blacked-out (protected) frame would be.
    let blankFrames: Int
    /// Kept frames whose picture differs noticeably from the previous kept frame.
    let changedFrames: Int
    /// Longest silence between two consecutive log lines. Heartbeats come every 2 s while the extension runs.
    let longestGap: TimeInterval
    let peakMemoryMB: Double?
    /// Footprint + available memory: the extension's memory ceiling as iOS reports it.
    let memoryLimitMB: Double?
    let pauses: Int
    /// nil when the run has no finished line: iOS ended the extension another way, it crashed, or it's still running.
    let finishReason: String?
    let frameSize: String?
    let pixelFormat: String?

    var duration: TimeInterval { end.timeIntervalSince(start) }

    /// Share of 2-second windows with a kept frame (pass: ≥ 95% during the Reels run).
    var coverage: Double {
        guard duration > 0 else { return 0 }
        return min(1, Double(framesKept) * FrameLog.keepInterval / duration)
    }

    static func all(from records: [FrameLogRecord]) -> [RunSummary] {
        Dictionary(grouping: records, by: \.run)
            .compactMap { RunSummary(id: $0.key, records: $0.value.sorted { $0.time < $1.time }) }
            .sorted { $0.start > $1.start }
    }

    private init?(id: String, records: [FrameLogRecord]) {
        guard let first = records.first, let last = records.last else { return nil }
        let frames = records.filter { $0.event == .frame }
        let finished = records.last { $0.event == .finished }

        self.id = id
        start = first.time
        end = last.time
        framesKept = frames.count
        framesReceived = records.compactMap(\.framesReceived).max() ?? 0
        blankFrames = frames.filter { ($0.meanLuma ?? 255) < 20 && hashBits($0.dHash) <= 2 }.count
        changedFrames = zip(frames, frames.dropFirst()).filter { hammingDistance($0.dHash, $1.dHash) > 8 }.count
        longestGap = zip(records, records.dropFirst()).map { $1.time.timeIntervalSince($0.time) }.max() ?? 0
        peakMemoryMB = records.compactMap(\.memoryMB).max()
        memoryLimitMB = records.compactMap { record in
            record.memoryMB.flatMap { used in record.memoryAvailableMB.map { used + $0 } }
        }.max()
        pauses = records.filter { $0.event == .paused }.count
        finishReason = finished?.reason
        frameSize = frames.first.flatMap { frame in
            frame.width.flatMap { width in frame.height.map { "\(width)×\($0)" } }
        }
        pixelFormat = frames.first?.pixelFormat
    }
}

private func hashBits(_ hash: String?) -> Int {
    (hash ?? "").reduce(0) { $0 + ($1.hexDigitValue ?? 0).nonzeroBitCount }
}

private func hammingDistance(_ a: String?, _ b: String?) -> Int {
    guard let a, let b else { return 0 }
    return zip(a, b).reduce(0) { $0 + (($1.0.hexDigitValue ?? 0) ^ ($1.1.hexDigitValue ?? 0)).nonzeroBitCount }
}
