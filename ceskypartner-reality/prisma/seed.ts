import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@ceskypartner.cz" },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: "admin@ceskypartner.cz",
        name: "Admin",
        passwordHash: await hash("admin123", 12),
        role: "ADMIN",
        phone: "+420 224 000 111",
      },
    });
    console.log("✓ Admin uživatel vytvořen (admin@ceskypartner.cz / admin123)");
  } else {
    console.log("✓ Admin uživatel již existuje");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
