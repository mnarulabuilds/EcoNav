'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { LoginPanel } from '@/components/LoginPanel';
import { useSession } from '@/components/useSession';
import { fetchModules } from '@/lib/platform-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { PageLoader } from '@/components/ui/PageLoader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CitizenHomePage() {
  const { user, loading, setUser, logout } = useSession();
  const fetcher = useCallback(() => fetchModules(), []);
  const { data, loading: loadingModules, error } = useApiQuery(fetcher, []);
  const modules = data?.modules ?? [];

  return (
    <PlatformShell
      title="Citizen Portal"
      subtitle="Services for residents"
      user={user}
      variant="citizen"
      onLogout={logout}
    >
      {!loading && !user && <LoginPanel onLoggedIn={setUser} />}
      {user && (
        <p className="welcome-banner">
          Welcome back, <strong>{user.name}</strong>. Pick a service below or{' '}
          <Link href="/citizen/track" className="inline-link">
            track your requests
          </Link>
          .
        </p>
      )}

      {loadingModules && <PageLoader label="Loading services…" />}
      {!loadingModules && error && (
        <EmptyState title="Could not load services" description={error} />
      )}
      {!loadingModules && !error && (
        <div className="landing-grid">
          {modules.map((mod) => (
            <Link key={mod.id} href={mod.citizenPath} className="module-card">
              <div className="icon">{mod.icon}</div>
              <h3>{mod.title}</h3>
              <p>{mod.description}</p>
            </Link>
          ))}
        </div>
      )}
    </PlatformShell>
  );
}
