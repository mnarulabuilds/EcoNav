import Link from 'next/link';
import { PLATFORM_MODULES } from '@econav/platform';

export default function HomePage() {
  return (
    <div className="platform-root">
      <header className="app-header">
        <div>
          <h1>CityConnect</h1>
          <p>Smart city citizen services &amp; official operations</p>
        </div>
      </header>
      <main className="platform-main">
        <section className="landing-hero">
          <h1>One platform for citizens and government</h1>
          <p className="muted">
            Report issues, discover schemes, book waste pickups, and run municipal operations — built on EcoNav route intelligence.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link href="/citizen" className="btn btn-primary">
              Citizen portal
            </Link>
            <Link href="/admin" className="btn btn-secondary">
              Official console
            </Link>
          </div>
        </section>

        <h2 style={{ fontSize: '1.125rem', color: 'var(--color-primary)' }}>Service modules</h2>
        <div className="landing-grid">
          {PLATFORM_MODULES.map((mod) => (
            <Link key={mod.id} href={mod.citizenPath} className="module-card">
              <div className="icon">{mod.icon}</div>
              <h3>{mod.title}</h3>
              <p>{mod.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
