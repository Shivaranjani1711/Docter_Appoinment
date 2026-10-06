/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  testTimeout: 60000,
  setupFiles: ["<rootDir>/src/__tests__/env.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
};
