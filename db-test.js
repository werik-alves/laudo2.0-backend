import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testando conexão com:", process.env.DATABASE_URL);
    await prisma.$connect();

    // Consulta simples para confirmar que o banco responde
    const result = await prisma.$queryRaw`SELECT VERSION() AS version`;
    const row = Array.isArray(result) ? result[0] : result;
    // console.log("Conectado com sucesso. MySQL versão:", row?.version ?? row);
    console.log("Banco de dados conectado com sucesso.");
  } catch (err) {
    console.error("Falha na conexão:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();