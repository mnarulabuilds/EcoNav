import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { planRoutes } from './routes/plan.js';

const PORT = Number(process.env.API_PORT ?? 3001);
const HOST = process.env.API_HOST ?? '0.0.0.0';
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

async function buildServer() {
  const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  await fastify.register(cors, {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  await fastify.register(healthRoutes);
  await fastify.register(planRoutes);

  return fastify;
}

async function start() {
  const server = await buildServer();

  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`EcoNav API running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { buildServer };
