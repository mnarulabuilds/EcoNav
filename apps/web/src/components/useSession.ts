'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PlatformUser } from '@econav/platform';
import { logoutWithCookie } from '@/lib/auth-api';
import { fetchMe } from '@/lib/platform-api';

export function useSession() {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: me } = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function logout() {
    await logoutWithCookie().catch(() => undefined);
    setUser(null);
  }

  return { user, loading, refresh, logout, setUser };
}
