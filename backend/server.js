const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');
const { startExpiryJob } = require('./src/jobs/expireReservations.job');

async function main() {
  await connectDB();
  startExpiryJob();
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Feedants backend listening on port ${config.port} (${config.nodeEnv})`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
