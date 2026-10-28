/**
 * Detects whether we are running inside an SRT native shell.
 * The shell sets this marker before injecting the bridge.
 */
export function isNativeHost(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  return w.__SRT_NATIVE__ === true || w.__SRT_NATIVE__ === '1';
}

export function platform(): 'ios' | 'android' | 'web' {
  if (!isNativeHost()) return 'web';
  const p = (window as unknown as Record<string, unknown>).__SRT_PLATFORM__;
  return p === 'ios' || p === 'android' ? p : 'web';
}
