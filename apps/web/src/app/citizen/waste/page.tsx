'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { LoginPanel } from '@/components/LoginPanel';
import { useSession } from '@/components/useSession';
import { createPickup, fetchDropPoints, fetchModules, fetchPickups } from '@/lib/platform-api';
import type { PickupBooking, WasteDropPoint, Ward } from '@econav/platform';

export default function WastePage() {
  const { user, loading, setUser } = useSession();
  const [dropPoints, setDropPoints] = useState<WasteDropPoint[]>([]);
  const [pickups, setPickups] = useState<PickupBooking[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [type, setType] = useState<'bulk_waste' | 'ewaste'>('ewaste');
  const [wardId, setWardId] = useState('ward-1');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDropPoints().then((d) => setDropPoints(d.dropPoints)).catch(() => undefined);
    fetchModules().then((d) => setWards(d.wards)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchPickups().then((d) => setPickups(d.pickups)).catch(() => setPickups([]));
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ward = wards.find((w) => w.id === wardId);
    try {
      await createPickup({
        type,
        wardId,
        address,
        items,
        scheduledDate,
        lat: ward?.lat ?? 28.61,
        lng: ward?.lng ?? 77.21,
      });
      setMessage('Pickup requested.');
      const d = await fetchPickups();
      setPickups(d.pickups);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <PlatformShell title="Waste & E-Waste" variant="citizen" user={user}>
      {!loading && !user && <LoginPanel onLoggedIn={setUser} />}
      <div className="panel">
        <h2>Nearby drop points</h2>
        <ul className="data-list">
          {dropPoints.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong> ({p.type})
              <div className="muted">Accepts: {p.accepts.join(', ')}</div>
            </li>
          ))}
        </ul>
      </div>
      {user && (
        <div className="two-col">
          <form className="panel form-stack" onSubmit={submit}>
            <h2>Schedule pickup</h2>
            <label>
              Type
              <select value={type} onChange={(e) => setType(e.target.value as 'bulk_waste' | 'ewaste')}>
                <option value="ewaste">E-waste</option>
                <option value="bulk_waste">Bulk waste</option>
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
              Address
              <input value={address} onChange={(e) => setAddress(e.target.value)} required />
            </label>
            <label>
              Items
              <textarea value={items} onChange={(e) => setItems(e.target.value)} required />
            </label>
            <label>
              Preferred date
              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn-primary">
              Request pickup
            </button>
            {message && <p className="muted">{message}</p>}
          </form>
          <div className="panel">
            <h2>Your pickups</h2>
            <ul className="data-list">
              {pickups.map((p) => (
                <li key={p.id}>
                  <strong>{p.type}</strong> — {p.scheduledDate}
                  <div className="muted">{p.address}</div>
                  <span className="status-pill">{p.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}
