package {{androidPackage}}

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import org.json.JSONObject

class SRTWebViewClient(
    private val activity: MainActivity,
    private val config: SRTConfig,
    private val bridge: SRTBridge,
) : WebViewClient() {

    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        val url = request.url.toString()

        if (url.startsWith("srt://")) return bridge.handle(url)

        if (config.deepLink.enabled && url.startsWith(config.deepLink.scheme + "://")) {
            view.loadUrl(url.replace(config.deepLink.scheme + "://", config.site.startUrl))
            return true
        }

        val sameOrigin = Uri.parse(url).host == Uri.parse(config.site.startUrl).host
        if (!sameOrigin && config.site.externalLinkMode == "system-browser") {
            activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
            return true
        }

        return false
    }

    override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        if (config.site.injectBridge && !url.startsWith("srt://")) {
            view.evaluateJavascript(BridgeAssets.read(activity), null)
        }
    }

    override fun onPageFinished(view: WebView, url: String) {
        super.onPageFinished(view, url)
        if (config.site.customCss.isNotBlank()) {
            view.evaluateJavascript(
                "var s=document.createElement('style');s.textContent=" +
                    JSONObject.quote(config.site.customCss) +
                    ";document.head.appendChild(s);",
                null,
            )
        }
        if (config.site.customJs.isNotBlank()) {
            view.evaluateJavascript(config.site.customJs, null)
        }
    }
}

object BridgeAssets {
    fun read(activity: MainActivity): String =
        activity.assets.open("srt-bridge.js").bufferedReader().use { it.readText() }
}

class SRTChromeClient(private val activity: MainActivity) : android.webkit.WebChromeClient() {
    override fun onPermissionRequest(request: android.webkit.PermissionRequest) {
        activity.runOnUiThread { request.grant(request.resources) }
    }
}
