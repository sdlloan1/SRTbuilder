import UIKit
import WebKit

final class WebViewController: UIViewController, WKNavigationDelegate {

    private var webView: WKWebView!
    private var bridge: SRTBridge!
    private var tabs: TabController!
    private let config = SRTConfig.load()

    override var preferredStatusBarStyle: UIStatusBarStyle { SRTStatusStyle.shared.style }
    override var prefersStatusBarHidden: Bool { SRTStatusStyle.shared.hidden }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(hex: config.theme.statusBarColor)

        let webConfig = WKWebViewConfiguration()
        webConfig.allowsInlineMediaPlayback = true
        webConfig.applicationNameForUserAgent = config.site.userAgentSuffix

        webView = WKWebView(frame: view.bounds, configuration: webConfig)
        webView.navigationDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)

        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])

        tabs = TabController(host: self, webView: webView, config: config)
        bridge = SRTBridge(webView: webView, host: self, config: config, tabs: tabs)

        webView.load(URLRequest(url: URL(string: config.site.startUrl)!))
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        guard config.site.injectBridge, let js = BridgeAssets.source else { return }
        webView.evaluateJavaScript(js)
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor action: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = action.request.url else { return decisionHandler(.allow) }

        if url.scheme == "srt" {
            bridge.handle(url)
            return decisionHandler(.cancel)
        }

        if config.deepLink.enabled, url.scheme == config.deepLink.scheme {
            let mapped = url.absoluteString.replacingOccurrences(
                of: config.deepLink.scheme + "://", with: config.site.startUrl
            )
            if let u = URL(string: mapped) { webView.load(URLRequest(url: u)) }
            return decisionHandler(.cancel)
        }

        let sameHost = url.host == URL(string: config.site.startUrl)?.host
        if !sameHost, config.site.externalLinkMode == "system-browser", action.navigationType == .linkActivated {
            UIApplication.shared.open(url)
            return decisionHandler(.cancel)
        }

        decisionHandler(.allow)
    }
}
