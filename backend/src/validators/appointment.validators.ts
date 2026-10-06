import { z } from "zod";

export const bookAppointmentSchema = z.object({
  slotId: z.string().min(1),
  problemSummary: z.string().trim().min(5).max(500),
  symptoms: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  symptomDurationDays: z.number().int().min(0).max(36500).optional(),
  additionalNotes: z.string().trim().max(1000).optional(),
  relevantMedicalHistory: z.string().trim().max(1000).optional(),
  currentMedications: z.string().trim().max(500).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  newSlotId: z.string().min(1),
});

export const convertToVideoSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const availabilityTemplateSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  slotDurationMin: z.number().int().min(5).max(240),
  breakStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable()
    .optional(),
  breakEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable()
    .optional(),
  onlineRatio: z.number().min(0).max(1).default(0.5),
  maxAppointmentsPerDay: z.number().int().min(1).nullable().optional(),
  isActive: z.boolean().default(true),
});

export const doctorLeaveSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().max(300).optional(),
});
