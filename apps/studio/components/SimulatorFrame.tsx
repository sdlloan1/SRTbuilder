'use client';

import { useEffect, useRef, useState } from 'react';
import { createSimulator } from '@srt/bridge';

interface Props {
  url: string;
  device: 'iphone' | 'android';
  onCommand: (line: string) => void;
}

const FRAMES = {
  iphone: { w: 390, h: 844, radius: 44, label: 'iPhone 15' },
  android: { w: 412, h: 915, radius: 24, label: 'Pixel 8' },
};

export function SimulatorFrame({ url, device, onCommand }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const spec = FRAMES[device];

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
  }, [onCommand]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        position: 'relative', overflow: 'hidden', border: '10px solid #111827',
        background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,.5)',
        width: spec.w, maxWidth: '100%', height: spec.h, borderRadius: spec.radius,
      }}>
        {!ready && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1020', color: '#8b95b5', fontSize: 13 }}>
            Loading {url}…
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          title="SRT simulator"
          onLoad={() => setReady(true)}
          style={{ width: '100%', height: '100%', border: 0 }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
      <span style={{ fontSize: 11, color: '#8b95b5' }}>{spec.label} · live bridge</span>
    </div>
  );
}
