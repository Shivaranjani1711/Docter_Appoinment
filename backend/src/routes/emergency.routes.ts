import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { createEmergencyRequestSchema } from "../validators/emergency.validators";
import { accept, cancel, complete, create, getById, listMine, listOpen } from "../controllers/emergency.controller";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole("PATIENT"), validateBody(createEmergencyRequestSchema), create);
router.get("/", requireRole("PATIENT"), listMine);
router.get("/open", requireRole("DOCTOR"), listOpen);
router.get("/:id", getById);
router.post("/:id/accept", requireRole("DOCTOR"), accept);
router.post("/:id/cancel", requireRole("PATIENT"), cancel);
router.post("/:id/complete", requireRole("DOCTOR"), complete);

export default router;
