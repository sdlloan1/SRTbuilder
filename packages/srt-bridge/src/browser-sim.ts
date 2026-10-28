/**
 * Studio simulator host. Runs in the PARENT frame and answers srt://
 * commands posted by the bridge running inside the preview iframe.
 *
 * This gives you a genuinely interactive preview in a plain browser —
 * no emulator, no cloud device farm.
 */
import { parseUrl } from './protocol.js';

type Handler = (args: Record<string, unknown>) => unknown;

export interface SimulatorOptions {
  target: HTMLIFrameElement;
  onCommand?: (module: string, fn: string, args: Record<string, unknown>) => void;
}

function stableSimId(): string {
  const existing = localStorage.getItem('srt_sim_id');
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  localStorage.setItem('srt_sim_id', fresh);
  return fresh;
}

export function createSimulator({ target, onCommand }: SimulatorOptions) {
  const state = {
    statusbar: { color: '#ffffff', style: 'dark' as const, hidden: false },
    brightness: 0.5,
    tabs: { items: [] as unknown[], selected: 0 },
  };

  const handlers: Record<string, Handler> = {
    'device/getInfo': () => ({
      platform: 'web',
      osVersion: navigator.userAgent,
      model: 'Simulator',
      appVersion: '1.0.0',
      appBuild: '1',
      bundleId: 'ai.srtbuilder.simulator',
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenWidth: target.clientWidth,
      screenHeight: target.clientHeight,
      pixelRatio: window.devicePixelRatio,
      isTablet: target.clientWidth > 768,
      installId: 'sim-' + stableSimId(),
    }),
    'device/isNative': () => false,
    'statusbar/set': (a) => Object.assign(state.statusbar, a),
    'statusbar/get': () => state.statusbar,
    'statusbar/hide': () => { state.statusbar.hidden = true; },
    'statusbar/show': () => { state.statusbar.hidden = false; },
    'screen/setBrightness': (a) => { state.brightness = Number(a.value ?? 0.5); },
    'screen/getBrightness': () => state.brightness,
    'clipboard/write': (a) => { navigator.clipboard.writeText(String(a.text ?? '')); return true; },
    'clipboard/read': () => navigator.clipboard.readText(),
    'haptics/impact': () => { if (navigator.vibrate) navigator.vibrate(12); return true; },
    'haptics/vibrate': (a) => { if (navigator.vibrate) navigator.vibrate(Number(a.ms ?? 100)); return true; },
    'share/page': (a) => {
      if (navigator.share) navigator.share({ url: String(a.url ?? ''), title: String(a.title ?? '') });
      return { completed: true };
    },
    'tabs/set': (a) => { state.tabs.items = (a.items as unknown[]) ?? []; },
    'tabs/select': (a) => { state.tabs.selected = Number(a.index ?? 0); },
  };

  function onMessage(event: MessageEvent) {
    const data = event.data as { __srt_protocol?: boolean; url?: string };
    if (!data || !data.__srt_protocol || !data.url) return;

    const env = parseUrl(data.url);
    if (!env) return;

    const args = env.args ?? {};
    if (onCommand) onCommand(env.module, env.fn, args);

    const handler = handlers[env.module + '/' + env.fn];
    let payload: unknown;
    let error: string | null = null;

    try {
      payload = handler ? handler(args) : { ok: true };
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    if (!env.callback) return;
    const win = target.contentWindow;
    if (!win) return;

    if (error) {
      win.postMessage({ __srt_callback: env.callback, payload: { __error: error } }, '*');
    } else {
      Promise.resolve(payload).then((resolved) => {
        win.postMessage({ __srt_callback: env.callback, payload: resolved ?? null }, '*');
      });
    }
  }

  window.addEventListener('message', onMessage);

  return {
    state,
    dispose: () => window.removeEventListener('message', onMessage),
  };
}
