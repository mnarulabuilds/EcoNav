import type { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/health', async () => ({
    status: 'ok',
    service: 'econav-api',
    timestamp: new Date().toISOString(),
  }));
}
