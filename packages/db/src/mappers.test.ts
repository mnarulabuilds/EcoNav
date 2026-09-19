import { describe, expect, it } from 'vitest';
import { mapCommunityEvent, mapPickup, mapTicket, mapUser } from './mappers.js';

describe('db mappers', () => {
  it('mapUser maps row to platform user', () => {
    const user = mapUser({
      id: 'u1',
      name: 'Test',
      phone: '9000000000',
      role: 'citizen',
      wardId: 'ward-1',
      preferredLanguage: 'en',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(user.id).toBe('u1');
    expect(user.role).toBe('citizen');
    expect(user.wardId).toBe('ward-1');
  });

  it('mapTicket omits location when lat/lng missing', () => {
    const ticket = mapTicket({
      id: 't1',
      domain: 'civic',
      category: 'pothole',
      title: 'Pothole',
      description: 'Large pothole on main road',
      status: 'submitted',
      priority: 'medium',
      wardId: 'ward-1',
      reporterId: 'u1',
      assigneeId: null,
      lat: null,
      lng: null,
      slaHours: 72,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      resolvedAt: null,
    });
    expect(ticket.location).toBeUndefined();
  });

  it('mapTicket includes location when coordinates present', () => {
    const ticket = mapTicket({
      id: 't2',
      domain: 'waste',
      category: 'bulk',
      title: 'Pickup',
      description: 'Need bulk waste pickup scheduled',
      status: 'assigned',
      priority: 'high',
      wardId: 'ward-2',
      reporterId: 'u2',
      assigneeId: 'u3',
      lat: 28.6,
      lng: 77.2,
      slaHours: 48,
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-03T00:00:00.000Z',
      resolvedAt: '2026-01-03T00:00:00.000Z',
    });
    expect(ticket.location).toEqual({ lat: 28.6, lng: 77.2 });
    expect(ticket.assigneeId).toBe('u3');
  });

  it('mapPickup and mapCommunityEvent map enums', () => {
    const pickup = mapPickup({
      id: 'p1',
      type: 'ewaste',
      citizenId: 'u1',
      wardId: 'ward-1',
      address: '123 Main St',
      lat: 1,
      lng: 2,
      items: 'Old TV',
      scheduledDate: '2026-02-01',
      status: 'requested',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(pickup.type).toBe('ewaste');

    const event = mapCommunityEvent({
      id: 'e1',
      title: 'Cleanup',
      type: 'volunteer',
      wardId: 'ward-1',
      lat: 3,
      lng: 4,
      startsAt: '2026-03-01T10:00:00.000Z',
      slots: 50,
      enrolled: 10,
    });
    expect(event.slots).toBe(50);
    expect(event.enrolled).toBe(10);
  });
});
