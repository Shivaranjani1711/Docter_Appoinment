import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { list, markAllRead, markRead } from "../controllers/notification.controller";

const router = Router();

router.use(requireAuth);
router.get("/", list);
router.post("/read-all", markAllRead);
router.post("/:id/read", markRead);

export default router;
