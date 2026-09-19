import Fastify from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { registerSecurityPlugins } from './security.js';

describe('security plugins (production)', () => {
  const prevNode = process.env.NODE_ENV;
  const prevRate = process.env.RATE_LIMIT_ENABLED;

  beforeAll(() => {
    process.env.NODE_ENV = 'production';
    process.env.RATE_LIMIT_ENABLED = 'false';
  });

  afterAll(() => {
    process.env.NODE_ENV = prevNode;
    if (prevRate === undefined) delete process.env.RATE_LIMIT_ENABLED;
    else process.env.RATE_LIMIT_ENABLED = prevRate;
  });

  it('sets helmet security headers', async () => {
    const server = Fastify({ logger: false });
    await registerSecurityPlugins(server);
    server.get('/ping', async () => ({ ok: true }));
    await server.ready();

    const res = await server.inject({ method: 'GET', url: '/ping' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    await server.close();
  });
});
