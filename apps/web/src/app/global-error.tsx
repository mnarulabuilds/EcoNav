'use client';

import { Inter, Noto_Sans_Devanagari } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${devanagari.variable}`}>
      <body>
        <div className="platform-root">
          <main className="platform-main error-page">
            <h1>Something went wrong</h1>
            <p className="muted">{error.message || 'An unexpected error occurred.'}</p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary" onClick={() => reset()}>
                Try again
              </button>
              <a href="/" className="btn btn-secondary">
                Go home
              </a>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
