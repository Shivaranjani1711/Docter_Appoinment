import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { createPrescriptionSchema } from "../validators/prescription.validators";
import { create, getById, listMine } from "../controllers/prescription.controller";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole("DOCTOR"), validateBody(createPrescriptionSchema), create);
router.get("/", requireRole("PATIENT"), listMine);
router.get("/:id", getById);

export default router;
