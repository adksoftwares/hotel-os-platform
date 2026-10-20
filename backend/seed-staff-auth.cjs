const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  const properties = await prisma.property.findMany();
  let property = properties[0];
  if (!property) {
    property = await prisma.property.create({
      data: { name: 'Grand ADK Hotel', propertyCode: 'ADK001' }
    });
  }

  const superHash = await bcrypt.hash('Super@123', 10);
  const adminHash = await bcrypt.hash('Admin@123', 10);

  // 1. superadmin@hotel.com
  await prisma.user.upsert({
    where: { email: 'superadmin@hotel.com' },
    update: { passwordHash: superHash, role: 'SUPER_ADMIN', isActive: true },
    create: {
      email: 'superadmin@hotel.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: superHash,
      role: 'SUPER_ADMIN',
      isActive: true,
      propertyId: property.id
    }
  });

  // 2. super_admin@gmail.com
  await prisma.user.upsert({
    where: { email: 'super_admin@gmail.com' },
    update: { passwordHash: superHash, role: 'SUPER_ADMIN', isActive: true },
    create: {
      email: 'super_admin@gmail.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: superHash,
      role: 'SUPER_ADMIN',
      isActive: true,
      propertyId: property.id
    }
  });

  // 3. admin@hotel.com
  await prisma.user.upsert({
    where: { email: 'admin@hotel.com' },
    update: { passwordHash: adminHash, role: 'ADMIN', isActive: true },
    create: {
      email: 'admin@hotel.com',
      firstName: 'Hotel',
      lastName: 'Administrator',
      passwordHash: adminHash,
      role: 'ADMIN',
      isActive: true,
      propertyId: property.id
    }
  });

  console.log('SUCCESS_SEEDED');
  const all = await prisma.user.findMany({ select: { id: true, email: true, role: true, isActive: true } });
  console.log(JSON.stringify(all, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
