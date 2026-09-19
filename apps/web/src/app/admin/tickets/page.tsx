'use client';

import { useCallback, useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { GuestGate } from '@/components/auth/GuestGate';
import { useSession } from '@/components/useSession';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { fetchAdminTickets, updateTicketStatus } from '@/lib/platform-api';
import type { ServiceTicket } from '@econav/platform';
import { useI18n } from '@/i18n';
import { resolveUserMessage } from '@/lib/errors';

const STATUS_ACTIONS: ServiceTicket['status'][] = ['assigned', 'in_progress', 'resolved', 'escalated'];

export default function AdminTicketsPage() {
  const { user, loading, setUser, logout } = useSession();
  const { push } = useToast();
  const { t } = useI18n();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  const load = useCallback(async (cursor?: string, append = false) => {
    setLoadingList(true);
    setListError(null);
    try {
      const d = await fetchAdminTickets({ limit: 50, cursor });
      setTickets((prev) => (append ? [...prev, ...d.tickets] : d.tickets));
      setNextCursor(d.nextCursor);
    } catch (err) {
      const msg = resolveUserMessage(err, t.errors);
      setListError(msg);
      push(msg, 'error');
      if (!append) setTickets([]);
    } finally {
      setLoadingList(false);
    }
  }, [push, t.errors]);

  useEffect(() => {
    if (!user || user.role === 'citizen') return;
    void load(undefined, false);
  }, [user, load]);

  async function setStatus(id: string, status: ServiceTicket['status']) {
    try {
      await updateTicketStatus(id, status);
      push(`Ticket marked ${status.replace(/_/g, ' ')}`, 'success');
      await load(undefined, false);
    } catch (err) {
      push(resolveUserMessage(err, t.errors), 'error');
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
        {listError && (
          <div className="alert alert-error" role="alert">
            {listError}
          </div>
        )}
        {user && user.role !== 'citizen' && !loadingList && tickets.length === 0 && !listError && (
          <EmptyState
            title="No tickets in queue"
            description="Citizens can submit reports from the civic module."
          />
        )}
        {user && user.role !== 'citizen' && tickets.length > 0 && (
          <>
            <ul className="data-list" aria-label="Service tickets">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <strong>{ticket.title}</strong> — {ticket.domain}/{ticket.category}
                  <div className="muted">{ticket.description}</div>
                  {ticket.location && (
                    <div className="muted">
                      Map: {ticket.location.lat.toFixed(5)}, {ticket.location.lng.toFixed(5)}
                    </div>
                  )}
                  <StatusBadge status={ticket.status} />
                  <div
                    className="ticket-actions"
                    role="group"
                    aria-label={`Update status for ${ticket.title}`}
                  >
                    {STATUS_ACTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        aria-label={`Set ${ticket.title} to ${s.replace(/_/g, ' ')}`}
                        onClick={() => setStatus(ticket.id, s)}
                      >
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            {nextCursor && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loadingList}
                onClick={() => load(nextCursor, true)}
              >
                {loadingList ? t.common.loading : t.common.loadMore}
              </button>
            )}
          </>
        )}
      </GuestGate>
    </PlatformShell>
  );
}
