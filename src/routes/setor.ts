import { Router } from "express";
import * as setorController from "../controllers/setorController";

const router = Router();

// Lista setores
router.get("/", setorController.list);

// Cria setor
router.post("/", setorController.create);

// Atualiza setor por ID
router.put("/:id", setorController.update);

// Deleta setor por ID
router.delete("/:id", setorController.removeById);

export default router;
