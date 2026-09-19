import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

export async function registerSecurityPlugins(fastify: FastifyInstance): Promise<void> {
  if (process.env.TRUST_PROXY === 'true') {
    fastify.setTrustProxy(true);
  }

  if (process.env.NODE_ENV === 'test' || process.env.RATE_LIMIT_ENABLED === 'false') {
    return;
  }

  const max = Number(process.env.RATE_LIMIT_MAX ?? 200);
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);

  await fastify.register(rateLimit, {
    global: true,
    max,
    timeWindow: windowMs,
    ban: 0,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
  });
}
