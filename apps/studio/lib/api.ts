// Browser calls go to the same origin and are proxied to the API by next.config.mjs
// rewrites; server components need an absolute URL for the API service.
const BASE =
  typeof window === 'undefined' ? process.env.API_INTERNAL_URL ?? 'http://localhost:4000' : '';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? res.status + ' ' + res.statusText);
  }
  return res.json() as Promise<T>;
}

export const createApp = (body: { url: string; name?: string }) =>
  req<{ id: string }>('/api/apps', { method: 'POST', body: JSON.stringify(body) });

export const getApp = (id: string) => req<any>('/api/apps/' + id);

export const updateApp = (id: string, patch: unknown) =>
  req<any>('/api/apps/' + id, { method: 'PATCH', body: JSON.stringify(patch) });

export const startBuild = (id: string, platform: 'ios' | 'android' | 'all' = 'all') =>
  req<{ buildIds: string[] }>('/api/apps/' + id + '/build', {
    method: 'POST',
    body: JSON.stringify({ platform }),
  });

export const getBuild = (id: string) => req<any>('/api/builds/' + id);
