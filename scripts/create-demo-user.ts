import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@ziki.dev" },
    update: { passwordHash, name: "Demo User" },
    create: {
      name: "Demo User",
      email: "demo@ziki.dev",
      passwordHash,
      role: "user",
    },
  });
  console.log("Demo user ready:", user.id, user.email);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});