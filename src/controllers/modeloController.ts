import { Request, Response } from "express";
import prisma from "../db/prisma";
import { Prisma } from "@prisma/client";

export async function list(req: Request, res: Response) {
  try {
    const equipamentoId = req.query.equipamentoId
      ? Number(req.query.equipamentoId)
      : undefined;
    const where = equipamentoId ? { equipamentoId } : {};
    const modelos = await prisma.modelo.findMany({
      where,
      orderBy: { nome: "asc" },
    });
    return res.status(200).json(modelos);
  } catch (err) {
    console.error("Erro ao listar modelos:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { nome, equipamentoId } = req.body ?? {};
    const nomeTrim = String(nome || "").trim();
    const eqId = Number(equipamentoId);
    if (!nomeTrim || Number.isNaN(eqId)) {
      return res
        .status(400)
        .json({ error: "Nome e equipamentoId são obrigatórios" });
    }
    const modelo = await prisma.modelo.create({
      data: { nome: nomeTrim, equipamentoId: eqId },
    });
    return res.status(201).json(modelo);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res
        .status(409)
        .json({ error: "Modelo já cadastrado para esse equipamento" });
    }
    console.error("Erro ao criar modelo:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
export async function getById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const modelo = await prisma.modelo.findUnique({ where: { id } });
    if (!modelo) {
      return res.status(404).json({ error: "Modelo não encontrado" });
    }
    return res.status(200).json(modelo);
  } catch (err) {
    console.error("Erro ao buscar modelo:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
export async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const nome = req.body?.nome;
    const equipamentoIdRaw = req.body?.equipamentoId;
    if (nome == null && equipamentoIdRaw == null) {
      return res.status(400).json({ error: "Informe nome e/ou equipamentoId" });
    }
    const data: { nome?: string; equipamentoId?: number } = {};
    if (typeof nome === "string" && nome.trim()) {
      data.nome = nome.trim();
    }
    if (equipamentoIdRaw != null && !Number.isNaN(Number(equipamentoIdRaw))) {
      data.equipamentoId = Number(equipamentoIdRaw);
    }
    const modelo = await prisma.modelo.update({ where: { id }, data });
    return res.status(200).json(modelo);
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Modelo não encontrado" });
      }
      if (err.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Modelo já existe para esse equipamento" });
      }
    }
    console.error("Erro ao atualizar modelo:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    await prisma.modelo.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return res.status(404).json({ error: "Modelo não encontrado" });
    }
    console.error("Erro ao remover modelo:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
