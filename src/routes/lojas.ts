import { Router } from "express";
import * as lojaController from "../controllers/lojaController";

const router = Router();

router.get("/", lojaController.list);
router.get("/:id", lojaController.getById);
router.post("/", lojaController.create);
router.put("/:id", lojaController.update);
router.delete("/:id", lojaController.remove);

export default router;
