import { initPlatformStore, shutdownPlatformStore, getPlatformStore } from '../store/index.js';

const INTERVAL_MS = Number(process.env.NOTIFICATION_POLL_MS ?? 15_000);

async function tick() {
  const processed = await getPlatformStore().processPendingNotifications();
  if (processed > 0) {
    console.log(`[notifications] marked ${processed} message(s) as sent (demo — no external SMS)`);
  }
}

async function main() {
  await initPlatformStore();
  console.log(`Notification worker started (poll every ${INTERVAL_MS}ms)`);
  await tick();
  const timer = setInterval(() => {
    tick().catch((err) => console.error(err));
  }, INTERVAL_MS);

  const shutdown = async () => {
    clearInterval(timer);
    await shutdownPlatformStore();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
