'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId, useState } from 'react';
import type { PlatformUser } from '@econav/platform';
import { SiteFooter } from '@/components/SiteFooter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';
import { adminNav, citizenNav, labelForNav } from '@/components/nav-config';

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
  const [moreOpen, setMoreOpen] = useState(false);
  const pageTitleId = useId();
  const { t } = useI18n();

  const navLabel =
    variant === 'admin' ? t.nav.officialConsole : variant === 'citizen' ? t.nav.citizenServices : 'Site';

  const citizen = variant === 'citizen' ? citizenNav() : null;
  const adminItems = variant === 'admin' ? adminNav() : [];

  function renderNavLink(href: string, label: string) {
    const active = isActive(pathname, href);
    return (
      <Link
        key={href}
        href={href}
        className={active ? 'nav-link active' : 'nav-link'}
        aria-current={active ? 'page' : undefined}
        onClick={() => {
          setMenuOpen(false);
          setMoreOpen(false);
        }}
      >
        {label}
      </Link>
    );
  }

  return (
    <div className="platform-root platform-shell-layout">
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
        <div className="app-header-actions">
          <LanguageSwitcher />
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="platform-nav"
            aria-label={menuOpen ? t.common.closeMenu : t.common.openMenu}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {t.common.menu}
          </button>
        </div>
        <nav
          id="platform-nav"
          className={menuOpen ? 'platform-nav open' : 'platform-nav'}
          aria-label={navLabel}
        >
          {variant === 'citizen' && citizen && (
            <>
              {citizen.primary.map((item) => renderNavLink(item.href, labelForNav(t, item.labelKey)))}
              <div className="nav-more">
                <button
                  type="button"
                  className="nav-link nav-more-toggle"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((o) => !o)}
                >
                  {t.nav.allModules}
                </button>
                {moreOpen && (
                  <div className="nav-more-panel" role="group" aria-label={t.nav.allModules}>
                    {citizen.more.map((item) => renderNavLink(item.href, labelForNav(t, item.labelKey)))}
                    <Link href="/citizen/community" className="nav-link" onClick={() => setMenuOpen(false)}>
                      Community
                    </Link>
                    <Link href="/citizen/utilities" className="nav-link" onClick={() => setMenuOpen(false)}>
                      Utilities
                    </Link>
                    <Link href="/citizen/education" className="nav-link" onClick={() => setMenuOpen(false)}>
                      Education
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
          {variant === 'admin' && adminItems.map((item) => renderNavLink(item.href, labelForNav(t, item.labelKey)))}
        </nav>
      </header>

      {variant === 'citizen' && (
        <aside className="platform-sidebar" aria-label={t.nav.citizenServices}>
          {[...(citizen?.primary ?? []), ...(citizen?.more ?? [])].map((item) =>
            renderNavLink(item.href, labelForNav(t, item.labelKey)),
          )}
        </aside>
      )}

      {user && (
        <div className="platform-user-bar" role="status">
          <span>
            {t.common.signedInAs} <strong>{user.name}</strong> · {user.role.replace(/_/g, ' ')}
          </span>
          {onLogout && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onLogout}>
              {t.common.signOut}
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
