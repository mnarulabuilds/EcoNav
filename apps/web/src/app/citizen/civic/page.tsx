'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { LoginPanel } from '@/components/LoginPanel';
import { useSession } from '@/components/useSession';
import { createCivicTicket, fetchCivicTickets, fetchModules } from '@/lib/platform-api';
import type { ServiceTicket, Ward } from '@econav/platform';

const IssueLocationMap = dynamic(() => import('@/components/IssueLocationMap'), { ssr: false });

export default function CivicPage() {
  const { user, loading, setUser } = useSession();
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
      setMessage('Tap the map to mark the issue location.');
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
      setMessage('Report submitted. Track status below.');
      setTitle('');
      setDescription('');
      setPin(null);
      const d = await fetchCivicTickets();
      setTickets(d.tickets);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <PlatformShell title="Civic & Grievances" variant="citizen" user={user}>
      {!loading && !user && <LoginPanel onLoggedIn={setUser} />}
      {user && (
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
            {message && <p className="muted">{message}</p>}
          </form>
          <div className="panel">
            <h2>Your reports</h2>
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
                  <span className="status-pill">{t.status}</span>
                </li>
              ))}
              {tickets.length === 0 && <p className="muted">No reports yet.</p>}
            </ul>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}
