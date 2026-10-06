import rateLimit from "express-rate-limit";

// In-memory store is fine for a single-instance demo deployment; swap to a Redis
// store (rate-limit-redis) before running multiple backend instances.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many login attempts. Please try again later." } },
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
});
