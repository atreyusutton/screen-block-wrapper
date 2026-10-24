//
//  BlockLog.swift
//  Exp3Web
//

import Foundation
import Observation

/// Counts what the web view kept out, by category only.
/// No usernames, message threads or URLs are stored.
@Observable
final class BlockLog {
    enum Category: String, CaseIterable {
        case reelsFeed, reelSwipe, explore, appLink, externalLink

        var label: String {
            switch self {
            case .reelsFeed: "Reels feed or Reels tab"
            case .reelSwipe: "Scrolled to another Reel"
            case .explore: "Explore grid"
            case .appLink: "Link to the Instagram app"
            case .externalLink: "Other website (opened in Safari)"
            }
        }
    }

    private static let defaultsKey = "BlockLog.counts"
    private(set) var counts: [Category: Int]

    /// Recent page types and video starts, newest first, for checking what the guard sees.
    /// Addresses are reduced to their shape (see `shape(of:)`) and kept in memory only.
    private(set) var recent: [String] = []

    init() {
        let saved = UserDefaults.standard.dictionary(forKey: Self.defaultsKey) as? [String: Int] ?? [:]
        counts = Dictionary(uniqueKeysWithValues: saved.compactMap { key, value in
            Category(rawValue: key).map { ($0, value) }
        })
    }

    /// Everything except links sent to Safari, which aren't blocks.
    var blockedTotal: Int {
        counts.filter { $0.key != .externalLink }.values.reduce(0, +)
    }

    func record(_ category: Category) {
        counts[category, default: 0] += 1
        save()
    }

    func reset() {
        counts = [:]
        recent = []
        save()
    }

    func note(_ entry: String) {
        recent.insert("\(Date.now.formatted(date: .omitted, time: .standard))  \(entry)", at: 0)
        if recent.count > 40 {
            recent.removeLast()
        }
    }

    /// An address with everything except Instagram's own path words replaced by {id},
    /// so usernames, post and thread IDs never appear: "/direct/t/{id}/", "/reel/{id}/".
    static func shape(of url: URL) -> String {
        let keywords: Set = [
            "direct", "inbox", "t", "reel", "reels", "explore", "search", "tags",
            "locations", "p", "stories", "highlights", "accounts", "tv",
        ]
        let parts = url.pathComponents
            .filter { $0 != "/" }
            .map { keywords.contains($0) ? $0 : "{id}" }
        return "/" + parts.map { $0 + "/" }.joined()
    }

    private func save() {
        UserDefaults.standard.set(
            Dictionary(uniqueKeysWithValues: counts.map { ($0.key.rawValue, $0.value) }),
            forKey: Self.defaultsKey
        )
    }
}
