import Link from 'next/link';

export function SiteHeader() {
  return (
    <header style={{ borderBottom: '1px solid #1a2340', background: 'rgba(11,16,32,.85)', position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(8px)' }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 24, height: 62 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#e6e9f2', textDecoration: 'none', fontWeight: 700 }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>S</span>
          SRT Builder
        </Link>

        <nav className="nav" style={{ display: 'flex', gap: 18, marginLeft: 'auto', fontSize: 14 }}>
          <Link href="/#features" style={{ color: '#8b95b5', textDecoration: 'none' }}>Features</Link>
          <Link href="/#how" style={{ color: '#8b95b5', textDecoration: 'none' }}>How it works</Link>
          <Link href="/#pricing" style={{ color: '#8b95b5', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/docs" style={{ color: '#8b95b5', textDecoration: 'none' }}>API</Link>
          <Link href="/apps" style={{ color: '#8b95b5', textDecoration: 'none' }}>My apps</Link>
        </nav>

        <Link href="/new" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 14, textDecoration: 'none' }}>
          Start free
        </Link>
      </div>
    </header>
  );
}
