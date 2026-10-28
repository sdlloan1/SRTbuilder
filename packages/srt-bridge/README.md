# @srt/bridge

The SRT JavaScript Bridge. Injected into every page the native shell loads,
and usable standalone in the browser.

## Install

```bash
pnpm add @srt/bridge
```

## Use

```ts
import { srt } from '@srt/bridge';

await srt.device.getInfo();
srt.statusbar.set({ color: '#0b1020', style: 'light' });
```

## Protocol

Every call becomes `srt://<module>/<fn>?args=<json>&callback=<name>`.
The native shell intercepts the scheme. In a browser the bridge relays to
`window.parent`, which is how the Studio simulator stays fully interactive.

## Builds

- `dist/index.js` — ESM/CJS library
- `dist/srt-bridge.js` — minified IIFE, self-installing, injected by the shells
