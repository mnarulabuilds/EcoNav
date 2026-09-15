'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PlatformUser } from '@econav/platform';

interface PlatformShellProps {
  title: string;
  subtitle?: string;
  user?: PlatformUser | null;
  variant: 'citizen' | 'admin' | 'public';
  children: React.ReactNode;
}

export function PlatformShell({ title, subtitle, user, variant, children }: PlatformShellProps) {
  const pathname = usePathname();

  const nav =
    variant === 'citizen'
      ? [
          { href: '/citizen', label: 'Home' },
          { href: '/citizen/civic', label: 'Civic' },
          { href: '/citizen/schemes', label: 'Schemes' },
          { href: '/citizen/waste', label: 'Waste' },
        ]
      : variant === 'admin'
        ? [
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/tickets', label: 'Tickets' },
            { href: '/admin/waste-ops', label: 'Waste Ops' },
          ]
        : [{ href: '/', label: 'Home' }];

  return (
    <div className="platform-root">
      <header className="app-header">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <nav className="platform-nav">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'nav-link active' : 'nav-link'}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/" className="nav-link">
            CityConnect
          </Link>
        </nav>
      </header>
      {user && (
        <div className="platform-user-bar">
          Signed in as <strong>{user.name}</strong> ({user.role})
        </div>
      )}
      <main className="platform-main">{children}</main>
    </div>
  );
}
