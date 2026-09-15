import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
import { runMigrations } from './migrate.js';
import { seedIfEmpty } from './seed.js';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

async function main() {
  const connectionString = url!;
  await runMigrations(connectionString);
  const pool = new pg.Pool({ connectionString });
  const db = drizzle(pool, { schema });
  await seedIfEmpty(db);
  await pool.end();
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
