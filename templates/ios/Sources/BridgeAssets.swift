import Foundation

/// The bridge JS is bundled into the app at build time and re-injected
/// on every navigation. Mirrors the Android asset-loading path.
enum BridgeAssets {
    static let source: String? = {
        guard
            let url = Bundle.main.url(forResource: "srt-bridge", withExtension: "js"),
            let js = try? String(contentsOf: url, encoding: .utf8)
        else { return nil }
        return js
    }()
}
