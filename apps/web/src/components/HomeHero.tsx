'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';

export function HomeHero() {
  const { t } = useI18n();

  return (
    <section className="landing-hero">
      <p className="hero-eyebrow">{t.home.eyebrow}</p>
      <h1>{t.home.title}</h1>
      <p className="hero-lead">
        Report issues, discover schemes, book waste pickups, and run municipal route operations —
        with persistent tickets when PostgreSQL is enabled.
      </p>
      <div className="hero-actions">
        <Link href="/citizen" className="btn btn-primary">
          {t.home.citizenPortal}
        </Link>
        <Link href="/admin" className="btn btn-secondary">
          {t.home.officialConsole}
        </Link>
        <Link href="/citizen/track" className="btn btn-secondary">
          {t.home.trackRequests}
        </Link>
      </div>
    </section>
  );
}
