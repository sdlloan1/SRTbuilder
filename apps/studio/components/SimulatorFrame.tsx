'use client';

import { useEffect, useRef, useState } from 'react';
import { createSimulator } from '@srt/bridge';
import { checkPreview } from '@/lib/api';

interface Props {
  url: string;
  device: 'iphone' | 'android';
  onCommand: (line: string) => void;
  appName?: string;
  iconPath?: string | null;
}

const FRAMES = {
  iphone: { w: 390, h: 844, radius: 44, label: 'iPhone 15' },
  android: { w: 412, h: 915, radius: 24, label: 'Pixel 8' },
};

type Check = { embeddable: boolean | null; reason: string; reachable: boolean };

export function SimulatorFrame({ url, device, onCommand, appName, iconPath }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [check, setCheck] = useState<Check | null>(null);
  const spec = FRAMES[device];
  const blocked = check?.embeddable === false;

  useEffect(() => {
    let active = true;
    setCheck(null);
    setReady(false);
    checkPreview(url)
      .then((result) => active && setCheck(result))
      .catch(() => active && setCheck({ embeddable: null, reason: 'the preview check failed', reachable: false }));
    return () => {
      active = false;
    };
  }, [url, reloadKey]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const sim = createSimulator({
      target: iframe,
      onCommand: (module, fn, args) =>
        onCommand('srt.' + module + '.' + fn + '(' + (Object.keys(args).length ? JSON.stringify(args) : '') + ')'),
    });

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { __srt_protocol?: boolean };
      if (data && data.__srt_protocol) iframe.contentWindow?.postMessage(data, '*');
    };
    window.addEventListener('message', onMessage);

    return () => {
      sim.dispose();
      window.removeEventListener('message', onMessage);
    };
  }, [onCommand, reloadKey, blocked]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center', fontSize: 12 }}>
        <span style={{ color: '#8b95b5', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
        <button
          onClick={() => setReloadKey((n) => n + 1)}
          style={{ padding: '4px 9px', borderRadius: 7, border: '1px solid #243056', background: '#131a30', color: '#e6e9f2', fontSize: 11.5, cursor: 'pointer' }}
        >
          Reload
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{ padding: '4px 9px', borderRadius: 7, border: '1px solid #243056', background: '#131a30', color: '#e6e9f2', fontSize: 11.5, textDecoration: 'none' }}
        >
          Open site ↗
        </a>
      </div>

      <div style={{
        position: 'relative', overflow: 'hidden', border: '10px solid #111827',
        background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,.5)',
        width: spec.w, maxWidth: '100%', height: spec.h, borderRadius: spec.radius,
      }}>
        {blocked ? (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center',
            background: '#0b1020', color: '#e6e9f2',
          }}>
            {iconPath
              ? <img src={iconPath} alt="" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover' }} />
              : <div style={{
                  width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700,
                }}>{(appName ?? 'S').slice(0, 1).toUpperCase()}</div>}
            <strong style={{ fontSize: 14 }}>{appName ?? 'Your app'}</strong>
            <p style={{ fontSize: 12, color: '#8b95b5', margin: 0, lineHeight: 1.5 }}>
              {appName ? appName + ' can\u2019t be previewed here because ' : 'This site can\u2019t be previewed here because '}
              {check?.reason || 'it refuses to be embedded'}.
              The generated app loads it natively, so this does not affect the build.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{ padding: '8px 14px', borderRadius: 9, background: '#3b82f6', color: '#fff', fontSize: 12.5, textDecoration: 'none', fontWeight: 600 }}
            >
              Open site in a new tab
            </a>
          </div>
        ) : (
          <>
            {(!ready || !check) && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1020', color: '#8b95b5', fontSize: 13, textAlign: 'center', padding: 20 }}>
                {check?.reachable === false ? 'Site unreachable — showing an empty frame' : 'Loading ' + url + '…'}
              </div>
            )}
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={url}
              title="SRT simulator"
              onLoad={() => setReady(true)}
              style={{ width: '100%', height: '100%', border: 0 }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </>
        )}
      </div>
      <span style={{ fontSize: 11, color: '#8b95b5' }}>{spec.label} · live bridge</span>
      {check?.reachable === false && (
        <span style={{ fontSize: 11, color: '#fbbf24' }}>
          The server could not reach this site — the frame may stay blank.
        </span>
      )}
    </div>
  );
}
