import { initPlatformStore, shutdownPlatformStore, getPlatformStore } from '../store/index.js';

const INTERVAL_MS = Number(process.env.NOTIFICATION_POLL_MS ?? 15_000);

async function tick() {
  try {
    const processed = await getPlatformStore().processPendingNotifications();
    if (processed > 0) {
      console.log(
        JSON.stringify({
          level: 'info',
          msg: 'notifications_processed',
          count: processed,
          note: 'Demo worker — integrate MSG91/Twilio for production SMS',
        }),
      );
    }
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', msg: 'notification_tick_failed', err: String(err) }));
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
