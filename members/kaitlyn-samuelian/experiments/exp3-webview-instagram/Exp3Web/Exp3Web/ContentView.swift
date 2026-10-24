//
//  ContentView.swift
//  Exp3Web
//
//  Created by Kaitlyn Samuelian on 10/24/26.
//

import SwiftUI

struct ContentView: View {
    @State private var web = WebController()
    @State private var showingLog = false

    var body: some View {
        InstagramWebView(controller: web)
            .safeAreaInset(edge: .bottom) {
                HStack {
                    Button("Back", systemImage: "chevron.backward", action: web.goBack)
                    .disabled(!web.canGoBack)
                    Spacer()
                    Button("Messages", systemImage: "paperplane") {
                        web.open(WebController.inbox)
                    }
                    Spacer()
                    Button("Search", systemImage: "magnifyingglass") {
                        web.open(WebController.search)
                    }
                    Spacer()
                    Button {
                        showingLog = true
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "hand.raised")
                            Text("\(web.blockLog.blockedTotal)")
                                .monospacedDigit()
                        }
                    }
                    .accessibilityLabel("Blocked \(web.blockLog.blockedTotal)")
                }
                .labelStyle(.iconOnly)
                .font(.title3)
                .padding(.horizontal, 24)
                .padding(.vertical, 10)
                .background(.bar)
            }
            .task { web.start() }
            .sheet(isPresented: $showingLog) {
                BlockLogView(log: web.blockLog)
            }
    }
}

struct BlockLogView: View {
    let log: BlockLog
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(BlockLog.Category.allCases, id: \.self) { category in
                        LabeledContent(category.label, value: "\(log.counts[category, default: 0])")
                    }
                } footer: {
                    Text("Counts only. No usernames, messages or addresses are stored.")
                }
                Section {
                    if log.recent.isEmpty {
                        Text("Nothing yet").foregroundStyle(.secondary)
                    }
                    ForEach(Array(log.recent.enumerated()), id: \.offset) { _, entry in
                        Text(entry)
                            .font(.caption.monospaced())
                    }
                } header: {
                    Text("Recent pages (newest first)")
                } footer: {
                    Text("Page types only: usernames and IDs show as {id}. Kept in memory, cleared when the app closes.")
                }
                Section {
                    Button("Reset counts", role: .destructive, action: log.reset)
                }
            }
            .navigationTitle("Kept out")
            .toolbar {
                Button("Done") { dismiss() }
            }
        }
    }
}

#Preview {
    ContentView()
}
