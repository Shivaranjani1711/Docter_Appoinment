import { DoctorAvailabilityTemplate } from "../models/DoctorAvailabilityTemplate";
import { DoctorLeave } from "../models/DoctorLeave";
import { AppointmentSlot } from "../models/AppointmentSlot";
import { Appointment } from "../models/Appointment";
import { ensureSlotsForDoctorDate } from "./slotGeneration.service";
import { parseDateOnly, startOfUtcDay } from "../utils/time";
import { ApiError } from "../utils/ApiError";

export async function upsertAvailabilityTemplate(doctorId: string, input: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMin: number;
  breakStart?: string | null;
  breakEnd?: string | null;
  onlineRatio: number;
  maxAppointmentsPerDay?: number | null;
  isActive: boolean;
}) {
  if (input.startTime >= input.endTime) {
    throw new ApiError(422, "INVALID_WINDOW", "Start time must be before end time");
  }
  return DoctorAvailabilityTemplate.findOneAndUpdate(
    { doctorId, dayOfWeek: input.dayOfWeek },
    { $set: { ...input, doctorId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function listAvailabilityTemplates(doctorId: string) {
  return DoctorAvailabilityTemplate.find({ doctorId }).sort({ dayOfWeek: 1 });
}

export async function addDoctorLeave(doctorId: string, dateStr: string, reason?: string) {
  const date = parseDateOnly(dateStr);
  if (date.getTime() < startOfUtcDay(new Date()).getTime()) {
    throw new ApiError(422, "PAST_DATE", "Cannot mark leave for a past date");
  }

  const leave = await DoctorLeave.findOneAndUpdate(
    { doctorId, date },
    { $set: { reason } },
    { upsert: true, new: true }
  );

  // Block any slots already generated for that date that are still OPEN, and
  // surface existing booked appointments so the doctor/admin can act on them.
  await AppointmentSlot.updateMany(
    { doctorId, date, status: "OPEN" },
    { $set: { status: "BLOCKED" } }
  );

  const affected = await Appointment.find({
    doctorId,
    status: { $in: ["PENDING", "CONFIRMED"] },
  })
    .populate({ path: "slotId", match: { date } })
    .then((apps) => apps.filter((a) => a.slotId));

  return { leave, affectedAppointmentIds: affected.map((a) => a._id) };
}

export async function listDoctorLeave(doctorId: string) {
  return DoctorLeave.find({ doctorId }).sort({ date: 1 });
}

export async function getAvailableSlots(doctorId: string, dateStr: string) {
  const date = parseDateOnly(dateStr);
  await ensureSlotsForDoctorDate(doctorId, date);
  const slots = await AppointmentSlot.find({ doctorId, date }).sort({ startTime: 1 });
  return slots;
}
