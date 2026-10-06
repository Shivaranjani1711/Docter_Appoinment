import { DoctorAvailabilityTemplate } from "../models/DoctorAvailabilityTemplate";
import { DoctorLeave } from "../models/DoctorLeave";
import { AppointmentSlot, type SlotType } from "../models/AppointmentSlot";
import { minutesToTime, startOfUtcDay, timeToMinutes } from "../utils/time";

/**
 * Distributes ONLINE/IN_PERSON across `count` slots according to `onlineRatio`
 * using an accumulator (error-diffusion) method rather than naive alternation,
 * so it stays evenly interleaved for any ratio, not just 50/50:
 *   ratio 0.5, count 6  -> O I O I O I
 *   ratio 0.33, count 6 -> I O I I O I   (2 online, evenly spread)
 *   ratio 1.0           -> O O O O O O
 */
export function assignSlotTypes(count: number, onlineRatio: number): SlotType[] {
  const types: SlotType[] = [];
  let acc = 0;
  for (let i = 0; i < count; i += 1) {
    acc += onlineRatio;
    if (acc >= 1) {
      acc -= 1;
      types.push("ONLINE");
    } else {
      types.push("IN_PERSON");
    }
  }
  return types;
}

/**
 * Generates (or idempotently re-ensures) AppointmentSlot rows for one doctor/date,
 * based on that weekday's DoctorAvailabilityTemplate. Already-generated slots are
 * never mutated - re-running this for a date that already has slots is a no-op for
 * those slots (the unique index on doctorId+date+startTime makes inserts idempotent).
 */
export async function ensureSlotsForDoctorDate(doctorId: string, date: Date): Promise<void> {
  const day = startOfUtcDay(date);
  const dayOfWeek = day.getUTCDay();

  const [template, leave] = await Promise.all([
    DoctorAvailabilityTemplate.findOne({ doctorId, dayOfWeek, isActive: true }),
    DoctorLeave.findOne({ doctorId, date: day }),
  ]);

  if (!template || leave) {
    return; // No availability that day - nothing to generate.
  }

  const startMin = timeToMinutes(template.startTime);
  const endMin = timeToMinutes(template.endTime);
  const breakStartMin = template.breakStart ? timeToMinutes(template.breakStart) : null;
  const breakEndMin = template.breakEnd ? timeToMinutes(template.breakEnd) : null;

  const rawSlots: { startTime: string; endTime: string }[] = [];
  for (let t = startMin; t + template.slotDurationMin <= endMin; t += template.slotDurationMin) {
    const slotEnd = t + template.slotDurationMin;
    const overlapsBreak =
      breakStartMin !== null && breakEndMin !== null && t < breakEndMin && slotEnd > breakStartMin;
    if (!overlapsBreak) {
      rawSlots.push({ startTime: minutesToTime(t), endTime: minutesToTime(slotEnd) });
    }
  }

  const capped = template.maxAppointmentsPerDay
    ? rawSlots.slice(0, template.maxAppointmentsPerDay)
    : rawSlots;

  const types = assignSlotTypes(capped.length, template.onlineRatio);

  const ops = capped.map((slot, i) => ({
    updateOne: {
      filter: { doctorId, date: day, startTime: slot.startTime },
      update: {
        $setOnInsert: {
          doctorId,
          date: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          type: types[i],
          status: "OPEN" as const,
        },
      },
      upsert: true,
    },
  }));

  if (ops.length > 0) {
    await AppointmentSlot.bulkWrite(ops as Parameters<typeof AppointmentSlot.bulkWrite>[0], { ordered: false });
  }
}
