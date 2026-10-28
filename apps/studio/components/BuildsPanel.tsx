'use client';

import { useCallback, useEffect, useState } from 'react';
import { listBuilds, startBuild } from '@/lib/api';

const PENDING = new Set(['queued', 'generating', 'generated', 'compiling']);

const STATUS_COLORS: Record<string, string> = {
  succeeded: '#34d399',
  failed: '#f87171',
  compiling: '#fbbf24',
};

export function BuildsPanel({ appId }: { appId: string }) {
  const [builds, setBuilds] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    try {
      setBuilds(await listBuilds(appId));
    } catch {
      // the panel simply keeps the last known builds
    }
  }, [appId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pending = builds.some((b) => PENDING.has(b.status));
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(refresh, 1500);
    return () => clearInterval(timer);
  }, [pending, refresh]);

  async function build() {
    setBusy(true);
    setMessage('queued…');
    try {
      const { buildIds } = await startBuild(appId, 'all');
      setMessage('queued ' + buildIds.length + ' builds');
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'build failed to start');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: '1px solid #243056', borderRadius: 10, padding: 14, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3 style={{ fontSize: 13, color: '#8b95b5', margin: 0 }}>Builds</h3>
        <button
          onClick={build}
          disabled={busy}
          style={{
            marginLeft: 'auto', padding: '7px 12px', borderRadius: 8, border: 0,
            background: '#3b82f6', color: '#fff', fontSize: 12.5, fontWeight: 600,
            cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Starting…' : 'Build all'}
        </button>
      </div>
      {message && <p style={{ fontSize: 11.5, color: '#8b95b5', marginBottom: 0 }}>{message}</p>}

      {builds.length === 0 && !message && (
        <p style={{ fontSize: 12, color: '#6b7699', marginBottom: 0 }}>
          No builds yet. Build once to download the Android package.
        </p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'grid', gap: 8 }}>
        {builds.map((b) => (
          <li key={b.id} style={{ borderTop: '1px solid #1a2340', paddingTop: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{b.platform.toUpperCase()}</span>
              <span style={{ color: STATUS_COLORS[b.status] ?? '#8b95b5' }}>{b.status}</span>
              {b.artifactName && (
                <a
                  href={'/api/builds/' + b.id + '/download'}
                  download
                  style={{
                    marginLeft: 'auto', padding: '5px 10px', borderRadius: 7,
                    background: '#1b2440', border: '1px solid #243056',
                    color: '#e6e9f2', textDecoration: 'none', fontSize: 11.5,
                  }}
                >
                  {b.artifactName.endsWith('.apk') ? 'Download APK' : 'Download project .zip'}
                </a>
              )}
            </div>
            {b.status === 'failed' && b.log && (
              <pre style={{
                margin: '6px 0 0', maxHeight: 90, overflow: 'auto', whiteSpace: 'pre-wrap',
                color: '#f87171', fontSize: 10.5, fontFamily: 'ui-monospace, monospace',
              }}>{String(b.log).slice(-400)}</pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
