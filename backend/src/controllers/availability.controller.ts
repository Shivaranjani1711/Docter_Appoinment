import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addDoctorLeave,
  listAvailabilityTemplates,
  listDoctorLeave,
  upsertAvailabilityTemplate,
} from "../services/availability.service";
import { resolveOwnDoctorProfileId } from "../services/doctorProfile.helpers";
import { recordAudit } from "../services/audit.service";

// Doctors manage their own availability; admins may manage via /admin/doctors/:doctorId/* routes
// (same service functions, different controller entry reused there - see admin.routes.ts).

export const getMyAvailability = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = await resolveOwnDoctorProfileId(req.auth!.userId);
  const [templates, leave] = await Promise.all([
    listAvailabilityTemplates(doctorId),
    listDoctorLeave(doctorId),
  ]);
  res.status(200).json({ templates, leave });
});

export const setMyAvailabilityDay = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = await resolveOwnDoctorProfileId(req.auth!.userId);
  const template = await upsertAvailabilityTemplate(doctorId, req.body);
  await recordAudit({
    actorId: req.auth!.userId,
    action: "SET_AVAILABILITY",
    targetType: "DoctorAvailabilityTemplate",
    targetId: template._id.toString(),
    ip: req.ip,
  });
  res.status(200).json({ template });
});

export const addMyLeave = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = await resolveOwnDoctorProfileId(req.auth!.userId);
  const { leave, affectedAppointmentIds } = await addDoctorLeave(doctorId, req.body.date, req.body.reason);
  await recordAudit({
    actorId: req.auth!.userId,
    action: "ADD_LEAVE",
    targetType: "DoctorLeave",
    targetId: leave._id.toString(),
    ip: req.ip,
    metadata: { affectedAppointmentCount: affectedAppointmentIds.length },
  });
  res.status(200).json({
    leave,
    affectedAppointmentIds,
    notice:
      affectedAppointmentIds.length > 0
        ? "Existing appointments on this date are affected. Please reschedule or cancel them."
        : undefined,
  });
});
