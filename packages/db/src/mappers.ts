import type { CommunityEvent, PickupBooking, PlatformUser, ServiceTicket } from '@econav/platform';
import type { communityEvents, pickupBookings, serviceTickets, users } from './schema.js';

type UserRow = typeof users.$inferSelect;
type TicketRow = typeof serviceTickets.$inferSelect;
type PickupRow = typeof pickupBookings.$inferSelect;
type EventRow = typeof communityEvents.$inferSelect;

export function mapUser(row: UserRow): PlatformUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    role: row.role as PlatformUser['role'],
    wardId: row.wardId ?? undefined,
    preferredLanguage: row.preferredLanguage as PlatformUser['preferredLanguage'],
    createdAt: row.createdAt,
  };
}

export function mapTicket(row: TicketRow): ServiceTicket {
  return {
    id: row.id,
    domain: row.domain as ServiceTicket['domain'],
    category: row.category,
    title: row.title,
    description: row.description,
    status: row.status as ServiceTicket['status'],
    priority: row.priority as ServiceTicket['priority'],
    wardId: row.wardId,
    reporterId: row.reporterId,
    assigneeId: row.assigneeId ?? undefined,
    location: row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : undefined,
    slaHours: row.slaHours,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    resolvedAt: row.resolvedAt ?? undefined,
  };
}

export function mapPickup(row: PickupRow): PickupBooking {
  return {
    id: row.id,
    type: row.type as PickupBooking['type'],
    citizenId: row.citizenId,
    wardId: row.wardId,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    items: row.items,
    scheduledDate: row.scheduledDate,
    status: row.status as PickupBooking['status'],
    createdAt: row.createdAt,
  };
}

export function mapCommunityEvent(row: EventRow): CommunityEvent {
  return {
    id: row.id,
    title: row.title,
    type: row.type as CommunityEvent['type'],
    wardId: row.wardId,
    lat: row.lat,
    lng: row.lng,
    startsAt: row.startsAt,
    slots: row.slots ?? undefined,
    enrolled: row.enrolled,
  };
}
