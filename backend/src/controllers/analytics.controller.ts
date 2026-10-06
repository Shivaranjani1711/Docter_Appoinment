import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getAppointmentTrend, getOverviewAnalytics, getSpecializationDistribution } from "../services/analytics.service";

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getOverviewAnalytics();
  res.status(200).json(data);
});

export const trend = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const data = await getAppointmentTrend(days);
  res.status(200).json({ trend: data });
});

export const specializationDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getSpecializationDistribution();
  res.status(200).json({ distribution: data });
});
