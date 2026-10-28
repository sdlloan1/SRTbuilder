import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid #1a2340', marginTop: 80, padding: '32px 0 48px', fontSize: 13, color: '#8b95b5' }}>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
        <span>SRT Builder — MIT licensed. Free for everyone.</span>
        <span style={{ display: 'flex', gap: 18 }}>
          <Link href="/apps" style={{ color: '#8b95b5' }}>My apps</Link>
          <Link href="/new" style={{ color: '#8b95b5' }}>New app</Link>
          <Link href="/docs" style={{ color: '#8b95b5' }}>API reference</Link>
        </span>
      </div>
    </footer>
  );
}
