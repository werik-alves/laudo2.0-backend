import { Request, Response } from "express";
import prisma from "../db/prisma";
import { Prisma } from "@prisma/client";

export async function list(_req: Request, res: Response) {
  try {
    const equipamentos = await prisma.equipamento.findMany({
      orderBy: { nome: "asc" },
    });
    return res.status(200).json(equipamentos);
  } catch (err) {
    console.error("Erro ao listar equipamentos:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { nome } = req.body ?? {};
    const nomeTrim = String(nome || "").trim();
    if (!nomeTrim) {
      return res
        .status(400)
        .json({ error: "Nome do equipamento é obrigatório" });
    }
    const equipamento = await prisma.equipamento.create({
      data: { nome: nomeTrim },
    });
    return res.status(201).json(equipamento);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(409).json({ error: "Equipamento já cadastrado" });
    }
    console.error("Erro ao criar equipamento:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
export async function getById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const equipamento = await prisma.equipamento.findUnique({
      where: { id },
      include: { modelos: true },
    });
    if (!equipamento) {
      return res.status(404).json({ error: "Equipamento não encontrado" });
    }
    return res.status(200).json(equipamento);
  } catch (err) {
    console.error("Erro ao buscar equipamento:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
export async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const nome = String(req.body?.nome ?? "").trim();
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }
    const equipamento = await prisma.equipamento.update({
      where: { id },
      data: { nome },
    });
    return res.status(200).json(equipamento);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Equipamento não encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Nome já cadastrado" });
      }
    }
    console.error("Erro ao atualizar equipamento:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    await prisma.equipamento.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return res.status(404).json({ error: "Equipamento não encontrado" });
    }
    console.error("Erro ao remover equipamento:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
