//
//  FrameLog.swift
//  Shared by the Exp1R26 app and BroadcastExtension.
//
//  The log format both sides agree on. The extension writes one JSON object
//  per line (NDJSON) into the App Group; the app reads the same file.
//  Fields follow experiments/shared/README.md ("Frame log format").
//

import Foundation

nonisolated enum FrameLog {
    /// The App Group both targets belong to (Signing & Capabilities › App Groups).
    static let appGroupID = "group.com.kaitlynsamuelian.Exp1R26"
    static let fileName = "frame-log.ndjson"

    /// Keep one frame, and write one heartbeat, every this many seconds.
    static let keepInterval: TimeInterval = 2

    static var fileURL: URL? {
        FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: appGroupID)?
            .appendingPathComponent(fileName)
    }

    static func makeEncoder() -> JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .secondsSince1970
        encoder.outputFormatting = .sortedKeys
        return encoder
    }

    static func makeDecoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .secondsSince1970
        return decoder
    }

    /// Every record in the log, oldest first. Lines that fail to decode are skipped.
    static func readAll() -> [FrameLogRecord] {
        guard let url = fileURL, let data = try? Data(contentsOf: url) else { return [] }
        let decoder = makeDecoder()
        return data.split(separator: UInt8(ascii: "\n")).compactMap {
            try? decoder.decode(FrameLogRecord.self, from: Data($0))
        }
    }
}

/// One line of the log. Optional fields are left out of the JSON when unused.
nonisolated struct FrameLogRecord: Codable, Sendable {
    enum Event: String, Codable, Sendable {
        case started, frame, heartbeat, paused, resumed, finished
    }

    var event: Event
    var run: String
    var time: Date
    var path = "r26"

    // .frame
    var width: Int?
    var height: Int?
    var pixelFormat: String?
    var meanLuma: Double?
    var dHash: String?

    // .frame, .heartbeat and .finished
    var framesReceived: Int?
    var framesKept: Int?
    var memoryMB: Double?
    var memoryAvailableMB: Double?

    // .finished
    var reason: String?
}
