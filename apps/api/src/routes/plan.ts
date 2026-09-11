import type { FastifyInstance } from 'fastify';
import { CVRPSolver, RouteSimulator } from '@econav/core';
import { routePlanRequestSchema } from '../schemas.js';

const solver = new CVRPSolver();
const simulator = new RouteSimulator();

const defaultConfig = {
  criterion: 'balanced' as const,
  serviceTimeMinutes: 10,
  costPerKm: 2.5,
  costPerHour: 500,
};

export async function planRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/api/plan', async (request, reply) => {
    const parsed = routePlanRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.flatten(),
      });
    }

    const { depot, sites, vehicles, config } = parsed.data;

    try {
      const plan = solver.plan({
        depot,
        sites,
        vehicles,
        config: { ...defaultConfig, ...config },
      });

      const simulation = simulator.simulate(plan, depot);

      return reply.send({
        plan,
        simulation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Planning failed';
      return reply.status(422).send({ error: message });
    }
  });
}
