import { Schema, model, Types } from "mongoose";

export const CONSENT_TYPES = [
  "REGISTRATION",
  "MEDICAL_DATA_PROCESSING",
  "COOKIE_ANALYTICS",
  "COMMUNICATION",
] as const;

const consentRecordSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: CONSENT_TYPES, required: true },
    granted: { type: Boolean, required: true },
    policyVersion: { type: String, required: true },
  },
  { timestamps: true }
);

consentRecordSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const ConsentRecord = model("ConsentRecord", consentRecordSchema);
