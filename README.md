# SRT Builder

**Site → Runtime Toolkit.** Turn any website into a native iOS + Android app.
Self-hostable, open source, bridge-first.

> Reverse-engineered from Median.co (formerly GoNative.io). Independent implementation.

## Why

Wrapping a website in a WebView is trivial. Getting it *past App Store review* is not —
Apple rejects "thin wrappers". SRT Builder ships the native capability surface (push,
haptics, biometrics, native tab bars, deep links) plus a JS bridge so your web code can
drive it, without ever opening Xcode.

## Architecture

```
Studio (Next.js) → API (Fastify) → config + templates → iOS/Android project → IPA/AAB
                                          ↓
                              injected srt-bridge.js in WebView
                                          ↓
                        srt:// protocol → native modules → callback
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and
[docs/REVERSE-ENGINEERING.md](docs/REVERSE-ENGINEERING.md).

## Quickstart

```bash
git clone https://github.com/your-org/srt-builder.git
cd srt-builder
pnpm install
cp .env.example .env
pnpm --filter @srt/config build
pnpm --filter @srt/bridge build
pnpm dev            # studio on :3000, api on :4000
```

Open http://localhost:3000, paste a URL, and you get a live simulator plus a
downloadable native project.

### Run with Docker

```bash
docker compose up -d
```

Brings up the same dev servers (studio on :3000, API on :4000) straight from the
source in this checkout. See `docker-compose.base44.yml`.

### The site

| Route | What it is |
|---|---|
| `/` | Marketing page — features, how it works, pricing, FAQ |
| `/apps` | Your apps |
| `/new` | Create an app from a URL |
| `/apps/<id>` | Simulator, branding, bridge console, build |
| `/docs` | OpenAPI reference for the studio API (proxied to the API service) |

### Generating a real app

```bash
pnpm --filter @srt/api exec tsx scripts/generate.ts --config ./srt.config.json --out ./out
```

- `out/android` → `./gradlew assembleDebug` (needs Android SDK)
- `out/ios` → `xcodegen generate && xcodebuild` (needs Xcode + XcodeGen)

## Using the bridge from your site

```html
<script>
  srt.statusbar.set({ color: '#0b1020', style: 'light' });
  srt.haptics.impact({ style: 'medium' });
  const info = await srt.device.getInfo();
</script>
```

In a desktop browser the same calls resolve against the Studio simulator via
`postMessage`, so you develop the native UX without a device.

Full reference: [docs/BRIDGE-API.md](docs/BRIDGE-API.md).

## Packages

| Package | Purpose |
|---|---|
| `@srt/bridge` | The injected bridge + npm client. Framework agnostic. |
| `@srt/config` | Zod schema for `srt.config.json`. Single source of truth for validation. |

## Templates

`templates/ios` and `templates/android` are plain Handlebars-tokenised native projects.
Fork them, change them, rebuild. No proprietary toolchain.

## License

MIT.
