import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/User";
import { PatientProfile } from "../models/PatientProfile";
import { Errors } from "../utils/ApiError";
import { parseDateOnly } from "../utils/time";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.auth!.userId);
  if (!user) {
    throw Errors.notFound("User");
  }
  res.status(200).json({
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
  });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, phone, dateOfBirth, gender, address, emergencyContactName, emergencyContactPhone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.auth!.userId,
    { $set: { ...(fullName && { fullName }), ...(phone && { phone }) } },
    { new: true }
  );
  if (!user) throw Errors.notFound("User");

  if (user.role === "PATIENT") {
    await PatientProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          ...(dateOfBirth && { dateOfBirth: parseDateOnly(dateOfBirth) }),
          ...(gender && { gender }),
          ...(address && { address }),
          ...(emergencyContactName && { emergencyContactName }),
          ...(emergencyContactPhone && { emergencyContactPhone }),
        },
      },
      { upsert: true }
    );
  }

  res.status(200).json({ id: user._id.toString(), fullName: user.fullName, phone: user.phone });
});
