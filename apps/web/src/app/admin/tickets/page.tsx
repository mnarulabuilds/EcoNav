'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { LoginPanel } from '@/components/LoginPanel';
import { useSession } from '@/components/useSession';
import { fetchAdminTickets, updateTicketStatus } from '@/lib/platform-api';
import type { ServiceTicket } from '@econav/platform';

export default function AdminTicketsPage() {
  const { user, loading, setUser } = useSession();
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
    await updateTicketStatus(id, status);
    await load();
  }

  return (
    <PlatformShell title="Ticket queue" variant="admin" user={user}>
      {!loading && !user && <LoginPanel onLoggedIn={setUser} />}
      <ul className="data-list">
        {tickets.map((t) => (
          <li key={t.id}>
            <strong>{t.title}</strong> — {t.domain}/{t.category}
            <div className="muted">{t.description}</div>
            {t.location && (
              <div className="muted">
                Map: {t.location.lat.toFixed(5)}, {t.location.lng.toFixed(5)}
              </div>
            )}
            <span className="status-pill">{t.status}</span>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {(['assigned', 'in_progress', 'resolved', 'escalated'] as const).map((s) => (
                <button key={s} type="button" className="btn btn-secondary" onClick={() => setStatus(t.id, s)}>
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
        {tickets.length === 0 && user && <p className="muted">No tickets yet — citizens can submit from the portal.</p>}
      </ul>
    </PlatformShell>
  );
}
