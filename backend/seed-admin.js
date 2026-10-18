import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.property.findMany();
  let property = properties[0];
  if (!property) {
    property = await prisma.property.create({
      data: {
        name: 'Grand ADK Hotel',
        propertyCode: 'ADK001'
      }
    });
  }

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super_admin@gmail.com',
      passwordHash: passwordHash,
      role: 'SUPER_ADMIN',
      propertyId: property.id
    }
  });

  console.log('Created Admin:', admin.email);
  console.log('Password: admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
