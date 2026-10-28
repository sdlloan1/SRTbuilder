'use client';

import { useState } from 'react';
import { updateApp } from '@/lib/api';

export function BrandingPanel({ app, onSaved }: { app: any; onSaved: (a: any) => void }) {
  const [primary, setPrimary] = useState(app.config.branding.theme.primaryColor);
  const [status, setStatus] = useState('');
  const [issues, setIssues] = useState<Array<{ path: string; message: string }>>([]);

  async function save() {
    setStatus('saving…');
    setIssues([]);
    try {
      const next = await updateApp(app.id, {
        branding: { ...app.config.branding, theme: { ...app.config.branding.theme, primaryColor: primary } },
      });
      onSaved(next);
      setStatus('saved');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'failed');
    }
  }

  return (
    <div style={{ border: '1px solid #243056', borderRadius: 10, padding: 14 }}>
      <h3 style={{ fontSize: 13, color: '#8b95b5', marginTop: 0 }}>Branding</h3>

      <label style={{ display: 'block', fontSize: 13 }}>
        Primary color
        <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)}
               style={{ display: 'block', width: '100%', height: 34, marginTop: 4, background: 'none', border: '1px solid #243056', borderRadius: 8 }} />
      </label>

      <p style={{ fontSize: 11, color: '#8b95b5' }}>
        Bundle ID: {app.config.app.iosBundleId}
      </p>

      <button onClick={save} style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #243056', background: '#1b2440', color: '#e6e9f2', cursor: 'pointer' }}>
        Save
      </button>
      {status && <span style={{ marginLeft: 8, fontSize: 12, color: '#8b95b5' }}>{status}</span>}
      {issues.length > 0 && (
        <ul style={{ fontSize: 11, color: '#f87171', paddingLeft: 16 }}>
          {issues.map((i, n) => <li key={n}>{i.path}: {i.message}</li>)}
        </ul>
      )}
    </div>
  );
}
