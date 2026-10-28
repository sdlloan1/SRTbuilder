import UIKit
import WebKit

final class TabController {

    private weak var host: UIViewController?
    private weak var webView: WKWebView?
    private let config: SRTConfig
    private var items: [[String: Any]] = []
    private var selected = 0

    init(host: UIViewController, webView: WKWebView, config: SRTConfig) {
        self.host = host
        self.webView = webView
        self.config = config
    }

    func set(_ list: [[String: Any]]) {
        items = list
        render()
    }

    func select(_ index: Int) {
        selected = index
        if let url = items[safe: index]?["url"] as? String, let u = URL(string: url) {
            webView?.load(URLRequest(url: u))
        }
        render()
    }

    func setBadge(_ index: Int, _ badge: String?) {
        if items.indices.contains(index) { items[index]["badge"] = badge }
        render()
    }

    func snapshot() -> [String: Any] { ["items": items, "selected": selected] }

    private func render() {
        let labels = items.map { ($0["label"] as? String ?? "") }
        guard let data = try? JSONSerialization.data(withJSONObject: labels),
              let json = String(data: data, encoding: .utf8) else { return }
        webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('srt:tabs',{detail:" + json + "}))")
    }
}

extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
