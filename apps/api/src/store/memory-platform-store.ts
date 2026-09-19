import {
  SEED_COMMUNITY,
  SEED_SCHEMES,
  SEED_WARDS,
  SLA_HOURS,
  type AdminDashboardStats,
  type PickupBooking,
  type PlatformUser,
  type ServiceTicket,
  type TicketDomain,
  type TicketStatus,
} from '@econav/platform';
import type { PlatformStore, TicketListFilter, TicketListResult } from './types.js';

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface PendingNotification {
  id: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent';
}

export class MemoryPlatformStore implements PlatformStore {
  readonly users: PlatformUser[];
  private readonly sessions = new Map<string, string>();
  private tickets: ServiceTicket[] = [];
  private pickups: PickupBooking[] = [];
  private communityEvents = [...SEED_COMMUNITY];
  private notifications: PendingNotification[] = [];

  constructor(users: PlatformUser[]) {
    this.users = users;
  }

  async ping(): Promise<boolean> {
    return true;
  }

  async findUserByPhone(phone: string): Promise<PlatformUser | undefined> {
    return this.users.find((u) => u.phone === phone);
  }

  async createSession(userId: string): Promise<string> {
    const token = `sess_${userId}_${Math.random().toString(36).slice(2)}`;
    this.sessions.set(token, userId);
    return token;
  }

  async getUserByToken(token: string | undefined): Promise<PlatformUser | undefined> {
    if (!token) return undefined;
    const userId = this.sessions.get(token.replace(/^Bearer\s+/i, ''));
    return this.users.find((u) => u.id === userId);
  }

  async revokeSession(token: string): Promise<void> {
    const clean = token.replace(/^Bearer\s+/i, '');
    this.sessions.delete(clean);
  }

  async revokeAllSessionsForUser(userId: string): Promise<void> {
    for (const [tok, uid] of this.sessions) {
      if (uid === userId) this.sessions.delete(tok);
    }
  }

  async updateUserPreferredLanguage(
    userId: string,
    language: PlatformUser['preferredLanguage'],
  ): Promise<PlatformUser | undefined> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return undefined;
    user.preferredLanguage = language;
    return user;
  }

  async listTickets(filter?: TicketListFilter): Promise<TicketListResult> {
    let list = [...this.tickets];
    if (filter?.domain) list = list.filter((t) => t.domain === filter.domain);
    if (filter?.reporterId) list = list.filter((t) => t.reporterId === filter.reporterId);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter?.cursor) {
      const idx = list.findIndex((t) => t.id === filter.cursor);
      list = idx >= 0 ? list.slice(idx + 1) : list;
    }

    const limit = Math.min(filter?.limit ?? 50, 100);
    const page = list.slice(0, limit);
    const hasMore = list.length > limit;
    return {
      tickets: page,
      nextCursor: hasMore && page.length > 0 ? page[page.length - 1]!.id : null,
    };
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const tickets = this.tickets;
    const pickups = this.pickups;
    const events = this.communityEvents;
    const now = Date.now();
    const openTickets = tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length;
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

    const ticketsByDomain = {} as AdminDashboardStats['ticketsByDomain'];
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
  }): Promise<ServiceTicket> {
    const now = new Date().toISOString();
    const slaKey = `${input.domain}_${input.category}`.replace(/\s+/g, '_').toLowerCase();
    const slaHours = SLA_HOURS[slaKey] ?? SLA_HOURS.default ?? 72;

    const ticket: ServiceTicket = {
      id: id('ticket'),
      domain: input.domain,
      category: input.category,
      title: input.title,
      description: input.description,
      status: 'submitted',
      priority: input.priority ?? 'medium',
      wardId: input.wardId,
      reporterId: input.reporterId,
      location:
        input.lat !== undefined && input.lng !== undefined
          ? { lat: input.lat, lng: input.lng }
          : undefined,
      slaHours,
      createdAt: now,
      updatedAt: now,
    };

    this.tickets.unshift(ticket);
    const reporter = this.users.find((u) => u.id === input.reporterId);
    if (reporter) {
      await this.enqueueNotification({
        userId: reporter.id,
        channel: 'sms',
        recipient: reporter.phone,
        subject: 'Report received',
        body: `Your report "${input.title}" was submitted (${ticket.id}).`,
      });
    }
    return ticket;
  }

  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    assigneeId?: string,
  ): Promise<ServiceTicket | undefined> {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return undefined;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    if (assigneeId) ticket.assigneeId = assigneeId;
    if (status === 'resolved' || status === 'closed') ticket.resolvedAt = ticket.updatedAt;
    return ticket;
  }

  async listPickups(filter?: { citizenId?: string }): Promise<PickupBooking[]> {
    if (filter?.citizenId) return this.pickups.filter((p) => p.citizenId === filter.citizenId);
    return [...this.pickups];
  }

  async createPickup(input: Omit<PickupBooking, 'id' | 'status' | 'createdAt'>): Promise<PickupBooking> {
    const booking: PickupBooking = {
      ...input,
      id: id('pickup'),
      status: 'requested',
      createdAt: new Date().toISOString(),
    };
    this.pickups.unshift(booking);
    return booking;
  }

  async listCommunityEvents() {
    return [...this.communityEvents];
  }

  async enrollCommunity(eventId: string) {
    const event = this.communityEvents.find((e) => e.id === eventId);
    if (!event) return { ok: false, message: 'Event not found' };
    if (event.slots !== undefined && (event.enrolled ?? 0) >= event.slots) {
      return { ok: false, message: 'Event is full' };
    }
    event.enrolled = (event.enrolled ?? 0) + 1;
    return { ok: true, message: 'Enrolled successfully' };
  }

  async enqueueNotification(input: {
    userId?: string;
    channel: 'sms' | 'push' | 'email';
    recipient: string;
    subject: string;
    body: string;
  }): Promise<void> {
    this.notifications.push({
      id: id('notif'),
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      status: 'pending',
    });
  }

  async processPendingNotifications(limit = 20): Promise<number> {
    const batch = this.notifications.filter((n) => n.status === 'pending').slice(0, limit);
    for (const n of batch) n.status = 'sent';
    return batch.length;
  }
}
