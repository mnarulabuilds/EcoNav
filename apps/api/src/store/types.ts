import type {
  AdminDashboardStats,
  CommunityEvent,
  PickupBooking,
  PlatformUser,
  ServiceTicket,
  TicketDomain,
  TicketStatus,
} from '@econav/platform';

export type TicketListFilter = {
  domain?: TicketDomain;
  reporterId?: string;
  limit?: number;
  cursor?: string;
};

export type TicketListResult = {
  tickets: ServiceTicket[];
  nextCursor: string | null;
};

export interface PlatformStore {
  findUserByPhone(phone: string): Promise<PlatformUser | undefined>;
  createSession(userId: string): Promise<string>;
  getUserByToken(token: string | undefined): Promise<PlatformUser | undefined>;
  revokeSession(token: string): Promise<void>;
  revokeAllSessionsForUser(userId: string): Promise<void>;
  updateUserPreferredLanguage(userId: string, language: PlatformUser['preferredLanguage']): Promise<PlatformUser | undefined>;
  listTickets(filter?: TicketListFilter): Promise<TicketListResult>;
  getDashboardStats(): Promise<AdminDashboardStats>;
  createTicket(input: {
    domain: TicketDomain;
    category: string;
    title: string;
    description: string;
    wardId: string;
    reporterId: string;
    priority?: ServiceTicket['priority'];
    lat?: number;
    lng?: number;
  }): Promise<ServiceTicket>;
  updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    assigneeId?: string,
  ): Promise<ServiceTicket | undefined>;
  listPickups(filter?: { citizenId?: string }): Promise<PickupBooking[]>;
  createPickup(input: Omit<PickupBooking, 'id' | 'status' | 'createdAt'>): Promise<PickupBooking>;
  listCommunityEvents(): Promise<CommunityEvent[]>;
  enrollCommunity(eventId: string): Promise<{ ok: boolean; message: string }>;
  enqueueNotification(input: {
    userId?: string;
    channel: 'sms' | 'push' | 'email';
    recipient: string;
    subject: string;
    body: string;
  }): Promise<void>;
  processPendingNotifications(limit?: number): Promise<number>;
  ping(): Promise<boolean>;
}
