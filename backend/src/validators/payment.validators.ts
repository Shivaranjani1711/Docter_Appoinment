import { z } from "zod";

export const createOrderSchema = z.object({
  appointmentId: z.string().min(1),
});

export const initiateRefundSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().int().positive(), // smallest currency unit (paise)
  reason: z.string().trim().min(3).max(300),
});
