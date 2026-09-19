'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { LoginPanel } from '@/components/LoginPanel';
import { useSession } from '@/components/useSession';
import { fetchAdminDashboard } from '@/lib/platform-api';
import type { AdminDashboardStats } from '@econav/platform';

export default function AdminDashboardPage() {
  const { user, loading, setUser, logout } = useSession();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'official' && user.role !== 'field_staff')) return;
    fetchAdminDashboard()
      .then((d) => setStats(d.stats))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'));
  }, [user]);

  return (
    <PlatformShell
      title="Official Console"
      subtitle="City operations dashboard"
      variant="admin"
      user={user}
      onLogout={logout}
    >
      {!loading && !user && <LoginPanel onLoggedIn={setUser} />}
      {user && user.role === 'citizen' && (
        <div className="alert alert-error">Sign in with official demo phone 8888888888.</div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {stats && (
        <>
          <div className="summary-grid" style={{ marginBottom: '1rem' }}>
            <div className="summary-card">
              <div className="value">{stats.openTickets}</div>
              <div className="label">Open tickets</div>
            </div>
            <div className="summary-card">
              <div className="value">{stats.slaBreaches}</div>
              <div className="label">SLA breaches</div>
            </div>
            <div className="summary-card">
              <div className="value">{stats.resolvedThisWeek}</div>
              <div className="label">Resolved (7d)</div>
            </div>
            <div className="summary-card">
              <div className="value">{stats.pendingPickups}</div>
              <div className="label">Pending pickups</div>
            </div>
          </div>
          <div className="panel">
            <h2>Tickets by ward</h2>
            <ul className="data-list">
              {stats.ticketsByWard.map((w) => (
                <li key={w.wardId}>
                  {w.wardName}: <strong>{w.count}</strong>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </PlatformShell>
  );
}
