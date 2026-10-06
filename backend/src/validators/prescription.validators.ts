import { z } from "zod";

const medicineSchema = z.object({
  name: z.string().trim().min(1).max(200),
  dosage: z.string().trim().min(1).max(100),
  frequency: z.string().trim().min(1).max(100),
  durationDays: z.number().int().min(1).max(365).optional(),
  instructions: z.string().trim().max(300).optional(),
});

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().min(1),
  diagnosisNotes: z.string().trim().max(2000).optional(),
  medicines: z.array(medicineSchema).max(30).default([]),
  advice: z.string().trim().max(1000).optional(),
  followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
