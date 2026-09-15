import { and, desc, eq, gt, lt, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SLA_HOURS, type PickupBooking, type ServiceTicket, type TicketDomain, type TicketStatus } from '@econav/platform';
import * as schema from './schema.js';
import { mapCommunityEvent, mapPickup, mapTicket, mapUser } from './mappers.js';

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class PostgresPlatformStore {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findUserByPhone(phone: string) {
    const rows = await this.db.select().from(schema.users).where(eq(schema.users.phone, phone)).limit(1);
    return rows[0] ? mapUser(rows[0]) : undefined;
  }

  async createSession(userId: string) {
    const token = `sess_${userId}_${Math.random().toString(36).slice(2)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 3_600_000).toISOString();
    await this.db.insert(schema.authSessions).values({
      token,
      userId,
      expiresAt,
      createdAt: now.toISOString(),
    });
    return token;
  }

  async getUserByToken(token: string | undefined) {
    if (!token) return undefined;
    const clean = token.replace(/^Bearer\s+/i, '');
    const now = new Date().toISOString();
    const rows = await this.db
      .select({ user: schema.users })
      .from(schema.authSessions)
      .innerJoin(schema.users, eq(schema.authSessions.userId, schema.users.id))
      .where(and(eq(schema.authSessions.token, clean), gt(schema.authSessions.expiresAt, now)))
      .limit(1);
    return rows[0] ? mapUser(rows[0].user) : undefined;
  }

  async listTickets(filter?: { domain?: TicketDomain; reporterId?: string }) {
    const conditions = [];
    if (filter?.domain) conditions.push(eq(schema.serviceTickets.domain, filter.domain));
    if (filter?.reporterId) conditions.push(eq(schema.serviceTickets.reporterId, filter.reporterId));

    const rows = await this.db
      .select()
      .from(schema.serviceTickets)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(schema.serviceTickets.createdAt));

    return rows.map(mapTicket);
  }

  async createTicket(input: {
    domain: TicketDomain;
    category: string;
    title: string;
    description: string;
    wardId: string;
    reporterId: string;
    priority?: ServiceTicket['priority'];
    lat?: number;
    lng?: number;
  }) {
    const now = new Date().toISOString();
    const slaKey = `${input.domain}_${input.category}`.replace(/\s+/g, '_').toLowerCase();
    const slaHours = SLA_HOURS[slaKey] ?? SLA_HOURS.default ?? 72;
    const id = newId('ticket');

    await this.db.insert(schema.serviceTickets).values({
      id,
      domain: input.domain,
      category: input.category,
      title: input.title,
      description: input.description,
      status: 'submitted',
      priority: input.priority ?? 'medium',
      wardId: input.wardId,
      reporterId: input.reporterId,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      slaHours,
      createdAt: now,
      updatedAt: now,
    });

    const user = await this.db.select().from(schema.users).where(eq(schema.users.id, input.reporterId)).limit(1);
    if (user[0]) {
      await this.enqueueNotification({
        userId: user[0].id,
        channel: 'sms',
        recipient: user[0].phone,
        subject: 'Report received',
        body: `Your ${input.domain} report "${input.title}" was submitted. Ticket ${id}.`,
      });
    }

    const created = await this.db.select().from(schema.serviceTickets).where(eq(schema.serviceTickets.id, id)).limit(1);
    return mapTicket(created[0]!);
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, assigneeId?: string) {
    const now = new Date().toISOString();
    const resolvedAt = status === 'resolved' || status === 'closed' ? now : null;

    await this.db
      .update(schema.serviceTickets)
      .set({
        status,
        assigneeId: assigneeId ?? null,
        updatedAt: now,
        resolvedAt,
      })
      .where(eq(schema.serviceTickets.id, ticketId));

    const row = await this.db
      .select()
      .from(schema.serviceTickets)
      .where(eq(schema.serviceTickets.id, ticketId))
      .limit(1);
    return row[0] ? mapTicket(row[0]) : undefined;
  }

  async listPickups(filter?: { citizenId?: string }) {
    const rows = await this.db
      .select()
      .from(schema.pickupBookings)
      .where(filter?.citizenId ? eq(schema.pickupBookings.citizenId, filter.citizenId) : undefined)
      .orderBy(desc(schema.pickupBookings.createdAt));
    return rows.map(mapPickup);
  }

  async createPickup(input: Omit<PickupBooking, 'id' | 'status' | 'createdAt'>) {
    const id = newId('pickup');
    const now = new Date().toISOString();
    await this.db.insert(schema.pickupBookings).values({
      id,
      type: input.type,
      citizenId: input.citizenId,
      wardId: input.wardId,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      items: input.items,
      scheduledDate: input.scheduledDate,
      status: 'requested',
      createdAt: now,
    });

    const user = await this.db.select().from(schema.users).where(eq(schema.users.id, input.citizenId)).limit(1);
    if (user[0]) {
      await this.enqueueNotification({
        userId: user[0].id,
        channel: 'sms',
        recipient: user[0].phone,
        subject: 'Pickup scheduled',
        body: `Waste pickup requested for ${input.scheduledDate}. Ref ${id}.`,
      });
    }

    const row = await this.db.select().from(schema.pickupBookings).where(eq(schema.pickupBookings.id, id)).limit(1);
    return mapPickup(row[0]!);
  }

  async listCommunityEvents() {
    const rows = await this.db.select().from(schema.communityEvents).orderBy(schema.communityEvents.startsAt);
    return rows.map(mapCommunityEvent);
  }

  async enrollCommunity(eventId: string) {
    const rows = await this.db
      .select()
      .from(schema.communityEvents)
      .where(eq(schema.communityEvents.id, eventId))
      .limit(1);
    const event = rows[0];
    if (!event) return { ok: false, message: 'Event not found' };
    if (event.slots != null && event.enrolled >= event.slots) {
      return { ok: false, message: 'Event is full' };
    }

    await this.db
      .update(schema.communityEvents)
      .set({ enrolled: event.enrolled + 1 })
      .where(eq(schema.communityEvents.id, eventId));

    return { ok: true, message: 'Enrolled successfully' };
  }

  async enqueueNotification(input: {
    userId?: string;
    channel: 'sms' | 'push' | 'email';
    recipient: string;
    subject: string;
    body: string;
  }) {
    await this.db.insert(schema.notificationOutbox).values({
      id: newId('notif'),
      userId: input.userId ?? null,
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  async processPendingNotifications(limit = 20) {
    const pending = await this.db
      .select()
      .from(schema.notificationOutbox)
      .where(eq(schema.notificationOutbox.status, 'pending'))
      .orderBy(schema.notificationOutbox.createdAt)
      .limit(limit);

    const now = new Date().toISOString();
    for (const row of pending) {
      await this.db
        .update(schema.notificationOutbox)
        .set({ status: 'sent', sentAt: now })
        .where(eq(schema.notificationOutbox.id, row.id));
    }
    return pending.length;
  }

  async ping() {
    await this.db.execute(sql`select 1`);
    return true;
  }

  async purgeExpiredSessions() {
    const now = new Date().toISOString();
    await this.db.delete(schema.authSessions).where(lt(schema.authSessions.expiresAt, now));
  }
}
