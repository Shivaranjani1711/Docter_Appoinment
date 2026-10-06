import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { updateMySchema } from "../validators/user.validators";
import { getMe, updateMe } from "../controllers/user.controller";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, validateBody(updateMySchema), updateMe);

export default router;
