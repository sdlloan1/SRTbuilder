import Foundation
import UIKit

struct SRTConfig {
    struct Site {
        var startUrl: String
        var userAgentSuffix: String
        var injectBridge: Bool
        var allowedBridgePaths: [String]
        var customCss: String
        var customJs: String
        var cookiePersistence: Bool
        var externalLinkMode: String
    }
    struct Theme {
        var statusBarColor: String
        var navigationBarColor: String
        var primaryColor: String
    }
    struct Deep {
        var enabled: Bool
        var scheme: String
    }

    var site: Site
    var theme: Theme
    var deepLink: Deep

    static func load() -> SRTConfig {
        guard
            let url = Bundle.main.url(forResource: "srt.config", withExtension: "json"),
            let data = try? Data(contentsOf: url),
            let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            return SRTConfig(
                site: Site(startUrl: "https://example.com", userAgentSuffix: "SRTBuilder/1.0",
                           injectBridge: true, allowedBridgePaths: [], customCss: "",
                           customJs: "", cookiePersistence: true, externalLinkMode: "in-app"),
                theme: Theme(statusBarColor: "#ffffff", navigationBarColor: "#ffffff", primaryColor: "#2563eb"),
                deepLink: Deep(enabled: false, scheme: "srtapp")
            )
        }

        let site = json["site"] as? [String: Any] ?? [:]
        let branding = json["branding"] as? [String: Any] ?? [:]
        let theme = branding["theme"] as? [String: Any] ?? [:]
        let deep = json["deepLink"] as? [String: Any] ?? [:]

        return SRTConfig(
            site: Site(
                startUrl: site["startUrl"] as? String ?? "https://example.com",
                userAgentSuffix: site["userAgentSuffix"] as? String ?? "",
                injectBridge: site["injectBridge"] as? Bool ?? true,
                allowedBridgePaths: site["allowedBridgePaths"] as? [String] ?? [],
                customCss: site["customCss"] as? String ?? "",
                customJs: site["customJs"] as? String ?? "",
                cookiePersistence: site["cookiePersistence"] as? Bool ?? true,
                externalLinkMode: site["externalLinkMode"] as? String ?? "in-app"
            ),
            theme: Theme(
                statusBarColor: theme["statusBarColor"] as? String ?? "#ffffff",
                navigationBarColor: theme["navigationBarColor"] as? String ?? "#ffffff",
                primaryColor: theme["primaryColor"] as? String ?? "#2563eb"
            ),
            deepLink: Deep(enabled: deep["enabled"] as? Bool ?? false, scheme: deep["scheme"] as? String ?? "srtapp")
        )
    }
}

extension UIColor {
    convenience init?(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        if s.hasPrefix("#") { s.removeFirst() }
        guard s.count == 6, let value = UInt32(s, radix: 16) else { return nil }
        self.init(
            red: CGFloat((value >> 16) & 0xFF) / 255,
            green: CGFloat((value >> 8) & 0xFF) / 255,
            blue: CGFloat(value & 0xFF) / 255,
            alpha: 1
        )
    }
}
