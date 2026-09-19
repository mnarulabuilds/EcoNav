import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <strong>CityConnect</strong>
          <p className="muted">Demo municipal platform — not an official government site.</p>
        </div>
        <nav className="site-footer-links" aria-label="Footer">
          <Link href="/citizen/help">Help &amp; demo login</Link>
          <Link href="/citizen/emergency">Emergency</Link>
          <Link href="/citizen/track">Track requests</Link>
          <Link href="/admin">Official console</Link>
        </nav>
      </div>
    </footer>
  );
}
