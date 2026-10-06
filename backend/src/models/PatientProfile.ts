import { Schema, model, Types } from "mongoose";

const patientProfileSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] },
    address: { type: String },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
  },
  { timestamps: true }
);

export const PatientProfile = model("PatientProfile", patientProfileSchema);
