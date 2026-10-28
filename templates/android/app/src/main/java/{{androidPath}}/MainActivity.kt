package {{androidPackage}}

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var bridge: SRTBridge
    private lateinit var tabs: TabController

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val config = SRTConfig.fromAssets(this)
        tabs = TabController(this, config)

        webView = findViewById(R.id.webview)
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            setSupportZoom({{interface.zoom}})
            builtInZoomControls = {{interface.zoom}}
            displayZoomControls = false
            userAgentString = "$userAgentString ${config.site.userAgentSuffix}"
        }

        bridge = SRTBridge(this, webView, config, tabs)
        webView.webViewClient = SRTWebViewClient(this, config, bridge)
        webView.webChromeClient = SRTChromeClient(this)

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(config.site.startUrl)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }
}
