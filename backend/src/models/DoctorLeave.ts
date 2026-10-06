import { Schema, model, Types } from "mongoose";

const doctorLeaveSchema = new Schema(
  {
    doctorId: { type: Types.ObjectId, ref: "DoctorProfile", required: true },
    date: { type: Date, required: true }, // normalized to UTC midnight
    reason: { type: String },
  },
  { timestamps: true }
);

doctorLeaveSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export const DoctorLeave = model("DoctorLeave", doctorLeaveSchema);
