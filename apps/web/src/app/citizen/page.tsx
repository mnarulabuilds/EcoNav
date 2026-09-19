'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { LoginPanel } from '@/components/LoginPanel';
import { useSession } from '@/components/useSession';
import { fetchModules } from '@/lib/platform-api';
import type { PlatformModuleMeta } from '@econav/platform';

export default function CitizenHomePage() {
  const { user, loading, setUser, logout } = useSession();
  const [modules, setModules] = useState<PlatformModuleMeta[]>([]);

  useEffect(() => {
    fetchModules()
      .then((data) => setModules(data.modules))
      .catch(() => setModules([]));
  }, []);

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

      <div className="landing-grid">
        {modules.map((mod) => (
          <Link key={mod.id} href={mod.citizenPath} className="module-card">
            <div className="icon">{mod.icon}</div>
            <h3>{mod.title}</h3>
            <p>{mod.description}</p>
          </Link>
        ))}
      </div>
    </PlatformShell>
  );
}
