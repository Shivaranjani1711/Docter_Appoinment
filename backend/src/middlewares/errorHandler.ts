import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

// Never leak stack traces or raw driver/library errors to the client.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Resource not found" } });
}
