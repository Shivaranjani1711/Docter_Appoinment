import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Department, Specialization } from "../models/Department";
import { DoctorProfile } from "../models/DoctorProfile";
import { User } from "../models/User";
import { Appointment } from "../models/Appointment";
import { AuditLog } from "../models/AuditLog";
import { ApiError, Errors } from "../utils/ApiError";
import { recordAudit } from "../services/audit.service";
import { hashPassword } from "../utils/password";

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const department = await Department.create(req.body);
  res.status(201).json({ department });
});

export const listDepartments = asyncHandler(async (_req: Request, res: Response) => {
  const departments = await Department.find().sort({ name: 1 });
  res.status(200).json({ departments });
});

export const createSpecialization = asyncHandler(async (req: Request, res: Response) => {
  const specialization = await Specialization.create(req.body);
  res.status(201).json({ specialization });
});

export const listSpecializations = asyncHandler(async (req: Request, res: Response) => {
  const filter = req.query.departmentId ? { departmentId: req.query.departmentId } : {};
  const specializations = await Specialization.find(filter).populate("departmentId").sort({ name: 1 });
  res.status(200).json({ specializations });
});

export const listAllDoctors = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.isApproved !== undefined) filter.isApproved = req.query.isApproved === "true";

  const doctors = await DoctorProfile.find(filter)
    .populate({ path: "userId", select: "fullName email isActive" })
    .populate("specializationId")
    .sort({ createdAt: -1 });
  res.status(200).json({ doctors });
});

export const setDoctorApproval = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await DoctorProfile.findByIdAndUpdate(
    req.params.id,
    { $set: { isApproved: Boolean(req.body.isApproved) } },
    { new: true }
  );
  if (!doctor) throw Errors.notFound("Doctor");

  await recordAudit({
    actorId: req.auth!.userId,
    action: req.body.isApproved ? "APPROVE_DOCTOR" : "SUSPEND_DOCTOR",
    targetType: "DoctorProfile",
    targetId: doctor._id.toString(),
    ip: req.ip,
  });

  res.status(200).json({ doctor });
});

export const listAllPatients = asyncHandler(async (_req: Request, res: Response) => {
  const patients = await User.find({ role: "PATIENT" }).select("fullName email phone isActive createdAt").sort({
    createdAt: -1,
  });
  res.status(200).json({ patients });
});

export const setUserActive = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: Boolean(req.body.isActive) } },
    { new: true }
  );
  if (!user) throw Errors.notFound("User");
  await recordAudit({
    actorId: req.auth!.userId,
    action: req.body.isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    targetType: "User",
    targetId: user._id.toString(),
    ip: req.ip,
  });
  res.status(200).json({ user: { id: user._id.toString(), isActive: user.isActive } });
});

export const listAllAppointments = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;

  const appointments = await Appointment.find(filter)
    .populate("slotId")
    .populate({ path: "patientId", select: "fullName email" })
    .sort({ createdAt: -1 })
    .limit(500);
  res.status(200).json({ appointments });
});

export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.action) filter.action = req.query.action;

  const logs = await AuditLog.find(filter)
    .populate({ path: "actorId", select: "fullName email role" })
    .sort({ createdAt: -1 })
    .limit(200);
  res.status(200).json({ logs });
});

// Admins are never self-registrable (see auth.validators.ts) - only an existing
// admin can create another admin account.
export const createAdminUser = asyncHandler(async (req: Request, res: Response) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new ApiError(409, "EMAIL_IN_USE", "An account with this email already exists");
  const passwordHash = await hashPassword(req.body.password);
  const admin = await User.create({
    email: req.body.email,
    passwordHash,
    role: "ADMIN",
    fullName: req.body.fullName,
    isEmailVerified: true,
  });
  await recordAudit({
    actorId: req.auth!.userId,
    action: "CREATE_ADMIN",
    targetType: "User",
    targetId: admin._id.toString(),
    ip: req.ip,
  });
  res.status(201).json({ id: admin._id.toString(), email: admin.email });
});
