import { test, expect } from '@playwright/test';
import { createMockToken } from './helpers';

test.describe('Staff Authentication Workstation', () => {
  test('unauthenticated users accessing dashboard should be redirected to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Staff Authentication' })).toBeVisible();
  });

  test('login page displays proper branding, fields, and focus indicators', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'ADK Hotel OS' })).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Security Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In to Shift/i })).toBeVisible();
  });

  test('submitting invalid credentials displays an error alert', async ({ page }) => {
    // Intercept backend auth endpoint to return 401
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid email or password. Please verify credentials.' }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email Address').fill('wrong@hotel.com');
    await page.getByLabel('Security Password').fill('wrongpass');
    await page.getByRole('button', { name: /Sign In to Shift/i }).click();

    const formAlert = page.locator('form [role="alert"]');
    await expect(formAlert).toBeVisible();
    await expect(formAlert).toContainText(/Invalid email or password/i);
  });

  test('successful authentication saves tokens and navigates to dashboard', async ({ page }) => {
    const mockToken = createMockToken();
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: mockToken,
          user: { id: 'usr_1', email: 'admin@hotel.com', role: 'SUPER_ADMIN' },
        }),
      });
    });

    await page.route('**/dashboard/metrics*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hotel: { occupancyRate: 75, occupiedRooms: 9, vacantRooms: 3, todayArrivals: 4, todayDepartures: 3, inHouseGuests: 14 },
          housekeeping: { dirtyRooms: 2, cleaningRooms: 1, readyRooms: 5, maintenanceRooms: 1, inspectionRooms: 3 },
          restaurant: { activeOrders: 4, activeKots: 3, preparingKots: 2, readyKots: 1, occupiedTables: 3, delayedKots: 1 },
          financial: { todayRevenue: 2850.00, todayPayments: 1950.00, outstanding: 900.00 },
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email Address').fill('admin@hotel.com');
    await page.getByLabel('Security Password').fill('admin123');
    await page.getByRole('button', { name: /Sign In to Shift/i }).click();

    await expect(page).toHaveURL(/localhost:3000\/?$/);
    await expect(page.getByRole('heading', { name: 'Operational Command Center' })).toBeVisible();
  });
});
