import { z } from "zod";

export const createEmergencyRequestSchema = z.object({
  specializationId: z.string().min(1).optional(),
  problemSummary: z.string().trim().min(5).max(500),
});
