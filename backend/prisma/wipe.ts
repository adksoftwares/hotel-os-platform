import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.kOT.deleteMany({});
  await prisma.restaurantOrder.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.stay.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.folio.deleteMany({});
  console.log('Deleted fake DB data');
}

main().finally(() => prisma.$disconnect());
