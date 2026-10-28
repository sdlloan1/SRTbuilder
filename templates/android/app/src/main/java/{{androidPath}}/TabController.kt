package {{androidPackage}}

import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import org.json.JSONObject

class TabController(private val activity: AppCompatActivity, private val config: SRTConfig) {

    private val items = mutableListOf<JSONObject>()
    private var selected = 0

    fun set(list: JSONArray) {
        items.clear()
        for (i in 0 until list.length()) items.add(list.getJSONObject(i))
        render()
    }

    fun select(index: Int) {
        selected = index
        render()
    }

    fun setBadge(index: Int, badge: String?) {
        if (index in items.indices) items[index].put("badge", badge ?: JSONObject.NULL)
        render()
    }

    fun snapshot(): JSONObject = JSONObject()
        .put("items", JSONArray(items))
        .put("selected", selected)

    private fun render() {
        val bar = activity.findViewById<LinearLayout>(R.id.tabbar)
        bar.removeAllViews()
        if (config.navigation.mode != "tabbar") return

        items.forEachIndexed { index, item ->
            val label = item.optString("label")
            val text = TextView(activity).apply {
                text = if (index == selected) "• " + label else label
                gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f)
                setOnClickListener { select(index) }
            }
            bar.addView(text)
        }
    }
}
