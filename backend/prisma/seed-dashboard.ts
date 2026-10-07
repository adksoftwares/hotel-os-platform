import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const propertyId = 'default-property-id';

  // 1. Create Property if not exists
  await prisma.property.upsert({
    where: { id: propertyId },
    update: {},
    create: {
      id: propertyId,
      name: 'Grand Hotel OS',
      propertyCode: 'GHOS'
    }
  });

  // 2. Create Room Types
  const rType = await prisma.roomType.upsert({
    where: { id: 'type-1' },
    update: {},
    create: {
      id: 'type-1',
      propertyId,
      name: 'Deluxe Room',
      basePrice: 150
    }
  });

  // 3. Create Rooms
  const roomsData = [
    { id: '101', roomNumber: '101', occupancyStatus: 'OCCUPIED', housekeepingStatus: 'CLEAN', operationalStatus: 'AVAILABLE' },
    { id: '102', roomNumber: '102', occupancyStatus: 'OCCUPIED', housekeepingStatus: 'DIRTY', operationalStatus: 'AVAILABLE' },
    { id: '103', roomNumber: '103', occupancyStatus: 'RESERVED', housekeepingStatus: 'INSPECTED', operationalStatus: 'AVAILABLE' },
    { id: '104', roomNumber: '104', occupancyStatus: 'VACANT', housekeepingStatus: 'DIRTY', operationalStatus: 'AVAILABLE' },
    { id: '201', roomNumber: '201', occupancyStatus: 'VACANT', housekeepingStatus: 'DIRTY', operationalStatus: 'OUT_OF_ORDER' },
    { id: '202', roomNumber: '202', occupancyStatus: 'VACANT', housekeepingStatus: 'CLEAN', operationalStatus: 'OUT_OF_SERVICE' }
  ];

  for (const r of roomsData) {
    await prisma.room.upsert({
      where: { id: r.id },
      update: r,
      create: {
        id: r.id,
        propertyId,
        roomTypeId: rType.id,
        roomNumber: r.roomNumber,
        occupancyStatus: r.occupancyStatus,
        housekeepingStatus: r.housekeepingStatus,
        operationalStatus: r.operationalStatus,
        description: 'Mocked Room'
      }
    });
  }

  const station = await prisma.kitchenStation.upsert({
    where: { id: 'station-1' },
    update: {},
    create: { id: 'station-1', name: 'Main Kitchen' }
  });

  const outlet = await prisma.restaurantOutlet.upsert({
    where: { id: 'outlet-1' },
    update: {},
    create: { id: 'outlet-1', propertyId, name: 'Main Restaurant' }
  });

  // 4. Create Restaurant Order and KOTs
  const order = await prisma.restaurantOrder.upsert({
    where: { id: 'order-1' },
    update: {},
    create: {
      id: 'order-1',
      propertyId,
      outletId: outlet.id,
      serviceType: 'DINE_IN',
      status: 'OPEN',
      subtotal: 0,
      grandTotal: 0
    }
  });

  await prisma.kOT.upsert({
    where: { id: 'kot-1' },
    update: { status: 'NEW' },
    create: {
      id: 'kot-1',
      orderId: order.id,
      kitchenStationId: station.id,
      status: 'NEW'
    }
  });

  await prisma.kOT.upsert({
    where: { id: 'kot-2' },
    update: { status: 'NEW' },
    create: {
      id: 'kot-2',
      orderId: order.id,
      kitchenStationId: station.id,
      status: 'NEW'
    }
  });

  // 5. Create some financial data
  const today = new Date();
  await prisma.folio.upsert({
    where: { id: 'folio-1' },
    update: {},
    create: {
      id: 'folio-1',
      propertyId,
      folioNumber: 'FOL-1001',
      status: 'OPEN',
      openedAt: today,
      grandTotal: 450,
      paidTotal: 150,
      balance: 300
    }
  });

  // 6. Reservations (Today's Arrivals/Departures)
  const guest = await prisma.guest.upsert({
    where: { id: 'guest-1' },
    update: {},
    create: {
      id: 'guest-1',
      propertyId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    }
  });

  await prisma.reservation.upsert({
    where: { id: 'res-1' },
    update: {},
    create: {
      id: 'res-1',
      propertyId,
      status: 'CONFIRMED',
      expectedCheckIn: today,
      expectedCheckOut: new Date(today.getTime() + 86400000),
      guestId: guest.id,
      roomTypeId: 'type-1',
      adults: 2
    }
  });

  console.log('Database seeded successfully!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
