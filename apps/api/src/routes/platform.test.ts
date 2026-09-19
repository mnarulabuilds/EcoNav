import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../server.js';

describe('platform API', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
    server = await buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  async function login(phone: string): Promise<string> {
    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { phone, otp: '123456' },
    });
    expect(res.statusCode).toBe(200);
    return res.json().token as string;
  }

  it('lists platform modules and wards', async () => {
    const res = await server.inject({ method: 'GET', url: '/api/v1/platform/modules' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.modules.length).toBeGreaterThan(0);
    expect(body.wards.length).toBeGreaterThan(0);
  });

  it('rejects invalid login', async () => {
    const badOtp = await server.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { phone: '9999999999', otp: '000000' },
    });
    expect(badOtp.statusCode).toBe(401);

    const unknown = await server.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { phone: '1111111111', otp: '123456' },
    });
    expect(unknown.statusCode).toBe(404);
  });

  it('returns auth/me when logged in', async () => {
    const token = await login('9999999999');
    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().user.phone).toBe('9999999999');
  });

  it('creates civic ticket and lists for citizen', async () => {
    const token = await login('9999999999');
    const create = await server.inject({
      method: 'POST',
      url: '/api/v1/civic/tickets',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        domain: 'civic',
        category: 'pothole',
        title: 'Test pothole',
        description: 'Testing civic ticket flow',
        wardId: 'ward-1',
      },
    });
    expect(create.statusCode).toBe(201);

    const list = await server.inject({
      method: 'GET',
      url: '/api/v1/civic/tickets',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(list.json().tickets.length).toBeGreaterThan(0);
  });

  it('matches schemes and serves catalog endpoints', async () => {
    const schemes = await server.inject({ method: 'GET', url: '/api/v1/schemes' });
    expect(schemes.statusCode).toBe(200);

    const match = await server.inject({
      method: 'POST',
      url: '/api/v1/schemes/match',
      payload: {
        age: 16,
        annualIncomeInr: 100000,
        gender: 'female',
        category: 'general',
        isDisabled: false,
        isStudent: true,
        wardId: 'ward-1',
      },
    });
    expect(match.statusCode).toBe(200);
    expect(match.json().results.length).toBeGreaterThan(0);

    expect((await server.inject({ method: 'GET', url: '/api/v1/health/facilities?wardId=ward-1' })).statusCode).toBe(200);
    expect((await server.inject({ method: 'GET', url: '/api/v1/education/programs' })).statusCode).toBe(200);
    expect((await server.inject({ method: 'GET', url: '/api/v1/mobility/assets' })).statusCode).toBe(200);
    expect((await server.inject({ method: 'GET', url: '/api/v1/emergency/resources' })).statusCode).toBe(200);
    expect((await server.inject({ method: 'GET', url: '/api/v1/waste/drop-points' })).statusCode).toBe(200);
    expect((await server.inject({ method: 'GET', url: '/api/v1/utilities/types' })).statusCode).toBe(200);
  });

  it('enrolls in community events and filters transparency', async () => {
    const events = await server.inject({ method: 'GET', url: '/api/v1/community/events' });
    const eventId = events.json().events[0]?.id;
    expect(eventId).toBeDefined();

    const enroll = await server.inject({
      method: 'POST',
      url: `/api/v1/community/events/${eventId}/enroll`,
    });
    expect(enroll.statusCode).toBe(200);

    const projects = await server.inject({
      method: 'GET',
      url: '/api/v1/transparency/projects?wardId=ward-1',
    });
    expect(projects.statusCode).toBe(200);
  });

  it('creates utilities ticket', async () => {
    const token = await login('9999999999');
    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/utilities/tickets',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        category: 'water',
        title: 'Low pressure',
        description: 'Water pressure very low on 2nd floor',
        wardId: 'ward-1',
      },
    });
    expect(res.statusCode).toBe(201);
  });

  it('schedules waste pickup', async () => {
    const token = await login('9999999999');
    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/waste/pickups',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: 'bulk_waste',
        wardId: 'ward-1',
        address: '123 Test Lane',
        lat: 28.61,
        lng: 77.21,
        items: 'Old furniture',
        scheduledDate: '2026-05-01',
      },
    });
    expect(res.statusCode).toBe(201);
  });

  it('protects admin routes and supports ticket updates', async () => {
    const citizenToken = await login('9999999999');
    const denied = await server.inject({
      method: 'GET',
      url: '/api/v1/admin/dashboard',
      headers: { authorization: `Bearer ${citizenToken}` },
    });
    expect(denied.statusCode).toBe(403);

    const officialToken = await login('8888888888');
    const dash = await server.inject({
      method: 'GET',
      url: '/api/v1/admin/dashboard',
      headers: { authorization: `Bearer ${officialToken}` },
    });
    expect(dash.statusCode).toBe(200);
    expect(dash.json().stats).toBeDefined();

    await server.inject({
      method: 'POST',
      url: '/api/v1/civic/tickets',
      headers: { authorization: `Bearer ${citizenToken}` },
      payload: {
        domain: 'civic',
        category: 'streetlight',
        title: 'Dark street',
        description: 'Streetlight out for two weeks',
        wardId: 'ward-1',
      },
    });

    const tickets = await server.inject({
      method: 'GET',
      url: '/api/v1/admin/tickets',
      headers: { authorization: `Bearer ${officialToken}` },
    });
    const ticketId = tickets.json().tickets[0]?.id;
    expect(ticketId).toBeDefined();

    const patch = await server.inject({
      method: 'PATCH',
      url: `/api/v1/admin/tickets/${ticketId}`,
      headers: { authorization: `Bearer ${officialToken}` },
      payload: { status: 'in_progress' },
    });
    expect(patch.statusCode).toBe(200);
    expect(patch.json().ticket.status).toBe('in_progress');
  });
});
