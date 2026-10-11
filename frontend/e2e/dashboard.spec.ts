import { test, expect } from '@playwright/test';
import { authenticateStaff } from './helpers';

test.describe('Live Operational Command Center (Dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateStaff(page);
    await page.goto('/');
  });

  test('renders operational command center header and live date', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Operational Command Center' })).toBeVisible();
    await expect(page.getByText('Live hospitality operations overview')).toBeVisible();
  });

  test('displays key operational metrics strip (Occupancy, Arrivals, Departures, In-House)', async ({ page }) => {
    await expect(page.getByText('Occupancy', { exact: true })).toBeVisible();
    await expect(page.getByText("Today's Arrivals")).toBeVisible();
    await expect(page.getByText("Today's Departures")).toBeVisible();
    await expect(page.getByText('In-House Guests')).toBeVisible();
    await expect(page.getByText('Upcoming Bookings')).toBeVisible();
  });

  test('displays department workstations (Rooms & Housekeeping, Restaurant Pulse, Daily Cashier)', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Rooms & Housekeeping Readiness' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Restaurant & Kitchen Pulse' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Daily Cashier & Folio Pulse' })).toBeVisible();
  });

  test('navigates to room board when clicking Open Room Board link', async ({ page }) => {
    await page.getByRole('link', { name: /Open Room Board/i }).click();
    await expect(page).toHaveURL(/\/rooms/);
    await expect(page.getByRole('heading', { name: 'Operational Room Board' })).toBeVisible();
  });
});
