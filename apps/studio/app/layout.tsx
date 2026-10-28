import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SRT Builder',
  description: 'Turn any website into a native iOS and Android app.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0b1020', color: '#e6e9f2' }}>
        {children}
      </body>
    </html>
  );
}
