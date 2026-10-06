import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createPaymentOrder, handleWebhookEvent, verifyWebhookSignature } from "../services/payment.service";
import { initiateRefund } from "../services/refund.service";
import { recordAudit } from "../services/audit.service";
import { Payment } from "../models/Payment";
import { Errors } from "../utils/ApiError";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await createPaymentOrder(req.body.appointmentId, req.auth!.userId);
  res.status(201).json(order);
});

export const listMyPayments = asyncHandler(async (req: Request, res: Response) => {
  const payments = await Payment.find({ patientId: req.auth!.userId }).sort({ createdAt: -1 });
  res.status(200).json({ payments });
});

export const refund = asyncHandler(async (req: Request, res: Response) => {
  const result = await initiateRefund(req.body.paymentId, req.body.amount, req.body.reason, req.auth!.userId);
  await recordAudit({
    actorId: req.auth!.userId,
    action: "INITIATE_REFUND",
    targetType: "Refund",
    targetId: result._id.toString(),
    ip: req.ip,
  });
  res.status(201).json({ refund: result });
});

// Mounted separately in app.ts with a raw-body parser (signature verification needs
// the exact bytes Razorpay signed, not the re-serialized JSON object).
export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"];
  if (typeof signature !== "string" || !verifyWebhookSignature(req.body as Buffer, signature)) {
    throw Errors.forbidden();
  }

  const event = JSON.parse((req.body as Buffer).toString("utf-8"));
  await handleWebhookEvent(event);
  res.status(200).json({ received: true });
});
