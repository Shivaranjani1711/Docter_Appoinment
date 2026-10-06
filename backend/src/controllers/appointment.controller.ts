import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Appointment } from "../models/Appointment";
import { Errors } from "../utils/ApiError";
import {
  bookAppointment,
  cancelAppointment,
  convertAppointmentToVideo,
  rescheduleAppointment,
} from "../services/booking.service";
import { transitionAppointment } from "../services/appointmentTransition.service";
import { resolveOwnDoctorProfileId } from "../services/doctorProfile.helpers";
import { recordAudit } from "../services/audit.service";
import { notify } from "../services/notification.service";
import { DoctorProfile } from "../models/DoctorProfile";
import type { TransitionActor } from "../services/appointmentStateMachine";

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await bookAppointment({ patientId: req.auth!.userId, ...req.body });
  await recordAudit({
    actorId: req.auth!.userId,
    action: "BOOK_APPOINTMENT",
    targetType: "Appointment",
    targetId: appointment!._id.toString(),
    ip: req.ip,
  });
  res.status(201).json({ appointment });
});

export const listMyAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = {};

  if (req.auth!.role === "PATIENT") {
    filter.patientId = req.auth!.userId;
  } else if (req.auth!.role === "DOCTOR") {
    filter.doctorId = await resolveOwnDoctorProfileId(req.auth!.userId);
  }
  // ADMIN: no identity filter - sees all, still goes through the same read path.

  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate("slotId")
    .populate({ path: "patientId", select: "fullName" })
    .sort({ createdAt: -1 });

  res.status(200).json({ appointments });
});

async function getOwnedAppointment(req: Request) {
  const appointment = await Appointment.findById(req.params.id).populate("slotId");
  if (!appointment) throw Errors.notFound("Appointment");

  if (req.auth!.role === "PATIENT" && appointment.patientId.toString() !== req.auth!.userId) {
    throw Errors.forbidden();
  }
  if (req.auth!.role === "DOCTOR") {
    const doctorId = await resolveOwnDoctorProfileId(req.auth!.userId);
    if (appointment.doctorId.toString() !== doctorId) {
      throw Errors.forbidden();
    }
  }
  return appointment;
}

export const getAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await getOwnedAppointment(req);
  res.status(200).json({ appointment });
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const existing = await getOwnedAppointment(req); // authorization check
  const actor: TransitionActor = req.auth!.role === "PATIENT" ? "PATIENT" : req.auth!.role === "DOCTOR" ? "DOCTOR" : "ADMIN";
  const appointment = await cancelAppointment(req.params.id, actor, req.auth!.userId, req.body.reason);
  await recordAudit({
    actorId: req.auth!.userId,
    action: "CANCEL_APPOINTMENT",
    targetType: "Appointment",
    targetId: req.params.id,
    ip: req.ip,
  });

  // Notify whichever party did not initiate the cancellation.
  if (actor === "PATIENT") {
    const doctor = await DoctorProfile.findById(existing.doctorId);
    if (doctor) {
      void notify({
        userId: doctor.userId.toString(),
        type: "APPOINTMENT_CANCELLED",
        title: "Appointment cancelled by patient",
        relatedType: "Appointment",
        relatedId: req.params.id,
      });
    }
  } else {
    void notify({
      userId: existing.patientId.toString(),
      type: "APPOINTMENT_CANCELLED",
      title: "Your appointment was cancelled",
      body: req.body.reason,
      relatedType: "Appointment",
      relatedId: req.params.id,
    });
  }

  res.status(200).json({ appointment });
});

export const reschedule = asyncHandler(async (req: Request, res: Response) => {
  await getOwnedAppointment(req);
  const actor: TransitionActor = req.auth!.role === "PATIENT" ? "PATIENT" : req.auth!.role === "DOCTOR" ? "DOCTOR" : "ADMIN";
  const appointment = await rescheduleAppointment(req.params.id, req.body.newSlotId, req.auth!.userId, actor);
  await recordAudit({
    actorId: req.auth!.userId,
    action: "RESCHEDULE_APPOINTMENT",
    targetType: "Appointment",
    targetId: req.params.id,
    ip: req.ip,
  });
  void notify({
    userId: appointment.patientId.toString(),
    type: "APPOINTMENT_RESCHEDULED",
    title: "Your appointment has been rescheduled",
    relatedType: "Appointment",
    relatedId: appointment._id.toString(),
  });
  res.status(200).json({ appointment });
});

export const convertToVideo = asyncHandler(async (req: Request, res: Response) => {
  await getOwnedAppointment(req);
  if (req.auth!.role !== "PATIENT") throw Errors.forbidden();
  const appointment = await convertAppointmentToVideo(req.params.id, req.auth!.userId, req.body.reason);
  await recordAudit({
    actorId: req.auth!.userId,
    action: "CONVERT_TO_VIDEO",
    targetType: "Appointment",
    targetId: req.params.id,
    ip: req.ip,
  });
  const doctor = await DoctorProfile.findById(appointment.doctorId);
  if (doctor) {
    void notify({
      userId: doctor.userId.toString(),
      type: "APPOINTMENT_CONVERTED_TO_VIDEO",
      title: "An appointment was converted to a video consultation",
      relatedType: "Appointment",
      relatedId: req.params.id,
    });
  }
  res.status(200).json({ appointment });
});

export const checkIn = asyncHandler(async (req: Request, res: Response) => {
  await getOwnedAppointment(req);
  if (req.auth!.role !== "DOCTOR" && req.auth!.role !== "ADMIN") throw Errors.forbidden();
  const appointment = await transitionAppointment({
    appointmentId: req.params.id,
    to: "CHECKED_IN",
    actor: req.auth!.role as TransitionActor,
    changedByUserId: req.auth!.userId,
  });
  res.status(200).json({ appointment });
});

export const startConsultation = asyncHandler(async (req: Request, res: Response) => {
  await getOwnedAppointment(req);
  if (req.auth!.role !== "DOCTOR") throw Errors.forbidden();
  const appointment = await transitionAppointment({
    appointmentId: req.params.id,
    to: "IN_PROGRESS",
    actor: "DOCTOR",
    changedByUserId: req.auth!.userId,
  });
  res.status(200).json({ appointment });
});

export const completeConsultation = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await getOwnedAppointment(req);
  if (req.auth!.role !== "DOCTOR") throw Errors.forbidden();
  if (typeof req.body.consultationNotes === "string") {
    appointment.consultationNotes = req.body.consultationNotes.slice(0, 4000);
    await appointment.save();
  }
  const updated = await transitionAppointment({
    appointmentId: req.params.id,
    to: "COMPLETED",
    actor: "DOCTOR",
    changedByUserId: req.auth!.userId,
  });
  res.status(200).json({ appointment: updated });
});
