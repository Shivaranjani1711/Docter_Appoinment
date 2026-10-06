import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/tokens";
import { Errors } from "../utils/ApiError";
import type { UserRole } from "../models/User";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { userId: string; role: UserRole };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(Errors.unauthorized());
  }
  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    next(Errors.unauthorized());
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(Errors.forbidden());
    }
    next();
  };
}
