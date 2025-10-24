import { Router } from "express";
import * as modeloController from "../controllers/modeloController";

const router = Router();

router.get("/", modeloController.list);
router.post("/", modeloController.create);
router.get("/:id", modeloController.getById);
router.put("/:id", modeloController.update);
router.delete("/:id", modeloController.remove);

export default router;
