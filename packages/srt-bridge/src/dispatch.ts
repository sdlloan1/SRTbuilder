import { buildUrl, CALLBACK_PREFIX } from './protocol.js';
import { isNativeHost } from './native.js';

interface Pending {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

let seq = 0;
const pending = new Map<number, Pending>();

const DEFAULT_TIMEOUT = 8000;

/**
 * Native shells set __SRT_NATIVE__ and intercept srt:// navigations.
 * Without a native host we relay to the parent frame (Studio simulator).
 */
function transport(url: string): void {
  if (typeof document === 'undefined') return;

  if (isNativeHost()) {
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    frame.setAttribute('aria-hidden', 'true');
    frame.src = url;
    document.documentElement.appendChild(frame);
    setTimeout(() => frame.parentNode && frame.parentNode.removeChild(frame), 500);
    return;
  }

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ __srt_protocol: true, url }, '*');
    return;
  }

  window.dispatchEvent(new CustomEvent('srt:unhandled', { detail: { url } }));
}

export function invoke<T = unknown>(
  module: string,
  fn: string,
  args: Record<string, unknown> = {},
  opts: { timeout?: number } = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = ++seq;
    const cbName = CALLBACK_PREFIX + id;
    const timeout = opts.timeout ?? DEFAULT_TIMEOUT;

    (window as unknown as Record<string, unknown>)[cbName] = (payload: unknown) => {
      const entry = pending.get(id);
      if (!entry) return;
      clearTimeout(entry.timer);
      pending.delete(id);
      delete (window as unknown as Record<string, unknown>)[cbName];

      if (payload && typeof payload === 'object' && '__error' in payload) {
        reject(new Error(String((payload as { __error: unknown }).__error)));
      } else {
        resolve(payload as T);
      }
    };

    const timer = setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      delete (window as unknown as Record<string, unknown>)[cbName];
      reject(new Error('srt.' + module + '.' + fn + ' timed out after ' + timeout + 'ms'));
    }, timeout);

    pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });
    transport(buildUrl({ module, fn, args, callback: cbName }));
  });
}

/** Fire-and-forget. Never waits for a callback. */
export function emit(module: string, fn: string, args: Record<string, unknown> = {}): void {
  transport(buildUrl({ module, fn, args }));
}

/** Resolve a pending callback by name. Called by the native host. */
export function resolveCallback(name: string, payload: unknown): void {
  const fn = (window as unknown as Record<string, unknown>)[name];
  if (typeof fn === 'function') (fn as (p: unknown) => void)(payload);
}

export function rejectCallback(name: string, message: string): void {
  resolveCallback(name, { __error: message });
}
