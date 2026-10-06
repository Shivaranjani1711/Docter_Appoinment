import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { createOrderSchema, initiateRefundSchema } from "../validators/payment.validators";
import { createOrder, listMyPayments, refund } from "../controllers/payment.controller";

const router = Router();

router.use(requireAuth);

router.post("/orders", requireRole("PATIENT"), validateBody(createOrderSchema), createOrder);
router.get("/", requireRole("PATIENT"), listMyPayments);
router.post("/refunds", requireRole("ADMIN"), validateBody(initiateRefundSchema), refund);

export default router;
