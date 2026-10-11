import { Page } from '@playwright/test';

/**
 * Generates a valid unexpired JWT token for E2E tests
 */
export function createMockToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: 'staff-admin-01',
    email: 'admin@hotel.com',
    role: 'SUPER_ADMIN',
    propertyId: 'default-property-id',
    exp: Math.floor(Date.now() / 1000) + 86400, // Valid for 24 hours
  }));
  const signature = 'mockSignature7x9Qk2';
  return `${header}.${payload}.${signature}`;
}

/**
 * Seeds browser localStorage with authenticated staff session
 */
export async function authenticateStaff(page: Page) {
  const token = createMockToken();
  await page.addInitScript(({ token }) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify({
      id: 'staff-admin-01',
      email: 'admin@hotel.com',
      role: 'SUPER_ADMIN',
      firstName: 'Hotel',
      lastName: 'Administrator',
    }));
  }, { token });

  // Route backend dashboard metrics to prevent 401 unauthenticated redirect on dashboard
  await page.route('**/dashboard/metrics*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        hotel: {
          totalRooms: 12,
          occupancyRate: 75,
          occupiedRooms: 9,
          vacantRooms: 3,
          reservedRooms: 2,
          todayArrivals: 4,
          todayDepartures: 3,
          inHouseGuests: 14,
        },
        housekeeping: {
          dirtyRooms: 2,
          cleaningRooms: 1,
          readyRooms: 5,
          maintenanceRooms: 1,
          inspectionRooms: 3,
        },
        restaurant: {
          activeOrders: 4,
          activeKots: 3,
          preparingKots: 2,
          readyKots: 1,
          occupiedTables: 3,
          delayedKots: 1,
        },
        financial: {
          todayRevenue: 2850.00,
          todayPayments: 1950.00,
          outstanding: 900.00,
        },
      }),
    });
  });
}
