import crypto from "crypto";
import { User, type UserRole } from "../models/User";
import { PatientProfile } from "../models/PatientProfile";
import { RefreshToken } from "../models/RefreshToken";
import { ConsentRecord } from "../models/ConsentRecord";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateRefreshToken, hashRefreshToken, refreshExpiryDate, signAccessToken } from "../utils/tokens";
import { ApiError, Errors } from "../utils/ApiError";
import { sendEmail, buildClientUrl } from "./email.service";
import type { RegisterInput, LoginInput } from "../validators/auth.validators";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const CURRENT_TERMS_VERSION = "2026-10-01";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; fullName: string; role: UserRole };
}

export async function registerUser(input: RegisterInput): Promise<AuthSession> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw Errors.emailInUse();
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    email: input.email,
    passwordHash,
    role: input.role,
    fullName: input.fullName,
    phone: input.phone,
  });

  if (input.role === "PATIENT") {
    await PatientProfile.create({ userId: user._id });
  }
  // DOCTOR role: a DoctorProfile is created separately by an admin once the
  // doctor's credentials/specialization are verified (isApproved defaults false).

  await ConsentRecord.create({
    userId: user._id,
    type: "REGISTRATION",
    granted: true,
    policyVersion: CURRENT_TERMS_VERSION,
  });

  const userId = user._id.toString();
  sendVerificationEmail(userId).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to send verification email:", err);
  });

  return issueSession(userId, user.email, user.fullName, user.role as UserRole);
}

export async function loginUser(input: LoginInput): Promise<AuthSession> {
  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  if (!user) {
    throw Errors.invalidCredentials();
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    throw Errors.accountLocked();
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw Errors.invalidCredentials();
  }

  if (!user.isActive) {
    throw Errors.forbidden();
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  return issueSession(user._id.toString(), user.email, user.fullName, user.role as UserRole);
}

export async function rotateRefreshToken(
  rawToken: string,
  meta: { userAgent?: string; ip?: string }
): Promise<AuthSession> {
  const tokenHash = hashRefreshToken(rawToken);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
    throw Errors.unauthorized();
  }

  // Reuse of an already-rotated token indicates possible theft: revoke the whole chain.
  if (stored.replacedByTokenHash) {
    await RefreshToken.updateMany({ userId: stored.userId, revokedAt: null }, { revokedAt: new Date() });
    throw Errors.unauthorized();
  }

  const user = await User.findById(stored.userId);
  if (!user || !user.isActive) {
    throw Errors.unauthorized();
  }

  const next = generateRefreshToken();
  stored.revokedAt = new Date();
  stored.replacedByTokenHash = next.hash;
  await stored.save();

  await RefreshToken.create({
    userId: user._id,
    tokenHash: next.hash,
    expiresAt: refreshExpiryDate(),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role as UserRole });
  return {
    accessToken,
    refreshToken: next.raw,
    user: { id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role as UserRole },
  };
}

export async function logoutUser(rawToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(rawToken);
  await RefreshToken.updateOne({ tokenHash, revokedAt: null }, { revokedAt: new Date() });
}

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw Errors.notFound("User");

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "INVALID_CURRENT_PASSWORD", "Your current password is incorrect");
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  // Revoke every other session - a change of password should not leave old
  // sessions (e.g. from a shared/compromised device) still valid.
  await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
}

export async function changeEmail(userId: string, newEmail: string, currentPassword: string): Promise<void> {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw Errors.notFound("User");

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "INVALID_CURRENT_PASSWORD", "Your current password is incorrect");
  }

  const existing = await User.findOne({ email: newEmail });
  if (existing && existing._id.toString() !== userId) {
    throw Errors.emailInUse();
  }

  user.email = newEmail;
  user.isEmailVerified = false;
  await user.save();

  sendVerificationEmail(userId).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to send verification email after email change:", err);
  });
}

export async function sendVerificationEmail(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user || user.isEmailVerified) return;

  const raw = crypto.randomBytes(32).toString("hex");
  user.emailVerificationTokenHash = hashToken(raw);
  user.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const link = buildClientUrl(`/verify-email?token=${raw}`);
  await sendEmail(user.email, "Verify your email", `Verify your email by visiting:\n${link}\n\nThis link expires in 1 hour.`);
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const user = await User.findOne({ emailVerificationTokenHash: tokenHash }).select(
    "+emailVerificationTokenHash +emailVerificationExpires"
  );
  if (!user || !user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now()) {
    throw new ApiError(400, "INVALID_OR_EXPIRED_TOKEN", "This verification link is invalid or has expired");
  }
  user.isEmailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpires = null;
  await user.save();
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await User.findOne({ email });
  if (!user) return; // Do not reveal whether an account exists.

  const raw = crypto.randomBytes(32).toString("hex");
  user.passwordResetTokenHash = hashToken(raw);
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const link = buildClientUrl(`/reset-password?token=${raw}`);
  await sendEmail(user.email, "Reset your password", `Reset your password by visiting:\n${link}\n\nThis link expires in 30 minutes. If you did not request this, ignore this email.`);
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const user = await User.findOne({ passwordResetTokenHash: tokenHash }).select(
    "+passwordResetTokenHash +passwordResetExpires"
  );
  if (!user || !user.passwordResetExpires || user.passwordResetExpires.getTime() < Date.now()) {
    throw new ApiError(400, "INVALID_OR_EXPIRED_TOKEN", "This reset link is invalid or has expired");
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  // Password changed - revoke every existing session so a stolen refresh token
  // (or a session from before the reset) can no longer be used.
  await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
}

async function issueSession(userId: string, email: string, fullName: string, role: UserRole): Promise<AuthSession> {
  const accessToken = signAccessToken({ sub: userId, role });
  const { raw, hash } = generateRefreshToken();

  await RefreshToken.create({
    userId,
    tokenHash: hash,
    expiresAt: refreshExpiryDate(),
  });

  return { accessToken, refreshToken: raw, user: { id: userId, email, fullName, role } };
}
