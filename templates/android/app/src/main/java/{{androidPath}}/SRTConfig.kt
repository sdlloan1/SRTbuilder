package {{androidPackage}}

import android.content.Context
import org.json.JSONObject

data class SRTConfig(
    val site: Site,
    val branding: Branding,
    val navigation: Nav,
    val deepLink: Deep,
) {
    data class Site(
        val startUrl: String,
        val userAgentSuffix: String,
        val injectBridge: Boolean,
        val allowedBridgePaths: List<String>,
        val customCss: String,
        val customJs: String,
        val cookiePersistence: Boolean,
        val externalLinkMode: String,
    )
    data class Branding(val theme: Theme)
    data class Theme(val statusBarColor: String, val navigationBarColor: String, val primaryColor: String)
    data class Nav(val mode: String, val title: String)
    data class Deep(val enabled: Boolean, val scheme: String)

    companion object {
        fun fromAssets(context: Context): SRTConfig {
            val raw = context.assets.open("srt.config.json").bufferedReader().use { it.readText() }
            val json = JSONObject(raw)

            val site = json.getJSONObject("site")
            val theme = json.getJSONObject("branding").getJSONObject("theme")
            val nav = json.getJSONObject("navigation")
            val deep = json.getJSONObject("deepLink")

            val paths = mutableListOf<String>()
            val arr = site.optJSONArray("allowedBridgePaths")
            if (arr != null) for (i in 0 until arr.length()) paths.add(arr.getString(i))

            return SRTConfig(
                site = Site(
                    startUrl = site.getString("startUrl"),
                    userAgentSuffix = site.optString("userAgentSuffix"),
                    injectBridge = site.optBoolean("injectBridge", true),
                    allowedBridgePaths = paths,
                    customCss = site.optString("customCss"),
                    customJs = site.optString("customJs"),
                    cookiePersistence = site.optBoolean("cookiePersistence", true),
                    externalLinkMode = site.optString("externalLinkMode", "in-app"),
                ),
                branding = Branding(
                    Theme(
                        theme.optString("statusBarColor", "#ffffff"),
                        theme.optString("navigationBarColor", "#ffffff"),
                        theme.optString("primaryColor", "#2563eb"),
                    ),
                ),
                navigation = Nav(nav.optString("mode", "none"), nav.optString("title")),
                deepLink = Deep(deep.optBoolean("enabled", false), deep.optString("scheme", "srtapp")),
            )
        }
    }
}
