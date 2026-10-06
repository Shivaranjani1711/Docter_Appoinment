import { Router } from "express";
import { getDoctorAvailableSlots, getDoctorById, getMyProfile, listDoctors, upsertMyProfile } from "../controllers/doctor.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { availabilityTemplateSchema, doctorLeaveSchema } from "../validators/appointment.validators";
import { upsertDoctorProfileSchema } from "../validators/doctorProfile.validators";
import { addMyLeave, getMyAvailability, setMyAvailabilityDay } from "../controllers/availability.controller";

const router = Router();

// Doctor self-service routes MUST be registered before the "/:id" routes below,
// otherwise Express would match "me" as a doctor :id and never reach these handlers.
router.get("/me/profile", requireAuth, requireRole("DOCTOR"), getMyProfile);
router.put("/me/profile", requireAuth, requireRole("DOCTOR"), validateBody(upsertDoctorProfileSchema), upsertMyProfile);
router.get("/me/availability", requireAuth, requireRole("DOCTOR"), getMyAvailability);
router.put(
  "/me/availability",
  requireAuth,
  requireRole("DOCTOR"),
  validateBody(availabilityTemplateSchema),
  setMyAvailabilityDay
);
router.post("/me/leave", requireAuth, requireRole("DOCTOR"), validateBody(doctorLeaveSchema), addMyLeave);

// Public doctor discovery (no PII beyond name/specialization - no auth required to browse).
router.get("/", listDoctors);
router.get("/:id", getDoctorById);
router.get("/:id/availability", getDoctorAvailableSlots);

export default router;
