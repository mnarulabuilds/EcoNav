'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { LoginPanel } from '@/components/LoginPanel';
import { useSession } from '@/components/useSession';
import { createUtilityTicket, fetchModules, fetchUtilityTypes } from '@/lib/platform-api';
import type { UtilityRequestType, Ward } from '@econav/platform';

export default function UtilitiesPage() {
  const { user, loading, setUser } = useSession();
  const [types, setTypes] = useState<UtilityRequestType[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wardId, setWardId] = useState('ward-1');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUtilityTypes().then((d) => {
      setTypes(d.types);
      if (d.types[0]) setCategory(d.types[0].id);
    });
    fetchModules().then((d) => setWards(d.wards));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const type = types.find((t) => t.id === category);
    try {
      await createUtilityTicket({
        category: type?.name ?? category,
        title,
        description,
        wardId,
      });
      setMessage('Utility request submitted.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <PlatformShell title="Utilities & Environment" variant="citizen" user={user}>
      {!loading && !user && <LoginPanel onLoggedIn={setUser} />}
      {user && (
        <form className="panel form-stack" onSubmit={submit}>
          <h2>New request</h2>
          <label>
            Request type
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (SLA {t.slaHours}h)
                </option>
              ))}
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
            Details
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          {message && <p className="muted">{message}</p>}
        </form>
      )}
    </PlatformShell>
  );
}
