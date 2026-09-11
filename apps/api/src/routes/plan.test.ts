import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../server.js';

describe('POST /api/plan', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    server = await buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  const validPayload = {
    depot: {
      id: 'depot-1',
      name: 'Central Depot',
      lat: 28.6139,
      lng: 77.209,
    },
    sites: [
      { id: 's1', name: 'Site A', lat: 28.7041, lng: 77.1025, demandKg: 500 },
      { id: 's2', name: 'Site B', lat: 28.5355, lng: 77.391, demandKg: 800 },
    ],
    vehicles: [
      { id: 'v1', name: 'Truck 1', capacityKg: 5000, speedKmh: 40 },
    ],
    config: {
      criterion: 'balanced',
      serviceTimeMinutes: 10,
      costPerKm: 2.5,
      costPerHour: 500,
    },
  };

  it('returns route plan and simulation', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/plan',
      payload: validPayload,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.plan).toBeDefined();
    expect(body.simulation).toBeDefined();
    expect(body.plan.summary.totalSitesAssigned).toBe(2);
    expect(body.simulation.events.length).toBeGreaterThan(0);
  });

  it('returns 400 for invalid payload', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/plan',
      payload: { depot: validPayload.depot, sites: [], vehicles: [] },
    });

    expect(response.statusCode).toBe(400);
  });

  it('health check returns ok', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe('ok');
  });
});
