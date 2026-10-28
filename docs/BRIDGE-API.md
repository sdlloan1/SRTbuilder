# SRT Bridge API

Global: `srt`. Every method either returns a promise or is fire-and-forget.

## Protocol

Commands travel as `srt://<module>/<function>?args=<json>&callback=<name>`.
The native shell intercepts the scheme. Without a native shell the bridge
relays to `window.parent` so the Studio simulator can answer.

## Modules

### `srt.device`
| Method | Returns |
|---|---|
| `getInfo()` | DeviceInfo |
| `isNative()` | boolean |
| `getInstallId()` | string (stable, per-install) |

### `srt.statusbar`
`set({ color, style, hidden, overlay })` · `get()` · `hide()` · `show()`

### `srt.tabs`
`set(items)` · `select(index)` · `setBadge(index, badge)` · `get()`

### `srt.screen`
`keepOn()` · `allowSleep()` · `fullScreen()` · `exitFullScreen()` ·
`setBrightness(0..1)` · `getBrightness()` · `lockOrientation(o)`

### `srt.share`
`page({ url, text, title })` → `{ completed }`

### `srt.clipboard`
`write(text)` · `read()`

### `srt.haptics`
`impact({ style })` · `notification({ style })` · `vibrate(ms)` · `selection()`

### `srt.navigation`
`push(url)` · `pop()` · `reload()` · `canGoBack()` · `clearCache()` ·
`setTitle(title)` · `openExternal(url)`

## Escape hatch

```js
srt.invoke('statusbar', 'set', { color: '#000' });   // promise
srt.emit('screen', 'keepOn');                        // fire and forget
```

## Init hook

The library is not available at parse time. Define `srt_library_ready()` and it
is called once the bridge is installed.

```js
function srt_library_ready() { /* safe to call srt.* here */ }
```

## Access control

Set `site.allowedBridgePaths` to an array of path prefixes. Empty = all paths.
Only matching pages can execute bridge commands. Requires a rebuild to change —
keep it empty during development.
