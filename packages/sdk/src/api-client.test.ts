import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, configureApiClient, requestJson } from './api-client.js';

describe('api-client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    configureApiClient({ getBaseUrl: () => 'http://localhost:3001' });
  });

  it('throws ApiError on failed responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Nope' }),
      }),
    );

    await expect(requestJson('/api/v1/auth/me')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Nope',
    });
  });

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' }),
      }),
    );

    await expect(requestJson('/api/health')).resolves.toEqual({ status: 'ok' });
  });

  it('ApiError exposes status', () => {
    const err = new ApiError('bad', 400);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
  });
});
