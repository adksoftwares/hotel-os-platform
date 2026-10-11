"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bed, Utensils, Receipt, Wrench, FileText, 
  Settings, UserPlus, PlusCircle, ArrowRight, CornerDownLeft, Smartphone
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Rooms & Tables';
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const items: CommandItem[] = [
    // Navigation
    { id: 'nav-dash', title: 'Dashboard Analytics', category: 'Navigation', icon: <FileText className="w-4 h-4 text-blue-500" />, action: () => router.push('/') },
    { id: 'nav-front', title: 'Front Desk & Arrivals', category: 'Navigation', icon: <Bed className="w-4 h-4 text-emerald-500" />, action: () => router.push('/front-desk') },
    { id: 'nav-res', title: 'Reservations & Tape Chart', category: 'Navigation', icon: <Bed className="w-4 h-4 text-indigo-500" />, action: () => router.push('/reservations') },
    { id: 'nav-pos', title: 'Restaurant POS & Tables', category: 'Navigation', icon: <Utensils className="w-4 h-4 text-amber-500" />, action: () => router.push('/pos') },
    { id: 'nav-waiter', title: 'Waiter Handheld POS (Hold & Fire Mains)', category: 'Navigation', icon: <Smartphone className="w-4 h-4 text-emerald-500" />, action: () => router.push('/pos/waiter') },
    { id: 'nav-housekeeper', title: 'Housekeeper Maid Portal (Minibar & Timer)', category: 'Navigation', icon: <Smartphone className="w-4 h-4 text-sky-500" />, action: () => router.push('/rooms/housekeeper') },
    { id: 'nav-kds', title: 'Kitchen Display System (KDS)', category: 'Navigation', icon: <Utensils className="w-4 h-4 text-rose-500" />, action: () => router.push('/kitchen') },
    { id: 'nav-bill', title: 'Billing & Folios', category: 'Navigation', icon: <Receipt className="w-4 h-4 text-purple-500" />, action: () => router.push('/billing') },
    { id: 'nav-maint', title: 'Maintenance Kanban', category: 'Navigation', icon: <Wrench className="w-4 h-4 text-orange-500" />, action: () => router.push('/maintenance') },
    { id: 'nav-rep', title: 'Reports & BI Center', category: 'Navigation', icon: <FileText className="w-4 h-4 text-teal-500" />, action: () => router.push('/reports') },
    { id: 'nav-tax', title: 'Tax & Compliance Settings', category: 'Navigation', icon: <Settings className="w-4 h-4 text-slate-500" />, action: () => router.push('/settings/tax') },
    
    // Quick Actions
    { id: 'act-res', title: 'Create New Reservation', category: 'Actions', icon: <PlusCircle className="w-4 h-4 text-emerald-500" />, action: () => router.push('/reservations') },
    { id: 'act-walkin', title: 'Register Walk-In Guest', category: 'Actions', icon: <UserPlus className="w-4 h-4 text-blue-500" />, action: () => router.push('/front-desk') },
    { id: 'act-food', title: 'Add New Food Menu Item', category: 'Actions', icon: <PlusCircle className="w-4 h-4 text-amber-500" />, action: () => router.push('/settings/restaurant/food/new') },
    { id: 'act-room', title: 'Create New Hotel Room', category: 'Actions', icon: <PlusCircle className="w-4 h-4 text-indigo-500" />, action: () => router.push('/settings/rooms/new') },
    { id: 'act-stock', title: 'Initiate Physical Stocktake', category: 'Actions', icon: <Receipt className="w-4 h-4 text-purple-500" />, action: () => router.push('/inventory/stocktake') },

    // Rooms & Quick Entities
    { id: 'ent-101', title: 'Room 101 (Deluxe King)', category: 'Rooms & Tables', icon: <Bed className="w-4 h-4 text-blue-500" />, action: () => router.push('/rooms/101') },
    { id: 'ent-102', title: 'Room 102 (Standard Queen)', category: 'Rooms & Tables', icon: <Bed className="w-4 h-4 text-blue-500" />, action: () => router.push('/rooms/102') },
    { id: 'ent-201', title: 'Room 201 (Executive Suite)', category: 'Rooms & Tables', icon: <Bed className="w-4 h-4 text-blue-500" />, action: () => router.push('/rooms/201') },
    { id: 'ent-tbl4', title: 'Table 4 (Garden Dining)', category: 'Rooms & Tables', icon: <Utensils className="w-4 h-4 text-amber-500" />, action: () => router.push('/pos') },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const executeItem = (item: CommandItem) => {
    setIsOpen(false);
    setQuery('');
    item.action();
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms, guests, actions, or jump to page... (e.g. POS, Room 101)"
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 outline-none text-base font-normal"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
              } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
                e.preventDefault();
                executeItem(filteredItems[selectedIndex]);
              }
            }}
          />
          <kbd className="px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-200/80 border border-slate-300 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No matching rooms, actions, or pages found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
                      {item.icon}
                    </div>
                    <div>
                      <p className="leading-snug">{item.title}</p>
                      <span className="text-xs text-slate-400 font-normal">{item.category}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-blue-600 text-xs">
                      <span>Jump</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Use ↑ ↓ to navigate</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
}
