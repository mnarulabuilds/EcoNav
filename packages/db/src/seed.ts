import { count } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SEED_COMMUNITY, SEED_USERS } from '@econav/platform';
import * as schema from './schema.js';

export async function seedIfEmpty(db: NodePgDatabase<typeof schema>): Promise<void> {
  const [{ value: userCount }] = await db.select({ value: count() }).from(schema.users);
  if (userCount > 0) return;

  const now = new Date().toISOString();

  await db.insert(schema.users).values(
    SEED_USERS.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      role: u.role,
      wardId: u.wardId ?? null,
      preferredLanguage: u.preferredLanguage,
      createdAt: u.createdAt ?? now,
    })),
  );

  await db.insert(schema.communityEvents).values(
    SEED_COMMUNITY.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type,
      wardId: e.wardId,
      lat: e.lat,
      lng: e.lng,
      startsAt: e.startsAt,
      slots: e.slots ?? null,
      enrolled: e.enrolled ?? 0,
    })),
  );
}
