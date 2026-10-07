import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const kots = await prisma.kOT.count();
  console.log('KOT count in DB:', kots);
}
main().finally(() => prisma.$disconnect());
