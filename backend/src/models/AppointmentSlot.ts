import { Schema, model, Types, type InferSchemaType } from "mongoose";

export const SLOT_TYPES = ["ONLINE", "IN_PERSON"] as const;
export type SlotType = (typeof SLOT_TYPES)[number];

export const SLOT_STATUSES = ["OPEN", "BOOKED", "BLOCKED"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

const appointmentSlotSchema = new Schema(
  {
    doctorId: { type: Types.ObjectId, ref: "DoctorProfile", required: true },
    date: { type: Date, required: true }, // UTC midnight of the slot's calendar day
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },
    type: { type: String, enum: SLOT_TYPES, required: true }, // fixed at generation time
    status: { type: String, enum: SLOT_STATUSES, default: "OPEN" },
  },
  { timestamps: true }
);

// The core double-booking guard: the database itself refuses two slots with the
// same doctor/date/startTime, independent of any application-level check.
appointmentSlotSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });
appointmentSlotSchema.index({ doctorId: 1, date: 1, status: 1 });

export type AppointmentSlotDocument = InferSchemaType<typeof appointmentSlotSchema> & {
  _id: Types.ObjectId;
};
export const AppointmentSlot = model("AppointmentSlot", appointmentSlotSchema);
