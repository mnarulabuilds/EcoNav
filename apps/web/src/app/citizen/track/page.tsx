'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { LoginPanel } from '@/components/LoginPanel';
import { useSession } from '@/components/useSession';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from '@/components/ui/PageLoader';
import { StatusBadge, slaLabel } from '@/components/ui/StatusBadge';
import { fetchCivicTickets } from '@/lib/platform-api';
import type { ServiceTicket } from '@econav/platform';

export default function TrackRequestsPage() {
  const { user, loading, setUser, logout } = useSession();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    fetchCivicTickets()
      .then((d) => setTickets(d.tickets))
      .catch(() => setTickets([]))
      .finally(() => setFetching(false));
  }, [user]);

  return (
    <PlatformShell
      title="Track requests"
      subtitle="Status and SLA for your civic reports"
      variant="citizen"
      user={user}
      onLogout={logout}
    >
      {loading && <PageLoader label="Checking session…" />}
      {!loading && !user && <LoginPanel onLoggedIn={setUser} />}
      {!loading && user && fetching && <PageLoader label="Loading your reports…" />}
      {!loading && user && !fetching && tickets.length === 0 && (
        <EmptyState
          title="No reports yet"
          description="Submit a civic issue to track resolution here."
          action={
            <Link href="/citizen/civic" className="btn btn-primary">
              Report an issue
            </Link>
          }
        />
      )}
      {!loading && user && !fetching && tickets.length > 0 && (
        <ul className="data-list track-list">
          {tickets.map((t) => {
            const sla = slaLabel(t);
            return (
              <li key={t.id}>
                <div className="track-list-head">
                  <strong>{t.title}</strong>
                  <StatusBadge status={t.status} />
                </div>
                <p className="muted">
                  {t.category} · {new Date(t.createdAt).toLocaleString()}
                </p>
                <p className={`sla-hint sla-${sla.tone}`}>{sla.text}</p>
                {t.location && (
                  <p className="muted">
                    Location: {t.location.lat.toFixed(4)}, {t.location.lng.toFixed(4)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PlatformShell>
  );
}
