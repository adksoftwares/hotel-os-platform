export interface UnifiedFoodItem {
  id: string;
  name: string;
  category: string;
  course: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
  price: number;
  basePrice: number;
  cost?: number;
  tax?: number;
  img: string;
  image?: string;
  available: boolean;
  isAvailable: boolean;
  dietary?: string;
  station?: string;
  description?: string;
  code?: string;
  variants?: { id?: string; name: string; price: number }[];
  modifiers?: { id: number | string; name: string; price: string | number }[];
}

export const FAKE_FOOD_IDS = new Set([
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
  'M-001', 'M-002', 'M-003'
]);

export const FAKE_FOOD_NAMES = new Set([
  'steak frites (250g)',
  'caesar salad with bacon',
  'truffle parmesan fries',
  'artisan craft cola',
  'wagyu burger deluxe',
  'ny baked cheesecake',
  'margherita woodfire pizza',
  'garlic tomato bruschetta',
  'grilled atlantic salmon',
  'crispy calamari rings',
  'espresso martini',
  'lava chocolate cake',
  'warm lava chocolate cake',
  'grilled salmon',
  'caesar salad',
  'truffle pasta',
]);

export const getEmojiForDish = (name: string, category: string = ''): string => {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();
  if (n.includes('rice') || n.includes('biryani') || n.includes('fried rice') || n.includes('pulao')) return '🍚';
  if (n.includes('burger')) return '🍔';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('pasta') || n.includes('noodle') || n.includes('spaghetti')) return '🍝';
  if (n.includes('fish') || n.includes('salmon') || n.includes('seafood') || n.includes('crab') || n.includes('prawn')) return '🐟';
  if (n.includes('chicken') || n.includes('meat') || n.includes('steak') || n.includes('curry') || n.includes('mutton') || n.includes('beef')) return '🍗';
  if (n.includes('fries') || n.includes('potato') || n.includes('chip')) return '🍟';
  if (n.includes('cake') || n.includes('dessert') || n.includes('sweet') || n.includes('ice cream') || n.includes('chocolate')) return '🍰';
  if (n.includes('tea') || n.includes('coffee') || n.includes('espresso') || n.includes('cappuccino') || n.includes('latte')) return '☕';
  if (n.includes('juice') || n.includes('drink') || n.includes('beverage') || n.includes('coke') || n.includes('mojito') || n.includes('water') || n.includes('soda')) return '🥤';
  if (n.includes('bread') || n.includes('roti') || n.includes('naan') || n.includes('toast') || n.includes('parotta')) return '🍞';
  if (n.includes('taco') || n.includes('wrap') || n.includes('burrito') || n.includes('roll')) return '🌮';
  if (n.includes('soup')) return '🥣';
  if (n.includes('salad')) return '🥗';
  if (c.includes('beverage') || c.includes('drink')) return '🥤';
  if (c.includes('dessert') || c.includes('sweet')) return '🍰';
  if (c.includes('starter') || c.includes('appetizer')) return '🥗';
  return '🍽️';
};

const normalizeCategory = (cat?: string): string => {
  const c = (cat || '').toLowerCase().trim();
  if (c.includes('starter') || c.includes('appetizer')) return 'Starters';
  if (c.includes('main')) return 'Mains';
  if (c.includes('side')) return 'Sides';
  if (c.includes('beverage') || c.includes('drink')) return 'Beverages';
  if (c.includes('dessert') || c.includes('sweet')) return 'Desserts';
  if (c.includes('special')) return 'Chef Specials';
  return cat || 'Mains';
};

const normalizeCourse = (cat: string, course?: string): 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE' => {
  if (course === 'STARTER' || course === 'MAIN' || course === 'DESSERT' || course === 'BEVERAGE') {
    return course;
  }
  const c = (cat || '').toLowerCase();
  if (c.includes('starter') || c.includes('appetizer')) return 'STARTER';
  if (c.includes('dessert') || c.includes('sweet')) return 'DESSERT';
  if (c.includes('beverage') || c.includes('drink')) return 'BEVERAGE';
  return 'MAIN';
};

const STORAGE_KEYS = [
  'hotel_menu_items',
  'restaurant_menu_items',
  'pos_all_menu_items',
  'pos_custom_menu_items'
];

export const loadMenuCatalog = (): UnifiedFoodItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const rawItems: any[] = [];
    for (const key of STORAGE_KEYS) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            rawItems.push(...parsed);
          }
        } catch (_) {}
      }
    }

    if (rawItems.length === 0) {
      return [];
    }

    // Deduplicate and normalize by unique name / id
    const itemsMap = new Map<string, UnifiedFoodItem>();

    for (const raw of rawItems) {
      if (!raw || !raw.name) continue;

      const rawName = String(raw.name).trim();
      const rawNameLower = rawName.toLowerCase();
      const rawId = String(raw.id || '');

      // Filter out mock / fake demo dishes
      if (FAKE_FOOD_IDS.has(rawId) || FAKE_FOOD_NAMES.has(rawNameLower)) {
        continue;
      }

      const category = normalizeCategory(raw.category);
      const course = normalizeCourse(category, raw.course);
      const price = parseFloat(raw.price || raw.basePrice || 0) || 0;
      const isAvail = raw.available !== false && raw.isAvailable !== false && raw.status !== '86';
      const cleanImg = (raw.img && !raw.img.startsWith('http') && raw.img.length <= 10)
        ? raw.img
        : getEmojiForDish(rawName, category);

      const unified: UnifiedFoodItem = {
        id: raw.id || `dish-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: rawName,
        category,
        course,
        price,
        basePrice: price,
        cost: parseFloat(raw.cost || 0) || 0,
        tax: parseFloat(raw.tax || 0) || 0,
        img: cleanImg,
        image: cleanImg,
        available: isAvail,
        isAvailable: isAvail,
        dietary: raw.dietary || 'None',
        station: raw.station || (category === 'Beverages' ? 'Bar' : 'Kitchen'),
        description: raw.description || '',
        code: raw.code || '',
        variants: Array.isArray(raw.variants) ? raw.variants : [],
        modifiers: Array.isArray(raw.modifiers) ? raw.modifiers : []
      };

      // Map key: prioritize name to avoid duplicate items created with different IDs
      const dedupeKey = rawNameLower;
      if (!itemsMap.has(dedupeKey)) {
        itemsMap.set(dedupeKey, unified);
      } else {
        // Merge rich fields if found
        const existing = itemsMap.get(dedupeKey)!;
        if (unified.variants && unified.variants.length > 0) existing.variants = unified.variants;
        if (unified.modifiers && unified.modifiers.length > 0) existing.modifiers = unified.modifiers;
        if (unified.description) existing.description = unified.description;
        if (unified.code) existing.code = unified.code;
      }
    }

    const unifiedList = Array.from(itemsMap.values());

    // Sync all storage keys to ensure all components see the exact same catalog
    const json = JSON.stringify(unifiedList);
    for (const key of STORAGE_KEYS) {
      localStorage.setItem(key, json);
    }

    return unifiedList;
  } catch (_) {
    return [];
  }
};

export const saveMenuCatalog = (items: UnifiedFoodItem[]): void => {
  if (typeof window === 'undefined') return;

  try {
    const normalized = items
      .filter(item => item && item.name && !FAKE_FOOD_NAMES.has(item.name.toLowerCase().trim()))
      .map(item => {
        const category = normalizeCategory(item.category);
        const course = normalizeCourse(category, item.course);
        const price = parseFloat(String(item.price || item.basePrice || 0)) || 0;
        const img = (item.img && !item.img.startsWith('http') && item.img.length <= 10)
          ? item.img
          : getEmojiForDish(item.name, category);
        const isAvail = item.available !== false && item.isAvailable !== false;

        return {
          ...item,
          category,
          course,
          price,
          basePrice: price,
          img,
          image: img,
          available: isAvail,
          isAvailable: isAvail,
        };
      });

    const json = JSON.stringify(normalized);
    for (const key of STORAGE_KEYS) {
      localStorage.setItem(key, json);
    }

    // Broadcast change event
    window.dispatchEvent(new Event('hotel_menu_changed'));
    window.dispatchEvent(new Event('storage'));
  } catch (_) {}
};

export const addMenuItem = (item: Partial<UnifiedFoodItem>): UnifiedFoodItem => {
  const current = loadMenuCatalog();
  const name = (item.name || '').trim();
  const category = normalizeCategory(item.category);
  const price = parseFloat(String(item.price || item.basePrice || 0)) || 0;
  const img = item.img || getEmojiForDish(name, category);

  const newItem: UnifiedFoodItem = {
    id: item.id || `food-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    category,
    course: normalizeCourse(category, item.course),
    price,
    basePrice: price,
    cost: item.cost || 0,
    tax: item.tax || 0,
    img,
    image: img,
    available: item.available !== false && item.isAvailable !== false,
    isAvailable: item.available !== false && item.isAvailable !== false,
    dietary: item.dietary || 'None',
    station: item.station || (category === 'Beverages' ? 'Bar' : 'Kitchen'),
    description: item.description || '',
    code: item.code || '',
    variants: item.variants || [],
    modifiers: item.modifiers || []
  };

  const filtered = current.filter(i => i.name.toLowerCase() !== name.toLowerCase());
  const updated = [...filtered, newItem];
  saveMenuCatalog(updated);
  return newItem;
};

export const updateMenuItem = (id: string, updates: Partial<UnifiedFoodItem>): boolean => {
  const current = loadMenuCatalog();
  const index = current.findIndex(i => i.id === id);
  if (index === -1) return false;

  const existing = current[index];
  const updated: UnifiedFoodItem = {
    ...existing,
    ...updates,
    price: updates.price !== undefined ? parseFloat(String(updates.price)) : existing.price,
    basePrice: updates.basePrice !== undefined ? parseFloat(String(updates.basePrice)) : (updates.price !== undefined ? parseFloat(String(updates.price)) : existing.basePrice),
    available: updates.available !== undefined ? updates.available : (updates.isAvailable !== undefined ? updates.isAvailable : existing.available),
    isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : (updates.available !== undefined ? updates.available : existing.isAvailable),
  };

  current[index] = updated;
  saveMenuCatalog(current);
  return true;
};

export const deleteMenuItem = (id: string): boolean => {
  const current = loadMenuCatalog();
  const filtered = current.filter(i => i.id !== id);
  if (filtered.length === current.length) return false;

  saveMenuCatalog(filtered);
  return true;
};
