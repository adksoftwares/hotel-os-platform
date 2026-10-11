import { test, expect } from '@playwright/test';
import { authenticateStaff } from './helpers';

test.describe('Room and Food Real-Time CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateStaff(page);
    // Navigate once and clear localStorage once so items persist across subsequent navigations
    await page.goto('/rooms');
    await page.evaluate(() => {
      localStorage.setItem('hotel_room_board_state', JSON.stringify([]));
      localStorage.setItem('hotel_menu_items', JSON.stringify([]));
      localStorage.setItem('restaurant_menu_items', JSON.stringify([]));
    });
    await page.reload();
  });

  test('starts with a clean slate: verifies empty state on Rooms and Menu pages', async ({ page }) => {
    // 1. Check Rooms Page shows clean empty fleet state
    await page.goto('/rooms');
    await expect(page.getByRole('heading', { name: 'No Rooms in Fleet' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Add Your First Room/i })).toBeVisible();

    // 2. Check Menu Management shows clean empty menu state
    await page.goto('/restaurant/menu');
    await expect(page.getByRole('heading', { name: 'No Food Items in Menu' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Your First Dish/i })).toBeVisible();
  });

  test('creates new room with custom number and verifies it appears on Room Board', async ({ page }) => {
    // Navigate to Add Room form
    await page.goto('/settings/rooms/new');

    // Fill in Room Details
    await page.getByPlaceholder('e.g. 101').fill('505');
    await page.getByPlaceholder('e.g. Main Building').fill('Executive Tower');
    await page.getByPlaceholder('e.g. 1', { exact: true }).fill('5');
    await page.getByRole('combobox').selectOption('Deluxe');
    await page.getByPlaceholder('e.g. 1 King, 2 Twin').fill('1 King Bed');

    // Submit form
    await page.getByRole('button', { name: 'Create Room' }).click();

    // Verify blurred popup window is visible with entered room details
    await expect(page.getByRole('heading', { name: 'Room Successfully Created!' })).toBeVisible();
    await expect(page.getByText('Room 505')).toBeVisible();
    await expect(page.getByText('Deluxe Tier')).toBeVisible();

    // Click "Go to Operational Room Board"
    await page.getByRole('button', { name: /Go to Operational Room Board/i }).click();

    // Verify navigation to /rooms and Room 505 is visible
    await expect(page).toHaveURL(/\/rooms/);
    await expect(page.getByRole('link', { name: 'Room 505' })).toBeVisible();
    await expect(page.getByText('Deluxe Tier')).toBeVisible();
    await expect(page.getByText('Floor 5')).toBeVisible();
  });

  test('supports adding multiple rooms and deleting individual rooms', async ({ page }) => {
    // Seed one room first
    await page.goto('/settings/rooms/new');
    await page.getByPlaceholder('e.g. 101').fill('101');
    await page.getByPlaceholder('e.g. 1', { exact: true }).fill('1');
    await page.getByPlaceholder('e.g. 1 King, 2 Twin').fill('1 King Bed');
    await page.getByRole('button', { name: 'Create Room' }).click();
    await page.getByRole('button', { name: /Go to Operational Room Board/i }).click();
    await expect(page.getByRole('link', { name: 'Room 101' })).toBeVisible();

    // Add a second room (Room 202)
    await page.goto('/settings/rooms/new');
    await page.getByPlaceholder('e.g. 101').fill('202');
    await page.getByPlaceholder('e.g. 1', { exact: true }).fill('2');
    await page.getByRole('combobox').selectOption('Suite');
    await page.getByPlaceholder('e.g. 1 King, 2 Twin').fill('2 Queen Beds');
    await page.getByRole('button', { name: 'Create Room' }).click();
    await page.getByRole('button', { name: /Go to Operational Room Board/i }).click();

    // Verify both rooms are visible
    await expect(page.getByRole('link', { name: 'Room 101' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Room 202' })).toBeVisible();

    // Delete Room 101
    await page.getByLabel('Delete Room 101').click();
    await expect(page.getByRole('heading', { name: 'Delete Room 101?' })).toBeVisible();
    await page.getByRole('button', { name: 'Yes, Delete Room' }).click();

    // Verify Room 101 is deleted, and Room 202 remains
    await expect(page.getByRole('link', { name: 'Room 101' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Room 202' })).toBeVisible();
  });

  test('creates new food item, displays it in Menu Catalog, and supports deletion', async ({ page }) => {
    // Navigate to Add Food page
    await page.goto('/settings/restaurant/food/new');

    // Fill in Food Details
    await page.getByPlaceholder('e.g. Classic Cheeseburger').fill('Hyderabadi Chicken Biryani');
    await page.getByPlaceholder('0.00').first().fill('16.50');

    // Save item
    await page.getByRole('button', { name: 'Save Item' }).click();

    // Verify blurred popup window is visible
    await expect(page.getByRole('heading', { name: 'Food Item Saved Successfully!' })).toBeVisible();
    await expect(page.getByText('Hyderabadi Chicken Biryani').first()).toBeVisible();
    await expect(page.getByText('$16.50')).toBeVisible();

    // Click "Go to Menu Management"
    await page.getByRole('button', { name: /Go to Menu Management/i }).click();

    // Verify item is visible in Menu list
    await expect(page).toHaveURL(/\/restaurant\/menu/);
    await expect(page.getByText('Hyderabadi Chicken Biryani')).toBeVisible();
    await expect(page.getByRole('cell', { name: '$16.50', exact: true })).toBeVisible();

    // Delete the food item
    await page.getByLabel('Delete Hyderabadi Chicken Biryani').click();
    await expect(page.getByText('Hyderabadi Chicken Biryani')).not.toBeVisible();
    // Catalog should return to clean empty state
    await expect(page.getByRole('heading', { name: 'No Food Items in Menu' })).toBeVisible();
  });
});
