'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { GuestGate } from '@/components/auth/GuestGate';
import { useSession } from '@/components/useSession';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { fetchAdminTickets, updateTicketStatus } from '@/lib/platform-api';
import type { ServiceTicket } from '@econav/platform';

const STATUS_ACTIONS: ServiceTicket['status'][] = ['assigned', 'in_progress', 'resolved', 'escalated'];

export default function AdminTicketsPage() {
  const { user, loading, setUser, logout } = useSession();
  const { push } = useToast();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);

  async function load() {
    const d = await fetchAdminTickets();
    setTickets(d.tickets);
  }

  useEffect(() => {
    if (!user || user.role === 'citizen') return;
    load().catch(() => setTickets([]));
  }, [user]);

  async function setStatus(id: string, status: ServiceTicket['status']) {
    try {
      await updateTicketStatus(id, status);
      push(`Ticket marked ${status.replace(/_/g, ' ')}`, 'success');
      await load();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  }

  return (
    <PlatformShell
      title="Ticket queue"
      subtitle="Review and update citizen reports"
      variant="admin"
      user={user}
      onLogout={logout}
    >
      <GuestGate loading={loading} user={user} onLoggedIn={setUser}>
        {user?.role === 'citizen' && (
          <div className="alert alert-error" role="alert">
            Sign in with official demo phone 8888888888.
          </div>
        )}
        {user && user.role !== 'citizen' && tickets.length === 0 && (
          <EmptyState
            title="No tickets in queue"
            description="Citizens can submit reports from the civic module."
          />
        )}
        {user && user.role !== 'citizen' && tickets.length > 0 && (
          <ul className="data-list" aria-label="Service tickets">
            {tickets.map((t) => (
              <li key={t.id}>
                <strong>{t.title}</strong> — {t.domain}/{t.category}
                <div className="muted">{t.description}</div>
                {t.location && (
                  <div className="muted">
                    Map: {t.location.lat.toFixed(5)}, {t.location.lng.toFixed(5)}
                  </div>
                )}
                <StatusBadge status={t.status} />
                <div
                  className="ticket-actions"
                  role="group"
                  aria-label={`Update status for ${t.title}`}
                >
                  {STATUS_ACTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      aria-label={`Set ${t.title} to ${s.replace(/_/g, ' ')}`}
                      onClick={() => setStatus(t.id, s)}
                    >
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </GuestGate>
    </PlatformShell>
  );
}
