import { Schema, model, Types } from "mongoose";

const appointmentStatusHistorySchema = new Schema(
  {
    appointmentId: { type: Types.ObjectId, ref: "Appointment", required: true },
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    changedByActor: { type: String, enum: ["PATIENT", "DOCTOR", "ADMIN", "SYSTEM"], required: true },
    changedByUserId: { type: Types.ObjectId, ref: "User", default: null },
    reason: { type: String },
  },
  { timestamps: true }
);

appointmentStatusHistorySchema.index({ appointmentId: 1, createdAt: 1 });

export const AppointmentStatusHistory = model(
  "AppointmentStatusHistory",
  appointmentStatusHistorySchema
);
