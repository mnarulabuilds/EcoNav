'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { GuestGate } from '@/components/auth/GuestGate';
import { useSession } from '@/components/useSession';
import { createCivicTicket, fetchCivicTickets, fetchModules } from '@/lib/platform-api';
import type { ServiceTicket, Ward } from '@econav/platform';
import { useToast } from '@/components/ui/Toast';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
const IssueLocationMap = dynamic(() => import('@/components/IssueLocationMap'), { ssr: false });

export default function CivicPage() {
  const { user, loading, setUser, logout } = useSession();
  const { push } = useToast();
  const [wards, setWards] = useState<Ward[]>([]);
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [category, setCategory] = useState('pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wardId, setWardId] = useState('ward-1');
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const mapCenter = useMemo(() => {
    const ward = wards.find((w) => w.id === wardId);
    return ward ? { lat: ward.lat, lng: ward.lng } : { lat: 28.6139, lng: 77.209 };
  }, [wards, wardId]);

  useEffect(() => {
    fetchModules().then((d) => setWards(d.wards)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchCivicTickets().then((d) => setTickets(d.tickets)).catch(() => setTickets([]));
  }, [user]);

  useEffect(() => {
    setPin(null);
  }, [wardId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) {
      const msg = 'Tap the map to mark the issue location.';
      setMessage(msg);
      push(msg, 'error');
      return;
    }
    setMessage(null);
    try {
      await createCivicTicket({
        category,
        title,
        description,
        wardId,
        lat: pin.lat,
        lng: pin.lng,
      });
      push('Report submitted successfully', 'success');
      setMessage('Report submitted. Track status below or on Track.');
      setTitle('');
      setDescription('');
      setPin(null);
      const d = await fetchCivicTickets();
      setTickets(d.tickets);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      setMessage(msg);
      push(msg, 'error');
    }
  }

  return (
    <PlatformShell title="Civic & Grievances" variant="citizen" user={user} onLogout={logout}>
      <GuestGate loading={loading} user={user} onLoggedIn={setUser} loaderLabel="Checking session…">
        <div className="two-col">
          <form className="panel form-stack" onSubmit={submit}>
            <h2>Report an issue</h2>
            <p className="muted">Click the map to pin the exact location.</p>
            <IssueLocationMap center={mapCenter} position={pin} onPick={(lat, lng) => setPin({ lat, lng })} />
            {pin && (
              <p className="muted">
                Location: {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
              </p>
            )}
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="pothole">Pothole / road damage</option>
                <option value="streetlight">Streetlight outage</option>
                <option value="water">Water leak</option>
                <option value="illegal_dumping">Illegal dumping</option>
              </select>
            </label>
            <label>
              Ward
              <select value={wardId} onChange={(e) => setWardId(e.target.value)}>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn-primary">
              Submit report
            </button>
            {message && <p className="form-hint">{message}</p>}
          </form>
          <div className="panel">
            <h2>Your reports</h2>
            {tickets.length === 0 ? (
              <EmptyState title="No reports yet" description="Your submitted issues appear here." />
            ) : (
              <ul className="data-list">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <strong>{t.title}</strong>
                    <div className="muted">{t.category}</div>
                    {t.location && (
                      <div className="muted">
                        📍 {t.location.lat.toFixed(4)}, {t.location.lng.toFixed(4)}
                      </div>
                    )}
                    <StatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </GuestGate>
    </PlatformShell>
  );
}
