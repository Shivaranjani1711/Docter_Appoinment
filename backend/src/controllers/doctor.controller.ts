import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { DoctorProfile } from "../models/DoctorProfile";
import { Errors } from "../utils/ApiError";
import { getAvailableSlots } from "../services/availability.service";

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await DoctorProfile.findOne({ userId: req.auth!.userId }).populate("specializationId");
  if (!profile) throw Errors.notFound("Doctor profile");
  res.status(200).json({ profile });
});

export const upsertMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await DoctorProfile.findOneAndUpdate(
    { userId: req.auth!.userId },
    { $set: { ...req.body, userId: req.auth!.userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(200).json({ profile });
});

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { specializationId, supportsOnline, supportsInPerson, search } = req.query;

  const filter: Record<string, unknown> = { isApproved: true };
  if (specializationId) filter.specializationId = specializationId;
  if (supportsOnline === "true") filter.supportsOnline = true;
  if (supportsInPerson === "true") filter.supportsInPerson = true;

  const doctors = await DoctorProfile.find(filter)
    .populate({ path: "userId", select: "fullName" })
    .populate({ path: "specializationId", select: "name" })
    .lean();

  const filtered = search
    ? doctors.filter((d) =>
        (d.userId as unknown as { fullName: string })?.fullName
          ?.toLowerCase()
          .includes(String(search).toLowerCase())
      )
    : doctors;

  res.status(200).json({ doctors: filtered });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await DoctorProfile.findOne({ _id: req.params.id, isApproved: true })
    .populate({ path: "userId", select: "fullName" })
    .populate({ path: "specializationId", select: "name" });
  if (!doctor) throw Errors.notFound("Doctor");
  res.status(200).json({ doctor });
});

export const getDoctorAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query;
  if (typeof date !== "string") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "date (YYYY-MM-DD) is required" } });
  }
  const doctor = await DoctorProfile.findOne({ _id: req.params.id, isApproved: true });
  if (!doctor) throw Errors.notFound("Doctor");

  const slots = await getAvailableSlots(req.params.id, date);
  return res.status(200).json({ slots });
});
