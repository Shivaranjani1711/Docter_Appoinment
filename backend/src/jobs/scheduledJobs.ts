import cron from "node-cron";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment";
import { AppointmentSlot } from "../models/AppointmentSlot";
import { transitionAppointment } from "../services/appointmentTransition.service";
import { slotStartDateTime } from "../utils/slotDateTime";
import { POLICY } from "../config/policy";
import { expireStaleEmergencyRequests } from "../services/emergency.service";

/**
 * Releases slots held by appointments that never completed payment within the
 * configured TTL, so they don't permanently block a slot an abandoned checkout
 * never paid for.
 */
async function expireUnpaidPendingAppointments() {
  const cutoff = new Date(Date.now() - POLICY.PENDING_PAYMENT_TTL_MINUTES * 60 * 1000);
  const stale = await Appointment.find({ status: "PENDING", createdAt: { $lt: cutoff } });

  for (const appointment of stale) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await transitionAppointment({
          appointmentId: appointment._id.toString(),
          to: "EXPIRED",
          actor: "SYSTEM",
          reason: "Payment not completed within the allowed time window",
          session,
        });
        await AppointmentSlot.updateOne(
          { _id: appointment.slotId, status: "BOOKED" },
          { $set: { status: "OPEN" } },
          { session }
        );
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to expire appointment ${appointment._id.toString()}:`, err);
    } finally {
      await session.endSession();
    }
  }
}

/**
 * Marks CONFIRMED appointments as NO_SHOW once the grace period after the slot's
 * start time has elapsed without a check-in. Deliberately time-based and run by a
 * scheduled job only - no request handler may mark a no-show directly.
 */
async function markNoShows() {
  const confirmed = await Appointment.find({ status: "CONFIRMED" }).populate("slotId");

  for (const appointment of confirmed) {
    const slot = appointment.slotId as unknown as { date: Date; startTime: string } | null;
    if (!slot) continue;

    const graceDeadline = new Date(
      slotStartDateTime(slot).getTime() + POLICY.NO_SHOW_GRACE_MINUTES * 60 * 1000
    );
    if (Date.now() < graceDeadline.getTime()) continue;

    try {
      await transitionAppointment({
        appointmentId: appointment._id.toString(),
        to: "NO_SHOW",
        actor: "SYSTEM",
        reason: `No check-in within ${POLICY.NO_SHOW_GRACE_MINUTES} minutes of the appointment start`,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to mark appointment ${appointment._id.toString()} as no-show:`, err);
    }
  }
}

export function startScheduledJobs() {
  cron.schedule("* * * * *", () => {
    expireUnpaidPendingAppointments().catch((err) => console.error("expireUnpaidPendingAppointments failed:", err));
    markNoShows().catch((err) => console.error("markNoShows failed:", err));
    expireStaleEmergencyRequests().catch((err) => console.error("expireStaleEmergencyRequests failed:", err));
  });
}
