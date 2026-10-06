import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  changeEmail,
  changePassword,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  rotateRefreshToken,
  sendVerificationEmail,
  verifyEmail,
} from "../services/auth.service";
import { recordAudit } from "../services/audit.service";
import { REFRESH_COOKIE_NAME, clearRefreshCookie, setRefreshCookie } from "../utils/cookies";
import { Errors } from "../utils/ApiError";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const session = await registerUser(req.body);
  setRefreshCookie(res, session.refreshToken);
  await recordAudit({ actorId: session.user.id, action: "REGISTER", targetType: "User", targetId: session.user.id, ip: req.ip });
  res.status(201).json({ accessToken: session.accessToken, user: session.user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const session = await loginUser(req.body);
  setRefreshCookie(res, session.refreshToken);
  await recordAudit({ actorId: session.user.id, action: "LOGIN", targetType: "User", targetId: session.user.id, ip: req.ip });
  res.status(200).json({ accessToken: session.accessToken, user: session.user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!raw) {
    throw Errors.unauthorized();
  }
  const session = await rotateRefreshToken(raw, { userAgent: req.headers["user-agent"], ip: req.ip });
  setRefreshCookie(res, session.refreshToken);
  res.status(200).json({ accessToken: session.accessToken, user: session.user });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  await sendVerificationEmail(req.auth!.userId);
  res.status(204).send();
});

export const confirmEmail = asyncHandler(async (req: Request, res: Response) => {
  await verifyEmail(req.body.token);
  res.status(200).json({ verified: true });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await requestPasswordReset(req.body.email);
  // Always 204, regardless of whether the email existed - avoids account enumeration.
  res.status(204).send();
});

export const confirmPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  await resetPassword(req.body.token, req.body.newPassword);
  res.status(200).json({ reset: true });
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  await changePassword(req.auth!.userId, req.body.currentPassword, req.body.newPassword);
  await recordAudit({
    actorId: req.auth!.userId,
    action: "CHANGE_PASSWORD",
    targetType: "User",
    targetId: req.auth!.userId,
    ip: req.ip,
  });
  // Every refresh session was just revoked (including this one's underlying
  // refresh token), so clear the cookie and make the client log in again.
  clearRefreshCookie(res);
  res.status(200).json({ changed: true });
});

export const updateEmail = asyncHandler(async (req: Request, res: Response) => {
  await changeEmail(req.auth!.userId, req.body.newEmail, req.body.currentPassword);
  await recordAudit({
    actorId: req.auth!.userId,
    action: "CHANGE_EMAIL",
    targetType: "User",
    targetId: req.auth!.userId,
    ip: req.ip,
  });
  res.status(200).json({ changed: true });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.cookies?.[REFRESH_COOKIE_NAME];
  if (raw) {
    await logoutUser(raw);
  }
  clearRefreshCookie(res);
  await recordAudit({ actorId: req.auth?.userId ?? null, action: "LOGOUT", targetType: "User", targetId: req.auth?.userId ?? null, ip: req.ip });
  res.status(204).send();
});
