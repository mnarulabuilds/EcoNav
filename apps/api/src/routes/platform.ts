import type { FastifyInstance } from 'fastify';
import { matchSchemes } from '@econav/schemes-engine';
import {
  DEMO_OTP,
  PLATFORM_MODULES,
  SEED_DROP_POINTS,
  SEED_EDUCATION,
  SEED_EMERGENCY,
  SEED_HEALTH,
  SEED_MOBILITY,
  SEED_SCHEMES,
  SEED_TRANSPARENCY,
  SEED_UTILITY_TYPES,
  SEED_WARDS,
  type AdminDashboardStats,
  type CitizenProfile,
  type TicketDomain,
} from '@econav/platform';
import { z } from 'zod';
import { getAuthUser, requireAuth } from '../middleware/auth.js';
import { getPlatformStore } from '../store/index.js';

const loginSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().min(4).max(8),
});

const ticketSchema = z.object({
  domain: z.enum([
    'civic',
    'waste',
    'utilities',
    'health',
    'education',
    'mobility',
    'emergency',
    'community',
  ]),
  category: z.string().min(1).max(80),
  title: z.string().min(3).max(120),
  description: z.string().min(5).max(2000),
  wardId: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const profileSchema = z.object({
  age: z.number().int().min(0).max(120),
  annualIncomeInr: z.number().min(0),
  gender: z.enum(['female', 'male', 'other']),
  category: z.enum(['general', 'sc', 'st', 'obc', 'ews']),
  isDisabled: z.boolean(),
  isStudent: z.boolean(),
  wardId: z.string().min(1),
});

const pickupSchema = z.object({
  type: z.enum(['bulk_waste', 'ewaste']),
  wardId: z.string(),
  address: z.string().min(5),
  lat: z.number(),
  lng: z.number(),
  items: z.string().min(3),
  scheduledDate: z.string().min(4),
});

async function computeDashboardStats(): Promise<AdminDashboardStats> {
  const store = getPlatformStore();
  const tickets = await store.listTickets();
  const pickups = await store.listPickups();
  const events = await store.listCommunityEvents();

  const openTickets = tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length;

  const now = Date.now();
  const slaBreaches = tickets.filter((t) => {
    if (['resolved', 'closed'].includes(t.status)) return false;
    const ageHours = (now - new Date(t.createdAt).getTime()) / 3_600_000;
    return ageHours > t.slaHours;
  }).length;

  const weekAgo = now - 7 * 24 * 3_600_000;
  const resolvedThisWeek = tickets.filter((t) => {
    if (!t.resolvedAt) return false;
    return new Date(t.resolvedAt).getTime() >= weekAgo;
  }).length;

  const ticketsByDomain = {} as Record<TicketDomain, number>;
  for (const t of tickets) {
    ticketsByDomain[t.domain] = (ticketsByDomain[t.domain] ?? 0) + 1;
  }

  const ticketsByWard = SEED_WARDS.map((w) => ({
    wardId: w.id,
    wardName: w.name,
    count: tickets.filter((t) => t.wardId === w.id).length,
  }));

  return {
    openTickets,
    slaBreaches,
    resolvedThisWeek,
    activeSchemes: SEED_SCHEMES.filter((s) => s.active).length,
    pendingPickups: pickups.filter((p) => p.status === 'requested').length,
    communityEvents: events.length,
    ticketsByDomain,
    ticketsByWard,
  };
}

export async function platformRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/v1/platform/modules', async () => ({
    modules: PLATFORM_MODULES,
    wards: SEED_WARDS,
  }));

  fastify.post('/api/v1/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid login', details: parsed.error.flatten() });
    }

    const { phone, otp } = parsed.data;
    if (otp !== DEMO_OTP) {
      return reply.status(401).send({ error: 'Invalid OTP. Use demo OTP 123456.' });
    }

    const store = getPlatformStore();
    const user = await store.findUserByPhone(phone);
    if (!user) {
      return reply.status(404).send({
        error: 'User not found',
        hint: 'Demo phones: 9999999999 (citizen), 8888888888 (official), 7777777777 (field)',
      });
    }

    const token = await store.createSession(user.id);
    return { token, user };
  });

  fastify.get('/api/v1/auth/me', async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) return reply.status(401).send({ error: 'Not authenticated' });
    return { user };
  });

  fastify.get('/api/v1/civic/tickets', async (request) => {
    const user = await getAuthUser(request);
    const store = getPlatformStore();
    const tickets = await store.listTickets({
      domain: 'civic',
      reporterId: user?.role === 'citizen' ? user.id : undefined,
    });
    return { tickets };
  });

  fastify.post('/api/v1/civic/tickets', async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) return reply.status(401).send({ error: 'Authentication required' });

    const parsed = ticketSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    if (parsed.data.domain !== 'civic') {
      return reply.status(400).send({ error: 'Use domain-specific endpoint' });
    }

    const ticket = await getPlatformStore().createTicket({
      ...parsed.data,
      reporterId: user.id,
    });
    return reply.status(201).send({ ticket });
  });

  fastify.get('/api/v1/utilities/types', async () => ({ types: SEED_UTILITY_TYPES }));

  fastify.post('/api/v1/utilities/tickets', async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) return reply.status(401).send({ error: 'Authentication required' });

    const parsed = ticketSchema.safeParse({ ...(request.body as object), domain: 'utilities' });
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const ticket = await getPlatformStore().createTicket({
      domain: 'utilities',
      category: parsed.data.category,
      title: parsed.data.title,
      description: parsed.data.description,
      wardId: parsed.data.wardId,
      reporterId: user.id,
      priority: parsed.data.priority,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
    });
    return reply.status(201).send({ ticket });
  });

  fastify.get('/api/v1/schemes', async () => ({ schemes: SEED_SCHEMES }));

  fastify.post('/api/v1/schemes/match', async (request, reply) => {
    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const profile = parsed.data as CitizenProfile;
    const results = matchSchemes(SEED_SCHEMES, profile);
    return { results };
  });

  fastify.get('/api/v1/health/facilities', async (request) => {
    const wardId = (request.query as { wardId?: string }).wardId;
    let facilities = SEED_HEALTH;
    if (wardId) facilities = facilities.filter((f) => f.wardId === wardId);
    return { facilities };
  });

  fastify.get('/api/v1/education/programs', async () => ({
    programs: SEED_EDUCATION,
  }));

  fastify.get('/api/v1/mobility/assets', async () => ({
    assets: SEED_MOBILITY,
  }));

  fastify.get('/api/v1/emergency/resources', async () => ({
    resources: SEED_EMERGENCY,
  }));

  fastify.get('/api/v1/community/events', async () => ({
    events: await getPlatformStore().listCommunityEvents(),
  }));

  fastify.post('/api/v1/community/events/:id/enroll', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await getPlatformStore().enrollCommunity(id);
    if (!result.ok) return reply.status(400).send({ error: result.message });
    return result;
  });

  fastify.get('/api/v1/transparency/projects', async (request) => {
    const wardId = (request.query as { wardId?: string }).wardId;
    let projects = SEED_TRANSPARENCY;
    if (wardId) projects = projects.filter((p) => p.wardId === wardId);
    return { projects };
  });

  fastify.get('/api/v1/waste/drop-points', async () => ({
    dropPoints: SEED_DROP_POINTS,
  }));

  fastify.get('/api/v1/waste/pickups', async (request) => {
    const user = await getAuthUser(request);
    const pickups = await getPlatformStore().listPickups(
      user?.role === 'citizen' ? { citizenId: user.id } : undefined,
    );
    return { pickups };
  });

  fastify.post('/api/v1/waste/pickups', async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) return reply.status(401).send({ error: 'Authentication required' });

    const parsed = pickupSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const booking = await getPlatformStore().createPickup({
      ...parsed.data,
      citizenId: user.id,
    });
    return reply.status(201).send({ booking });
  });

  fastify.get(
    '/api/v1/admin/dashboard',
    { preHandler: requireAuth(['official', 'field_staff']) },
    async () => ({
      stats: await computeDashboardStats(),
    }),
  );

  fastify.get(
    '/api/v1/admin/tickets',
    { preHandler: requireAuth(['official', 'field_staff']) },
    async () => ({ tickets: await getPlatformStore().listTickets() }),
  );

  fastify.patch(
    '/api/v1/admin/tickets/:id',
    { preHandler: requireAuth(['official', 'field_staff']) },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { status?: string; assigneeId?: string };
      const status = body.status as
        | 'submitted'
        | 'assigned'
        | 'in_progress'
        | 'resolved'
        | 'closed'
        | 'escalated'
        | undefined;

      if (!status) {
        return reply.status(400).send({ error: 'status is required' });
      }

      const user = await getAuthUser(request);
      const ticket = await getPlatformStore().updateTicketStatus(
        id,
        status,
        body.assigneeId ?? user?.id,
      );
      if (!ticket) return reply.status(404).send({ error: 'Ticket not found' });
      return { ticket };
    },
  );
}
