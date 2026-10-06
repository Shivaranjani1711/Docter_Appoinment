import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  // A single-node replica set is required for multi-document transactions to
  // work (standalone MongoDB does not support them) - this mirrors how the real
  // deployment target (MongoDB Atlas) always runs as a replica set.
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
}, 60000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});
