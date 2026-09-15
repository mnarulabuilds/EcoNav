'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { fetchHealth, fetchModules } from '@/lib/platform-api';
import type { HealthFacility, Ward } from '@econav/platform';

export default function HealthPage() {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [wardId, setWardId] = useState('');
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    fetchModules().then((d) => setWards(d.wards)).catch(() => undefined);
  }, []);

  useEffect(() => {
    fetchHealth(wardId || undefined)
      .then((d) => setFacilities(d.facilities))
      .catch(() => setFacilities([]));
  }, [wardId]);

  return (
    <PlatformShell title="Health & Wellness" variant="citizen">
      <div className="panel">
        <label>
          Filter by ward
          <select value={wardId} onChange={(e) => setWardId(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="">All wards</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="data-list">
        {facilities.map((f) => (
          <li key={f.id}>
            <strong>{f.name}</strong> ({f.type})
            <div className="muted">{f.hours}</div>
            <div>Services: {f.services.join(', ')}</div>
            {f.phone && <div>Phone: {f.phone}</div>}
          </li>
        ))}
      </ul>
    </PlatformShell>
  );
}
