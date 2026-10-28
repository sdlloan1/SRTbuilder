import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function listApps() {
  try {
    const res = await fetch(API + '/api/apps', { cache: 'no-store' });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function Apps() {
  const apps = await listApps();

  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 40, maxWidth: 780 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontSize: 26, margin: 0 }}>Your apps</h1>
          <Link
            href="/new"
            className="btn btn-primary"
            style={{ marginLeft: 'auto', textDecoration: 'none', padding: '8px 14px', fontSize: 14 }}
          >
            New app
          </Link>
        </div>

        {apps.length === 0 && (
          <p style={{ color: '#8b95b5', marginTop: 24 }}>
            Nothing yet. <Link href="/new">Create your first app</Link>.
          </p>
        )}

        <ul style={{ listStyle: 'none', padding: 0, marginTop: 24 }}>
          {apps.map((a: any) => (
            <li key={a.id} style={{ borderBottom: '1px solid #243056', padding: '14px 0' }}>
              <Link href={'/apps/' + a.id} style={{ fontWeight: 600, fontSize: 15 }}>{a.name}</Link>
              <div style={{ color: '#8b95b5', fontSize: 12 }}>{a.startUrl}</div>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
