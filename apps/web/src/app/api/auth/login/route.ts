import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/session-cookie';

export async function POST(request: Request) {
  const body = await request.text();
  const upstream = await fetch(`${getServerApiUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body,
    cache: 'no-store',
  });

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(payload ?? { error: 'Login failed' }, { status: upstream.status });
  }

  const token = (payload as { token?: string }).token;
  if (!token) {
    return NextResponse.json({ error: 'Invalid login response' }, { status: 502 });
  }

  const secure = process.env.NODE_ENV === 'production';
  cookies().set(SESSION_COOKIE, token, sessionCookieOptions(secure));
  return NextResponse.json({ user: (payload as { user: unknown }).user });
}
