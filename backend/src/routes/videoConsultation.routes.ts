import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { end, join } from "../controllers/videoConsultation.controller";

const router = Router();

router.use(requireAuth);
router.post("/:appointmentId/join", join);
router.post("/:appointmentId/end", end);

export default router;
