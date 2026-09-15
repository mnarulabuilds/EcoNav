import {
  SEED_COMMUNITY,
  SLA_HOURS,
  type PickupBooking,
  type PlatformUser,
  type ServiceTicket,
  type TicketDomain,
  type TicketStatus,
} from '@econav/platform';
import type { PlatformStore } from './types.js';

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

  async listTickets(filter?: { domain?: TicketDomain; reporterId?: string }): Promise<ServiceTicket[]> {
    let list = [...this.tickets];
    if (filter?.domain) list = list.filter((t) => t.domain === filter.domain);
    if (filter?.reporterId) list = list.filter((t) => t.reporterId === filter.reporterId);
    return list;
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
