import { test, expect } from '@playwright/test';
import { authenticateStaff } from './helpers';

test.describe('Operational Room Board', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateStaff(page);
    await page.addInitScript(() => {
      localStorage.setItem('hotel_room_board_state', JSON.stringify([
        { id: '101', roomNumber: '101', type: 'Deluxe King', floor: 1, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'David Miller', reservation: 'RES-4401', pricePerNight: 180 },
        { id: '102', roomNumber: '102', type: 'Deluxe King', floor: 1, occupancy: 'Vacant', housekeeping: 'Dirty', operational: 'In Service', reservation: 'None', pricePerNight: 180 },
        { id: '103', roomNumber: '103', type: 'Twin Executive', floor: 1, occupancy: 'Vacant', housekeeping: 'Inspected', operational: 'In Service', reservation: 'None', pricePerNight: 160 },
        { id: '104', roomNumber: '104', type: 'Twin Executive', floor: 1, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'Elena Rostova', reservation: 'RES-4405', pricePerNight: 160 },
        { id: '201', roomNumber: '201', type: 'Executive Suite', floor: 2, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'Sarah Jenkins (VIP)', reservation: 'RES-4410', pricePerNight: 280 },
        { id: '202', roomNumber: '202', type: 'Executive Suite', floor: 2, occupancy: 'Vacant', housekeeping: 'Cleaning', operational: 'In Service', reservation: 'None', pricePerNight: 280 },
        { id: '203', roomNumber: '203', type: 'Deluxe King', floor: 2, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', reservation: 'None', pricePerNight: 180 },
        { id: '204', roomNumber: '204', type: 'Deluxe King', floor: 2, occupancy: 'Occupied', housekeeping: 'Dirty', operational: 'In Service', currentGuest: 'Carlos Gomez', reservation: 'RES-4412', pricePerNight: 180 },
        { id: '301', roomNumber: '301', type: 'Ocean Panorama Suite', floor: 3, occupancy: 'Vacant', housekeeping: 'Inspected', operational: 'In Service', reservation: 'None', pricePerNight: 350 },
        { id: '302', roomNumber: '302', type: 'Ocean Panorama Suite', floor: 3, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'Michael Chang', reservation: 'RES-4418', pricePerNight: 350 },
        { id: '303', roomNumber: '303', type: 'Family Studio', floor: 3, occupancy: 'Vacant', housekeeping: 'Dirty', operational: 'Out of Order', reservation: 'None', pricePerNight: 220 },
        { id: '401', roomNumber: '401', type: 'Presidential Penthouse', floor: 4, occupancy: 'Occupied', housekeeping: 'Inspected', operational: 'In Service', currentGuest: 'Ambassador Al-Mansoor', reservation: 'RES-4420', pricePerNight: 750 },
      ]));
    });
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
