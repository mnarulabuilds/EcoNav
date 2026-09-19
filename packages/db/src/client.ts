import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
import { runMigrations } from './migrate.js';
import { seedIfEmpty } from './seed.js';
import { PostgresPlatformStore } from './postgres-store.js';

export async function createPostgresPlatformStore(connectionString: string) {
  await runMigrations(connectionString);
  const max = Number(process.env.PG_POOL_MAX ?? 20);
  const pool = new pg.Pool({
    connectionString,
    max: Number.isFinite(max) && max > 0 ? max : 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  const db = drizzle(pool, { schema });
  await seedIfEmpty(db);
  const store = new PostgresPlatformStore(db);
  return { store, pool };
}
