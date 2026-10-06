import { Payment } from "../models/Payment";
import { Refund } from "../models/Refund";
import { getRazorpayClient } from "./razorpayClient";
import { ApiError, Errors } from "../utils/ApiError";

export async function initiateRefund(paymentId: string, amountPaise: number, reason: string, adminUserId: string) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw Errors.notFound("Payment");
  if (payment.status !== "SUCCESS") {
    throw new ApiError(422, "NOT_REFUNDABLE", "Only a successfully captured payment can be refunded");
  }
  if (amountPaise > payment.amount) {
    throw new ApiError(422, "AMOUNT_TOO_HIGH", "Refund amount cannot exceed the original payment amount");
  }

  const refund = await Refund.create({
    paymentId: payment._id,
    amount: amountPaise,
    reason,
    status: "PENDING",
    initiatedByUserId: adminUserId,
  });

  try {
    const gatewayRefund = await getRazorpayClient().payments.refund(payment.gatewayPaymentId!, {
      amount: amountPaise,
    });
    refund.status = "PROCESSED";
    refund.gatewayRefundId = gatewayRefund.id;
  } catch {
    refund.status = "FAILED";
  }
  await refund.save();
  return refund;
}
