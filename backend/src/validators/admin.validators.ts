import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export const createSpecializationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  departmentId: z.string().min(1),
});

export const setDoctorApprovalSchema = z.object({
  isApproved: z.boolean(),
});

export const setUserActiveSchema = z.object({
  isActive: z.boolean(),
});

export const createAdminSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  fullName: z.string().trim().min(2).max(120),
});
