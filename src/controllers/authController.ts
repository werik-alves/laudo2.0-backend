import { Request, Response } from "express";
import { ldapAuthenticateAndGetFullName } from "../auth/ldap";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8; // 8h

export async function login(req: Request, res: Response) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Credenciais não informadas" });
  }

  try {
    const result = await ldapAuthenticateAndGetFullName(
      String(username),
      String(password)
    );
    if (result.success) {
      // Busca no banco se é admin
      const usuario = await prisma.usuario.findUnique({
        where: { username: String(username) },
      });
      const isAdmin = !!usuario?.isAdmin;

      const token = jwt.sign(
        { username: String(username), fullName: result.fullName, isAdmin },
        JWT_SECRET,
        { expiresIn: TOKEN_MAX_AGE_SECONDS }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // em produção com HTTPS, defina como true
        maxAge: TOKEN_MAX_AGE_SECONDS * 1000,
        path: "/",
      });

      return res.status(200).json({
        success: true,
        fullName: result.fullName,
        isAdmin,
        token,
      });
    }
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function me(req: Request, res: Response) {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ error: "Unauthenticated" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      username: string;
      fullName?: string;
      isAdmin?: boolean;
    };
    return res.status(200).json({
      user: {
        username: payload.username,
        fullName: payload.fullName,
        isAdmin: !!payload.isAdmin,
      },
    });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("auth_token", { path: "/" });
  return res.status(200).json({ success: true });
}
