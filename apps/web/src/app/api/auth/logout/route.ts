import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import { SESSION_COOKIE } from '@/lib/session-cookie';

export async function POST() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await fetch(`${getServerApiUrl()}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    }).catch(() => undefined);
  }

  cookies().delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
