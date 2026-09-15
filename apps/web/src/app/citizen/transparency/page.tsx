'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { fetchModules, fetchTransparency } from '@/lib/platform-api';
import type { TransparencyProject, Ward } from '@econav/platform';

export default function TransparencyPage() {
  const [projects, setProjects] = useState<TransparencyProject[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [wardId, setWardId] = useState('');

  useEffect(() => {
    fetchModules().then((d) => setWards(d.wards));
  }, []);

  useEffect(() => {
    fetchTransparency(wardId || undefined)
      .then((d) => setProjects(d.projects))
      .catch(() => setProjects([]));
  }, [wardId]);

  return (
    <PlatformShell title="Transparency" variant="citizen">
      <div className="panel">
        <label>
          Ward
          <select value={wardId} onChange={(e) => setWardId(e.target.value)}>
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
        {projects.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong>
            <div className="muted">
              Budget ₹{p.budgetInr.toLocaleString('en-IN')} · {p.status} · {p.completionPercent}%
            </div>
            <p>{p.summary}</p>
          </li>
        ))}
      </ul>
    </PlatformShell>
  );
}
