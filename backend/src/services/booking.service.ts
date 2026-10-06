import mongoose from "mongoose";
import { AppointmentSlot } from "../models/AppointmentSlot";
import { Appointment } from "../models/Appointment";
import { AppointmentStatusHistory } from "../models/AppointmentStatusHistory";
import { DoctorProfile } from "../models/DoctorProfile";
import { User } from "../models/User";
import { ApiError, Errors } from "../utils/ApiError";
import { slotStartDateTime, hoursUntil } from "../utils/slotDateTime";
import { POLICY } from "../config/policy";
import { transitionAppointment } from "./appointmentTransition.service";
import type { TransitionActor } from "./appointmentStateMachine";

interface BookAppointmentInput {
  patientId: string;
  slotId: string;
  problemSummary: string;
  symptoms?: string[];
  symptomDurationDays?: number;
  additionalNotes?: string;
  relevantMedicalHistory?: string;
  currentMedications?: string;
}

export async function bookAppointment(input: BookAppointmentInput) {
  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      const patient = await User.findById(input.patientId).session(session);
      if (!patient?.isEmailVerified) {
        throw Errors.emailNotVerified();
      }

      // Atomic compare-and-swap: only one concurrent request can flip OPEN -> BOOKED.
      const lockedSlot = await AppointmentSlot.findOneAndUpdate(
        { _id: input.slotId, status: "OPEN" },
        { $set: { status: "BOOKED" } },
        { new: true, session }
      );

      if (!lockedSlot) {
        throw new ApiError(409, "SLOT_ALREADY_BOOKED", "This slot is no longer available. Please choose another.");
      }

      if (slotStartDateTime(lockedSlot).getTime() <= Date.now()) {
        throw new ApiError(410, "SLOT_EXPIRED", "This slot's time has already passed.");
      }

      const doctor = await DoctorProfile.findById(lockedSlot.doctorId).session(session);
      if (!doctor || !doctor.isApproved) {
        throw new ApiError(409, "DOCTOR_UNAVAILABLE", "This doctor is not currently accepting bookings.");
      }

      const [appointment] = await Appointment.create(
        [
          {
            slotId: lockedSlot._id,
            patientId: input.patientId,
            doctorId: lockedSlot.doctorId,
            type: lockedSlot.type,
            originalType: lockedSlot.type,
            status: "PENDING",
            problemSummary: input.problemSummary,
            symptoms: input.symptoms ?? [],
            symptomDurationDays: input.symptomDurationDays,
            additionalNotes: input.additionalNotes,
            relevantMedicalHistory: input.relevantMedicalHistory,
            currentMedications: input.currentMedications,
          },
        ],
        { session }
      );

      await AppointmentStatusHistory.create(
        [
          {
            appointmentId: appointment._id,
            fromStatus: "NONE",
            toStatus: "PENDING",
            changedByActor: "PATIENT",
            changedByUserId: input.patientId,
          },
        ],
        { session }
      );

      // No consultation fee -> nothing to pay for, confirm immediately.
      // Otherwise the appointment stays PENDING until a successful Payment webhook
      // confirms it (see payment.service.ts), or the auto-expiry job releases the slot.
      if (!doctor.consultationFee || doctor.consultationFee === 0) {
        appointment.status = "CONFIRMED";
        await appointment.save({ session });
        await AppointmentStatusHistory.create(
          [
            {
              appointmentId: appointment._id,
              fromStatus: "PENDING",
              toStatus: "CONFIRMED",
              changedByActor: "SYSTEM",
              reason: "No consultation fee required",
            },
          ],
          { session }
        );
      }

      result = appointment;
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function cancelAppointment(
  appointmentId: string,
  actor: TransitionActor,
  actorUserId: string,
  reason?: string
) {
  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      const appointment = await Appointment.findById(appointmentId).session(session);
      if (!appointment) throw Errors.notFound("Appointment");

      if (actor === "PATIENT" && appointment.patientId.toString() !== actorUserId) {
        throw Errors.forbidden();
      }

      if (actor === "PATIENT" || actor === "DOCTOR") {
        const slot = await AppointmentSlot.findById(appointment.slotId).session(session);
        if (slot) {
          const cutoffHours =
            actor === "PATIENT" ? POLICY.CANCELLATION_CUTOFF_HOURS : 0;
          if (cutoffHours > 0 && hoursUntil(slotStartDateTime(slot)) < cutoffHours) {
            throw new ApiError(
              422,
              "CANCELLATION_CUTOFF_PASSED",
              `Appointments can only be cancelled at least ${cutoffHours} hours in advance.`
            );
          }
        }
      }

      result = await transitionAppointment({
        appointmentId,
        to: "CANCELLED",
        actor,
        changedByUserId: actorUserId,
        reason,
        session,
      });

      await AppointmentSlot.updateOne(
        { _id: appointment.slotId, status: "BOOKED" },
        { $set: { status: "OPEN" } },
        { session }
      );
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function rescheduleAppointment(
  appointmentId: string,
  newSlotId: string,
  actorUserId: string,
  actor: TransitionActor
) {
  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      const appointment = await Appointment.findById(appointmentId).session(session);
      if (!appointment) throw Errors.notFound("Appointment");
      if (actor === "PATIENT" && appointment.patientId.toString() !== actorUserId) {
        throw Errors.forbidden();
      }

      const oldSlot = await AppointmentSlot.findById(appointment.slotId).session(session);
      if (oldSlot && actor === "PATIENT") {
        if (hoursUntil(slotStartDateTime(oldSlot)) < POLICY.RESCHEDULE_CUTOFF_HOURS) {
          throw new ApiError(
            422,
            "RESCHEDULE_CUTOFF_PASSED",
            `Appointments can only be rescheduled at least ${POLICY.RESCHEDULE_CUTOFF_HOURS} hours in advance.`
          );
        }
      }

      const newSlot = await AppointmentSlot.findOneAndUpdate(
        { _id: newSlotId, status: "OPEN", doctorId: appointment.doctorId },
        { $set: { status: "BOOKED" } },
        { new: true, session }
      );
      if (!newSlot) {
        throw new ApiError(409, "SLOT_ALREADY_BOOKED", "The selected new slot is no longer available.");
      }

      await transitionAppointment({
        appointmentId,
        to: "RESCHEDULE_REQUESTED",
        actor,
        changedByUserId: actorUserId,
        session,
      });
      await transitionAppointment({
        appointmentId,
        to: "RESCHEDULED",
        actor: "SYSTEM",
        session,
      });

      if (oldSlot) {
        await AppointmentSlot.updateOne(
          { _id: oldSlot._id, status: "BOOKED" },
          { $set: { status: "OPEN" } },
          { session }
        );
      }

      const [newAppointment] = await Appointment.create(
        [
          {
            slotId: newSlot._id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            type: newSlot.type,
            originalType: newSlot.type,
            status: "CONFIRMED",
            problemSummary: appointment.problemSummary,
            symptoms: appointment.symptoms,
            symptomDurationDays: appointment.symptomDurationDays,
            additionalNotes: appointment.additionalNotes,
            relevantMedicalHistory: appointment.relevantMedicalHistory,
            currentMedications: appointment.currentMedications,
            rescheduledFromAppointmentId: appointment._id,
          },
        ],
        { session }
      );

      await AppointmentStatusHistory.create(
        [
          {
            appointmentId: newAppointment._id,
            fromStatus: "NONE",
            toStatus: "CONFIRMED",
            changedByActor: actor,
            changedByUserId: actorUserId,
            reason: `Rescheduled from appointment ${appointment._id.toString()}`,
          },
        ],
        { session }
      );

      result = newAppointment;
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function convertAppointmentToVideo(
  appointmentId: string,
  patientId: string,
  reason?: string
) {
  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      const appointment = await Appointment.findById(appointmentId).session(session);
      if (!appointment) throw Errors.notFound("Appointment");
      if (appointment.patientId.toString() !== patientId) throw Errors.forbidden();

      if (appointment.type === "ONLINE") {
        throw new ApiError(422, "ALREADY_ONLINE", "This appointment is already an online consultation.");
      }
      if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
        throw new ApiError(422, "NOT_ELIGIBLE", "This appointment can no longer be converted.");
      }

      const currentSlot = await AppointmentSlot.findById(appointment.slotId).session(session);
      if (!currentSlot) throw Errors.notFound("Slot");

      if (hoursUntil(slotStartDateTime(currentSlot)) < POLICY.CONVERSION_CUTOFF_HOURS) {
        throw new ApiError(
          422,
          "CONVERSION_CUTOFF_PASSED",
          `Conversion to video must be requested at least ${POLICY.CONVERSION_CUTOFF_HOURS} hours before the appointment.`
        );
      }

      const doctor = await DoctorProfile.findById(appointment.doctorId).session(session);
      if (!doctor?.supportsOnline) {
        throw new ApiError(
          422,
          "DOCTOR_NO_ONLINE_SUPPORT",
          "This doctor does not offer online consultations."
        );
      }

      // Find another ONLINE slot for the same doctor, same day, that is still open.
      const onlineSlot = await AppointmentSlot.findOneAndUpdate(
        { doctorId: appointment.doctorId, date: currentSlot.date, type: "ONLINE", status: "OPEN" },
        { $set: { status: "BOOKED" } },
        { new: true, session }
      );
      if (!onlineSlot) {
        throw new ApiError(
          409,
          "NO_ONLINE_SLOT_AVAILABLE",
          "No online slot is currently available on that day for this doctor."
        );
      }

      await AppointmentSlot.updateOne(
        { _id: currentSlot._id, status: "BOOKED" },
        { $set: { status: "OPEN" } },
        { session }
      );

      appointment.slotId = onlineSlot._id as any;
      appointment.type = "ONLINE";
      await appointment.save({ session });

      await AppointmentStatusHistory.create(
        [
          {
            appointmentId: appointment._id,
            fromStatus: appointment.status,
            toStatus: appointment.status,
            changedByActor: "PATIENT",
            changedByUserId: patientId,
            reason: reason ?? "Converted from in-person to video consultation",
          },
        ],
        { session }
      );

      result = appointment;
    });
    return result;
  } finally {
    await session.endSession();
  }
}
