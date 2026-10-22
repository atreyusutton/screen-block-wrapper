//
//  SampleHandler.swift
//  BroadcastExtension
//
//  Created by Kaitlyn Samuelian on 10/22/26.
//

import ReplayKit

/// ReplayKit runs this in its own process while a broadcast is on and hands it
/// every screen frame, even while another app (such as Instagram) is in front.
/// It only measures frames through FrameRecorder; it never saves or sends them.
class SampleHandler: RPBroadcastSampleHandler {

    private let recorder = FrameRecorder()

    override func broadcastStarted(withSetupInfo setupInfo: [String : NSObject]?) {
        recorder.start()
    }

    override func broadcastPaused() {
        recorder.log(.paused)
    }

    override func broadcastResumed() {
        recorder.log(.resumed)
    }

    override func broadcastFinished() {
        // Called when the broadcast is stopped normally (status-bar indicator or Control Center).
        // If iOS ends the extension any other way, there's no finished line; the app reports
        // that as "no finish line". Which interruptions call this is part of what we're testing.
        recorder.finish(reason: "broadcastFinished")
    }

    override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer, with sampleBufferType: RPSampleBufferType) {
        // App and microphone audio also arrive here. They're ignored, so no audio is recorded.
        guard sampleBufferType == .video else { return }
        recorder.offer(sampleBuffer)
    }
}
