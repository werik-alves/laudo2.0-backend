import "dotenv/config";
import prisma from "./prisma";

async function main() {
  const username = "werik.souza";
  await prisma.usuario.upsert({
    where: { username },
    update: { isAdmin: true },
    create: { username, isAdmin: true },
  });
  console.log("Usuario admin criado/atualizado:", username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });