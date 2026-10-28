package {{androidPackage}}

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.WindowManager
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale
import java.util.UUID

/**
 * Handles every srt://module/function command coming from the injected bridge.
 * One entry point, strict module dispatch, JSON in / JSON out.
 */
class SRTBridge(
    private val activity: AppCompatActivity,
    private val webView: WebView,
    private val config: SRTConfig,
    private val tabs: TabController,
) {

    fun handle(rawUrl: String): Boolean {
        if (!rawUrl.startsWith("srt://")) return false

        val uri = Uri.parse(rawUrl)
        val module = uri.host ?: return true
        val fn = uri.pathSegments.firstOrNull() ?: return true
        val callback = uri.getQueryParameter("callback")
        val args = uri.getQueryParameter("args")?.let { JSONObject(it) } ?: JSONObject()

        if (!isPathAllowed()) return true

        try {
            val result = dispatch(module, fn, args)
            if (callback != null) respond(callback, result)
        } catch (e: Exception) {
            if (callback != null) respondError(callback, e.message ?: "bridge error")
        }
        return true
    }

    private fun dispatch(module: String, fn: String, args: JSONObject): Any? = when (module) {
        "device" -> device(fn, args)
        "statusbar" -> statusbar(fn, args)
        "tabs" -> tabsModule(fn, args)
        "screen" -> screen(fn, args)
        "share" -> share(fn, args)
        "clipboard" -> clipboard(fn, args)
        "haptics" -> haptics(fn, args)
        "navigation" -> navigation(fn, args)
        else -> throw IllegalArgumentException("unknown module: " + module)
    }

    private fun device(fn: String, args: JSONObject): Any = when (fn) {
        "getInfo" -> JSONObject()
            .put("platform", "android")
            .put("osVersion", Build.VERSION.RELEASE)
            .put("model", Build.MANUFACTURER + " " + Build.MODEL)
            .put("appVersion", BuildConfig.VERSION_NAME)
            .put("appBuild", BuildConfig.VERSION_CODE.toString())
            .put("bundleId", BuildConfig.APPLICATION_ID)
            .put("locale", Locale.getDefault().toString())
            .put("installId", installId())
        "isNative" -> true
        "getInstallId" -> installId()
        else -> throw IllegalArgumentException("device." + fn)
    }

    private fun statusbar(fn: String, args: JSONObject): Any? {
        return when (fn) {
            "set" -> {
                val color = args.optString("color", config.branding.theme.statusBarColor)
                activity.window.statusBarColor = Color.parseColor(color)
                null
            }
            "hide" -> { activity.window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN); null }
            "show" -> { activity.window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN); null }
            else -> null
        }
    }

    private fun tabsModule(fn: String, args: JSONObject): Any? = when (fn) {
        "set" -> { tabs.set(args.getJSONArray("items")); null }
        "select" -> { tabs.select(args.getInt("index")); null }
        "setBadge" -> { tabs.setBadge(args.getInt("index"), args.optString("badge")); null }
        "get" -> tabs.snapshot()
        else -> null
    }

    private fun screen(fn: String, args: JSONObject): Any? = when (fn) {
        "keepOn" -> { activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); null }
        "allowSleep" -> { activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); null }
        "setBrightness" -> {
            val lp = activity.window.attributes
            lp.screenBrightness = args.getDouble("value").toFloat().coerceIn(0f, 1f)
            activity.window.attributes = lp
            null
        }
        "lockOrientation" -> {
            activity.requestedOrientation = when (args.optString("orientation")) {
                "portrait" -> android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                "landscape" -> android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                else -> android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
            }
            null
        }
        else -> null
    }

    private fun share(fn: String, args: JSONObject): Any? {
        if (fn != "page") return null
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, args.optString("text").ifEmpty { args.optString("url") })
            putExtra(Intent.EXTRA_SUBJECT, args.optString("title"))
        }
        activity.startActivity(Intent.createChooser(intent, args.optString("title")))
        return null
    }

    private fun clipboard(fn: String, args: JSONObject): Any? {
        val cm = activity.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        return when (fn) {
            "write" -> { cm.setPrimaryClip(ClipData.newPlainText("srt", args.optString("text"))); true }
            "read" -> cm.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
            else -> null
        }
    }

    private fun haptics(fn: String, args: JSONObject): Any? {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (activity.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            activity.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ms = if (fn == "vibrate") args.optLong("ms", 100) else 12L
            vibrator.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION") vibrator.vibrate(12L)
        }
        return true
    }

    private fun navigation(fn: String, args: JSONObject): Any? = when (fn) {
        "push" -> { webView.loadUrl(args.getString("url")); null }
        "pop" -> { if (webView.canGoBack()) webView.goBack(); null }
        "reload" -> { webView.reload(); null }
        "canGoBack" -> webView.canGoBack()
        "clearCache" -> { webView.clearCache(true); true }
        "setTitle" -> null
        "openExternal" -> {
            activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(args.getString("url")))); null
        }
        else -> null
    }

    private fun isPathAllowed(): Boolean {
        val allowed = config.site.allowedBridgePaths
        if (allowed.isEmpty()) return true
        val path = webView.url?.let { Uri.parse(it).path } ?: return false
        return allowed.any { path.startsWith(it) }
    }

    private fun installId(): String {
        val prefs = activity.getSharedPreferences("srt", Context.MODE_PRIVATE)
        return prefs.getString("installId", null)
            ?: UUID.randomUUID().toString().also { prefs.edit().putString("installId", it).apply() }
    }

    private fun respond(callback: String, value: Any?) {
        val json = when (value) {
            null -> "null"
            is JSONObject, is JSONArray -> value.toString()
            is Boolean, is Number -> value.toString()
            else -> JSONObject.quote(value.toString())
        }
        evaluate(callback, json)
    }

    private fun respondError(callback: String, message: String) {
        evaluate(callback, "{\"__error\":${JSONObject.quote(message)}}")
    }

    private fun evaluate(callback: String, json: String) {
        webView.post {
            webView.evaluateJavascript("window['" + callback + "'] && window['" + callback + "'](" + json + ");", null)
        }
    }
}
