import { test, expect } from '@playwright/test';
import { authenticateStaff } from './helpers';

test.describe('Restaurant Point of Sale (POS)', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateStaff(page);
    await page.goto('/pos');
  });

  test('displays floor plan tables or order pad view', async ({ page }) => {
    // POS has two modes: Table Selection and Order Pad
    // Check if table grid or category buttons exist
    const orderPadToggle = page.getByRole('button', { name: /Order Pad/i });
    if (await orderPadToggle.isVisible()) {
      await orderPadToggle.click();
    }

    await expect(page.getByRole('button', { name: /\+ Add Food to Menu/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Special Custom Dish/i })).toBeVisible();
  });

  test('opens the Add Food to Menu Catalog modal', async ({ page }) => {
    const orderPadToggle = page.getByRole('button', { name: /Order Pad/i });
    if (await orderPadToggle.isVisible()) {
      await orderPadToggle.click();
    }

    await page.getByRole('button', { name: /\+ Add Food to Menu/i }).click();
    await expect(page.getByText('Add New Dish to POS Menu Catalog')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Crispy Duck Confit')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('opens Special Custom Dish modal for off-menu requests', async ({ page }) => {
    const orderPadToggle = page.getByRole('button', { name: /Order Pad/i });
    if (await orderPadToggle.isVisible()) {
      await orderPadToggle.click();
    }

    await page.getByRole('button', { name: /Special Custom Dish/i }).click();
    await expect(page.getByRole('heading', { name: /Special Custom Dish/i })).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Catch of the Day (Wild Snapper Fillet)')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
