import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Notification } from "../models/Notification";
import { Errors } from "../utils/ApiError";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ userId: req.auth!.userId })
    .sort({ createdAt: -1 })
    .limit(100);
  res.status(200).json({ notifications });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.auth!.userId },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!notification) throw Errors.notFound("Notification");
  res.status(200).json({ notification });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { userId: req.auth!.userId, readAt: null },
    { $set: { readAt: new Date() } }
  );
  res.status(204).send();
});
