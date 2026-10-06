import { Router } from "express";
import {
  confirmEmail,
  confirmPasswordReset,
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resendVerification,
  updateEmail,
  updatePassword,
} from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate";
import {
  changeEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.validators";
import { loginRateLimiter, passwordResetRateLimiter } from "../middlewares/rateLimiters";
import { requireAuth } from "../middlewares/auth";
import { z } from "zod";

const router = Router();

router.post("/register", loginRateLimiter, validateBody(registerSchema), register);
router.post("/login", loginRateLimiter, validateBody(loginSchema), login);
router.post("/refresh", refresh);
// Logout clears the refresh cookie even if the access token has already expired,
// so it intentionally does not require requireAuth.
router.post("/logout", logout);

router.post("/resend-verification", requireAuth, resendVerification);
router.post("/verify-email", validateBody(z.object({ token: z.string().min(1) })), confirmEmail);

router.post("/forgot-password", passwordResetRateLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", passwordResetRateLimiter, validateBody(resetPasswordSchema), confirmPasswordReset);

router.post("/change-password", requireAuth, validateBody(changePasswordSchema), updatePassword);
router.post("/change-email", requireAuth, validateBody(changeEmailSchema), updateEmail);

export default router;
