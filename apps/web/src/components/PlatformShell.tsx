'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId, useState } from 'react';
import type { PlatformUser } from '@econav/platform';
import { SiteFooter } from '@/components/SiteFooter';

interface PlatformShellProps {
  title: string;
  subtitle?: string;
  user?: PlatformUser | null;
  variant: 'citizen' | 'admin' | 'public';
  onLogout?: () => void;
  children: React.ReactNode;
}

function isActive(pathname: string, href: string) {
  if (href === '/citizen' || href === '/admin') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlatformShell({
  title,
  subtitle,
  user,
  variant,
  onLogout,
  children,
}: PlatformShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitleId = useId();
  const navLabel =
    variant === 'admin' ? 'Official console' : variant === 'citizen' ? 'Citizen services' : 'Site';

  const nav =
    variant === 'citizen'
      ? [
          { href: '/citizen', label: 'Home' },
          { href: '/citizen/civic', label: 'Report' },
          { href: '/citizen/track', label: 'Track' },
          { href: '/citizen/schemes', label: 'Schemes' },
          { href: '/citizen/waste', label: 'Waste' },
          { href: '/citizen/health', label: 'Health' },
          { href: '/citizen/emergency', label: 'Emergency' },
          { href: '/citizen/help', label: 'Help' },
        ]
      : variant === 'admin'
        ? [
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/tickets', label: 'Tickets' },
            { href: '/admin/waste-ops', label: 'Waste ops' },
          ]
        : [{ href: '/', label: 'Home' }];

  return (
    <div className="platform-root">
      <header className="app-header" role="banner">
        <div className="app-header-brand">
          <Link href="/" className="app-header-logo" aria-label="CityConnect home">
            CityConnect
          </Link>
          <div>
            <h1 id={pageTitleId}>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="platform-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          Menu
        </button>
        <nav
          id="platform-nav"
          className={menuOpen ? 'platform-nav open' : 'platform-nav'}
          aria-label={navLabel}
        >
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'nav-link active' : 'nav-link'}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {user && (
        <div className="platform-user-bar" role="status">
          <span>
            Signed in as <strong>{user.name}</strong> · {user.role.replace(/_/g, ' ')}
          </span>
          {onLogout && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onLogout}>
              Sign out
            </button>
          )}
        </div>
      )}
      <main id="main-content" className="platform-main" aria-labelledby={pageTitleId}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
