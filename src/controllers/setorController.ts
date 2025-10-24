import { Request, Response } from "express";
import prisma from "../db/prisma";
import { Prisma } from "@prisma/client";

export async function list(_req: Request, res: Response) {
  try {
    const setores = await prisma.setor.findMany({ orderBy: { nome: "asc" } });
    return res.status(200).json(setores);
  } catch (err) {
    console.error("Erro ao listar setores:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { nome } = req.body ?? {};
    const nomeTrim = String(nome || "").trim();
    if (!nomeTrim) {
      return res.status(400).json({ error: "Nome do setor é obrigatório" });
    }

    const setor = await prisma.setor.create({ data: { nome: nomeTrim } });
    return res.status(201).json(setor);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(409).json({ error: "Setor já cadastrado" });
    }
    console.error("Erro ao criar setor:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function removeById(req: Request, res: Response) {
  try {
    const { id } = req.params ?? {};
    if (!id) {
      return res.status(400).json({ error: "ID do setor é obrigatório" });
    }
    await prisma.setor.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return res.status(404).json({ error: "Setor não encontrado" });
    }
    console.error("Erro ao deletar setor:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const nomeTrim = String(req.body?.nome ?? "").trim();
    if (!nomeTrim) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const setor = await prisma.setor.update({
      where: { id },
      data: { nome: nomeTrim },
    });
    return res.status(200).json(setor);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Setor não encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Já existe setor com esse nome" });
      }
    }
    console.error("Erro ao atualizar setor:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
