import Link from 'next/link';
import { PLATFORM_MODULES } from '@econav/platform';
import { SiteFooter } from '@/components/SiteFooter';
import { HomePublicHeader } from '@/components/HomePublicHeader';
import { HomeHero } from '@/components/HomeHero';

export default function HomePage() {
  return (
    <div className="platform-root">
      <HomePublicHeader />
      <main id="main-content" className="platform-main">
        <HomeHero />

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
