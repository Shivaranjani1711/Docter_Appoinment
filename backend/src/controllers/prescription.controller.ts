import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Prescription } from "../models/Prescription";
import { createPrescription } from "../services/prescription.service";
import { canAccessPatientRecords } from "../services/recordAccess.service";
import { resolveOwnDoctorProfileId } from "../services/doctorProfile.helpers";
import { recordAudit } from "../services/audit.service";
import { notify } from "../services/notification.service";
import { Errors } from "../utils/ApiError";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = await resolveOwnDoctorProfileId(req.auth!.userId);
  const prescription = await createPrescription({ doctorId, ...req.body });
  await recordAudit({
    actorId: req.auth!.userId,
    action: "CREATE_PRESCRIPTION",
    targetType: "Prescription",
    targetId: prescription._id.toString(),
    ip: req.ip,
  });
  void notify({
    userId: prescription.patientId.toString(),
    type: "PRESCRIPTION_READY",
    title: "A new prescription is available",
    relatedType: "Prescription",
    relatedId: prescription._id.toString(),
  });
  res.status(201).json({ prescription });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const prescriptions = await Prescription.find({ patientId: req.auth!.userId }).sort({ createdAt: -1 });
  res.status(200).json({ prescriptions });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) throw Errors.notFound("Prescription");

  const allowed = await canAccessPatientRecords(
    req.auth!.role,
    req.auth!.userId,
    prescription.patientId.toString()
  );
  if (!allowed) throw Errors.forbidden();

  res.status(200).json({ prescription });
});
