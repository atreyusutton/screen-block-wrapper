//
//  FrameRecorder.swift
//  BroadcastExtension
//

import CoreMedia
import CoreVideo
import Darwin
import Foundation
import os
import Synchronization

/// Keeps one frame every `FrameLog.keepInterval` seconds and logs numbers about it.
/// Pixels are read in place and never copied, saved or sent.
///
/// ReplayKit only delivers frames when the screen changes, so a heartbeat is
/// also logged on the same interval. A gap in heartbeats means the extension
/// stopped running; a gap in frames alone may just mean the screen was still.
final class FrameRecorder: Sendable {
    private struct State {
        var run = ""
        var received = 0
        var kept = 0
        var lastKeptUptime: TimeInterval = -.infinity
        var heartbeat: Task<Void, Never>?
    }

    private let state = Mutex(State())
    private let writer = FrameLogWriter()

    func start() {
        let run = String(UUID().uuidString.prefix(8))
        let heartbeat = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(FrameLog.keepInterval))
                guard let self else { return }
                self.logHeartbeat()
            }
        }
        state.withLock { $0 = State(run: run, heartbeat: heartbeat) }
        writer.append(FrameLogRecord(event: .started, run: run, time: .now))
    }

    func log(_ event: FrameLogRecord.Event) {
        let run = state.withLock { $0.run }
        writer.append(FrameLogRecord(event: event, run: run, time: .now))
    }

    func finish(reason: String) {
        let (run, received, kept, heartbeat) = state.withLock { ($0.run, $0.received, $0.kept, $0.heartbeat) }
        heartbeat?.cancel()
        var record = FrameLogRecord(event: .finished, run: run, time: .now)
        record.framesReceived = received
        record.framesKept = kept
        record.reason = reason
        writer.append(record)
        writer.flush()
    }

    /// Called for every video frame. Most are only counted; one per interval is measured.
    func offer(_ sampleBuffer: CMSampleBuffer) {
        let now = ProcessInfo.processInfo.systemUptime
        let kept: (run: String, received: Int, kept: Int)? = state.withLock { state in
            state.received += 1
            guard now - state.lastKeptUptime >= FrameLog.keepInterval else { return nil }
            state.lastKeptUptime = now
            state.kept += 1
            return (state.run, state.received, state.kept)
        }
        guard let kept, let pixels = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }

        var record = FrameLogRecord(event: .frame, run: kept.run, time: .now)
        record.width = CVPixelBufferGetWidth(pixels)
        record.height = CVPixelBufferGetHeight(pixels)
        record.pixelFormat = fourCC(CVPixelBufferGetPixelFormatType(pixels))
        if let stats = FrameStats(pixels) {
            record.meanLuma = stats.meanLuma
            record.dHash = stats.dHash
        }
        record.framesReceived = kept.received
        record.framesKept = kept.kept
        addMemory(to: &record)
        writer.append(record)
    }

    private func logHeartbeat() {
        let (run, received, kept) = state.withLock { ($0.run, $0.received, $0.kept) }
        var record = FrameLogRecord(event: .heartbeat, run: run, time: .now)
        record.framesReceived = received
        record.framesKept = kept
        addMemory(to: &record)
        writer.append(record)
    }

    /// The extension's memory footprint, and how much more iOS will let it use.
    /// Footprint + available ≈ the extension's memory limit (reported to be about 50 MB).
    private func addMemory(to record: inout FrameLogRecord) {
        var info = task_vm_info_data_t()
        var count = mach_msg_type_number_t(MemoryLayout<task_vm_info_data_t>.size / MemoryLayout<integer_t>.size)
        let result = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
                task_info(mach_task_self_, task_flavor_t(TASK_VM_INFO), $0, &count)
            }
        }
        if result == KERN_SUCCESS {
            record.memoryMB = Double(info.phys_footprint) / 1_048_576
        }
        record.memoryAvailableMB = Double(os_proc_available_memory()) / 1_048_576
    }
}

/// Mean brightness (0–255) and a 16×16 difference hash, read straight from the frame.
/// The frame is split into a 17×16 grid; each cell's brightness is the average of 16 sample points.
/// Each hash bit says whether a cell is darker than its right-hand neighbour, so the hash
/// changes when the picture changes and is all zeros for a uniform (e.g. blacked-out) frame.
private struct FrameStats {
    var meanLuma: Double
    var dHash: String

    init?(_ pixels: CVPixelBuffer) {
        CVPixelBufferLockBaseAddress(pixels, .readOnly)
        defer { CVPixelBufferUnlockBaseAddress(pixels, .readOnly) }

        let base: UnsafeRawPointer
        let bytesPerRow, width, height: Int
        let luma: (UnsafeRawPointer) -> Int

        switch CVPixelBufferGetPixelFormatType(pixels) {
        case kCVPixelFormatType_420YpCbCr8BiPlanarFullRange, kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange:
            // Plane 0 is brightness (Y), one byte per pixel.
            guard let plane = CVPixelBufferGetBaseAddressOfPlane(pixels, 0) else { return nil }
            base = UnsafeRawPointer(plane)
            bytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(pixels, 0)
            width = CVPixelBufferGetWidthOfPlane(pixels, 0)
            height = CVPixelBufferGetHeightOfPlane(pixels, 0)
            luma = { Int($0.load(as: UInt8.self)) }
        case kCVPixelFormatType_32BGRA:
            guard let address = CVPixelBufferGetBaseAddress(pixels) else { return nil }
            base = UnsafeRawPointer(address)
            bytesPerRow = CVPixelBufferGetBytesPerRow(pixels)
            width = CVPixelBufferGetWidth(pixels)
            height = CVPixelBufferGetHeight(pixels)
            luma = { pixel in
                let b = Int(pixel.load(fromByteOffset: 0, as: UInt8.self))
                let g = Int(pixel.load(fromByteOffset: 1, as: UInt8.self))
                let r = Int(pixel.load(fromByteOffset: 2, as: UInt8.self))
                return (77 * r + 150 * g + 29 * b) >> 8
            }
        default:
            return nil
        }

        let columns = 17, rows = 16, samples = 4
        let bytesPerPixel = CVPixelBufferGetPixelFormatType(pixels) == kCVPixelFormatType_32BGRA ? 4 : 1
        let cellWidth = width / columns, cellHeight = height / rows
        guard cellWidth >= samples, cellHeight >= samples else { return nil }

        var cells = [Int](repeating: 0, count: columns * rows)
        for row in 0..<rows {
            for column in 0..<columns {
                var sum = 0
                for sy in 0..<samples {
                    for sx in 0..<samples {
                        let x = column * cellWidth + (2 * sx + 1) * cellWidth / (2 * samples)
                        let y = row * cellHeight + (2 * sy + 1) * cellHeight / (2 * samples)
                        sum += luma(base + y * bytesPerRow + x * bytesPerPixel)
                    }
                }
                cells[row * columns + column] = sum / (samples * samples)
            }
        }

        meanLuma = Double(cells.reduce(0, +)) / Double(cells.count)

        var bytes = [UInt8](repeating: 0, count: rows * (columns - 1) / 8)
        for row in 0..<rows {
            for column in 0..<(columns - 1) where cells[row * columns + column] < cells[row * columns + column + 1] {
                let bit = row * (columns - 1) + column
                bytes[bit / 8] |= 1 << (bit % 8)
            }
        }
        dHash = bytes.map { String(format: "%02x", $0) }.joined()
    }
}

/// A pixel format code as its four-letter name, e.g. "420f" or "BGRA".
private func fourCC(_ code: OSType) -> String {
    let bytes = [24, 16, 8, 0].map { UInt8((code >> $0) & 0xFF) }
    return String(decoding: bytes, as: UTF8.self)
}
