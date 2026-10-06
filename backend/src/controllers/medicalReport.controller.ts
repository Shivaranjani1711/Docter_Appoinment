import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { MedicalReport } from "../models/MedicalReport";
import { getMedicalReportFile, uploadMedicalReport } from "../services/medicalReport.service";
import { canAccessPatientRecords } from "../services/recordAccess.service";
import { Errors } from "../utils/ApiError";
import { recordAudit } from "../services/audit.service";

export const uploadReport = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "A file is required" } });
  }

  const report = await uploadMedicalReport({
    patientId: req.auth!.userId,
    appointmentId: req.body.appointmentId,
    originalFileName: req.file.originalname,
    buffer: req.file.buffer,
    declaredMimeType: req.file.mimetype,
    label: req.body.label,
  });

  await recordAudit({
    actorId: req.auth!.userId,
    action: "UPLOAD_MEDICAL_REPORT",
    targetType: "MedicalReport",
    targetId: report._id.toString(),
    ip: req.ip,
  });

  return res.status(201).json({
    report: {
      id: report._id.toString(),
      originalFileName: report.originalFileName,
      mimeType: report.mimeType,
      sizeBytes: report.sizeBytes,
      createdAt: report.createdAt,
    },
  });
});

export const listMyReports = asyncHandler(async (req: Request, res: Response) => {
  const reports = await MedicalReport.find({ patientId: req.auth!.userId })
    .select("-storageKey")
    .sort({ createdAt: -1 });
  res.status(200).json({ reports });
});

export const listPatientReportsForDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;
  const allowed = await canAccessPatientRecords(req.auth!.role, req.auth!.userId, patientId);
  if (!allowed) throw Errors.forbidden();

  const reports = await MedicalReport.find({ patientId }).select("-storageKey").sort({ createdAt: -1 });
  res.status(200).json({ reports });
});

export const downloadReport = asyncHandler(async (req: Request, res: Response) => {
  const result = await getMedicalReportFile(req.params.id);
  if (!result) throw Errors.notFound("Medical report");

  const allowed = await canAccessPatientRecords(
    req.auth!.role,
    req.auth!.userId,
    result.report.patientId.toString()
  );
  if (!allowed) throw Errors.forbidden();

  await recordAudit({
    actorId: req.auth!.userId,
    action: "VIEW_MEDICAL_REPORT",
    targetType: "MedicalReport",
    targetId: result.report._id.toString(),
    ip: req.ip,
  });

  res.setHeader("Content-Type", result.report.mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${result.report.originalFileName}"`);
  res.setHeader("Cache-Control", "private, no-store");
  res.send(result.buffer);
});
