import Fastify from 'fastify';
import cors from '@fastify/cors';
import { buildCorsOptions } from './cors.js';
import { healthRoutes } from './routes/health.js';
import { planRoutes } from './routes/plan.js';
import { platformRoutes } from './routes/platform.js';
import { registerSecurityPlugins } from './plugins/security.js';
import { initPlatformStore, shutdownPlatformStore } from './store/index.js';

const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
const HOST = process.env.API_HOST ?? '0.0.0.0';

async function buildServer() {
  await initPlatformStore();

  const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  await fastify.register(cors, buildCorsOptions());
  await registerSecurityPlugins(fastify);

  await fastify.register(healthRoutes);
  await fastify.register(planRoutes);
  await fastify.register(platformRoutes);

  fastify.addHook('onClose', async () => {
    await shutdownPlatformStore();
  });

  return fastify;
}

async function start() {
  const server = await buildServer();

  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`CityConnect API running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { buildServer };
