import { Schema, model, Types } from "mongoose";

const doctorProfileSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    specializationId: { type: Types.ObjectId, ref: "Specialization", required: true },
    qualifications: [{ type: String }],
    experienceYears: { type: Number, default: 0, min: 0 },
    consultationFee: { type: Number, default: 0, min: 0 },
    bio: { type: String },
    supportsOnline: { type: Boolean, default: true },
    supportsInPerson: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false }, // admin must verify a doctor before patients can book
  },
  { timestamps: true }
);

doctorProfileSchema.index({ specializationId: 1 });

export const DoctorProfile = model("DoctorProfile", doctorProfileSchema);
