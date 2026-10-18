"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Modal } from '@/components/ui/Modal';
import { ReceiptModal } from '@/components/ui/ReceiptModal';
import { 
  Settings, Utensils, Bed, Search, Tag, Percent, ArrowRight, 
  Minus, Plus, Edit2, Trash2, LayoutGrid, Coffee, Split, 
  CheckCircle, Clock, Users, ArrowUpRight, DollarSign, Smartphone,
  ChefHat, Sparkles, Sliders, X, Flame, ShieldAlert, Star, Check,
  ChevronLeft, ChevronRight, List, PauseCircle, PlayCircle, FilePlus,
  Printer, Eye, AlertCircle, ShoppingBag, RotateCcw
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface MenuItemEntity {
  id: string;
  name: string;
  category: string;
  course: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
  price: number;
  img: string;
  dietary?: string;
  station?: string;
  isCustom?: boolean;
}

export interface HeldBill {
  id: string;
  billNumber: string;
  orderType: 'Table' | 'Room' | 'Takeaway';
  tableOrRoom: string;
  customerName?: string;
  items: any[];
  subtotal: number;
  tax: number;
  discount: number;
  orderDiscount: { type: 'percent' | 'fixed' | 'none'; value: number };
  grandTotal: number;
  note?: string;
  heldAt: string;
  server?: string;
}

const defaultMenuItems: MenuItemEntity[] = [
  { id: '1', name: 'Steak Frites (250g)', category: 'Mains', course: 'MAIN', price: 50.00, img: '🥩', dietary: 'Chef Special' },
  { id: '2', name: 'Caesar Salad with Bacon', category: 'Starters', course: 'STARTER', price: 15.00, img: '🥗', dietary: 'GF' },
  { id: '3', name: 'Truffle Parmesan Fries', category: 'Sides', course: 'STARTER', price: 12.00, img: '🍟', dietary: 'Veg' },
  { id: '4', name: 'Artisan Craft Cola', category: 'Beverages', course: 'BEVERAGE', price: 5.00, img: '🥤' },
  { id: '5', name: 'Wagyu Burger Deluxe', category: 'Mains', course: 'MAIN', price: 25.00, img: '🍔', dietary: 'Popular' },
  { id: '6', name: 'NY Baked Cheesecake', category: 'Desserts', course: 'DESSERT', price: 10.00, img: '🍰', dietary: 'Veg' },
  { id: '7', name: 'Margherita Woodfire Pizza', category: 'Mains', course: 'MAIN', price: 18.00, img: '🍕', dietary: 'Veg' },
  { id: '8', name: 'Garlic Tomato Bruschetta', category: 'Starters', course: 'STARTER', price: 9.00, img: '🥖', dietary: 'Vegan' },
  { id: '9', name: 'Grilled Atlantic Salmon', category: 'Mains', course: 'MAIN', price: 34.00, img: '🐟', dietary: 'GF' },
  { id: '10', name: 'Crispy Calamari Rings', category: 'Starters', course: 'STARTER', price: 16.00, img: '🦑', dietary: 'Popular' },
  { id: '11', name: 'Espresso Martini', category: 'Beverages', course: 'BEVERAGE', price: 14.00, img: '🍸' },
  { id: '12', name: 'Lava Chocolate Cake', category: 'Desserts', course: 'DESSERT', price: 12.00, img: '🍫', dietary: 'Veg' },
];

interface TableEntity {
  id: string;
  name: string;
  zone: 'AC Dining' | 'Garden Patio' | 'Rooftop';
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'BILLED' | 'RESERVED';
  currentTotal: number;
  seatedMinutes?: number;
  guestCount?: number;
}

const initialTables: TableEntity[] = [
  { id: 'T1', name: 'Table 1', zone: 'AC Dining', capacity: 2, status: 'AVAILABLE', currentTotal: 0 },
  { id: 'T2', name: 'Table 2', zone: 'AC Dining', capacity: 4, status: 'AVAILABLE', currentTotal: 0 },
  { id: 'T3', name: 'Table 3', zone: 'AC Dining', capacity: 4, status: 'AVAILABLE', currentTotal: 0 },
  { id: 'T4', name: 'Table 4', zone: 'AC Dining', capacity: 6, status: 'AVAILABLE', currentTotal: 0 },
  { id: 'G1', name: 'Patio 1', zone: 'Garden Patio', capacity: 4, status: 'AVAILABLE', currentTotal: 0 },
  { id: 'G2', name: 'Patio 2', zone: 'Garden Patio', capacity: 4, status: 'AVAILABLE', currentTotal: 0 },
  { id: 'G3', name: 'Patio 3', zone: 'Garden Patio', capacity: 8, status: 'AVAILABLE', currentTotal: 0 },
  { id: 'R1', name: 'Roof 1', zone: 'Rooftop', capacity: 2, status: 'AVAILABLE', currentTotal: 0 },
  { id: 'R2', name: 'Roof 2', zone: 'Rooftop', capacity: 4, status: 'AVAILABLE', currentTotal: 0 },
];

export default function RestaurantPOS() {
  const { toast } = useToast();
  const isOffline = useOfflineStatus();
  
  // View mode: Floor Plan vs Order Pad Menu vs Food List
  const [posMode, setPosMode] = useState<'floorplan' | 'menu' | 'foodlist'>('menu');
  const [activeZone, setActiveZone] = useState<'All' | 'AC Dining' | 'Garden Patio' | 'Rooftop'>('All');
  const [tables, setTables] = useState<TableEntity[]>(initialTables);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 220;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const [menuItems, setMenuItems] = useState<MenuItemEntity[]>(defaultMenuItems);

  const categories = useMemo(() => {
    const defaultCats = ['All', 'Starters', 'Mains', 'Sides', 'Beverages', 'Desserts', 'Chef Specials'];
    const customCats = menuItems.map(m => m.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...customCats]));
  }, [menuItems]);

  const getEmojiForDish = (name: string, category: string = ''): string => {
    const n = (name || '').toLowerCase();
    const c = (category || '').toLowerCase();
    if (n.includes('rice') || n.includes('biryani') || n.includes('fried rice') || n.includes('pulao')) return '🍚';
    if (n.includes('burger')) return '🍔';
    if (n.includes('pizza')) return '🍕';
    if (n.includes('salad')) return '🥗';
    if (n.includes('soup')) return '🍲';
    if (n.includes('pasta') || n.includes('noodle') || n.includes('spaghetti')) return '🍝';
    if (n.includes('fish') || n.includes('salmon') || n.includes('seafood') || n.includes('crab') || n.includes('prawn')) return '🐟';
    if (n.includes('chicken') || n.includes('meat') || n.includes('steak') || n.includes('curry') || n.includes('mutton') || n.includes('beef')) return '🍗';
    if (n.includes('fries') || n.includes('potato') || n.includes('chip')) return '🍟';
    if (n.includes('cake') || n.includes('dessert') || n.includes('sweet') || n.includes('ice cream') || n.includes('chocolate')) return '🍰';
    if (n.includes('tea') || n.includes('coffee') || n.includes('espresso') || n.includes('cappuccino')) return '☕';
    if (n.includes('juice') || n.includes('drink') || n.includes('beverage') || n.includes('coke') || n.includes('mojito') || n.includes('water') || n.includes('soda')) return '🥤';
    if (n.includes('bread') || n.includes('roti') || n.includes('naan') || n.includes('toast')) return '🍞';
    if (n.includes('taco') || n.includes('wrap') || n.includes('burrito')) return '🌮';
    if (n.includes('sushi')) return '🍣';
    if (c.includes('beverage')) return '🥤';
    if (c.includes('dessert')) return '🍰';
    if (c.includes('starter') || c.includes('appetizer')) return '🥗';
    return '🍽️';
  };

  const loadAllMenuItems = () => {
    try {
      const allSaved = localStorage.getItem('pos_all_menu_items');
      if (allSaved) {
        const parsed = JSON.parse(allSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Auto-clean any items with raw URL strings so they show clean emojis instead of URL text
          let hasDirty = false;
          const cleaned = parsed.map((item: any) => {
            if (!item.img || item.img.startsWith('http') || item.img.length > 10) {
              hasDirty = true;
              return { ...item, img: getEmojiForDish(item.name, item.category) };
            }
            return item;
          });
          if (hasDirty) {
            localStorage.setItem('pos_all_menu_items', JSON.stringify(cleaned));
          }
          setMenuItems(cleaned);
          return;
        }
      }
      const saved = localStorage.getItem('pos_custom_menu_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMenuItems([...defaultMenuItems, ...parsed]);
          return;
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadAllMenuItems();
    const handleSync = () => loadAllMenuItems();
    window.addEventListener('storage', handleSync);
    window.addEventListener('hotel_menu_changed', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('hotel_menu_changed', handleSync);
    };
  }, []);

  const saveMenuItems = (updated: MenuItemEntity[]) => {
    setMenuItems(updated);
    try {
      localStorage.setItem('pos_all_menu_items', JSON.stringify(updated));
      const customOnly = updated.filter(i => !defaultMenuItems.some(d => d.id === i.id));
      localStorage.setItem('pos_custom_menu_items', JSON.stringify(customOnly));
      window.dispatchEvent(new Event('hotel_menu_changed'));
    } catch (_) {}
  };

  // Food List Filters & Editing State
  const [foodListSearch, setFoodListSearch] = useState('');
  const [foodListCategory, setFoodListCategory] = useState('All');
  const [editingFood, setEditingFood] = useState<MenuItemEntity | null>(null);
  const [foodToDelete, setFoodToDelete] = useState<MenuItemEntity | null>(null);

  const filteredFoodList = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCat = foodListCategory === 'All' || item.category === foodListCategory;
      const matchesSearch = item.name.toLowerCase().includes(foodListSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(foodListSearch.toLowerCase()) ||
        (item.dietary && item.dietary.toLowerCase().includes(foodListSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [menuItems, foodListCategory, foodListSearch]);

  const handleStartEditFood = (food: MenuItemEntity) => {
    setEditingFood({ ...food });
  };

  const handleSaveEditFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood) return;
    if (!editingFood.name.trim()) {
      toast("Please enter food item name", 'error');
      return;
    }
    const numPrice = Number(editingFood.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast("Please enter a valid price greater than Rs. 0", 'error');
      return;
    }

    const updatedDish: MenuItemEntity = {
      ...editingFood,
      name: editingFood.name.trim(),
      price: numPrice,
      img: editingFood.img || '🍽️'
    };

    const updated = menuItems.map(item => item.id === editingFood.id ? updatedDish : item);
    saveMenuItems(updated);
    toast(`Dish "${updatedDish.name}" updated successfully!`, 'success');
    setEditingFood(null);
  };

  const handleConfirmDeleteFood = () => {
    if (!foodToDelete) return;
    const deletedName = foodToDelete.name;
    const updated = menuItems.filter(item => item.id !== foodToDelete.id);
    saveMenuItems(updated);
    toast(`Dish "${deletedName}" has been removed.`, 'info');
    setFoodToDelete(null);
  };

  const handleRestoreDefaultMenu = () => {
    saveMenuItems(defaultMenuItems);
    toast("Restored default restaurant menu dishes!", 'success');
  };

  // 1. Add New Food Item to Catalog Modal State
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    category: 'Mains',
    course: 'MAIN' as 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE',
    price: '',
    img: '🍽️',
    dietary: 'None',
    station: 'Grill'
  });

  // 2. Add Special Custom Open Dish to Active Order State
  const [isOpenFoodModalOpen, setIsOpenFoodModalOpen] = useState(false);
  const [openFood, setOpenFood] = useState({
    name: '',
    price: '',
    course: 'MAIN' as 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE',
    notes: ''
  });

  // 3. Item Modifiers / Customizer State
  const [customizerItem, setCustomizerItem] = useState<MenuItemEntity | null>(null);
  const [customizerSize, setCustomizerSize] = useState<'Regular' | 'Large' | 'Small'>('Regular');
  const [customizerAddons, setCustomizerAddons] = useState<string[]>([]);
  const [customizerDoneness, setCustomizerDoneness] = useState('Medium');
  const [customizerSpice, setCustomizerSpice] = useState('Medium');
  const [customizerNotes, setCustomizerNotes] = useState('');

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [orderType, setOrderType] = useState<'Table' | 'Room' | 'Takeaway'>('Table');
  const [tableOrRoom, setTableOrRoom] = useState('Table 1');
  const [customerName, setCustomerName] = useState('');
  
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Held Bills (Parked Orders) State
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [isHoldBillModalOpen, setIsHoldBillModalOpen] = useState(false);
  const [holdBillNote, setHoldBillNote] = useState('');
  const [showHeldBillsModal, setShowHeldBillsModal] = useState(false);
  const [previewHeldBill, setPreviewHeldBill] = useState<HeldBill | null>(null);
  const [showNewBillModal, setShowNewBillModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pos_held_bills');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHeldBills(parsed);
        }
      }
    } catch (_) {}
  }, []);

  const saveHeldBills = (newHeldBills: HeldBill[]) => {
    setHeldBills(newHeldBills);
    try {
      localStorage.setItem('pos_held_bills', JSON.stringify(newHeldBills));
      window.dispatchEvent(new Event('pos_held_bills_changed'));
    } catch (_) {}
  };
  
  // Modals
  const [modalMessage, setModalMessage] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [showRoomChargeModal, setShowRoomChargeModal] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('101');
  
  // Item Discount Modal
  const [itemDiscountModal, setItemDiscountModal] = useState<{ isOpen: boolean, itemIndex: number, type: 'percent' | 'fixed' | 'none', value: number | '' }>({ isOpen: false, itemIndex: -1, type: 'percent', value: '' });
  
  // Order Discount Modal
  const [orderDiscountModal, setOrderDiscountModal] = useState<{ isOpen: boolean, type: 'percent' | 'fixed' | 'none', value: number | '' }>({ isOpen: false, type: 'percent', value: '' });
  const [orderDiscount, setOrderDiscount] = useState<{ type: 'percent' | 'fixed' | 'none', value: number }>({ type: 'none', value: 0 });

  // Qty Modal
  const [qtyModal, setQtyModal] = useState<{ isOpen: boolean, itemIndex: number, value: string | number }>({ isOpen: false, itemIndex: -1, value: '' });

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, menuItems]);

  const handleAddCustomFoodToCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name.trim()) {
      toast("Please enter food item name", 'error');
      return;
    }
    const numPrice = parseFloat(newFood.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast("Please enter a valid price greater than Rs. 0", 'error');
      return;
    }

    const newItem: MenuItemEntity = {
      id: `food-${Date.now()}`,
      name: newFood.name.trim(),
      category: newFood.category,
      course: newFood.course,
      price: numPrice,
      img: newFood.img || '🍽️',
      dietary: newFood.dietary !== 'None' ? newFood.dietary : undefined,
      station: newFood.station
    };

    const updated = [...menuItems, newItem];
    saveMenuItems(updated);

    toast(`"${newItem.name}" added to POS Menu Catalog!`, 'success');
    setIsAddFoodModalOpen(false);
    setNewFood({ name: '', category: 'Mains', course: 'MAIN', price: '', img: '🍽️', dietary: 'None', station: 'Grill' });
  };

  const handleAddOpenFoodToBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openFood.name.trim()) {
      toast("Please enter special dish description", 'error');
      return;
    }
    const numPrice = parseFloat(openFood.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast("Please enter a valid price greater than Rs. 0", 'error');
      return;
    }

    const customOrderItem = {
      id: `open-${Date.now()}`,
      name: openFood.name.trim(),
      category: 'Chef Specials',
      price: numPrice,
      qty: 1,
      discountType: 'none',
      discountValue: 0,
      course: openFood.course,
      notes: openFood.notes.trim() || undefined,
      isCustom: true
    };

    setOrderItems(prev => [...prev, customOrderItem]);
    toast(`Special order "${customOrderItem.name}" (Rs. ${numPrice.toFixed(2)}) added to ticket!`, 'success');
    setIsOpenFoodModalOpen(false);
    setOpenFood({ name: '', price: '', course: 'MAIN', notes: '' });
  };

  const handleOpenCustomizer = (item: MenuItemEntity) => {
    setCustomizerItem(item);
    setCustomizerSize('Regular');
    setCustomizerAddons([]);
    setCustomizerDoneness('Medium');
    setCustomizerSpice('Medium');
    setCustomizerNotes('');
  };

  const handleApplyCustomizer = () => {
    if (!customizerItem) return;

    let sizeDelta = 0;
    if (customizerSize === 'Large') sizeDelta = 5.0;
    if (customizerSize === 'Small') sizeDelta = -3.0;

    const addonsCost = customizerAddons.length * 2.5;
    const finalPrice = Math.max(1, customizerItem.price + sizeDelta + addonsCost);

    const customizedItem = {
      id: `${customizerItem.id}-custom-${Date.now()}`,
      name: customizerItem.name,
      category: customizerItem.category,
      price: finalPrice,
      qty: 1,
      discountType: 'none',
      discountValue: 0,
      portion: customizerSize !== 'Regular' ? customizerSize : undefined,
      modifiers: customizerAddons.length > 0 ? customizerAddons : undefined,
      doneness: (customizerItem.course === 'MAIN' && customizerItem.category === 'Mains') ? customizerDoneness : undefined,
      spiceLevel: customizerSpice !== 'Medium' ? customizerSpice : undefined,
      notes: customizerNotes.trim() || undefined
    };

    setOrderItems(prev => [...prev, customizedItem]);
    toast(`Customized ${customizerItem.name} added (Rs. ${finalPrice.toFixed(2)})`, 'success');
    setCustomizerItem(null);
  };

  const handleAddItem = (item: any) => {
    const existingIndex = orderItems.findIndex(o => o.id === item.id);
    if (existingIndex >= 0) {
      const newItems = [...orderItems];
      newItems[existingIndex].qty += 1;
      setOrderItems(newItems);
    } else {
      setOrderItems([...orderItems, { ...item, qty: 1, discountType: 'none', discountValue: 0 }]);
    }
  };

  const updateItemQty = (index: number, newQty: number) => {
    const newItems = [...orderItems];
    if (newQty <= 0) {
      newItems.splice(index, 1);
    } else {
      newItems[index].qty = newQty;
    }
    setOrderItems(newItems);
  };

  const applyItemDiscount = () => {
    const { itemIndex, type, value } = itemDiscountModal;
    if (itemIndex >= 0 && value !== '') {
      const newItems = [...orderItems];
      newItems[itemIndex].discountType = type;
      newItems[itemIndex].discountValue = Number(value);
      setOrderItems(newItems);
    }
    setItemDiscountModal({ isOpen: false, itemIndex: -1, type: 'percent', value: '' });
  };

  const applyOrderDiscount = () => {
    const { type, value } = orderDiscountModal;
    if (value !== '') {
      setOrderDiscount({ type, value: Number(value) });
    }
    setOrderDiscountModal({ isOpen: false, type: 'percent', value: '' });
  };

  const applyQty = () => {
    const { itemIndex, value } = qtyModal;
    const numValue = Number(value);
    if (itemIndex >= 0 && !isNaN(numValue) && numValue > 0) {
      updateItemQty(itemIndex, numValue);
    } else if (numValue === 0) {
      const newItems = [...orderItems];
      newItems.splice(itemIndex, 1);
      setOrderItems(newItems);
    }
    setQtyModal({ isOpen: false, itemIndex: -1, value: '' });
  };

  const handleFireKOT = () => {
    if (orderItems.length === 0) {
      toast("Order is empty! Please add menu items first.", 'error');
      return;
    }
    
    const newKot = {
      id: `KOT-${Math.floor(Math.random() * 9000) + 1000}`,
      table: tableOrRoom || 'Counter',
      type: orderType,
      server: 'Admin',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'NEW',
      items: orderItems.map(item => ({ name: item.name, qty: item.qty, notes: '' }))
    };

    const existingKots = JSON.parse(localStorage.getItem('kds_kots') || '[]');
    localStorage.setItem('kds_kots', JSON.stringify([newKot, ...existingKots]));
    window.dispatchEvent(new Event('kots_updated'));

    toast(`KOT ${newKot.id} fired to kitchen display!`, 'success');
  };

  // Calculations
  const calculateItemTotal = (item: any) => {
    const base = item.price * item.qty;
    if (item.discountType === 'percent') return base - (base * (item.discountValue / 100));
    if (item.discountType === 'fixed') return Math.max(0, base - item.discountValue);
    return base;
  };

  const subtotal = orderItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  
  let totalOrderDiscount = 0;
  if (orderDiscount.type === 'percent') {
    totalOrderDiscount = subtotal * (orderDiscount.value / 100);
  } else if (orderDiscount.type === 'fixed') {
    totalOrderDiscount = orderDiscount.value;
  }

  const postDiscountTotal = Math.max(0, subtotal - totalOrderDiscount);
  const tax = postDiscountTotal * 0.10; // 10% tax
  const grandTotal = postDiscountTotal + tax;

  const mockInvoice = {
    invoiceNumber: 'ORD-2091',
    createdAt: new Date().toISOString(),
    paymentMethod: 'PENDING',
    tableOrRoom: tableOrRoom,
    items: orderItems.map(item => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      total: calculateItemTotal(item),
    })),
    subtotal: subtotal,
    discount: totalOrderDiscount,
    tax: tax,
    grandTotal: grandTotal,
  };

  const handleSelectTable = (tbl: TableEntity) => {
    const matchingHeldBill = heldBills.find(b => b.tableOrRoom.toLowerCase() === tbl.name.toLowerCase());
    if (matchingHeldBill) {
      handleResumeHeldBill(matchingHeldBill);
      return;
    }
    setTableOrRoom(tbl.name);
    setOrderType('Table');
    setPosMode('menu');
    toast(`${tbl.name} selected. Order pad opened.`, 'info');
  };

  const handleTransferToRoom = () => {
    setShowRoomChargeModal(false);
    toast(`Rs. ${grandTotal.toFixed(2)} charged to Room ${selectedRoomNumber} Folio!`, 'success');
    setOrderItems([]);
  };

  // Held Bill & New Bill Handlers
  const handleHoldBill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (orderItems.length === 0) {
      toast("Cannot hold an empty bill! Please add food items first.", 'error');
      return;
    }

    const holdId = `HOLD-${Math.floor(1000 + Math.random() * 9000)}`;
    const billNum = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newHeldBill: HeldBill = {
      id: holdId,
      billNumber: billNum,
      orderType,
      tableOrRoom: tableOrRoom || 'Counter',
      customerName: customerName.trim() || undefined,
      items: [...orderItems],
      subtotal,
      tax,
      discount: totalOrderDiscount,
      orderDiscount: { ...orderDiscount },
      grandTotal,
      note: holdBillNote.trim() || `${orderType}: ${tableOrRoom}${customerName ? ` (${customerName})` : ''}`,
      heldAt: new Date().toISOString(),
      server: 'Admin Staff'
    };

    const updated = [newHeldBill, ...heldBills];
    saveHeldBills(updated);

    // Reset active order to start fresh
    setOrderItems([]);
    setOrderDiscount({ type: 'none', value: 0 });
    setCustomerName('');
    setIsHoldBillModalOpen(false);
    setHoldBillNote('');

    toast(`Bill #${holdId} for ${newHeldBill.tableOrRoom} (Rs. ${grandTotal.toFixed(2)}) placed on hold!`, 'success');
  };

  const handleResumeHeldBill = (bill: HeldBill) => {
    // If active order has items, auto-park it so zero data is lost!
    if (orderItems.length > 0) {
      const autoHoldId = `HOLD-${Math.floor(1000 + Math.random() * 9000)}`;
      const autoHeldBill: HeldBill = {
        id: autoHoldId,
        billNumber: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
        orderType,
        tableOrRoom: tableOrRoom || 'Counter',
        customerName: customerName.trim() || undefined,
        items: [...orderItems],
        subtotal,
        tax,
        discount: totalOrderDiscount,
        orderDiscount: { ...orderDiscount },
        grandTotal,
        note: `Swapped for ${bill.id}`,
        heldAt: new Date().toISOString(),
        server: 'Admin Staff'
      };
      const updatedList = [autoHeldBill, ...heldBills.filter(b => b.id !== bill.id)];
      saveHeldBills(updatedList);
      toast(`Current active bill parked as #${autoHoldId}.`, 'info');
    } else {
      saveHeldBills(heldBills.filter(b => b.id !== bill.id));
    }

    // Load held bill into active pad
    setOrderItems(bill.items);
    setOrderType(bill.orderType);
    setTableOrRoom(bill.tableOrRoom);
    setCustomerName(bill.customerName || '');
    if (bill.orderDiscount) {
      setOrderDiscount(bill.orderDiscount);
    }
    setShowHeldBillsModal(false);
    setPosMode('menu'); // switch to order pad
    toast(`Resumed Bill #${bill.id} (${bill.tableOrRoom} - Rs. ${bill.grandTotal.toFixed(2)})!`, 'success');
  };

  const handleDeleteHeldBill = (billId: string) => {
    const updated = heldBills.filter(b => b.id !== billId);
    saveHeldBills(updated);
    toast(`Held bill #${billId} has been removed.`, 'info');
  };

  const handleStartNewBill = () => {
    if (orderItems.length === 0) {
      setCustomerName('');
      toast("Fresh bill ready! Select dishes from the menu catalog.", 'info');
      return;
    }
    setShowNewBillModal(true);
  };

  const handleConfirmDiscardNewBill = () => {
    setOrderItems([]);
    setOrderDiscount({ type: 'none', value: 0 });
    setCustomerName('');
    setShowNewBillModal(false);
    toast("Started a fresh empty bill.", 'info');
  };

  const handleHoldAndStartNewBill = () => {
    handleHoldBill();
    setShowNewBillModal(false);
  };

  const heldBillInvoice = previewHeldBill ? {
    invoiceNumber: previewHeldBill.billNumber || previewHeldBill.id,
    createdAt: previewHeldBill.heldAt,
    paymentMethod: 'HELD BILL (ESTIMATION)',
    tableOrRoom: previewHeldBill.tableOrRoom,
    items: previewHeldBill.items.map((item: any) => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      total: calculateItemTotal(item),
    })),
    subtotal: previewHeldBill.subtotal,
    discount: previewHeldBill.discount,
    tax: previewHeldBill.tax,
    grandTotal: previewHeldBill.grandTotal,
  } : null;

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Top POS Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Restaurant POS</h1>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setPosMode('menu')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                posMode === 'menu' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Order Pad</span>
            </button>
            <button
              onClick={() => setPosMode('floorplan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                posMode === 'floorplan' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Table Floor Plan</span>
            </button>
            <button
              onClick={() => setPosMode('foodlist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                posMode === 'foodlist' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5 text-blue-600" />
              <span>Food List</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-bold">
                {menuItems.length}
              </span>
            </button>
            <button
              onClick={() => setShowHeldBillsModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                heldBills.length > 0 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-2xs hover:bg-amber-200' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="View and resume parked/held bills"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Held Bills</span>
              {heldBills.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600 text-white font-bold animate-pulse">
                  {heldBills.length}
                </span>
              )}
            </button>
            <Link
              href="/pos/waiter"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all"
              title="Switch to Mobile Handheld POS view with Course Firing"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Waiter Handheld Mode</span>
            </Link>
          </div>
        </div>

        {/* Selected Destination Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-400">Order For:</span>
            <span className="font-bold text-slate-800">
              {orderType} - {tableOrRoom}{customerName ? ` (${customerName})` : ''}
            </span>
          </div>

          {orderItems.length > 0 && (
            <button
              onClick={() => setShowRoomChargeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors"
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Charge to Hotel Room</span>
            </button>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* MODE 3: FOOD LIST VIEW (Edit & Delete Management) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {posMode === 'foodlist' ? (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 space-y-5">
          {/* Top Bar: Title, Search, Category Filter, and Add Dish Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Food List & Menu Catalog</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                  {filteredFoodList.length} of {menuItems.length} dishes
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                View all restaurant dishes, update details (price, course, station, tags), or delete dishes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddFoodModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Food</span>
              </button>
              <button
                type="button"
                onClick={handleRestoreDefaultMenu}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                title="Reset to default factory menu items"
              >
                Reset Default Menu
              </button>
            </div>
          </div>

          {/* Search & Category Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search food by name, category, or dietary tag..."
                value={foodListSearch}
                onChange={(e) => setFoodListSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 focus:bg-white transition-all"
              />
              {foodListSearch && (
                <button
                  type="button"
                  onClick={() => setFoodListSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFoodListCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    foodListCategory === c
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Food List Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-700">
                  <th className="p-3.5 font-bold">Food Item</th>
                  <th className="p-3.5 font-bold">Category</th>
                  <th className="p-3.5 font-bold">Course</th>
                  <th className="p-3.5 font-bold">Kitchen Station</th>
                  <th className="p-3.5 font-bold">Price</th>
                  <th className="p-3.5 font-bold text-center">Quick Action</th>
                  <th className="p-3.5 font-bold text-right">Manage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFoodList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      No food items found matching &quot;{foodListSearch}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredFoodList.map((food) => (
                    <tr key={food.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                            {food.img && !food.img.startsWith('http') ? food.img : getEmojiForDish(food.name, food.category)}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{food.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {food.dietary && (
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                  {food.dietary}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">ID: {food.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium">
                          {food.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          food.course === 'STARTER' ? 'bg-amber-50 text-amber-700 border border-amber-200/80' :
                          food.course === 'MAIN' ? 'bg-blue-50 text-blue-700 border border-blue-200/80' :
                          food.course === 'DESSERT' ? 'bg-pink-50 text-pink-700 border border-pink-200/80' :
                          'bg-purple-50 text-purple-700 border border-purple-200/80'
                        }`}>
                          {food.course}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        <div className="flex items-center gap-1 text-slate-700">
                          <ChefHat className="w-3.5 h-3.5 text-slate-400" />
                          <span>{food.station || 'Kitchen Grill'}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 text-sm">
                          Rs. {food.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            handleAddItem(food);
                            toast(`Added "${food.name}" to Active Order Ticket!`, 'success');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add to Bill</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditFood(food)}
                            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 rounded-lg font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                            title={`Edit ${food.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFoodToDelete(food)}
                            className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                            title={`Delete ${food.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : posMode === 'floorplan' ? (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 overflow-y-auto space-y-6">
          {/* Zone Selector & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              {(['All', 'AC Dining', 'Garden Patio', 'Rooftop'] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setActiveZone(z)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeZone === z
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-600 font-medium">Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-slate-600 font-medium">Billed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-slate-600 font-medium">Reserved</span>
              </div>
            </div>
          </div>

          {/* Tables Interactive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {tables
              .filter(t => activeZone === 'All' || t.zone === activeZone)
              .map((tbl) => {
                const tblHeld = heldBills.find(b => b.tableOrRoom.toLowerCase() === tbl.name.toLowerCase());
                return (
                  <div
                    key={tbl.id}
                    onClick={() => handleSelectTable(tbl)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md relative overflow-hidden ${
                      tblHeld
                        ? 'bg-amber-50/70 border-amber-400 hover:border-amber-600 ring-2 ring-amber-300/40'
                        : tbl.status === 'AVAILABLE'
                        ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-500'
                        : tbl.status === 'OCCUPIED'
                        ? 'bg-rose-50/40 border-rose-300 hover:border-rose-500'
                        : tbl.status === 'BILLED'
                        ? 'bg-amber-50/40 border-amber-300 hover:border-amber-500'
                        : 'bg-blue-50/40 border-blue-300 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-800">{tbl.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tblHeld ? 'bg-amber-200 text-amber-900 border border-amber-300 font-extrabold' :
                        tbl.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                        tbl.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800' :
                        tbl.status === 'BILLED' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tblHeld ? 'HELD BILL' : tbl.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">{tbl.zone} · {tbl.capacity} Seats</p>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      {tblHeld ? (
                        <>
                          <div className="flex items-center gap-1 text-amber-700 font-bold">
                            <PauseCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>Resume Held →</span>
                          </div>
                          <span className="font-extrabold text-amber-900 text-sm">Rs. {tblHeld.grandTotal.toFixed(2)}</span>
                        </>
                      ) : tbl.status === 'OCCUPIED' || tbl.status === 'BILLED' ? (
                        <>
                          <div className="flex items-center gap-1 text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{tbl.seatedMinutes}m</span>
                          </div>
                          <span className="font-bold text-slate-900 text-sm">Rs. {tbl.currentTotal.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-emerald-600 font-medium text-xs">Click to Seat & Order →</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────── */
        /* MODE 2: ORDER PAD & MENU VIEW */
        /* ──────────────────────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {/* Menu Items Left 2 Columns */}
          <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden min-h-[540px] lg:h-[calc(100vh-14rem)] lg:min-h-[580px]">
            {/* Search & Category Pills */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              {/* Row 1: Search and Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search food item, beverage, dessert..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>

                {/* Quick Add Food & Special Order Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsOpenFoodModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                    title="Add off-menu special order directly to current bill"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Special Custom Dish</span>
                  </button>
                  <button
                    onClick={() => setIsAddFoodModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
                    title="Add a brand new dish to the POS menu catalog"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>+ Add Food to Menu</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Full Width Category Carousel with Smooth Scroll Buttons */}
              <div className="flex items-center gap-1.5 w-full pt-1">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 shrink-0 transition-all shadow-2xs border border-slate-200 active:scale-90"
                  title="Scroll categories left"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={categoryScrollRef}
                  onWheel={(e) => {
                    if (categoryScrollRef.current) {
                      categoryScrollRef.current.scrollLeft += e.deltaY;
                    }
                  }}
                  className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1 px-0.5 flex-1 no-scrollbar select-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                        activeCategory === c
                          ? 'bg-blue-600 text-white shadow-2xs font-bold scale-102'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 shrink-0 transition-all shadow-2xs border border-slate-200 active:scale-90"
                  title="Scroll categories right"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Menu Cards Grid - Fixed Height Cards with auto-rows-max and content-start */}
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 auto-rows-max content-start">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  className="p-3 bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group select-none shadow-2xs hover:shadow-xs active:scale-98 min-h-[125px]"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      {/* Emoji Icon Container - Centered and protected against font clipping */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100/70 flex items-center justify-center text-2xl transition-colors mb-2 shrink-0">
                        {item.img && !item.img.startsWith('http') ? item.img : getEmojiForDish(item.name, item.category)}
                      </div>
                      {item.dietary && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.dietary}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs group-hover:text-blue-900 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Rs. {item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCustomizer(item);
                        }}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-700 transition"
                        title="Customize portion, add-ons & cooking preferences"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white border border-slate-200 group-hover:border-blue-600 text-slate-600 flex items-center justify-center font-bold text-xs transition-colors">
                        +
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Ticket Summary */}
          <div className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden min-h-[540px] lg:h-[calc(100vh-14rem)] lg:min-h-[580px]">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-slate-800 text-sm">Active Order Ticket</h2>
                    {orderItems.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px]">
                        {orderItems.reduce((acc, i) => acc + i.qty, 0)} items
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {heldBills.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowHeldBillsModal(true)}
                      className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] flex items-center gap-1 transition shadow-2xs cursor-pointer active:scale-95"
                      title={`${heldBills.length} bills currently on hold`}
                    >
                      <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{heldBills.length} Held</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleStartNewBill}
                    className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer active:scale-95"
                    title="Start a fresh new bill"
                  >
                    <FilePlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ New Bill</span>
                  </button>
                  {orderItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSplitBill(true)}
                      className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                      title="Split bill between guests"
                    >
                      <Split className="w-3.5 h-3.5" />
                      <span>Split</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Order Destination & Customer Tag */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 text-[11px] font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => setOrderType('Table')}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${orderType === 'Table' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('Takeaway')}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${orderType === 'Takeaway' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Takeaway
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('Room')}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${orderType === 'Room' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Room
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={orderType === 'Table' ? 'Table name/number...' : orderType === 'Room' ? 'Room number...' : 'Customer/Token #...'}
                  value={tableOrRoom}
                  onChange={(e) => setTableOrRoom(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none min-w-0"
                />

                <input
                  type="text"
                  placeholder="Guest name (optional)..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-28 sm:w-32 px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:ring-1 focus:ring-blue-500 outline-none truncate"
                  title="Guest or customer name"
                />
              </div>
            </div>

            {/* Order Items List */}
            <div className="flex-1 min-h-[180px] p-4 overflow-y-auto divide-y divide-slate-100">
              {orderItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                  <Utensils className="w-8 h-8 opacity-40" />
                  <p>No items added yet. Click menu items to build ticket.</p>
                </div>
              ) : (
                orderItems.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                        {item.isCustom && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-800 rounded border border-amber-300">
                            SPECIAL
                          </span>
                        )}
                        {item.portion && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                            {item.portion}
                          </span>
                        )}
                      </div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-[10px] text-blue-600 font-medium">
                          + {item.modifiers.join(', ')}
                        </p>
                      )}
                      {item.doneness && (
                        <p className="text-[10px] text-purple-600 font-medium">
                          Prep: {item.doneness}
                        </p>
                      )}
                      {item.spiceLevel && (
                        <p className="text-[10px] text-rose-600 font-medium">
                          Spice: {item.spiceLevel}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[10px] text-slate-500 italic">
                          Note: {item.notes}
                        </p>
                      )}
                      <span className="text-[11px] text-slate-400">Rs. {item.price.toFixed(2)} each</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <button
                        onClick={() => updateItemQty(idx, item.qty - 1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-xs">{item.qty}</span>
                      <button
                        onClick={() => updateItemQty(idx, item.qty + 1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right w-16 mt-0.5">
                      <span className="font-bold text-slate-800 text-xs">
                        Rs. {calculateItemTotal(item).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals & Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2 text-xs shrink-0 mt-auto">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (10%):</span>
                <span className="font-semibold text-slate-800">Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due:</span>
                <span className="text-blue-600 text-base">Rs. {grandTotal.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (orderItems.length === 0) return toast("Order is empty! Please add menu items to hold bill.", 'error');
                    setHoldBillNote(`${orderType}: ${tableOrRoom}${customerName ? ` (${customerName})` : ''}`);
                    setIsHoldBillModalOpen(true);
                  }}
                  className="py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title="Park this bill and serve another customer"
                >
                  <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hold Bill</span>
                </button>
                <button
                  type="button"
                  onClick={handleFireKOT}
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  Fire KOT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (orderItems.length === 0) return toast("Order is empty!", 'error');
                    setShowReceipt(true);
                  }}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  Settle Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Split Bill Modal */}
      <Modal isOpen={showSplitBill} onClose={() => setShowSplitBill(false)} title="Split Restaurant Bill">
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">Divide order grand total (Rs. {grandTotal.toFixed(2)}) equally across guests.</p>
          <div className="flex items-center gap-3">
            <span className="font-semibold">Number of Ways:</span>
            <div className="flex gap-2">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setSplitCount(num)}
                  className={`px-3 py-1.5 rounded-lg font-bold ${splitCount === num ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {num} Ways
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <p className="text-slate-500">Each Guest Pays:</p>
            <p className="text-2xl font-bold text-blue-600">Rs. {(grandTotal / splitCount).toFixed(2)}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowSplitBill(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Close</button>
            <button onClick={() => { setShowSplitBill(false); toast(`Bill split ${splitCount}-ways! Ready for multi-card settlement.`, 'success'); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Confirm Split</button>
          </div>
        </div>
      </Modal>

      {/* Charge to Room Folio Modal */}
      <Modal isOpen={showRoomChargeModal} onClose={() => setShowRoomChargeModal(false)} title="Charge to In-House Guest Room">
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">Post this restaurant charge directly to the guest&apos;s hotel folio.</p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Active Room</label>
            <select
              value={selectedRoomNumber}
              onChange={(e) => setSelectedRoomNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="101">Room 101 (Deluxe King)</option>
              <option value="102">Room 102 (Standard Queen)</option>
              <option value="201">Room 201 (Executive Suite)</option>
              <option value="401">Room 401 (Presidential Penthouse)</option>
            </select>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex justify-between font-bold">
            <span>Charge Amount:</span>
            <span>Rs. {grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowRoomChargeModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Cancel</button>
            <button onClick={handleTransferToRoom} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Confirm Room Charge</button>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            setOrderItems([]);
            toast('Payment processed and receipt issued!', 'success');
          }}
          invoice={mockInvoice}
        />
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. ADD NEW FOOD ITEM TO CATALOG MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <Modal isOpen={isAddFoodModalOpen} onClose={() => setIsAddFoodModalOpen(false)} title="Add New Dish to POS Menu Catalog">
        <form onSubmit={handleAddCustomFoodToCatalog} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Create a new culinary dish. It will be immediately available on the POS touch grid and Waiter Handheld station.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dish Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Crispy Duck Confit"
                value={newFood.name}
                onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selling Price (Rs.) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.50"
                placeholder="28.50"
                value={newFood.price}
                onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Menu Category</label>
              <select
                value={newFood.category}
                onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Starters">Starters</option>
                <option value="Mains">Mains</option>
                <option value="Sides">Sides</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Chef Specials">Chef Specials</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dining Course</label>
              <select
                value={newFood.course}
                onChange={(e) => setNewFood({ ...newFood, course: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="STARTER">Starter (Course 1)</option>
                <option value="MAIN">Main (Course 2)</option>
                <option value="DESSERT">Dessert (Course 3)</option>
                <option value="BEVERAGE">Beverage</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dietary Tag</label>
              <select
                value={newFood.dietary}
                onChange={(e) => setNewFood({ ...newFood, dietary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="None">Standard</option>
                <option value="Veg 🌱">Vegetarian 🌱</option>
                <option value="Vegan 🌿">Vegan 🌿</option>
                <option value="GF 🌾">Gluten-Free 🌾</option>
                <option value="Chef Special ⭐">Chef Special ⭐</option>
                <option value="Spicy 🌶️">Spicy 🌶️</option>
              </select>
            </div>
          </div>

          {/* Emoji Visual Picker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Food Icon</label>
            <div className="flex gap-1.5 flex-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {['🥩', '🍔', '🍕', '🥗', '🍟', '🍣', '🍝', '🍰', '🍨', '🥤', '☕', '🍷', '🍤', '🍲', '🌮', '🍜', '🥖', '🥪'].map(em => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setNewFood({ ...newFood, img: em })}
                  className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition ${
                    newFood.img === em ? 'bg-white shadow-sm ring-2 ring-emerald-500 scale-110' : 'hover:bg-slate-200'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddFoodModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/20"
            >
              Add to Menu Catalog
            </button>
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. SPECIAL CUSTOM OFF-MENU DISH MODAL (FAST ON-THE-FLY BILLING) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <Modal isOpen={isOpenFoodModalOpen} onClose={() => setIsOpenFoodModalOpen(false)} title="⚡ Special Custom Dish / Off-Menu Request">
        <form onSubmit={handleAddOpenFoodToBill} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Quickly add an off-menu chef special or custom request directly to this order ticket without changing catalog.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Special Dish Description *</label>
            <input
              required
              type="text"
              placeholder="e.g. Catch of the Day (Wild Snapper Fillet)"
              value={openFood.name}
              onChange={(e) => setOpenFood({ ...openFood, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Custom Price (Rs.) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.50"
                placeholder="35.00"
                value={openFood.price}
                onChange={(e) => setOpenFood({ ...openFood, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dining Course</label>
              <select
                value={openFood.course}
                onChange={(e) => setOpenFood({ ...openFood, course: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="STARTER">Starter (Course 1)</option>
                <option value="MAIN">Main (Course 2)</option>
                <option value="DESSERT">Dessert (Course 3)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kitchen Prep Instructions</label>
            <input
              type="text"
              placeholder="e.g. Pan-seared with olive oil, no garlic, lemon on side"
              value={openFood.notes}
              onChange={(e) => setOpenFood({ ...openFood, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpenFoodModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition shadow-md shadow-amber-600/20"
            >
              Add to Active Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. ITEM MODIFIER & CUSTOMIZER MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {customizerItem && (
        <Modal isOpen={!!customizerItem} onClose={() => setCustomizerItem(null)} title={`Customize: ${customizerItem.name}`}>
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-3xl">{customizerItem.img && !customizerItem.img.startsWith('http') ? customizerItem.img : getEmojiForDish(customizerItem.name, customizerItem.category)}</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{customizerItem.name}</h4>
                <p className="text-slate-500">Base Price: Rs. {customizerItem.price.toFixed(2)} • {customizerItem.category}</p>
              </div>
            </div>

            {/* Portion / Size Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Portion / Serving Size</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Small', 'Regular', 'Large'] as const).map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setCustomizerSize(sz)}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition ${
                      customizerSize === sz 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>{sz}</div>
                    <div className="text-[10px] font-normal opacity-80">
                      {sz === 'Small' ? '-Rs. 3.00' : sz === 'Large' ? '+Rs. 5.00' : 'Included'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gourmet Add-ons */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Gourmet Add-ons & Modifiers</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Extra Melted Cheese (+Rs. 2.50)',
                  'Crispy Smoked Bacon (+Rs. 3.00)',
                  'Garlic Mushrooms (+Rs. 3.50)',
                  'Fresh Hass Avocado (+Rs. 2.50)',
                  'Grilled Jumbo Prawns (+Rs. 6.00)',
                  'Truffle Mayo Dip (+Rs. 2.00)'
                ].map(addon => {
                  const isChecked = customizerAddons.includes(addon);
                  return (
                    <button
                      key={addon}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setCustomizerAddons(customizerAddons.filter(a => a !== addon));
                        } else {
                          setCustomizerAddons([...customizerAddons, addon]);
                        }
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{addon}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Doneness Preference for Mains */}
            {customizerItem.category === 'Mains' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cooking Doneness</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Rare', 'Medium-Rare', 'Medium', 'Well-Done'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCustomizerDoneness(d)}
                      className={`py-1.5 rounded-lg border text-center font-semibold text-[11px] transition ${
                        customizerDoneness === d
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Special Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Special Kitchen Notes</label>
              <input
                type="text"
                placeholder="e.g. Dressing on side, extra crispy, allergy note..."
                value={customizerNotes}
                onChange={(e) => setCustomizerNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCustomizerItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomizer}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-md shadow-blue-600/20"
              >
                Add Customized Dish to Bill
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* EDIT FOOD DETAILS MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {editingFood && (
        <Modal
          isOpen={!!editingFood}
          onClose={() => setEditingFood(null)}
          title={`Edit Food Details - ${editingFood.name}`}
        >
          <form onSubmit={handleSaveEditFood} className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-3xl p-2 bg-white rounded-xl shadow-2xs border border-slate-100 flex items-center justify-center">
                {editingFood.img && !editingFood.img.startsWith('http') ? editingFood.img : getEmojiForDish(editingFood.name, editingFood.category)}
              </span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{editingFood.name}</p>
                <p className="text-[11px] text-slate-500">ID: {editingFood.id} • Current Price: Rs. {Number(editingFood.price).toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food / Dish Name *</label>
                <input
                  type="text"
                  required
                  value={editingFood.name}
                  onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base Price (Rs.) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={editingFood.price}
                  onChange={(e) => setEditingFood({ ...editingFood, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={editingFood.category}
                  onChange={(e) => setEditingFood({ ...editingFood, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                >
                  <option value="Starters">Starters</option>
                  <option value="Mains">Mains</option>
                  <option value="Sides">Sides</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Chef Specials">Chef Specials</option>
                  {categories.filter(c => !['All', 'Starters', 'Mains', 'Sides', 'Beverages', 'Desserts', 'Chef Specials'].includes(c)).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meal Course</label>
                <select
                  value={editingFood.course}
                  onChange={(e) => setEditingFood({ ...editingFood, course: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                >
                  <option value="STARTER">Starter</option>
                  <option value="MAIN">Main Course</option>
                  <option value="DESSERT">Dessert</option>
                  <option value="BEVERAGE">Beverage</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dietary Tag</label>
                <select
                  value={editingFood.dietary || 'None'}
                  onChange={(e) => setEditingFood({ ...editingFood, dietary: e.target.value === 'None' ? undefined : e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                >
                  <option value="None">None</option>
                  <option value="Veg">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="GF">Gluten-Free (GF)</option>
                  <option value="Halal">Halal</option>
                  <option value="Chef Special">Chef Special</option>
                  <option value="Popular">Popular</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kitchen Station</label>
                <select
                  value={editingFood.station || 'Grill'}
                  onChange={(e) => setEditingFood({ ...editingFood, station: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                >
                  <option value="Grill">Grill Station</option>
                  <option value="Fryer">Fryer Station</option>
                  <option value="Sauté">Sauté Station</option>
                  <option value="Salad">Salad / Pantry</option>
                  <option value="Bar">Beverage Bar</option>
                  <option value="Bakery">Bakery & Pastry</option>
                  <option value="Pizza Oven">Pizza Oven</option>
                </select>
              </div>
            </div>

            {/* Quick Emoji Picker */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dish Emoji Icon</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {['🍽️', '🥩', '🍔', '🍕', '🥗', '🍟', '🍰', '🥤', '🥖', '🐟', '🦑', '🍸', '🍫', '☕', '🥪', '🍣', '🍜', '🍨'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setEditingFood({ ...editingFood, img: emoji })}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition cursor-pointer ${
                      editingFood.img === emoji ? 'bg-blue-600 text-white scale-110 shadow-2xs' : 'hover:bg-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingFood(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
              >
                Save Food Details
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* DELETE FOOD CONFIRMATION MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {foodToDelete && (
        <Modal
          isOpen={!!foodToDelete}
          onClose={() => setFoodToDelete(null)}
          title="Delete Food Item"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
              <span className="text-3xl p-2 bg-white rounded-xl shadow-2xs border border-rose-100 flex items-center justify-center">
                {foodToDelete.img && !foodToDelete.img.startsWith('http') ? foodToDelete.img : getEmojiForDish(foodToDelete.name, foodToDelete.category)}
              </span>
              <div>
                <p className="font-bold text-rose-950 text-sm">{foodToDelete.name}</p>
                <p className="text-rose-700 text-xs">
                  Category: {foodToDelete.category} • Price: Rs. {foodToDelete.price.toFixed(2)}
                </p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">&quot;{foodToDelete.name}&quot;</span>? 
              This will remove the food item from your POS Menu Catalog.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFoodToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition cursor-pointer"
              >
                Keep Dish
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFood}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Dish</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* HOLD ACTIVE BILL MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isHoldBillModalOpen}
        onClose={() => setIsHoldBillModalOpen(false)}
        title="Hold / Park Active Bill"
      >
        <form onSubmit={handleHoldBill} className="space-y-4 text-xs">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 text-sm">
                {orderType}: {tableOrRoom}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                {orderItems.reduce((acc, i) => acc + i.qty, 0)} Items
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-amber-200/60 font-semibold">
              <span>Bill Grand Total:</span>
              <span className="text-base font-extrabold text-blue-700">
                Rs. {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Hold Reference / Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Waiting for friends, Dessert pending, Guest Rahul..."
              value={holdBillNote}
              onChange={(e) => setHoldBillNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This reference helps identify this parked bill when resuming later.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsHoldBillModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Confirm Hold & Start New Bill</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* PARKED & HELD BILLS LIST MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showHeldBillsModal}
        onClose={() => setShowHeldBillsModal(false)}
        title={`Parked & Held Bills (${heldBills.length})`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Select any parked bill to restore it to the Order Pad, view pro-forma estimation, or discard.
          </p>

          {heldBills.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
              <PauseCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700 text-sm">No Bills Currently on Hold</p>
              <p className="text-slate-400 max-w-xs mx-auto text-[11px]">
                Click the &quot;Hold Bill&quot; button on any active order to park it and serve another customer without losing items.
              </p>
            </div>
          ) : (
            <div className="max-h-[460px] overflow-y-auto space-y-3 pr-1">
              {heldBills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-white shadow-2xs hover:shadow-xs transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{bill.tableOrRoom}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          {bill.orderType}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">#{bill.id}</span>
                      </div>
                      {bill.customerName && (
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          Guest: {bill.customerName}
                        </p>
                      )}
                      {bill.note && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          Note: {bill.note}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-blue-700">
                        Rs. {bill.grandTotal.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(bill.heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Summary Pill List */}
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-wrap gap-1.5 text-[11px]">
                    {bill.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium"
                      >
                        {item.qty}x {item.name}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPreviewHeldBill(bill)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                      title="View & print pro-forma bill receipt"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pro-Forma</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteHeldBill(bill.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                        title="Discard this parked bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Discard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResumeHeldBill(bill)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                        title="Load this bill onto Order Pad"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Resume Bill →</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowHeldBillsModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* NEW BILL CONFIRMATION MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showNewBillModal}
        onClose={() => setShowNewBillModal(false)}
        title="Start Fresh New Bill"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
            <p className="font-bold text-blue-950 text-sm">
              Active Order Has {orderItems.reduce((acc, i) => acc + i.qty, 0)} Items
            </p>
            <p className="text-blue-800">
              Destination: <span className="font-bold">{orderType} - {tableOrRoom}</span> • Total: <span className="font-bold">Rs. {grandTotal.toFixed(2)}</span>
            </p>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Would you like to put the current bill on hold so you can return to it later, or discard it to start clean?
          </p>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowNewBillModal(false)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition cursor-pointer"
            >
              Keep Current Bill
            </button>
            <button
              type="button"
              onClick={handleConfirmDiscardNewBill}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold transition cursor-pointer"
            >
              Discard & Clear
            </button>
            <button
              type="button"
              onClick={handleHoldAndStartNewBill}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Hold First & Start New</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Pro-Forma Receipt Modal for Previewed Held Bill */}
      {previewHeldBill && heldBillInvoice && (
        <ReceiptModal
          isOpen={!!previewHeldBill}
          onClose={() => setPreviewHeldBill(null)}
          invoice={heldBillInvoice}
        />
      )}
    </div>
  );
}
