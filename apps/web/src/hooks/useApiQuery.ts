'use client';

import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import { resolveUserMessage } from '@/lib/errors';
import { useToast } from '@/components/ui/Toast';

export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
  options?: { toastOnError?: boolean; enabled?: boolean },
) {
  const { t } = useI18n();
  const { push } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(options?.enabled !== false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      const msg = resolveUserMessage(err, t.errors);
      setError(msg);
      if (options?.toastOnError !== false) push(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetcher, options?.toastOnError, push, t.errors]);

  useEffect(() => {
    if (options?.enabled === false) return;
    void refetch().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps controlled by caller
  }, deps);

  return { data, error, loading, refetch, setData };
}
