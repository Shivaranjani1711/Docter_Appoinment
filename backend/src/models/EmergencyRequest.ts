import { Schema, model, Types } from "mongoose";

// REQUESTED and WAITING are collapsed into a single WAITING state at creation time:
// this implementation has no separate real-time broadcast step (doctors poll /open),
// so there is no meaningful gap between "request received" and "visible to doctors".
export const EMERGENCY_STATUSES = [
  "WAITING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
] as const;

const emergencyRequestSchema = new Schema(
  {
    patientId: { type: Types.ObjectId, ref: "User", required: true },
    specializationId: { type: Types.ObjectId, ref: "Specialization", default: null },
    problemSummary: { type: String, required: true, maxlength: 500 },
    status: { type: String, enum: EMERGENCY_STATUSES, default: "WAITING" },
    acceptedDoctorId: { type: Types.ObjectId, ref: "DoctorProfile", default: null },
    videoConsultationId: { type: Types.ObjectId, ref: "VideoConsultation", default: null },
    respondedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

emergencyRequestSchema.index({ status: 1, createdAt: -1 });
emergencyRequestSchema.index({ patientId: 1, createdAt: -1 });

export const EmergencyRequest = model("EmergencyRequest", emergencyRequestSchema);
