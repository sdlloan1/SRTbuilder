# Architecture

## Flow

1. **Studio** collects a URL plus branding and writes a validated `srt.config.json`.
2. **API** renders `templates/{ios,android}` with Handlebars into a native project.
3. The project embeds `srt-bridge.js` as an app asset.
4. At runtime the shell injects that asset into every page it loads.
5. Web code calls `srt.*`; the bridge rewrites each call to a `srt://` URL.
6. The native WebView intercepts the scheme, runs the module, and evaluates a
   named callback with a JSON result.

## Why a URI scheme

It is the only transport that works identically on `WKWebView` and
`android.webkit.WebView` without a message-handler shim per platform, and it
degrades gracefully: an `iframe` navigation is enough to fire it, and the
browser fallback can be a plain `postMessage` to the parent frame.

## Layers

| Layer | Responsibility | Trust |
|---|---|---|
| `@srt/config` | Schema + validation. Nothing else imports raw JSON. | pure |
| `@srt/bridge` | Protocol, dispatch, timeout, module surface. | runs in the page |
| `apps/api` | Config store, codegen, build queue. | server |
| `apps/studio` | Authoring UI + simulator host. | browser |
| `templates/*` | Native shells. Handlebars-tokenised. | compiled into the app |

## Security notes

- `allowedBridgePaths` gates which pages may invoke native modules. Empty = all.
- Bridge access is evaluated against the current URL, not the start URL.
- `installId` is generated locally and never leaves the device unless you send it.
- No traffic is proxied. The WebView talks to your origin directly.

## Extension points

- Add a module: create `src/modules/<name>.ts`, wire it in `dispatch`, add a
  `when (module)` branch in both shells.
- Add a template: drop files in `templates/<platform>`; the generator picks
  them up automatically.
