"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Utensils, ArrowLeft, Plus, Minus, Trash2, Send, Flame, 
  PauseCircle, PlayCircle, CheckCircle, Search, Users, 
  Clock, AlertTriangle, Coffee, Sparkles, ChefHat, BellRing,
  Smartphone, ChevronRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export type CourseType = 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  course: CourseType;
  price: number;
  img: string;
  dietary?: string;
}

interface WaiterOrderItem extends MenuItem {
  qty: number;
  course: CourseType;
  notes: string;
  hold?: boolean;
}

const MENU_CATALOG: MenuItem[] = [
  { id: '1', name: 'Steak Frites (250g)', category: 'Mains', course: 'MAIN', price: 50.0, img: '🥩', dietary: 'Chef Special' },
  { id: '2', name: 'Caesar Salad with Bacon', category: 'Starters', course: 'STARTER', price: 15.0, img: '🥗', dietary: 'GF Opt' },
  { id: '3', name: 'Truffle Parmesan Fries', category: 'Sides', course: 'STARTER', price: 12.0, img: '🍟', dietary: 'Veg' },
  { id: '4', name: 'Artisan Craft Cola', category: 'Beverages', course: 'BEVERAGE', price: 5.0, img: '🥤' },
  { id: '5', name: 'Wagyu Burger Deluxe', category: 'Mains', course: 'MAIN', price: 25.0, img: '🍔', dietary: 'Popular' },
  { id: '6', name: 'NY Baked Cheesecake', category: 'Desserts', course: 'DESSERT', price: 10.0, img: '🍰', dietary: 'Veg' },
  { id: '7', name: 'Margherita Woodfire Pizza', category: 'Mains', course: 'MAIN', price: 18.0, img: '🍕', dietary: 'Veg' },
  { id: '8', name: 'Garlic Tomato Bruschetta', category: 'Starters', course: 'STARTER', price: 9.0, img: '🥖', dietary: 'Vegan' },
  { id: '9', name: 'Crispy Calamari Rings', category: 'Starters', course: 'STARTER', price: 16.0, img: '🦑' },
  { id: '10', name: 'Grilled Atlantic Salmon', category: 'Mains', course: 'MAIN', price: 34.0, img: '🐟', dietary: 'GF' },
  { id: '11', name: 'Espresso Martini', category: 'Beverages', course: 'BEVERAGE', price: 14.0, img: '🍸' },
  { id: '12', name: 'Warm Lava Chocolate Cake', category: 'Desserts', course: 'DESSERT', price: 12.0, img: '🍫', dietary: 'Veg' },
];

const TABLES_LIST = [
  { id: 'T1', name: 'Table 1', zone: 'AC Dining', maxCovers: 2 },
  { id: 'T2', name: 'Table 2', zone: 'AC Dining', maxCovers: 4 },
  { id: 'T3', name: 'Table 3', zone: 'AC Dining', maxCovers: 4 },
  { id: 'T4', name: 'Table 4', zone: 'AC Dining', maxCovers: 6 },
  { id: 'G1', name: 'Patio 1', zone: 'Garden Patio', maxCovers: 4 },
  { id: 'G2', name: 'Patio 2', zone: 'Garden Patio', maxCovers: 4 },
  { id: 'R1', name: 'Roof 1', zone: 'Rooftop', maxCovers: 2 },
  { id: 'R2', name: 'Roof 2', zone: 'Rooftop', maxCovers: 4 },
];

export default function WaiterHandheldPOS() {
  const { toast } = useToast();

  const [selectedTable, setSelectedTable] = useState('Table 2');
  const [guestCovers, setGuestCovers] = useState(2);
  const [waiterName] = useState('Captain Rajesh');
  const [activeTab, setActiveTab] = useState<'All' | 'Starters' | 'Mains' | 'Desserts' | 'Beverages'>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [holdMains, setHoldMains] = useState(true);
  const [catalog, setCatalog] = useState<MenuItem[]>(MENU_CATALOG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pos_custom_menu_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCatalog([...MENU_CATALOG, ...parsed]);
        }
      }
    } catch (_) {}
  }, []);

  // Active Ticket
  const [currentTicket, setCurrentTicket] = useState<WaiterOrderItem[]>([
    { ...MENU_CATALOG[1], qty: 2, course: 'STARTER', notes: 'Dressing on side' },
    { ...MENU_CATALOG[0], qty: 2, course: 'MAIN', notes: 'Medium-rare', hold: true },
    { ...MENU_CATALOG[3], qty: 2, course: 'BEVERAGE', notes: 'No ice' },
  ]);

  // Audio tone helper
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  };

  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      const matchCat = activeTab === 'All' || item.category === activeTab;
      const matchSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          (item.dietary && item.dietary.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeTab, searchFilter, catalog]);

  const addItemToTicket = (item: MenuItem) => {
    const defaultHold = item.course === 'MAIN' ? holdMains : false;
    setCurrentTicket(prev => {
      const idx = prev.findIndex(p => p.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].qty += 1;
        return next;
      }
      return [...prev, { ...item, qty: 1, notes: '', hold: defaultHold }];
    });
    toast(`Added ${item.name}`, 'info');
  };

  const updateQuantity = (index: number, delta: number) => {
    setCurrentTicket(prev => {
      const next = [...prev];
      const newQty = next[index].qty + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index].qty = newQty;
      }
      return next;
    });
  };

  const toggleItemHold = (index: number) => {
    setCurrentTicket(prev => {
      const next = [...prev];
      next[index].hold = !next[index].hold;
      toast(`${next[index].name} course status: ${next[index].hold ? 'ON HOLD' : 'FIRED'}`, 'info');
      return next;
    });
  };

  const setItemCourse = (index: number, course: CourseType) => {
    setCurrentTicket(prev => {
      const next = [...prev];
      next[index].course = course;
      return next;
    });
  };

  const updateItemNotes = (index: number, notes: string) => {
    setCurrentTicket(prev => {
      const next = [...prev];
      next[index].notes = notes;
      return next;
    });
  };

  const subtotal = currentTicket.reduce((acc, it) => acc + it.price * it.qty, 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  // Send Order to Kitchen
  const sendToKitchen = () => {
    if (currentTicket.length === 0) {
      toast("Please add at least one item to fire ticket!", 'error');
      return;
    }

    const kotId = `KOT-${Math.floor(Math.random() * 8999) + 1000}`;
    const newKot = {
      id: kotId,
      table: selectedTable,
      server: waiterName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'PENDING',
      urgent: false,
      items: currentTicket.map(it => ({
        name: `${it.name} [${it.course}]${it.hold ? ' (ON HOLD)' : ''}`,
        qty: it.qty,
        notes: it.notes ? `${it.notes}${it.hold ? ' • ON HOLD' : ''}` : (it.hold ? 'ON HOLD' : undefined)
      }))
    };

    const existingKots = JSON.parse(localStorage.getItem('kds_kots') || '[]');
    localStorage.setItem('kds_kots', JSON.stringify([newKot, ...existingKots]));
    window.dispatchEvent(new Event('kots_updated'));

    playChime();
    toast(`Ticket #${kotId} fired to Kitchen KDS for ${selectedTable}!`, 'success');
  };

  // Fire Mains Action Trigger
  const fireMainsToKitchen = () => {
    const mainsItems = currentTicket.filter(it => it.course === 'MAIN' && it.hold);
    if (mainsItems.length === 0) {
      toast("No mains currently held for this table.", 'info');
      return;
    }

    // Release hold on ticket items
    setCurrentTicket(prev => prev.map(it => it.course === 'MAIN' ? { ...it, hold: false } : it));
    setHoldMains(false);

    // Broadcast Fire Mains KOT update
    const fireNotice = {
      id: `FIRE-${Math.floor(Math.random() * 8999) + 1000}`,
      table: selectedTable,
      server: waiterName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'PENDING',
      urgent: true,
      items: mainsItems.map(it => ({
        name: `🔥 FIRE MAINS: ${it.name}`,
        qty: it.qty,
        notes: `IMMEDIATE COOK REQUESTED by ${waiterName} • ${it.notes || 'Standard prep'}`
      }))
    };

    const existingKots = JSON.parse(localStorage.getItem('kds_kots') || '[]');
    localStorage.setItem('kds_kots', JSON.stringify([fireNotice, ...existingKots]));
    window.dispatchEvent(new Event('kots_updated'));

    playChime();
    toast(`🔥 MAINS FIRED! Kitchen notified to start cooking for ${selectedTable}.`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-2 sm:px-4">
      {/* Handheld Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link 
              href="/pos" 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
              title="Return to Main POS Floor Plan"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Smartphone className="w-3.5 h-3.5" />
                  WAITER MOBILE POS
                </span>
                <span className="text-xs text-slate-400">Server: <strong className="text-slate-200">{waiterName}</strong></span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
                Handheld Order & Course Station
              </h1>
            </div>
          </div>

          {/* Quick Table & Cover Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-slate-900 text-white font-semibold text-sm px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TABLES_LIST.map(t => (
                <option key={t.id} value={t.name}>{t.name} ({t.zone})</option>
              ))}
            </select>

            <div className="flex items-center gap-1 px-2 text-xs text-slate-300">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <button 
                onClick={() => setGuestCovers(Math.max(1, guestCovers - 1))}
                className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-white"
              >-</button>
              <span className="w-5 text-center font-bold">{guestCovers}</span>
              <button 
                onClick={() => setGuestCovers(guestCovers + 1)}
                className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-white"
              >+</button>
            </div>
          </div>
        </div>

        {/* Course Firing Master Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={holdMains}
                onChange={(e) => {
                  setHoldMains(e.target.checked);
                  setCurrentTicket(prev => prev.map(it => it.course === 'MAIN' ? { ...it, hold: e.target.checked } : it));
                }}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700"
              />
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <PauseCircle className="w-4 h-4 text-amber-400" />
                Hold Mains Default (Wait for Starters)
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fireMainsToKitchen}
              className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-500/20 flex items-center gap-1.5 active:scale-95 transition"
            >
              <Flame className="w-4 h-4 animate-pulse text-amber-200" />
              FIRE MAINS NOW
            </button>
            <button
              onClick={sendToKitchen}
              className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 flex items-center gap-1.5 active:scale-95 transition"
            >
              <Send className="w-4 h-4" />
              SEND TICKET
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Hand Catalog / Right Hand Live Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side: Touch Catalog */}
        <div className="lg:col-span-7 space-y-3">
          {/* Category Tabs & Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search menu or dietary..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['All', 'Starters', 'Mains', 'Desserts', 'Beverages'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === cat 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Cards (Touch friendly big buttons) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredCatalog.map(item => (
              <button
                key={item.id}
                onClick={() => addItemToTicket(item)}
                className="bg-slate-900 hover:bg-slate-800/90 active:scale-95 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3 text-left transition flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-2xl mb-1">{item.img}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      item.course === 'STARTER' ? 'bg-cyan-500/20 text-cyan-300' :
                      item.course === 'MAIN' ? 'bg-amber-500/20 text-amber-300' :
                      item.course === 'DESSERT' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {item.course}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-blue-300 transition">
                    {item.name}
                  </h3>
                  {item.dietary && (
                    <span className="text-[10px] text-slate-400 font-medium">{item.dietary}</span>
                  )}
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-400">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-blue-600/30 group-hover:bg-blue-600 text-blue-300 group-hover:text-white flex items-center justify-center transition">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Active Ticket / Handheld Pad */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="font-bold text-white text-base">Active Order Ticket</h2>
              </div>
              <p className="text-xs text-slate-400">{selectedTable} • {guestCovers} Covers</p>
            </div>
            <button
              onClick={() => setCurrentTicket([])}
              className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 transition"
              title="Clear Ticket"
            >
              Clear
            </button>
          </div>

          {/* Ticket Item List */}
          <div className="flex-1 my-3 space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
            {currentTicket.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Tap menu items on the left to add to this handheld ticket
              </div>
            ) : (
              currentTicket.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border transition ${
                    item.hold 
                      ? 'bg-amber-950/20 border-amber-800/40' 
                      : 'bg-slate-800/50 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-sm">{item.name}</span>
                        {item.hold && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                            HOLD
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        ${item.price.toFixed(2)} × {item.qty} = ${(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-700">
                      <button 
                        onClick={() => updateQuantity(idx, -1)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateQuantity(idx, 1)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Course Selector & Hold Toggle */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-1">
                      {(['STARTER', 'MAIN', 'DESSERT'] as const).map(c => (
                        <button
                          key={c}
                          onClick={() => setItemCourse(idx, c)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                            item.course === c 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    {item.course === 'MAIN' && (
                      <button
                        onClick={() => toggleItemHold(idx)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 transition ${
                          item.hold 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        {item.hold ? <PauseCircle className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                        {item.hold ? 'Held for Mains' : 'Fire Immediately'}
                      </button>
                    )}
                  </div>

                  {/* Special instruction notes */}
                  <input
                    type="text"
                    placeholder="Kitchen note (e.g., No onion, extra spicy)..."
                    value={item.notes}
                    onChange={(e) => updateItemNotes(idx, e.target.value)}
                    className="mt-2 w-full bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))
            )}
          </div>

          {/* Ticket Totals & Fast Actions */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-200">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax (10%)</span>
              <span className="font-semibold text-slate-200">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800/80">
              <span>Total Bill</span>
              <span className="text-emerald-400">${total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={fireMainsToKitchen}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 active:scale-95 text-white flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-600/20"
              >
                <Flame className="w-4 h-4 text-amber-200 animate-bounce" />
                Fire Mains
              </button>

              <button
                onClick={sendToKitchen}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-600/20"
              >
                <Send className="w-4 h-4" />
                Send to KDS
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
