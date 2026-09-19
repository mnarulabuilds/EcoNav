'use client';

import type { PlatformUser } from '@econav/platform';
import { ApiError } from '@econav/sdk';

function parseErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const msg = (body as { error?: unknown }).error;
    if (typeof msg === 'string' && msg.length > 0) return msg;
  }
  return `Request failed (HTTP ${status})`;
}

export async function loginWithCookie(
  phone: string,
  otp: string,
  preferredLanguage?: PlatformUser['preferredLanguage'],
): Promise<{ user: PlatformUser }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ phone, otp, preferredLanguage }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(parseErrorMessage(body, response.status), response.status);
  }

  return response.json() as Promise<{ user: PlatformUser }>;
}

export async function logoutWithCookie(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}
