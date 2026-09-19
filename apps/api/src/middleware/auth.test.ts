import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from './auth.js';
import * as storeModule from '../store/index.js';

describe('requireAuth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when user missing', async () => {
    vi.spyOn(storeModule, 'getPlatformStore').mockReturnValue({
      getUserByToken: vi.fn().mockResolvedValue(undefined),
    } as never);

    const handler = requireAuth(['official']);
    const request = { headers: {} } as FastifyRequest;
    const send = vi.fn();
    const status = vi.fn().mockReturnValue({ send });
    const reply = { status, send } as unknown as FastifyReply;

    await handler(request, reply);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('returns 403 when role not allowed', async () => {
    vi.spyOn(storeModule, 'getPlatformStore').mockReturnValue({
      getUserByToken: vi.fn().mockResolvedValue({
        id: 'u1',
        role: 'citizen',
        phone: '9999999999',
        name: 'Citizen',
        preferredLanguage: 'en',
        createdAt: '',
      }),
    } as never);

    const handler = requireAuth(['official']);
    const request = { headers: { authorization: 'Bearer tok' } } as FastifyRequest;
    const send = vi.fn();
    const status = vi.fn().mockReturnValue({ send });
    const reply = { status, send } as unknown as FastifyReply;

    await handler(request, reply);
    expect(status).toHaveBeenCalledWith(403);
  });
});
