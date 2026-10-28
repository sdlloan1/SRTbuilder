'use client';

import { useEffect, useRef } from 'react';

export function BridgeConsole({ lines }: { lines: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  return (
    <div style={{ height: 200, overflowY: 'auto', borderRadius: 10, background: '#05070f', padding: 12, fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: '#34d399' }}>
      {lines.length === 0 && <div style={{ color: '#4b5563' }}>{'// bridge calls appear here'}</div>}
      {lines.map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre-wrap' }}>
          <span style={{ color: '#4b5563' }}>{String(i + 1).padStart(3, '0')} </span>
          {line}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
