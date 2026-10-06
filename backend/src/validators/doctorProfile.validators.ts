import { z } from "zod";

export const upsertDoctorProfileSchema = z.object({
  specializationId: z.string().min(1),
  qualifications: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  experienceYears: z.number().int().min(0).max(70).default(0),
  consultationFee: z.number().min(0).default(0),
  bio: z.string().trim().max(2000).optional(),
  supportsOnline: z.boolean().default(true),
  supportsInPerson: z.boolean().default(true),
});
