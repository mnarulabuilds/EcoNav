export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiClientConfig = {
  getBaseUrl: () => string;
  credentials?: RequestCredentials;
  getBearerToken?: () => string | null | undefined;
};

let config: ApiClientConfig = {
  getBaseUrl: () => 'http://localhost:3001',
  credentials: 'same-origin',
};

export function configureApiClient(next: ApiClientConfig): void {
  config = { ...config, ...next };
}

export function getApiBaseUrl(): string {
  return config.getBaseUrl();
}

function authHeaders(): HeadersInit {
  const token = config.getBearerToken?.();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const msg = (body as { error?: unknown }).error;
    if (typeof msg === 'string' && msg.length > 0) return msg;
  }
  return `Request failed (HTTP ${status})`;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = config.getBaseUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    credentials: config.credentials ?? init?.credentials,
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
