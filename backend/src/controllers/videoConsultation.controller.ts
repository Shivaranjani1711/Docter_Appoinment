import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Appointment } from "../models/Appointment";
import { User } from "../models/User";
import { resolveOwnDoctorProfileId } from "../services/doctorProfile.helpers";
import { endVideoConsultation, joinVideoConsultation } from "../services/videoConsultation.service";
import { Errors } from "../utils/ApiError";
import { recordAudit } from "../services/audit.service";

export const join = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await Appointment.findById(req.params.appointmentId);
  if (!appointment) throw Errors.notFound("Appointment");

  const isDoctor = req.auth!.role === "DOCTOR";
  if (req.auth!.role === "PATIENT" && appointment.patientId.toString() !== req.auth!.userId) {
    throw Errors.forbidden();
  }
  if (isDoctor) {
    const doctorId = await resolveOwnDoctorProfileId(req.auth!.userId);
    if (appointment.doctorId.toString() !== doctorId) throw Errors.forbidden();
  }
  if (req.auth!.role === "ADMIN") throw Errors.forbidden(); // admins manage, don't join clinical sessions

  const user = await User.findById(req.auth!.userId);
  if (!user) throw Errors.notFound("User");

  const session = await joinVideoConsultation({
    appointmentId: appointment._id.toString(),
    userId: req.auth!.userId,
    userName: user.fullName,
    isDoctor,
  });

  await recordAudit({
    actorId: req.auth!.userId,
    action: "JOIN_VIDEO_CONSULTATION",
    targetType: "Appointment",
    targetId: appointment._id.toString(),
    ip: req.ip,
  });

  res.status(200).json(session);
});

export const end = asyncHandler(async (req: Request, res: Response) => {
  if (req.auth!.role !== "DOCTOR" && req.auth!.role !== "ADMIN") throw Errors.forbidden();
  const consultation = await endVideoConsultation(req.params.appointmentId);
  res.status(200).json({ consultation });
});
