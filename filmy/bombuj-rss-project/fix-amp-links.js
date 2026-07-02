const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  const before = await prisma.movieServerLink.count({
    where: { playerUrl: { contains: '&amp;' } }
  });

  const changed = await prisma.$executeRawUnsafe(
    "UPDATE \"MovieServerLink\" SET \"playerUrl\" = REPLACE(\"playerUrl\", '&amp;', '&') WHERE \"playerUrl\" LIKE '%&amp;%';"
  );

  const after = await prisma.movieServerLink.count({
    where: { playerUrl: { contains: '&amp;' } }
  });

  console.log({ before, changed: Number(changed), after });
  await prisma.$disconnect();
})();
