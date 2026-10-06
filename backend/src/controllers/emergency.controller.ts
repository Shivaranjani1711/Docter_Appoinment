import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { EmergencyRequest } from "../models/EmergencyRequest";
import {
  acceptEmergencyRequest,
  cancelEmergencyRequest,
  completeEmergencyRequest,
  createEmergencyRequest,
  listOpenRequestsForDoctor,
} from "../services/emergency.service";
import { VideoConsultation } from "../models/VideoConsultation";
import { Errors } from "../utils/ApiError";
import { recordAudit } from "../services/audit.service";
import { notify } from "../services/notification.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const request = await createEmergencyRequest(req.auth!.userId, req.body);
  await recordAudit({
    actorId: req.auth!.userId,
    action: "CREATE_EMERGENCY_REQUEST",
    targetType: "EmergencyRequest",
    targetId: request._id.toString(),
    ip: req.ip,
  });
  res.status(201).json({ request });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const requests = await EmergencyRequest.find({ patientId: req.auth!.userId }).sort({ createdAt: -1 });
  res.status(200).json({ requests });
});

export const listOpen = asyncHandler(async (req: Request, res: Response) => {
  const requests = await listOpenRequestsForDoctor(req.auth!.userId);
  res.status(200).json({ requests });
});

export const accept = asyncHandler(async (req: Request, res: Response) => {
  const request = await acceptEmergencyRequest(req.params.id, req.auth!.userId);
  const consultation = request.videoConsultationId
    ? await VideoConsultation.findById(request.videoConsultationId)
    : null;
  await recordAudit({
    actorId: req.auth!.userId,
    action: "ACCEPT_EMERGENCY_REQUEST",
    targetType: "EmergencyRequest",
    targetId: request._id.toString(),
    ip: req.ip,
  });
  void notify({
    userId: request.patientId.toString(),
    type: "EMERGENCY_ACCEPTED",
    title: "A doctor has accepted your emergency request",
    relatedType: "EmergencyRequest",
    relatedId: request._id.toString(),
  });
  res.status(200).json({ request, roomUrl: consultation?.roomUrl });
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const request = await cancelEmergencyRequest(req.params.id, req.auth!.userId);
  res.status(200).json({ request });
});

export const complete = asyncHandler(async (req: Request, res: Response) => {
  const request = await completeEmergencyRequest(req.params.id, req.auth!.userId);
  res.status(200).json({ request });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) throw Errors.notFound("Emergency request");
  if (req.auth!.role === "PATIENT" && request.patientId.toString() !== req.auth!.userId) {
    throw Errors.forbidden();
  }
  res.status(200).json({ request });
});
