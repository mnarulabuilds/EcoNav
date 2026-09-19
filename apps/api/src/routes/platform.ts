import type { FastifyInstance } from 'fastify';
import { matchSchemes } from '@econav/schemes-engine';
import {
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
  type CitizenProfile,
} from '@econav/platform';
import { z } from 'zod';
import { isDemoOtpLoginEnabled, verifyDemoOtp } from '../auth-config.js';
import { getAuthUser, requireAuth } from '../middleware/auth.js';
import { getPlatformStore } from '../store/index.js';

const loginSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().min(4).max(8),
  preferredLanguage: z.enum(['en', 'hi']).optional(),
});

const ticketListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
});

const adminTicketPatchSchema = z
  .object({
    status: z.enum([
      'submitted',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
      'escalated',
    ]),
    assigneeId: z.string().min(1).optional(),
  })
  .strict();

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

function parseTicketListQuery(request: { query: unknown }) {
  return ticketListQuerySchema.safeParse(request.query);
}

export async function platformRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/v1/platform/modules', async () => ({
    modules: PLATFORM_MODULES,
    wards: SEED_WARDS,
  }));

  fastify.post(
    '/api/v1/auth/login',
    {
      config: {
        rateLimit: {
          max: Number(process.env.RATE_LIMIT_LOGIN_MAX ?? 15),
          timeWindow: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS ?? 900_000),
        },
      },
    },
    async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid login', details: parsed.error.flatten() });
    }

    if (!isDemoOtpLoginEnabled()) {
      return reply.status(503).send({
        error: 'Demo login is disabled. Configure SMS/OTP provider for production authentication.',
      });
    }

    const { phone, otp, preferredLanguage } = parsed.data;
    if (!verifyDemoOtp(otp)) {
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

    await store.revokeAllSessionsForUser(user.id);
    const token = await store.createSession(user.id);
    let updatedUser = user;
    if (preferredLanguage) {
      updatedUser = (await store.updateUserPreferredLanguage(user.id, preferredLanguage)) ?? user;
    }
    return { token, user: updatedUser };
    },
  );

  fastify.post('/api/v1/auth/logout', async (request, reply) => {
    const user = await getAuthUser(request);
    const header = request.headers.authorization;
    const token = typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : undefined;
    if (token) await getPlatformStore().revokeSession(token);
    if (!user && !token) return reply.status(401).send({ error: 'Not authenticated' });
    return { ok: true };
  });

  fastify.get('/api/v1/auth/me', async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) return reply.status(401).send({ error: 'Not authenticated' });
    return { user };
  });

  fastify.get('/api/v1/civic/tickets', async (request, reply) => {
    const query = parseTicketListQuery(request);
    if (!query.success) {
      return reply.status(400).send({ error: 'Invalid query', details: query.error.flatten() });
    }
    const user = await getAuthUser(request);
    const store = getPlatformStore();
    return store.listTickets({
      domain: 'civic',
      reporterId: user?.role === 'citizen' ? user.id : undefined,
      limit: query.data.limit,
      cursor: query.data.cursor,
    });
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
      stats: await getPlatformStore().getDashboardStats(),
    }),
  );

  fastify.get(
    '/api/v1/admin/tickets',
    { preHandler: requireAuth(['official', 'field_staff']) },
    async (request, reply) => {
      const query = parseTicketListQuery(request);
      if (!query.success) {
        return reply.status(400).send({ error: 'Invalid query', details: query.error.flatten() });
      }
      return getPlatformStore().listTickets({
        limit: query.data.limit,
        cursor: query.data.cursor,
      });
    },
  );

  fastify.patch(
    '/api/v1/admin/tickets/:id',
    { preHandler: requireAuth(['official', 'field_staff']) },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = adminTicketPatchSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
      }

      const user = await getAuthUser(request);
      const ticket = await getPlatformStore().updateTicketStatus(
        id,
        parsed.data.status,
        parsed.data.assigneeId ?? user?.id,
      );
      if (!ticket) return reply.status(404).send({ error: 'Ticket not found' });
      return { ticket };
    },
  );
}
