import Link from 'next/link';
import { PLATFORM_MODULES } from '@econav/platform';
import { SiteFooter } from '@/components/SiteFooter';

export default function HomePage() {
  return (
    <div className="platform-root">
      <header className="app-header">
        <div className="app-header-brand">
          <span className="app-header-logo">CityConnect</span>
          <div>
            <h1>Smart city services</h1>
            <p>Citizen portal &amp; official operations</p>
          </div>
        </div>
        <nav className="platform-nav">
          <Link href="/citizen/help" className="nav-link">
            Help
          </Link>
        </nav>
      </header>
      <main id="main-content" className="platform-main">
        <section className="landing-hero">
          <p className="hero-eyebrow">Production-ready demo</p>
          <h1>One platform for citizens and government</h1>
          <p className="hero-lead">
            Report issues, discover schemes, book waste pickups, and run municipal route operations —
            with persistent tickets when PostgreSQL is enabled.
          </p>
          <div className="hero-actions">
            <Link href="/citizen" className="btn btn-primary">
              Citizen portal
            </Link>
            <Link href="/admin" className="btn btn-secondary">
              Official console
            </Link>
            <Link href="/citizen/track" className="btn btn-secondary">
              Track requests
            </Link>
          </div>
        </section>

        <section className="trust-row" aria-label="Highlights">
          <div className="trust-card">
            <strong>Map-based reporting</strong>
            <span className="muted">Pin exact issue locations</span>
          </div>
          <div className="trust-card">
            <strong>SLA tracking</strong>
            <span className="muted">See resolution timelines</span>
          </div>
          <div className="trust-card">
            <strong>Route optimization</strong>
            <span className="muted">CVRP for waste operations</span>
          </div>
        </section>

        <h2 className="section-title">Service modules</h2>
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
      <SiteFooter />
    </div>
  );
}
