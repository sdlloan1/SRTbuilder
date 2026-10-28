export const SCHEME = 'srt';
export const CALLBACK_PREFIX = '__srt_cb_';
export const READY_HOOK = 'srt_library_ready';

export interface Envelope {
  module: string;
  fn: string;
  args?: Record<string, unknown>;
  callback?: string;
}

export function buildUrl(env: Envelope): string {
  const params = new URLSearchParams();
  if (env.args && Object.keys(env.args).length) {
    params.set('args', JSON.stringify(env.args));
  }
  if (env.callback) params.set('callback', env.callback);
  const q = params.toString();
  return SCHEME + '://' + env.module + '/' + env.fn + (q ? '?' + q : '');
}

export function parseUrl(raw: string): Envelope | null {
  if (!raw.startsWith(SCHEME + '://')) return null;
  const url = new URL(raw);
  const argsRaw = url.searchParams.get('args');
  return {
    module: url.host,
    fn: url.pathname.replace(/^\//, ''),
    args: argsRaw ? (JSON.parse(argsRaw) as Record<string, unknown>) : undefined,
    callback: url.searchParams.get('callback') ?? undefined,
  };
}
