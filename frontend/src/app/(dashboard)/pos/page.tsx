"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Modal } from '@/components/ui/Modal';
import { ReceiptModal } from '@/components/ui/ReceiptModal';
import { 
  Settings, Utensils, Bed, Search, Tag, Percent, ArrowRight, 
  Minus, Plus, Edit2, Trash2, LayoutGrid, Coffee, Split, 
  CheckCircle, Clock, Users, ArrowUpRight, DollarSign, Smartphone,
  ChefHat, Sparkles, Sliders, X, Flame, ShieldAlert, Star, Check
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
  
  // View mode: Floor Plan vs Order Pad Menu
  const [posMode, setPosMode] = useState<'floorplan' | 'menu'>('menu');
  const [activeZone, setActiveZone] = useState<'All' | 'AC Dining' | 'Garden Patio' | 'Rooftop'>('All');
  const [tables, setTables] = useState<TableEntity[]>(initialTables);

  const categories = ['All', 'Starters', 'Mains', 'Sides', 'Beverages', 'Desserts', 'Chef Specials'];
  const [menuItems, setMenuItems] = useState<MenuItemEntity[]>(defaultMenuItems);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pos_custom_menu_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMenuItems([...defaultMenuItems, ...parsed]);
        }
      }
    } catch (_) {}
  }, []);

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
  
  const [orderType, setOrderType] = useState<'Table' | 'Room'>('Table');
  const [tableOrRoom, setTableOrRoom] = useState('Table 1');
  
  const [orderItems, setOrderItems] = useState<any[]>([
    { id: '5', name: 'Wagyu Burger', category: 'Mains', price: 25.00, qty: 2, discountType: 'none', discountValue: 0 },
    { id: '3', name: 'Truffle Fries', category: 'Sides', price: 12.00, qty: 1, discountType: 'none', discountValue: 0 },
  ]);
  
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
      toast("Please enter a valid price greater than LKR 0", 'error');
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
    setMenuItems(updated);

    try {
      const saved = JSON.parse(localStorage.getItem('pos_custom_menu_items') || '[]');
      localStorage.setItem('pos_custom_menu_items', JSON.stringify([...saved, newItem]));
    } catch (_) {}

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
      toast("Please enter a valid price greater than LKR 0", 'error');
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
    toast(`Special order "${customOrderItem.name}" (LKR ${numPrice.toFixed(2)}) added to ticket!`, 'success');
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
    toast(`Customized ${customizerItem.name} added (LKR ${finalPrice.toFixed(2)})`, 'success');
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
    setTableOrRoom(tbl.name);
    setOrderType('Table');
    setPosMode('menu');
    toast(`${tbl.name} selected. Order pad opened.`, 'info');
  };

  const handleTransferToRoom = () => {
    setShowRoomChargeModal(false);
    toast(`LKR ${grandTotal.toFixed(2)} charged to Room ${selectedRoomNumber} Folio!`, 'success');
    setOrderItems([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
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
            <span className="font-bold text-slate-800">{orderType} - {tableOrRoom}</span>
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
      {/* MODE 1: VISUAL TABLE FLOOR PLAN */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {posMode === 'floorplan' ? (
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
              .map((tbl) => (
                <div
                  key={tbl.id}
                  onClick={() => handleSelectTable(tbl)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md relative overflow-hidden ${
                    tbl.status === 'AVAILABLE'
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
                      tbl.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                      tbl.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800' :
                      tbl.status === 'BILLED' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tbl.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">{tbl.zone} · {tbl.capacity} Seats</p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    {tbl.status === 'OCCUPIED' || tbl.status === 'BILLED' ? (
                      <>
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{tbl.seatedMinutes}m</span>
                        </div>
                        <span className="font-bold text-slate-900 text-sm">LKR {tbl.currentTotal.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-emerald-600 font-medium text-xs">Click to Seat & Order →</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────── */
        /* MODE 2: ORDER PAD & MENU VIEW */
        /* ──────────────────────────────────────────────────────────────────────── */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Menu Items Left 2 Columns */}
          <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Search & Category Pills */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search food item, beverage, dessert..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                        activeCategory === c
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Quick Add Food & Special Order Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsOpenFoodModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition shadow-2xs"
                    title="Add off-menu special order directly to current bill"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Special Custom Dish</span>
                  </button>
                  <button
                    onClick={() => setIsAddFoodModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                    title="Add a brand new dish to the POS menu catalog"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>+ Add Food to Menu</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Cards Grid */}
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  className="p-3.5 bg-slate-50/60 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-300 rounded-xl cursor-pointer transition-all flex flex-col justify-between group select-none relative"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-2xl mb-1.5 block">{item.img}</span>
                      {item.dietary && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.dietary}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs group-hover:text-blue-900 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-[10px] text-slate-400">{item.category}</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">LKR {item.price.toFixed(2)}</span>
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
                      <span className="w-5 h-5 rounded-full bg-white group-hover:bg-blue-600 group-hover:text-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs transition-colors">
                        +
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Ticket Summary */}
          <div className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Active Order Ticket</h2>
                <span className="text-[11px] text-slate-400">{orderType}: {tableOrRoom}</span>
              </div>
              {orderItems.length > 0 && (
                <button
                  onClick={() => setShowSplitBill(true)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <Split className="w-3.5 h-3.5" /> Split Bill
                </button>
              )}
            </div>

            {/* Order Items List */}
            <div className="flex-1 p-4 overflow-y-auto divide-y divide-slate-100">
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
                      <span className="text-[11px] text-slate-400">LKR {item.price.toFixed(2)} each</span>
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

                    <div className="text-right w-20 mt-0.5">
                      <span className="font-bold text-slate-800 text-xs">
                        LKR {calculateItemTotal(item).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals & Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (10%):</span>
                <span className="font-semibold text-slate-800">LKR {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due:</span>
                <span className="text-blue-600 text-base">LKR {grandTotal.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleFireKOT}
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
                >
                  Fire KOT to Kitchen
                </button>
                <button
                  onClick={() => {
                    if (orderItems.length === 0) return toast("Order is empty!", 'error');
                    setShowReceipt(true);
                  }}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
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
          <p className="text-slate-500">Divide order grand total (LKR {grandTotal.toFixed(2)}) equally across guests.</p>
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
            <p className="text-2xl font-bold text-blue-600">LKR {(grandTotal / splitCount).toFixed(2)}</p>
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
            <span>LKR {grandTotal.toFixed(2)}</span>
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
              <label className="block font-semibold text-slate-700 mb-1">Selling Price (LKR) *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Custom Price (LKR) *</label>
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
              <span className="text-3xl">{customizerItem.img}</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{customizerItem.name}</h4>
                <p className="text-slate-500">Base Price: LKR {customizerItem.price.toFixed(2)} • {customizerItem.category}</p>
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
                      {sz === 'Small' ? '-LKR 300' : sz === 'Large' ? '+LKR 500' : 'Included'}
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
                  'Extra Melted Cheese (+LKR 250)',
                  'Crispy Smoked Bacon (+LKR 300)',
                  'Garlic Mushrooms (+LKR 350)',
                  'Fresh Hass Avocado (+LKR 250)',
                  'Grilled Jumbo Prawns (+LKR 600)',
                  'Truffle Mayo Dip (+LKR 200)'
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
    </div>
  );
}
