import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from './server.js';

describe('CORS', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    server = await buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it('allows https://econav-web.vercel.app', async () => {
    const response = await server.inject({
      method: 'OPTIONS',
      url: '/api/plan',
      headers: {
        origin: 'https://econav-web.vercel.app',
        'access-control-request-method': 'POST',
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(
      'https://econav-web.vercel.app',
    );
  });

  it('allows https://www.econav.in', async () => {
    const response = await server.inject({
      method: 'OPTIONS',
      url: '/api/plan',
      headers: {
        origin: 'https://www.econav.in',
        'access-control-request-method': 'POST',
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('https://www.econav.in');
  });

  it('allows https://www.cityconnect.in', async () => {
    const response = await server.inject({
      method: 'OPTIONS',
      url: '/api/plan',
      headers: {
        origin: 'https://www.cityconnect.in',
        'access-control-request-method': 'POST',
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('https://www.cityconnect.in');
  });

  it('allows Authorization header on preflight', async () => {
    const response = await server.inject({
      method: 'OPTIONS',
      url: '/api/v1/admin/dashboard',
      headers: {
        origin: 'https://www.cityconnect.in',
        'access-control-request-method': 'GET',
        'access-control-request-headers': 'authorization',
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-headers']).toMatch(/authorization/i);
  });
});
