import type { ClientSession } from "mongoose";
import { Appointment } from "../models/Appointment";
import { AppointmentStatusHistory } from "../models/AppointmentStatusHistory";
import { assertTransition, type AppointmentStatus, type TransitionActor } from "./appointmentStateMachine";
import { Errors } from "../utils/ApiError";

interface TransitionInput {
  appointmentId: string;
  to: AppointmentStatus;
  actor: TransitionActor;
  changedByUserId?: string | null;
  reason?: string;
  session?: ClientSession;
}

export async function transitionAppointment(input: TransitionInput) {
  const appointment = await Appointment.findById(input.appointmentId).session(input.session ?? null);
  if (!appointment) {
    throw Errors.notFound("Appointment");
  }

  const from = appointment.status as AppointmentStatus;
  assertTransition(from, input.to, input.actor);

  appointment.status = input.to;
  if (input.to === "CANCELLED") {
    appointment.cancelReason = input.reason;
    appointment.cancelledBy = input.actor;
  }
  if (input.to === "CHECKED_IN") {
    appointment.checkedInAt = new Date();
  }
  if (input.to === "COMPLETED") {
    appointment.completedAt = new Date();
  }

  await appointment.save({ session: input.session });
  await AppointmentStatusHistory.create(
    [
      {
        appointmentId: appointment._id,
        fromStatus: from,
        toStatus: input.to,
        changedByActor: input.actor,
        changedByUserId: input.changedByUserId ?? null,
        reason: input.reason,
      },
    ],
    { session: input.session }
  );

  return appointment;
}
