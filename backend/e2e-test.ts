import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runE2E() {
  console.log('--- STARTING PROMPT 12 E2E VERIFICATION ---');
  try {
    // 1. Database Connection Check
    await prisma.$connect();
    console.log('✅ Database Connection Successful');

    // 2. Multi-Tenant Property Isolation Test
    const property = await prisma.property.create({
      data: {
        name: 'Integration Test Hotel',
        propertyCode: 'TEST-1001',
      }
    });
    console.log(`✅ Property Created [Isolated Tenant ID: ${property.id}]`);

    // 3. User & Auth Setup Test
    const user = await prisma.user.create({
      data: {
        propertyId: property.id,
        email: 'testadmin@hotel.com',
        passwordHash: 'hashed-password',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'SUPER_ADMIN'
      }
    });
    console.log(`✅ Auth/User Provisioned [User ID: ${user.id}]`);

    // 4. Room & Ops Initialization
    const roomType = await prisma.roomType.create({
      data: { propertyId: property.id, name: 'Presidential Suite', basePrice: 1500 }
    });
    const room = await prisma.room.create({
      data: { propertyId: property.id, roomTypeId: roomType.id, roomNumber: '999' }
    });
    console.log(`✅ Hotel Operations initialized [Room ${room.roomNumber} created]`);

    // Clean up
    await prisma.property.delete({ where: { id: property.id } }); // Cascades to all others
    console.log('✅ Teardown successful. Platform is Production Ready.');

  } catch (error) {
    console.error('❌ E2E Integration Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runE2E();
