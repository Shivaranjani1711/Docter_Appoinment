import { createApp } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { startScheduledJobs } from "./jobs/scheduledJobs";

async function main() {
  await connectDatabase();
  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
  startScheduledJobs();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
