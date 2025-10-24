// import { Router } from "express";
// import prisma from "../db/prisma";

// const router = Router();

// router.get("/", async (_req, res) => {
//   try {
//     const laudos = await prisma.laudo.findMany({
//       orderBy: { createdAt: "desc" },
//     });
//     return res.status(200).json(laudos);
//   } catch (err) {
//     console.error("Erro ao listar laudos:", err);
//     return res.status(500).json({ error: "Erro interno" });
//   }
// });

// router.get("/:id", async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

//     const laudo = await prisma.laudo.findUnique({ where: { id } });
//     if (!laudo) return res.status(404).json({ error: "Laudo não encontrado" });

//     return res.status(200).json(laudo);
//   } catch (err) {
//     console.error("Erro ao obter laudo:", err);
//     return res.status(500).json({ error: "Erro interno" });
//   }
// });

// router.post("/", async (req, res) => {
//   try {
//     const {
//       numeroChamado,
//       nomeTecnico,
//       equipamento,
//       loja,
//       tombo,
//       modelo,
//       setor,
//       testesRealizados,
//       diagnostico,
//       estadoEquipamento,
//       necessidade,
//       imagemUrl,
//       assinaturaDataUrl,
//     } = req.body ?? {};

//     if (
//       !numeroChamado ||
//       !nomeTecnico ||
//       !equipamento ||
//       !loja ||
//       !tombo ||
//       !modelo ||
//       !setor ||
//       !testesRealizados ||
//       !diagnostico ||
//       !estadoEquipamento ||
//       !necessidade
//     ) {
//       return res.status(400).json({ error: "Campos obrigatórios ausentes" });
//     }

//     const laudo = await prisma.laudo.create({
//       data: {
//         numeroChamado: String(numeroChamado),
//         nomeTecnico: String(nomeTecnico),
//         equipamento: String(equipamento),
//         loja: String(loja),
//         tombo: String(tombo),
//         modelo: String(modelo),
//         setor: String(setor),
//         testesRealizados: String(testesRealizados),
//         diagnostico: String(diagnostico),
//         estadoEquipamento,
//         necessidade,
//         imagemUrl: imagemUrl ? String(imagemUrl) : null,
//         assinaturaDataUrl: assinaturaDataUrl ? String(assinaturaDataUrl) : null,
//       },
//     });

//     return res.status(201).json(laudo);
//   } catch (err) {
//     console.error("Erro ao criar laudo:", err);
//     return res.status(500).json({ error: "Erro interno" });
//   }
// });

// router.put("/:id", async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

//     const data = req.body ?? {};
//     const laudo = await prisma.laudo.update({ where: { id }, data });
//     return res.status(200).json(laudo);
//   } catch (err) {
//     if ((err as any)?.code === "P2025") {
//       return res.status(404).json({ error: "Laudo não encontrado" });
//     }
//     console.error("Erro ao atualizar laudo:", err);
//     return res.status(500).json({ error: "Erro interno" });
//   }
// });

// router.delete("/:id", async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

//     await prisma.laudo.delete({ where: { id } });
//     return res.status(204).send();
//   } catch (err) {
//     if ((err as any)?.code === "P2025") {
//       return res.status(404).json({ error: "Laudo não encontrado" });
//     }
//     console.error("Erro ao excluir laudo:", err);
//     return res.status(500).json({ error: "Erro interno" });
//   }
// });

// export default router;
