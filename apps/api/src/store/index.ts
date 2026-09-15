import { SEED_USERS } from '@econav/platform';
import type { PlatformStore } from './types.js';
import { MemoryPlatformStore } from './memory-platform-store.js';

let store: PlatformStore | null = null;
let shutdownHook: (() => Promise<void>) | null = null;

export async function initPlatformStore(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  const useMemory =
    process.env.PLATFORM_STORE === 'memory' ||
    process.env.NODE_ENV === 'test' ||
    !databaseUrl;

  if (useMemory) {
    store = new MemoryPlatformStore([...SEED_USERS]);
    return;
  }

  const { createPostgresPlatformStore } = await import('@econav/db');
  const { store: pgStore, pool } = await createPostgresPlatformStore(databaseUrl);
  store = pgStore as PlatformStore;
  shutdownHook = async () => {
    await pool.end();
  };
}

export function getPlatformStore(): PlatformStore {
  if (!store) {
    throw new Error('Platform store not initialized. Call initPlatformStore() first.');
  }
  return store;
}

export async function shutdownPlatformStore(): Promise<void> {
  if (shutdownHook) await shutdownHook();
}
