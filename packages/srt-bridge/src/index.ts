import { device } from './modules/device.js';
import { statusbar } from './modules/statusbar.js';
import { tabs } from './modules/tabs.js';
import { screen } from './modules/screen.js';
import { share } from './modules/share.js';
import { clipboard } from './modules/clipboard.js';
import { haptics } from './modules/haptics.js';
import { navigation } from './modules/navigation.js';
import { invoke, emit, resolveCallback, rejectCallback } from './dispatch.js';
import { isNativeHost, platform } from './native.js';
import { READY_HOOK } from './protocol.js';

export interface SrtBridge {
  device: typeof device;
  statusbar: typeof statusbar;
  tabs: typeof tabs;
  screen: typeof screen;
  share: typeof share;
  clipboard: typeof clipboard;
  haptics: typeof haptics;
  navigation: typeof navigation;
  invoke: typeof invoke;
  emit: typeof emit;
  isNative: () => boolean;
  platform: () => string;
}

export const srt: SrtBridge = {
  device,
  statusbar,
  tabs,
  screen,
  share,
  clipboard,
  haptics,
  navigation,
  invoke,
  emit,
  isNative: isNativeHost,
  platform,
};

export { resolveCallback, rejectCallback };
export * from './protocol.js';
export * from './browser-sim.js';
export * from './modules/device.js';
export * from './modules/statusbar.js';
export * from './modules/tabs.js';
export * from './modules/screen.js';
export * from './modules/share.js';
export * from './modules/clipboard.js';
export * from './modules/haptics.js';
export * from './modules/navigation.js';

/** Installs the global and fires the ready hook. Called by the native shell. */
export function install(target: Window = window): void {
  const w = target as unknown as Record<string, unknown>;
  w.srt = srt;

  target.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as { __srt_callback?: string; payload?: unknown };
    if (data && data.__srt_callback) resolveCallback(data.__srt_callback, data.payload);
  });

  const hook = w[READY_HOOK];
  if (typeof hook === 'function') (hook as () => void)();
}

export default srt;
