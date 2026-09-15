'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { fetchMobility } from '@/lib/platform-api';
import type { MobilityAsset } from '@econav/platform';

export default function MobilityPage() {
  const [assets, setAssets] = useState<MobilityAsset[]>([]);

  useEffect(() => {
    fetchMobility().then((d) => setAssets(d.assets)).catch(() => setAssets([]));
  }, []);

  return (
    <PlatformShell title="Mobility & Parking" variant="citizen">
      <ul className="data-list">
        {assets.map((a) => (
          <li key={a.id}>
            <strong>{a.name}</strong> — {a.type}
            <div className="muted">Status: {a.status}</div>
            {a.meta && <div>{a.meta}</div>}
          </li>
        ))}
      </ul>
    </PlatformShell>
  );
}
