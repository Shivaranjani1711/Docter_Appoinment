import { timeToMinutes } from "./time";
import type { AppointmentSlotDocument } from "../models/AppointmentSlot";

export function slotStartDateTime(slot: Pick<AppointmentSlotDocument, "date" | "startTime">): Date {
  const minutes = timeToMinutes(slot.startTime);
  const dt = new Date(slot.date);
  dt.setUTCMinutes(dt.getUTCMinutes() + minutes);
  return dt;
}

export function slotEndDateTime(slot: Pick<AppointmentSlotDocument, "date" | "endTime">): Date {
  const minutes = timeToMinutes(slot.endTime);
  const dt = new Date(slot.date);
  dt.setUTCMinutes(dt.getUTCMinutes() + minutes);
  return dt;
}

export function hoursUntil(date: Date): number {
  return (date.getTime() - Date.now()) / (1000 * 60 * 60);
}
