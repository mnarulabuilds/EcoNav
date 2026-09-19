import { describe, expect, it, vi, afterEach } from 'vitest';
import { ApiError, requestJson } from './api-client';

describe('requestJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws ApiError with server message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid OTP' }),
      }),
    );

    await expect(requestJson('/api/v1/auth/login')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid OTP',
      status: 401,
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

    const data = await requestJson<{ status: string }>('/api/health');
    expect(data.status).toBe('ok');
  });
});

describe('ApiError', () => {
  it('exposes status code', () => {
    const err = new ApiError('fail', 503);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(503);
  });
});
