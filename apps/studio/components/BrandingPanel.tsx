'use client';

import { useState } from 'react';
import { removeLogo, updateApp, uploadLogo } from '@/lib/api';

const MAX_BYTES = 3 * 1024 * 1024;

export function BrandingPanel({ app, onSaved }: { app: any; onSaved: (a: any) => void }) {
  const [primary, setPrimary] = useState(app.config.branding.theme.primaryColor);
  const [status, setStatus] = useState('');
  const [logoBusy, setLogoBusy] = useState(false);
  const [issues, setIssues] = useState<Array<{ path: string; message: string }>>([]);
  const iconPath: string | null = app.config.branding.iconPath;

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

  async function pickLogo(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setStatus('logo must be 3 MB or smaller');
      return;
    }
    setLogoBusy(true);
    setStatus('uploading logo…');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      onSaved(await uploadLogo(app.id, dataUrl));
      setStatus('logo saved');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'logo upload failed');
    } finally {
      setLogoBusy(false);
    }
  }

  async function clearLogo() {
    setLogoBusy(true);
    try {
      onSaved(await removeLogo(app.id));
      setStatus('logo removed');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'failed');
    } finally {
      setLogoBusy(false);
    }
  }

  return (
    <div style={{ border: '1px solid #243056', borderRadius: 10, padding: 14 }}>
      <h3 style={{ fontSize: 13, color: '#8b95b5', marginTop: 0 }}>Branding</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flex: '0 0 auto',
          background: '#0b1020', border: '1px solid #243056',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          {iconPath
            ? <img src={iconPath} alt="App logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#6b7699' }}>◆</span>}
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <label style={{ fontSize: 13, cursor: logoBusy ? 'default' : 'pointer' }}>
            <span style={{
              display: 'inline-block', padding: '7px 10px', borderRadius: 8,
              border: '1px solid #243056', background: '#1b2440', fontSize: 12.5,
              opacity: logoBusy ? 0.6 : 1,
            }}>
              {logoBusy ? 'Working…' : iconPath ? 'Replace logo' : 'Add logo'}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              disabled={logoBusy}
              onChange={(e) => pickLogo(e.target.files?.[0])}
              style={{ display: 'none' }}
            />
          </label>
          <div style={{ fontSize: 11, color: '#6b7699' }}>PNG, JPG, WebP or SVG · up to 3 MB</div>
          {iconPath && (
            <button onClick={clearLogo} disabled={logoBusy}
                    style={{ justifySelf: 'start', padding: 0, border: 0, background: 'none', color: '#8b95b5', fontSize: 11.5, cursor: 'pointer' }}>
              Remove logo
            </button>
          )}
        </div>
      </div>

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
