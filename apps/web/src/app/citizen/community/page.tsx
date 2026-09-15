'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { enrollCommunity, fetchCommunity } from '@/lib/platform-api';
import type { CommunityEvent } from '@econav/platform';

export default function CommunityPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunity().then((d) => setEvents(d.events)).catch(() => setEvents([]));
  }, []);

  async function enroll(id: string) {
    try {
      const res = await enrollCommunity(id);
      setMessage(res.message);
      const d = await fetchCommunity();
      setEvents(d.events);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <PlatformShell title="Community" variant="citizen">
      {message && <p className="muted">{message}</p>}
      <ul className="data-list">
        {events.map((e) => (
          <li key={e.id}>
            <strong>{e.title}</strong> — {e.type}
            <div className="muted">{new Date(e.startsAt).toLocaleString()}</div>
            {e.slots !== undefined && (
              <div>
                Slots: {e.enrolled ?? 0}/{e.slots}
              </div>
            )}
            <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => enroll(e.id)}>
              Enroll / RSVP
            </button>
          </li>
        ))}
      </ul>
    </PlatformShell>
  );
}
