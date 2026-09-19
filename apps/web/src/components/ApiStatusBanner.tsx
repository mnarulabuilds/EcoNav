'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';

const MIN_INTERVAL_MS = 30_000;
const MAX_INTERVAL_MS = 120_000;

export function ApiStatusBanner() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(false);
  const intervalRef = useRef(MIN_INTERVAL_MS);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_HIDE_API_BANNER === 'true') {
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    async function check() {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (!cancelled) setOffline(true);
        intervalRef.current = Math.min(intervalRef.current * 2, MAX_INTERVAL_MS);
        return;
      }

      try {
        const res = await fetch('/api/bff/api/health', { cache: 'no-store', credentials: 'include' });
        const ok = res.ok;
        if (!cancelled) setOffline(!ok);
        intervalRef.current = ok ? MIN_INTERVAL_MS : Math.min(intervalRef.current * 2, MAX_INTERVAL_MS);
      } catch {
        if (!cancelled) setOffline(true);
        intervalRef.current = Math.min(intervalRef.current * 2, MAX_INTERVAL_MS);
      }
    }

    function schedule() {
      timer = window.setTimeout(async () => {
        await check();
        if (!cancelled) schedule();
      }, intervalRef.current);
    }

    void check().then(schedule);

    function onOnline() {
      intervalRef.current = MIN_INTERVAL_MS;
      void check();
    }

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOnline);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="api-banner" role="alert">
      {t.apiBanner.offline}{' '}
      {process.env.NODE_ENV !== 'production' && (
        <span className="muted">{t.apiBanner.devHint}</span>
      )}
    </div>
  );
}
