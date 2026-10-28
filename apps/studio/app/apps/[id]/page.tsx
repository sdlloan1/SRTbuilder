'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SimulatorFrame } from '@/components/SimulatorFrame';
import { BridgeConsole } from '@/components/BridgeConsole';
import { BrandingPanel } from '@/components/BrandingPanel';
import { getApp, startBuild } from '@/lib/api';

export default function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [device, setDevice] = useState<'iphone' | 'android'>('iphone');
  const [lines, setLines] = useState<string[]>([]);
  const [buildMsg, setBuildMsg] = useState('');

  useEffect(() => {
    getApp(id).then(setApp).catch(() => setApp(null));
  }, [id]);

  const onCommand = useCallback((line: string) => {
    setLines((prev) => [...prev.slice(-200), line]);
  }, []);

  async function build() {
    setBuildMsg('queued…');
    try {
      const { buildIds } = await startBuild(id, 'all');
      setBuildMsg('queued: ' + buildIds.length + ' builds');
    } catch (err) {
      setBuildMsg(err instanceof Error ? err.message : 'failed');
    }
  }

  if (!app) return <p style={{ padding: 40 }}>Loading…</p>;

  return (
    <div className="studio-grid">
      <div>
        <Link href="/apps" style={{ color: '#8b95b5', fontSize: 12, textDecoration: 'none' }}>&larr; All apps</Link>
        <h1 style={{ fontSize: 20 }}>{app.name}</h1>
        <p style={{ color: '#8b95b5', fontSize: 12 }}>{app.startUrl}</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setDevice('iphone')}>iPhone</button>
          <button onClick={() => setDevice('android')}>Android</button>
          <button onClick={build} style={{ background: '#3b82f6', color: '#fff', border: 0 }}>
            Build all
          </button>
          {buildMsg && <span style={{ color: '#8b95b5', fontSize: 12, alignSelf: 'center' }}>{buildMsg}</span>}
        </div>

        <SimulatorFrame url={app.startUrl} device={device} onCommand={onCommand} />
      </div>

      <aside>
        <BrandingPanel app={app} onSaved={setApp} />
        <h3 style={{ fontSize: 13, color: '#8b95b5', marginTop: 24 }}>Bridge console</h3>
        <BridgeConsole lines={lines} />
      </aside>
    </div>
  );
}
