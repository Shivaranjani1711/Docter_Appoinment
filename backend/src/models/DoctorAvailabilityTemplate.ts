import { Schema, model, Types } from "mongoose";

// One row per (doctor, weekday). Editing a template only affects slots generated
// AFTER the edit - already-generated AppointmentSlot documents are never mutated,
// so a doctor changing their hours can never silently invalidate existing bookings.
const doctorAvailabilityTemplateSchema = new Schema(
  {
    doctorId: { type: Types.ObjectId, ref: "DoctorProfile", required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "17:00"
    slotDurationMin: { type: Number, required: true, min: 5, max: 240 },
    breakStart: { type: String, default: null },
    breakEnd: { type: String, default: null },
    onlineRatio: { type: Number, min: 0, max: 1, default: 0.5 },
    maxAppointmentsPerDay: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorAvailabilityTemplateSchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

export const DoctorAvailabilityTemplate = model(
  "DoctorAvailabilityTemplate",
  doctorAvailabilityTemplateSchema
);
