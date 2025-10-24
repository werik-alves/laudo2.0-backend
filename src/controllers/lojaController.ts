import { Request, Response } from "express";
import prisma from "../db/prisma";
import { Prisma } from "@prisma/client";

export async function list(_req: Request, res: Response) {
  try {
    const lojas = await prisma.loja.findMany({ orderBy: { nome: "asc" } });
    return res.status(200).json(lojas);
  } catch (err) {
    console.error("Erro ao listar lojas:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const loja = await prisma.loja.findUnique({ where: { id } });
    if (!loja) return res.status(404).json({ error: "Loja não encontrada" });

    return res.status(200).json(loja);
  } catch (err) {
    console.error("Erro ao obter loja:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { nome } = req.body ?? {};
    const nomeTrim = String(nome || "").trim();
    if (!nomeTrim) {
      return res.status(400).json({ error: "Nome da loja é obrigatório" });
    }

    const loja = await prisma.loja.create({ data: { nome: nomeTrim } });
    return res.status(201).json(loja);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(409).json({ error: "Loja já cadastrada" });
    }
    console.error("Erro ao criar loja:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const { nome } = req.body ?? {};
    const nomeTrim = String(nome || "").trim();
    if (!nomeTrim) return res.status(400).json({ error: "Nome é obrigatório" });

    const loja = await prisma.loja.update({
      where: { id },
      data: { nome: nomeTrim },
    });
    return res.status(200).json(loja);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Loja não encontrada" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Já existe loja com esse nome" });
      }
    }
    console.error("Erro ao atualizar loja:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    await prisma.loja.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2025") {
      return res.status(404).json({ error: "Loja não encontrada" });
    }
    console.error("Erro ao excluir loja:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
