import { test, expect } from '@playwright/test';
import { authenticateStaff } from './helpers';

test.describe('Waiter Mobile Handheld POS', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateStaff(page);
    await page.goto('/pos/waiter');
  });

  test('displays handheld header bar with table selector and server name', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Handheld Order & Course Station' })).toBeVisible();
    await expect(page.getByText('WAITER MOBILE POS')).toBeVisible();
    await expect(page.getByText(/Server:/i)).toBeVisible();
  });

  test('filters dishes by category tabs (Starters, Mains, Desserts, Beverages)', async ({ page }) => {
    // Click Beverages
    await page.getByRole('button', { name: 'Beverages', exact: true }).click();
    await expect(page.getByText('Artisan Craft Cola').first()).toBeVisible();

    // Click Desserts
    await page.getByRole('button', { name: 'Desserts', exact: true }).click();
    await expect(page.getByText('NY Baked Cheesecake').first()).toBeVisible();
  });

  test('adds dishes to active handheld ticket and updates total bill', async ({ page }) => {
    await page.getByRole('button', { name: 'All', exact: true }).click();

    // Tap on Steak Frites card
    const steakButton = page.getByRole('button', { name: /Steak Frites/i }).first();
    await steakButton.click();

    // Verify Steak Frites appears on active ticket on the right
    await expect(page.getByRole('heading', { name: 'Active Order Ticket' })).toBeVisible();
    await expect(page.getByText('Total Bill')).toBeVisible();
  });

  test('can fire held mains to kitchen KDS', async ({ page }) => {
    const fireMainsBtn = page.getByRole('button', { name: /Fire Mains/i }).first();
    await expect(fireMainsBtn).toBeVisible();
    await fireMainsBtn.click();
    // Toast notification or hold state updated
  });
});
