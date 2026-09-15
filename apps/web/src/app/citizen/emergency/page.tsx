'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { fetchEmergency } from '@/lib/platform-api';
import type { EmergencyResource } from '@econav/platform';

export default function EmergencyPage() {
  const [resources, setResources] = useState<EmergencyResource[]>([]);

  useEffect(() => {
    fetchEmergency().then((d) => setResources(d.resources)).catch(() => setResources([]));
  }, []);

  return (
    <PlatformShell title="Emergency & Safety" variant="citizen">
      <div className="alert alert-warning">
        In an emergency, call <strong>112</strong> or tap helplines below.
      </div>
      <ul className="data-list">
        {resources.map((r) => (
          <li key={r.id}>
            <strong>{r.name}</strong> ({r.type})
            <div>
              <a href={`tel:${r.phone}`}>{r.phone}</a>
            </div>
            {r.notes && <p className="muted">{r.notes}</p>}
          </li>
        ))}
      </ul>
    </PlatformShell>
  );
}
