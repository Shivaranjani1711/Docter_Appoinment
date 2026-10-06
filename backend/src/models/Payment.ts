import { Schema, model, Types } from "mongoose";

export const PAYMENT_STATUSES = ["CREATED", "SUCCESS", "FAILED"] as const;

const paymentSchema = new Schema(
  {
    appointmentId: { type: Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 }, // smallest currency unit (paise)
    currency: { type: String, default: "INR" },
    status: { type: String, enum: PAYMENT_STATUSES, default: "CREATED" },
    gatewayOrderId: { type: String, required: true, unique: true },
    gatewayPaymentId: { type: String, default: null, unique: true, sparse: true },
    failureReason: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ patientId: 1, createdAt: -1 });

export const Payment = model("Payment", paymentSchema);
