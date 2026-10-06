import { Schema, model, Types } from "mongoose";

export const NOTIFICATION_TYPES = [
  "APPOINTMENT_CONFIRMED",
  "APPOINTMENT_CANCELLED",
  "APPOINTMENT_RESCHEDULED",
  "APPOINTMENT_CONVERTED_TO_VIDEO",
  "PRESCRIPTION_READY",
  "EMERGENCY_ACCEPTED",
  "EMERGENCY_EXPIRED",
  "PAYMENT_FAILED",
] as const;

const notificationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, maxlength: 150 },
    body: { type: String, maxlength: 500 },
    relatedType: { type: String },
    relatedId: { type: Types.ObjectId },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export const Notification = model("Notification", notificationSchema);
