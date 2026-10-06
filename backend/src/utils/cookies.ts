import type { Response } from "express";
import { env } from "../config/env";

const REFRESH_COOKIE_NAME = "refresh_token";

export function setRefreshCookie(res: Response, token: string) {
  const isProd = env.NODE_ENV === "production";
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    // Cross-site in production: frontend (Vercel) and backend (Render) are
    // on different registrable domains, so the browser only attaches this
    // cookie to our fetch() calls if SameSite=None + Secure (HTTPS-only).
    // In dev both run on localhost, so Strict is safe and stronger.
    secure: isProd,
    sameSite: isProd ? "none" : "strict",
    // No explicit `domain` - Vercel/Render don't share a registrable domain,
    // so setting one would make the browser reject the cookie entirely.
    // Omitting it defaults to the backend's own host, which is correct here.
    path: "/api/v1/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/v1/auth" });
}

export { REFRESH_COOKIE_NAME };
