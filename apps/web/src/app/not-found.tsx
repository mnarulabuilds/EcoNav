'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="platform-root">
      <main className="platform-main error-page">
        <h1>{t.notFound.title}</h1>
        <p className="muted">{t.notFound.body}</p>
        <div className="hero-actions">
          <Link href="/" className="btn btn-primary">
            {t.common.goHome}
          </Link>
          <Link href="/citizen/help" className="btn btn-secondary">
            {t.nav.help}
          </Link>
        </div>
      </main>
    </div>
  );
}
