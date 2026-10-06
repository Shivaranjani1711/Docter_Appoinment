import fs from "fs";
import path from "path";
import { MongoMemoryReplSet } from "mongodb-memory-server";

const DB_PATH = path.resolve(__dirname, "../../.mongo-data");
const PORT = 27018;
const REPL_SET_NAME = "rs0";
const DB_NAME = "doctor_appointment_dev";

/**
 * Runs a persistent local MongoDB replica set for development, reusing the
 * mongod binary mongodb-memory-server already downloaded for the test suite -
 * no separate MongoDB install, Docker, or Atlas account needed. Data is written
 * to .mongo-data so it survives between `npm run dev:db` runs (unlike the
 * ephemeral instance the test suite uses).
 *
 * A replica set (even a single-node one) is required, not a standalone mongod,
 * because appointment booking relies on multi-document transactions.
 */
async function main() {
  fs.mkdirSync(DB_PATH, { recursive: true });

  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, name: REPL_SET_NAME, storageEngine: "wiredTiger" },
    instanceOpts: [{ port: PORT, dbPath: DB_PATH, storageEngine: "wiredTiger" }],
  });

  const uri = `${replSet.getUri(DB_NAME)}`;
  console.log("=".repeat(70));
  console.log("Dev MongoDB replica set is running.");
  console.log("Set this in backend/.env as MONGODB_URI:");
  console.log(`  ${uri}`);
  console.log("Keep this process running, then start the API in another terminal (npm run dev).");
  console.log("Press Ctrl+C here to stop the database.");
  console.log("=".repeat(70));

  const shutdown = async () => {
    console.log("\nStopping dev MongoDB...");
    await replSet.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Failed to start dev MongoDB:", err);
  process.exit(1);
});
