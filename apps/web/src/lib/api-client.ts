const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getApiBaseUrl(): string {
  return API_URL;
}

function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('cityconnect_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const msg = (body as { error?: unknown }).error;
    if (typeof msg === 'string' && msg.length > 0) return msg;
  }
  return `Request failed (HTTP ${status})`;
}

/** Typed JSON fetch against the CityConnect API. */
export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(parseErrorMessage(body, response.status), response.status);
  }

  return response.json() as Promise<T>;
}
