import { Router } from "express";
import * as equipamentoController from "../controllers/equipamentoController";

const router = Router();

router.get("/", equipamentoController.list);
router.post("/", equipamentoController.create);
router.get("/:id", equipamentoController.getById);
router.put("/:id", equipamentoController.update);
router.delete("/:id", equipamentoController.remove);

export default router;
