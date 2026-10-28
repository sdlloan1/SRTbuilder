import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const FEATURES = [
  {
    title: 'Real native shells',
    body: 'Ship a proper Xcode and Gradle project — no webview-only wrapper. Native navigation bars, tab bars, splash screens and status bar control included.',
  },
  {
    title: 'Bridge that is always on',
    body: 'Haptics, clipboard, share, screen, tabs, deep links. The srt.* JavaScript API is injected into every page you load, with no paid tier gating it.',
  },
  {
    title: 'Live simulator',
    body: 'Drop in a URL and drive the bridge from a browser. Every command shows up in the console, so you build the native UX before touching a device.',
  },
  {
    title: 'Self-hosted by design',
    body: 'The studio, the API and the templates all run on your machine. Your URL, your config and your builds never leave your infrastructure.',
  },
  {
    title: 'Plain, hackable templates',
    body: 'iOS and Android shells are Handlebars-tokenised files in the repo. Fork them, add a module, rebuild. No proprietary toolchain in the way.',
  },
  {
    title: 'OpenAPI for agents',
    body: 'The whole studio runs on a documented Fastify API at /docs. Point a script or an agent at it and generate apps without the UI.',
  },
];

const STEPS = [
  { n: '01', title: 'Paste a URL', body: 'Give the studio the site you already run and a name for the app.' },
  { n: '02', title: 'Tune the shell', body: 'Set branding, tabs, permissions and bridge access. The simulator answers every bridge call live.' },
  { n: '03', title: 'Build the project', body: 'Generate the iOS and Android project. Open it in Xcode or Gradle, sign it, ship it.' },
];

const FAQ = [
  {
    q: 'Is it really free?',
    a: 'Yes. SRT Builder is MIT licensed and self-hosted. There is no per-build fee, no seat count, no watermark and no runtime license check. The only costs are your own hosting and the Apple or Google developer accounts you already need to publish.',
  },
  {
    q: 'How is this different from a paid app builder?',
    a: 'Paid builders host your config and build farm, and often gate the JavaScript bridge on a paid plan. Here the studio, the API and the native templates live in your repository, so the bridge is always enabled and nothing phones home.',
  },
  {
    q: 'What can the bridge do?',
    a: 'Status bar, tabs, haptics, share sheet, clipboard, screen brightness, keep-awake, navigation controls and device info. Calls are srt.<module>.<method>() and each one returns a promise that resolves with the native result.',
  },
  {
    q: 'Do I need a Mac to build?',
    a: 'Only for the iOS app — App Store builds still require Xcode. The Android project builds with Gradle anywhere, and the studio plus simulator run fine in a browser.',
  },
  {
    q: 'Where does my data live?',
    a: 'In the API database next to the studio. The WebView talks to your origin directly, so there is no proxy in the middle and no analytics service watching your users.',
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="wrap hero">
          <span className="pill">Open source · MIT · Free forever</span>
          <h1>
            Turn any website into a
            <br />
            native iOS and Android app
          </h1>
          <p className="lead">
            SRT Builder gives your site a real native shell and a JavaScript bridge to every device
            capability — then hands you the project to publish. No subscriptions, no watermark, no
            locked bridge.
          </p>

          <div className="cta-row">
            <Link href="/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Build an app — free
            </Link>
            <Link href="/#how" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
              See how it works
            </Link>
          </div>

          <div className="trust-row">
            <span>Self-hosted</span>
            <span>·</span>
            <span>Bridge always enabled</span>
            <span>·</span>
            <span>Exportable Xcode &amp; Gradle projects</span>
            <span>·</span>
            <span>No credit card</span>
          </div>

          <div className="hero-shot">
            <div className="phone">
              <div className="phone-bar" />
              <div className="phone-body">
                <div className="phone-line w70" />
                <div className="phone-line w45 dim" />
                <div className="phone-card" />
                <div className="phone-card short" />
                <div className="phone-actions">
                  <div className="phone-chip">srt.haptics.impact</div>
                  <div className="phone-chip">statusbar.set</div>
                </div>
              </div>
            </div>
            <div className="console">
              <div className="console-head">Bridge console</div>
              <div className="console-line"><span>001</span> srt.device.getInfo()</div>
              <div className="console-line"><span>002</span> srt.statusbar.set({'{'}&quot;color&quot;:&quot;#0b1020&quot;{'}'})</div>
              <div className="console-line"><span>003</span> srt.haptics.impact({'{'}&quot;style&quot;:&quot;medium&quot;{'}'})</div>
              <div className="console-line"><span>004</span> srt.share.page({'{'}&quot;title&quot;:&quot;SRT&quot;{'}'})</div>
              <div className="console-line muted"><span>005</span> waiting for commands…</div>
            </div>
          </div>
        </section>

        <section id="features" className="wrap section">
          <h2>Everything a thin wrapper is missing</h2>
          <p className="section-lead">
            App stores reject a bare WebView. SRT Builder ships the native surface area and the
            JavaScript API that makes a wrapped site feel like a real app.
          </p>
          <div className="grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="wrap section">
          <h2>From URL to project in three steps</h2>
          <div className="grid steps">
            {STEPS.map((s) => (
              <div key={s.n} className="card step">
                <span className="step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="wrap section">
          <h2>One plan. It is free.</h2>
          <p className="section-lead">
            No trial, no per-build credits, no feature gates. Run as many apps as you like, on your
            own server.
          </p>
          <div className="price-card">
            <div>
              <div className="price-tag">
                $0 <span>/ forever</span>
              </div>
              <p className="price-note">MIT licensed. Self-hosted. Yours to fork.</p>
            </div>
            <ul className="price-list">
              <li>Unlimited apps and builds</li>
              <li>JavaScript bridge on every page</li>
              <li>iOS and Android templates included</li>
              <li>Live simulator with bridge console</li>
              <li>OpenAPI access for automation</li>
              <li>No watermark, no license key</li>
            </ul>
            <Link href="/new" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Start building
            </Link>
          </div>
        </section>

        <section id="faq" className="wrap section">
          <h2>Questions</h2>
          <div className="faq">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
