import { Router } from "express";
import { create, list, remove } from "../controllers/infoLaudoController";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", requireAdmin, list);
router.post("/", requireAuth, create);
router.delete("/:id", requireAdmin, remove);

export default router;
