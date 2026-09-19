import type { FastifyInstance } from 'fastify';
import { getPlatformStore } from '../store/index.js';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/health', async () => {
    const database: 'memory' | 'postgres' | 'unknown' = process.env.DATABASE_URL ? 'postgres' : 'memory';
    let dbOk = true;
    try {
      dbOk = await getPlatformStore().ping();
    } catch {
      dbOk = false;
    }

    return {
      status: dbOk ? 'ok' : 'degraded',
      service: 'cityconnect-api',
      database,
      dbOk,
      timestamp: new Date().toISOString(),
    };
  });
}
