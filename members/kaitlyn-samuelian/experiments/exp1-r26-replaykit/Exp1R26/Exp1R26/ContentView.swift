//
//  ContentView.swift
//  Exp1R26
//
//  Created by Kaitlyn Samuelian on 10/22/26.
//

import ReplayKit
import SwiftUI

struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase
    @State private var runs: [RunSummary] = []
    @State private var logURL: URL?

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 16) {
                        BroadcastPicker()
                            .frame(width: 60, height: 60)
                        Text("Tap to start or stop the broadcast, then switch to Instagram. Stop it from the status bar or Control Center.")
                            .font(.subheadline)
                    }
                } footer: {
                    Text("Frames are measured on this iPhone and discarded. No images or audio are saved, and nothing is sent anywhere.")
                }

                Section("Runs (newest first)") {
                    if runs.isEmpty {
                        Text("No runs yet").foregroundStyle(.secondary)
                    }
                    ForEach(runs) { run in
                        RunRow(run: run)
                    }
                }
            }
            .navigationTitle("Exp 1-R26")
            .toolbar {
                if let logURL {
                    ShareLink(item: logURL)
                }
                Button("Refresh", systemImage: "arrow.clockwise", action: reload)
            }
            .refreshable { reload() }
            .onAppear(perform: reload)
            .onChange(of: scenePhase) { _, phase in
                if phase == .active { reload() }
            }
        }
    }

    private func reload() {
        runs = RunSummary.all(from: FrameLog.readAll())
        logURL = FrameLog.fileURL.flatMap { FileManager.default.fileExists(atPath: $0.path) ? $0 : nil }
    }
}

/// Apple's system broadcast button. iOS only starts a broadcast when the user taps it;
/// apps can't start one in code.
struct BroadcastPicker: UIViewRepresentable {
    func makeUIView(context: Context) -> RPSystemBroadcastPickerView {
        let picker = RPSystemBroadcastPickerView(frame: CGRect(x: 0, y: 0, width: 60, height: 60))
        picker.preferredExtension = Bundle.main.bundleIdentifier.map { $0 + ".BroadcastExtension" }
        picker.showsMicrophoneButton = false
        return picker
    }

    func updateUIView(_ uiView: RPSystemBroadcastPickerView, context: Context) {}
}

struct RunRow: View {
    let run: RunSummary

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(run.start, format: .dateTime.month().day().hour().minute().second())
                .font(.headline)
            Text("Duration \(Duration.seconds(run.duration).formatted(.time(pattern: .minuteSecond))) · coverage \(run.coverage, format: .percent.precision(.fractionLength(0)))")
            Text("Frames kept \(run.framesKept) of \(run.framesReceived) received · \(run.frameSize ?? "?") \(run.pixelFormat ?? "")")
            Text("Changed \(run.changedFrames) · blank \(run.blankFrames) · longest gap \(run.longestGap, format: .number.precision(.fractionLength(1))) s")
            Text("Memory peak \(mb(run.peakMemoryMB)) of ~\(mb(run.memoryLimitMB)) limit · pauses \(run.pauses)")
            Text(run.finishReason.map { "Ended: \($0)" } ?? "No finish line: stopped by iOS, crashed, or still running")
                .foregroundStyle(run.finishReason == nil ? .orange : .secondary)
        }
        .font(.subheadline)
        .padding(.vertical, 4)
    }

    private func mb(_ value: Double?) -> String {
        value.map { String(format: "%.1f MB", $0) } ?? "?"
    }
}

#Preview {
    ContentView()
}
