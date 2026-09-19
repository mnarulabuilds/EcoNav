'use client';

import { useEffect, useState } from 'react';

import { getApiBaseUrl } from '@/lib/api-client';

export function ApiStatusBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/health`, { cache: 'no-store' });
        if (!cancelled) setOffline(!res.ok);
      } catch {
        if (!cancelled) setOffline(true);
      }
    }

    void check();
    const id = window.setInterval(check, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="api-banner" role="alert">
      Cannot reach the CityConnect API at <code>{getApiBaseUrl()}</code>. Start it with{' '}
      <code>npm run dev:api</code> or check <code>NEXT_PUBLIC_API_URL</code>.
    </div>
  );
}
