'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="platform-root">
      <main className="platform-main error-page">
        <h1>Something went wrong</h1>
        <p className="muted">{t.errors.generic}</p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            {t.common.tryAgain}
          </button>
          <Link href="/" className="btn btn-secondary">
            {t.common.goHome}
          </Link>
        </div>
      </main>
    </div>
  );
}
