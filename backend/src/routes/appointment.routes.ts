import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  convertToVideoSchema,
  rescheduleAppointmentSchema,
} from "../validators/appointment.validators";
import {
  cancel,
  checkIn,
  completeConsultation,
  convertToVideo,
  createAppointment,
  getAppointment,
  listMyAppointments,
  reschedule,
  startConsultation,
} from "../controllers/appointment.controller";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole("PATIENT"), validateBody(bookAppointmentSchema), createAppointment);
router.get("/", listMyAppointments);
router.get("/:id", getAppointment);
router.post("/:id/cancel", validateBody(cancelAppointmentSchema), cancel);
router.post("/:id/reschedule", validateBody(rescheduleAppointmentSchema), reschedule);
router.post("/:id/convert-to-video", requireRole("PATIENT"), validateBody(convertToVideoSchema), convertToVideo);
router.post("/:id/check-in", requireRole("DOCTOR", "ADMIN"), checkIn);
router.post("/:id/start", requireRole("DOCTOR"), startConsultation);
router.post("/:id/complete", requireRole("DOCTOR"), completeConsultation);

export default router;
