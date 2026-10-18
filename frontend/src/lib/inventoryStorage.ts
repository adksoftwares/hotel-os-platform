export interface InventoryItem {
  sku: string;
  name: string;
  category: 'Kitchen' | 'Bar' | 'Housekeeping' | 'Beverages';
  qty: number;
  unit: string;
  reorderLevel: number;
  location: string;
  unitCost: number;
}

export const initialStock: InventoryItem[] = [
  { sku: 'ING-BEEF', name: 'Premium Beef Tenderloin', category: 'Kitchen', qty: 45.5, unit: 'KG', reorderLevel: 20.0, location: 'Main Walk-In Freezer', unitCost: 28.50 },
  { sku: 'ING-POT', name: 'Russet Potatoes (A-Grade)', category: 'Kitchen', qty: 12.0, unit: 'KG', reorderLevel: 25.0, location: 'Dry Store A', unitCost: 2.20 },
  { sku: 'BEV-COLA', name: 'Craft Cola Postmix Syrup', category: 'Bar', qty: 5.0, unit: 'LITER', reorderLevel: 15.0, location: 'Bar Cellar Room', unitCost: 14.00 },
  { sku: 'BEV-COF', name: 'Single Origin Espresso Beans', category: 'Beverages', qty: 32.0, unit: 'KG', reorderLevel: 10.0, location: 'Dry Store B', unitCost: 19.50 },
  { sku: 'HK-SHAM', name: 'Luxury Guest Shampoo Bottles (50ml)', category: 'Housekeeping', qty: 240, unit: 'PCS', reorderLevel: 100, location: 'Linen Master Depot', unitCost: 1.10 },
  { sku: 'HK-TOWL', name: 'Egyptian Cotton Bath Towels (700gsm)', category: 'Housekeeping', qty: 85, unit: 'PCS', reorderLevel: 50, location: 'Floor 2 Linen Closet', unitCost: 18.00 },
  { sku: 'BAR-CHAM', name: 'Veuve Clicquot Brut Champagne', category: 'Bar', qty: 18, unit: 'BOTTLE', reorderLevel: 12, location: 'Wine Cellar Cooler', unitCost: 65.00 },
];

const STORAGE_KEY = 'hotel_inventory_stock';

export const loadInventoryStock = (): InventoryItem[] => {
  if (typeof window === 'undefined') return initialStock;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return initialStock;
};

export const saveInventoryStock = (data: InventoryItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('inventory_updated'));
  } catch (_) {}
};
