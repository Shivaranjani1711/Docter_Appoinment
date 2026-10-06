import { Schema, model, Types } from "mongoose";
import { APPOINTMENT_STATUSES } from "../services/appointmentStateMachine";
import { SLOT_TYPES } from "./AppointmentSlot";

const appointmentSchema = new Schema(
  {
    slotId: { type: Types.ObjectId, ref: "AppointmentSlot", required: true, unique: true },
    patientId: { type: Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Types.ObjectId, ref: "DoctorProfile", required: true },
    type: { type: String, enum: SLOT_TYPES, required: true },
    originalType: { type: String, enum: SLOT_TYPES, required: true },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: "PENDING" },

    // Patient-provided medical context for this consultation (§4) - minimal necessary fields only.
    problemSummary: { type: String, required: true, maxlength: 500 },
    symptoms: [{ type: String, maxlength: 100 }],
    symptomDurationDays: { type: Number, min: 0 },
    additionalNotes: { type: String, maxlength: 1000 },
    relevantMedicalHistory: { type: String, maxlength: 1000 },
    currentMedications: { type: String, maxlength: 500 },

    convertedFromAppointmentId: { type: Types.ObjectId, ref: "Appointment", default: null },
    rescheduledFromAppointmentId: { type: Types.ObjectId, ref: "Appointment", default: null },
    cancelReason: { type: String },
    cancelledBy: { type: String, enum: ["PATIENT", "DOCTOR", "ADMIN", "SYSTEM"], default: null },
    checkedInAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    consultationNotes: { type: String, maxlength: 4000 }, // doctor-authored, visible to doctor + patient
  },
  { timestamps: true }
);

appointmentSchema.index({ patientId: 1, status: 1, createdAt: -1 });
appointmentSchema.index({ doctorId: 1, status: 1, createdAt: -1 });

export const Appointment = model("Appointment", appointmentSchema);
