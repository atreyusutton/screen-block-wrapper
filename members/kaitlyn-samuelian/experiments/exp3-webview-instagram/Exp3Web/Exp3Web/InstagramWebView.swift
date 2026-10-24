//
//  InstagramWebView.swift
//  Exp3Web
//

import Observation
import SwiftUI
import UIKit
import WebKit

/// Owns the WKWebView that shows instagram.com and keeps Reels and Explore out.
/// Layer 1 (address guard) is here; layer 2 (hidden links) is BlockReels.js.
@Observable
final class WebController: NSObject {
    static let home = URL(string: "https://www.instagram.com/")!
    static let inbox = URL(string: "https://www.instagram.com/direct/inbox/")!
    static let search = URL(string: "https://www.instagram.com/explore/search/")!

    let webView: WKWebView
    let blockLog = BlockLog()
    private(set) var canGoBack = false

    @ObservationIgnored private var started = false
    @ObservationIgnored private var lastAllowed: URL?
    @ObservationIgnored private var lastViewerExit: Date?
    @ObservationIgnored private var observations: [NSKeyValueObservation] = []

    override init() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        if let url = Bundle.main.url(forResource: "BlockReels", withExtension: "js"),
           let source = try? String(contentsOf: url, encoding: .utf8) {
            configuration.userContentController.addUserScript(
                WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            )
        }
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.allowsBackForwardNavigationGestures = true
        super.init()
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.configuration.userContentController.add(self, name: "exp3")

        // Instagram's site changes pages without reloading, which the navigation delegate
        // doesn't see. `url` updates on every address change, so the guard also runs here.
        observations = [
            webView.observe(\.url, options: [.new]) { [weak self] webView, _ in
                MainActor.assumeIsolated { self?.addressChanged(to: webView.url) }
            },
            webView.observe(\.canGoBack, options: [.new]) { [weak self] webView, _ in
                MainActor.assumeIsolated { self?.canGoBack = webView.canGoBack }
            },
        ]
    }

    /// Loads Instagram the first time the screen appears.
    func start() {
        guard !started else { return }
        started = true
        open(Self.home)
    }

    func open(_ url: URL) {
        webView.load(URLRequest(url: url))
    }

    func goBack() {
        webView.goBack()
    }

    // MARK: - Address guard

    private func addressChanged(to url: URL?) {
        guard let url, Self.isInstagram(url) else { return }
        blockLog.note(BlockLog.shape(of: url))
        if let category = Self.blockReason(for: url, after: lastAllowed) {
            blockLog.note("  ↳ blocked: \(category.label)")
            bounce(category)
        } else {
            lastAllowed = url
        }
    }

    private func bounce(_ category: BlockLog.Category) {
        blockLog.record(category)
        open(Self.inbox)
    }

    /// Closes Instagram's Reel viewer after a scrolled-to Reel. On a DM page, reloading
    /// closes the viewer and shows the chat again; anywhere else, go to the inbox.
    private func leaveReelViewer() {
        let now = Date.now
        if let lastViewerExit, now.timeIntervalSince(lastViewerExit) < 2 { return }
        lastViewerExit = now
        blockLog.record(.reelSwipe)
        if webView.url?.pathComponents.dropFirst().first == "direct" {
            webView.reload()
        } else {
            open(Self.inbox)
        }
    }

    /// Why an Instagram address should be blocked, or nil to allow it.
    /// `previous` is the last allowed address, used to spot swiping from one Reel to the next.
    static func blockReason(for url: URL, after previous: URL?) -> BlockLog.Category? {
        let parts = url.pathComponents.filter { $0 != "/" }
        guard let section = parts.first else { return nil }

        switch section {
        case "explore" where parts.count == 1:
            return .explore                          // the Explore grid; /explore/search/ stays allowed
        case "reels" where parts.count == 1:
            return .reelsFeed                        // the Reels feed
        case "reel", "reels":
            let previousParts = previous?.pathComponents.filter { $0 != "/" } ?? []
            let cameFromReel = ["reel", "reels"].contains(previousParts.first ?? "")
            return cameFromReel && previousParts != parts ? .reelSwipe : nil
        default:
            return parts.last == "reels" ? .reelsFeed : nil   // a profile's Reels tab
        }
    }

    static func isInstagram(_ url: URL) -> Bool {
        guard let host = url.host()?.lowercased() else { return false }
        return host == "instagram.com" || host.hasSuffix(".instagram.com")
    }

    /// Hosts the login flow may pass through.
    private static func isLoginHost(_ url: URL) -> Bool {
        guard let host = url.host()?.lowercased() else { return false }
        return host == "facebook.com" || host.hasSuffix(".facebook.com")
    }
}

extension WebController: WKNavigationDelegate {
    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping @MainActor @Sendable (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url,
              navigationAction.targetFrame?.isMainFrame ?? true else {
            decisionHandler(.allow)
            return
        }

        switch url.scheme {
        case "http", "https":
            if Self.isInstagram(url) {
                if let category = Self.blockReason(for: url, after: lastAllowed) {
                    decisionHandler(.cancel)
                    blockLog.note("\(BlockLog.shape(of: url)) blocked before loading")
                    bounce(category)
                } else {
                    decisionHandler(.allow)
                }
            } else if Self.isLoginHost(url) {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
                blockLog.record(.externalLink)
                UIApplication.shared.open(url)
            }
        case "about", "blob", "data":
            decisionHandler(.allow)
        default:
            // instagram:// and similar would leave our app for the native one.
            decisionHandler(.cancel)
            blockLog.record(.appLink)
        }
    }
}

extension WebController: WKUIDelegate {
    /// Links that ask for a new window load in this one, through the same guard.
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let url = navigationAction.request.url {
            open(url)
        }
        return nil
    }
}

extension WebController: WKScriptMessageHandler {
    /// BlockReels.js reports only whether a full-screen video was allowed or blocked.
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], body["type"] as? String == "video" else { return }
        switch body["decision"] as? String {
        case "allowed":
            blockLog.note("▶︎ full-screen video you tapped")
        case "blocked":
            blockLog.note("■ full-screen video reached by scrolling")
            leaveReelViewer()
        default:
            break
        }
    }
}

/// Shows the controller's web view in SwiftUI.
struct InstagramWebView: UIViewRepresentable {
    let controller: WebController

    func makeUIView(context: Context) -> WKWebView {
        controller.webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}
