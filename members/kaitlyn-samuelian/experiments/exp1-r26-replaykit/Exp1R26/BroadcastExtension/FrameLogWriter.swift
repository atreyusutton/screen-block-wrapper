//
//  FrameLogWriter.swift
//  BroadcastExtension
//

import Foundation
import os

/// Appends records to the shared log file on a private serial queue.
/// Each line also goes to the system log, so a run can be watched live in
/// the Mac's Console app (filter: subsystem com.kaitlynsamuelian.Exp1R26).
final class FrameLogWriter: @unchecked Sendable {
    // `handle` and `encoder` are only touched on `queue`.
    private let queue = DispatchQueue(label: "FrameLogWriter")
    private var handle: FileHandle?
    private let encoder = FrameLog.makeEncoder()
    private let logger = Logger(subsystem: "com.kaitlynsamuelian.Exp1R26", category: "broadcast")

    func append(_ record: FrameLogRecord) {
        queue.async { [self] in
            guard let line = try? encoder.encode(record) else { return }
            logger.log("\(String(decoding: line, as: UTF8.self), privacy: .public)")
            do {
                let handle = try openHandle()
                try handle.seekToEnd()
                try handle.write(contentsOf: line + [UInt8(ascii: "\n")])
            } catch {
                logger.error("Log write failed: \(error.localizedDescription, privacy: .public)")
            }
        }
    }

    /// Waits until queued records are on disk, so the last lines survive the extension exiting.
    func flush() {
        queue.sync { try? handle?.synchronize() }
    }

    private func openHandle() throws -> FileHandle {
        if let handle { return handle }
        guard let url = FrameLog.fileURL else { throw CocoaError(.fileNoSuchFile) }
        if !FileManager.default.fileExists(atPath: url.path) {
            // Writable while the phone is locked, so lock/unlock tests don't lose lines.
            FileManager.default.createFile(
                atPath: url.path,
                contents: nil,
                attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication]
            )
        }
        let opened = try FileHandle(forWritingTo: url)
        handle = opened
        return opened
    }
}
