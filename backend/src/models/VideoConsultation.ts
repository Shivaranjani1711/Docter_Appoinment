import { Schema, model, Types } from "mongoose";

export const VIDEO_STATUSES = ["PENDING", "ACTIVE", "ENDED", "EXPIRED"] as const;

const videoConsultationSchema = new Schema(
  {
    // Null for emergency consultations, which are not tied to a scheduled Appointment.
    appointmentId: { type: Types.ObjectId, ref: "Appointment", default: null, unique: true, sparse: true },
    provider: { type: String, default: "daily" },
    roomName: { type: String, required: true, unique: true },
    roomUrl: { type: String, required: true },
    status: { type: String, enum: VIDEO_STATUSES, default: "PENDING" },
    windowStart: { type: Date, required: true }, // room/tokens are rejected outside this window
    windowEnd: { type: Date, required: true },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const VideoConsultation = model("VideoConsultation", videoConsultationSchema);
