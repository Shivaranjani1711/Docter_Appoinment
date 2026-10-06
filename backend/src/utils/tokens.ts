import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "../models/User";

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/**
 * Refresh tokens are opaque random strings, not JWTs: the raw value is sent to the
 * client in an httpOnly cookie, while only a SHA-256 hash of it is persisted, so a
 * database read alone never yields a usable session token.
 */
export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(48).toString("hex");
  const hash = hashRefreshToken(raw);
  return { raw, hash };
}

export function hashRefreshToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function refreshExpiryDate(): Date {
  const match = /^(\d+)d$/.exec(env.JWT_REFRESH_EXPIRES_IN);
  const days = match ? Number(match[1]) : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
