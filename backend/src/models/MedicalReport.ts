import { Schema, model, Types } from "mongoose";

export const MEDICAL_REPORT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;

const medicalReportSchema = new Schema(
  {
    patientId: { type: Types.ObjectId, ref: "User", required: true },
    appointmentId: { type: Types.ObjectId, ref: "Appointment", default: null },
    originalFileName: { type: String, required: true },
    storageKey: { type: String, required: true, unique: true }, // never exposed directly to clients
    mimeType: { type: String, enum: MEDICAL_REPORT_MIME_TYPES, required: true },
    sizeBytes: { type: Number, required: true },
    label: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);

medicalReportSchema.index({ patientId: 1, createdAt: -1 });
medicalReportSchema.index({ appointmentId: 1 });

export const MedicalReport = model("MedicalReport", medicalReportSchema);
