'use client';

import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';

export function HomePublicHeader() {
  const { t } = useI18n();

  return (
    <header className="app-header" role="banner">
      <div className="app-header-brand">
        <Link href="/" className="app-header-logo" aria-label="CityConnect home">
          CityConnect
        </Link>
        <div>
          <h1>Smart city services</h1>
          <p>Citizen portal &amp; official operations</p>
        </div>
      </div>
      <div className="app-header-actions">
        <LanguageSwitcher />
        <nav className="platform-nav" aria-label="Site">
          <Link href="/citizen/help" className="nav-link">
            {t.nav.help}
          </Link>
        </nav>
      </div>
    </header>
  );
}
