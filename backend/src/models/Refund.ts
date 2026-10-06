import { Schema, model, Types } from "mongoose";

export const REFUND_STATUSES = ["PENDING", "PROCESSED", "FAILED"] as const;

const refundSchema = new Schema(
  {
    paymentId: { type: Types.ObjectId, ref: "Payment", required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, maxlength: 300 },
    status: { type: String, enum: REFUND_STATUSES, default: "PENDING" },
    gatewayRefundId: { type: String, default: null },
    initiatedByUserId: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

refundSchema.index({ paymentId: 1 });

export const Refund = model("Refund", refundSchema);
