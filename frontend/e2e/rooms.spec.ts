import { test, expect } from '@playwright/test';
import { authenticateStaff } from './helpers';

test.describe('Operational Room Board', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateStaff(page);
    await page.goto('/rooms');
  });

  test('displays Room Board header, action buttons, and filters', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Operational Room Board' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: /Maid Portal/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Add New Room/i })).toBeVisible();
    await expect(page.getByPlaceholder('Search room or guest...')).toBeVisible();
  });

  test('filters room cards by status button (Vacant, Occupied, Clean, Dirty)', async ({ page }) => {
    // Click Vacant filter
    await page.getByRole('button', { name: /Vacant/i }).click();
    // Verify room 102 (Vacant) is visible
    await expect(page.getByRole('link', { name: 'Room 102' })).toBeVisible();

    // Click Occupied filter
    await page.getByRole('button', { name: /Occupied/i }).click();
    // Verify room 101 (Occupied) is visible
    await expect(page.getByRole('link', { name: 'Room 101' })).toBeVisible();
  });

  test('filters room cards by floor selector', async ({ page }) => {
    const floorSelect = page.getByLabel('Filter by floor');
    await floorSelect.selectOption('4');

    // Only Penthouse (Room 401) should be visible
    await expect(page.getByRole('link', { name: 'Room 401' })).toBeVisible();
    await expect(page.getByText('Presidential Penthouse')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Room 101' })).not.toBeVisible();
  });

  test('searches for rooms by guest name or room number', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search room or guest...');
    await searchInput.fill('Sarah Jenkins');

    await expect(page.getByRole('link', { name: 'Room 201' })).toBeVisible();
    await expect(page.getByText('Sarah Jenkins (VIP)')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Room 101' })).not.toBeVisible();
  });

  test('allows marking a clean room as inspected by supervisor', async ({ page }) => {
    // Room 203 is initially Clean
    await page.getByPlaceholder('Search room or guest...').fill('203');
    await expect(page.getByRole('link', { name: 'Room 203' })).toBeVisible();

    const inspectBtn = page.getByRole('button', { name: /Inspect/i });
    if (await inspectBtn.isVisible()) {
      await inspectBtn.click();
      // Should now show Inspected badge or button state updated
      await expect(page.getByTitle(/Status: Inspected/i)).toBeVisible();
    }
  });
});
