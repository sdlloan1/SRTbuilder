# Reverse-engineering notes

Target: **median.co** (formerly GoNative.io). Independent reimplementation.

## What was observed

- Marketing site, pricing matrix, and the full docs index
  (`docs.median.co/llms.txt`, ~200 pages).
- Their public repo `github.com/gonativeio/median-javascript-bridge`
  (TypeScript, rollup, published as `median-js-bridge`).
- The JavaScript Bridge spec, quickstart, and config docs.

## Findings

1. **The bridge is injected at runtime, not bundled.**
   Their docs state the library "is injected into your webpage DOM at runtime."
   So the shell owns the asset and re-injects per navigation.

2. **A second, library-free transport exists.**
   `median://module/function` plus `median://nativebridge/multi`. That is the
   signature of a custom URI scheme intercepted by the WebView — the same
   technique Cordova and PhoneGap use.

3. **Callback convention.** Bridge calls return promises, so the native side
   must evaluate a named JS function. Their documented init hook is
   `median_library_ready()`.

4. **Config is a JSON file.** A docs page is literally titled
   "App Configuration (appconfig.json)". Shells are data-driven.

5. **Legacy namespace.** `gonative` still works alongside `median`, confirming
   the GoNative lineage and a compat shim.

6. **Two surfaces:** App Studio (config UI + cloud build farm) and an MCP server
   so agents can drive builds.

7. **Free tier disables the bridge entirely** and adds a watermark. Gating is
   runtime license-key based.

## Where SRT Builder diverges

| Aspect | Median | SRT Builder |
|---|---|---|
| Bridge on free tier | disabled | always on |
| Browser preview | streamed emulator | real iframe + postMessage bridge |
| Templates | closed | plain Handlebars in-repo |
| Protocol scheme | `median://` | `srt://` |
| Agent access | MCP server | OpenAPI at `/docs` |
| Self-hosting | no | yes, docker-compose |

## What is still missing here

- Code signing (IPA / AAB output).
- Real implementations for push, biometrics, QR, IAP.
- Auth / multi-tenancy.
- A cloud build farm (this runs locally).
