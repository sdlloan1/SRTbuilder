'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createApp } from '@/lib/api';

export default function NewApp() {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const app = await createApp({ url, name });
      router.push('/apps/' + app.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
    } finally {
      setBusy(false);
    }
  }

  const field = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #243056', background: '#0b1020', color: '#e6e9f2', marginTop: 4,
  } as const;

  return (
    <form onSubmit={submit} style={{ maxWidth: 520, margin: '0 auto', padding: 40, display: 'grid', gap: 16 }}>
      <h1 style={{ fontSize: 24 }}>New app</h1>

      <label>
        <span style={{ fontSize: 13, color: '#8b95b5' }}>Website URL</span>
        <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)}
               placeholder="https://example.com" style={field} />
      </label>

      <label>
        <span style={{ fontSize: 13, color: '#8b95b5' }}>App name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Example" style={field} />
      </label>

      {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}

      <button disabled={busy} style={{ padding: 12, borderRadius: 8, border: 0, background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
        {busy ? 'Creating…' : 'Start building'}
      </button>
    </form>
  );
}
