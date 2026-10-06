import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { webhook as razorpayWebhook } from "./controllers/payment.controller";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );
  // Registered BEFORE express.json() so the webhook handler sees the exact raw
  // bytes Razorpay signed - re-serializing a parsed JSON body would break HMAC
  // signature verification.
  app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  if (env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.use("/api/v1", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
