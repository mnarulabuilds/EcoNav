import { describe, expect, it } from 'vitest';
import { createPostgresPlatformStore } from './client.js';

const url = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;

describe.runIf(Boolean(url))('PostgresPlatformStore (integration)', () => {
  it('lists tickets with pagination cursor', async () => {
    const { store, pool } = await createPostgresPlatformStore(url!);
    try {
      const first = await store.listTickets({ limit: 2 });
      expect(first.tickets.length).toBeLessThanOrEqual(2);
      if (first.nextCursor) {
        const second = await store.listTickets({ limit: 2, cursor: first.nextCursor });
        expect(second.tickets[0]?.id).not.toBe(first.tickets[0]?.id);
      }
      const stats = await store.getDashboardStats();
      expect(stats.openTickets).toBeGreaterThanOrEqual(0);
    } finally {
      await pool.end();
    }
  });
});
