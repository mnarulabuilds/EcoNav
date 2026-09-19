import { describe, expect, it, beforeEach } from 'vitest';
import { SEED_USERS, SEED_COMMUNITY } from '@econav/platform';
import { MemoryPlatformStore } from './memory-platform-store.js';

describe('MemoryPlatformStore', () => {
  let store: MemoryPlatformStore;

  beforeEach(() => {
    store = new MemoryPlatformStore([...SEED_USERS]);
  });

  it('authenticates via session token', async () => {
    const user = await store.findUserByPhone('9999999999');
    expect(user).toBeDefined();
    const token = await store.createSession(user!.id);
    const authed = await store.getUserByToken(`Bearer ${token}`);
    expect(authed?.id).toBe(user!.id);
  });

  it('creates and updates tickets', async () => {
    const citizen = (await store.findUserByPhone('9999999999'))!;
    const ticket = await store.createTicket({
      domain: 'civic',
      category: 'pothole',
      title: 'Road issue',
      description: 'Deep pothole near crossing',
      wardId: 'ward-1',
      reporterId: citizen.id,
      lat: 28.61,
      lng: 77.21,
    });
    expect(ticket.status).toBe('submitted');
    expect(ticket.location).toEqual({ lat: 28.61, lng: 77.21 });

    const listed = await store.listTickets({ domain: 'civic', reporterId: citizen.id });
    expect(listed.some((t) => t.id === ticket.id)).toBe(true);

    const updated = await store.updateTicketStatus(ticket.id, 'resolved', 'user-official-1');
    expect(updated?.status).toBe('resolved');
    expect(updated?.resolvedAt).toBeDefined();
  });

  it('manages pickups and notifications', async () => {
    const citizen = (await store.findUserByPhone('9999999999'))!;
    const booking = await store.createPickup({
      type: 'bulk_waste',
      citizenId: citizen.id,
      wardId: 'ward-1',
      address: '123 Demo Street',
      lat: 1,
      lng: 2,
      items: 'Furniture',
      scheduledDate: '2026-04-01',
    });
    const mine = await store.listPickups({ citizenId: citizen.id });
    expect(mine[0]?.id).toBe(booking.id);

    await store.enqueueNotification({
      channel: 'sms',
      recipient: citizen.phone,
      subject: 'Test',
      body: 'Hello',
    });
    const processed = await store.processPendingNotifications();
    expect(processed).toBeGreaterThan(0);
  });

  it('enrolls in community events until full', async () => {
    const eventId = SEED_COMMUNITY[0]!.id;
    const first = await store.enrollCommunity(eventId);
    expect(first.ok).toBe(true);

    const missing = await store.enrollCommunity('missing-event');
    expect(missing.ok).toBe(false);

    const event = (await store.listCommunityEvents()).find((e) => e.id === eventId)!;
    if (event.slots !== undefined) {
      const copies = new MemoryPlatformStore([...SEED_USERS]);
      const events = await copies.listCommunityEvents();
      const target = events.find((e) => e.id === eventId)!;
      target.slots = target.enrolled ?? 0;
      const full = await copies.enrollCommunity(eventId);
      expect(full.ok).toBe(false);
      expect(full.message).toMatch(/full/i);
    }
  });

  it('ping always succeeds', async () => {
    expect(await store.ping()).toBe(true);
  });
});
