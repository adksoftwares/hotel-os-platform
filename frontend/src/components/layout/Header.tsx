"use client";
import React, { useState, useEffect } from 'react';
import { 
  LogOut, Bell, Search, Check, AlertTriangle, 
  Sparkles, Coffee, UserCheck, Shield, Building2, 
  Crown, ChevronDown, CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CommandPalette } from '@/components/ui/CommandPalette';

import { loadHotelRoomsFleet } from '@/lib/hotelRoomsFleet';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'urgent' | 'info' | 'success';
  read: boolean;
  link?: string;
}

const initialNotifications: NotificationItem[] = [];

const DEFAULT_PROPERTY = {
  id: 'prop-adk-main',
  name: 'Grand ADK Hotel',
  type: 'Primary Property',
};

export function Header() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Multi-Property State
  const [selectedProperty, setSelectedProperty] = useState(DEFAULT_PROPERTY);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [totalRoomsCount, setTotalRoomsCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const fleet = loadHotelRoomsFleet();
      setTotalRoomsCount(fleet.length);
    };
    updateCount();
    window.addEventListener('hotel_rooms_changed', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('hotel_rooms_changed', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  // Luxury Gold / Obsidian Theme Mode
  const [isLuxuryGold, setIsLuxuryGold] = useState(false);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: string;
  }>({
    name: 'Hotel Administrator',
    email: 'admin@hotel.com',
    role: 'ADMIN',
  });

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name && parsed.email) {
          setCurrentUser({
            name: parsed.name,
            email: parsed.email,
            role: parsed.role || 'ADMIN',
          });
        }
      }
    } catch (_) {}
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelectProperty = (prop: typeof DEFAULT_PROPERTY) => {
    setSelectedProperty(prop);
    setShowPropertyDropdown(false);
    localStorage.setItem('active_property_id', prop.id);
    localStorage.setItem('active_property_name', prop.name);
    window.dispatchEvent(new CustomEvent('property_changed', { detail: prop }));
  };

  const toggleLuxuryTheme = () => {
    const next = !isLuxuryGold;
    setIsLuxuryGold(next);
    localStorage.setItem('hotel_luxury_theme', next ? 'gold' : 'classic');
    if (next) {
      document.documentElement.classList.add('luxury-gold-mode');
    } else {
      document.documentElement.classList.remove('luxury-gold-mode');
    }
  };

  return (
    <>
      <header className={`h-16 border-b flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isLuxuryGold 
          ? 'bg-slate-950 border-amber-500/30 text-amber-50 shadow-lg shadow-amber-900/10' 
          : 'bg-white border-slate-200/90'
      }`}>
        {/* Left: Multi-Property Chain Selector & Spotlight Search */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Multi-Property Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPropertyDropdown(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-left group ${
                isLuxuryGold
                  ? 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-500/40 text-amber-100'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isLuxuryGold ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-100 text-blue-700'}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold leading-tight group-hover:text-blue-600 transition">
                    {selectedProperty.name}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-semibold ${isLuxuryGold ? 'text-amber-400' : 'text-slate-500'}`}>
                    {selectedProperty.type}
                  </span>
                  <span className="text-[10px] text-slate-400">• {totalRoomsCount} Rooms</span>
                </div>
              </div>
            </button>

            {/* Property Dropdown Menu */}
            {showPropertyDropdown && (
              <div className={`absolute left-0 mt-2 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isLuxuryGold ? 'bg-slate-900 border-amber-500/30 text-amber-100' : 'bg-white border-slate-200'
              }`}>
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Property
                </div>
                <div className="space-y-1">
                  <div
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                      isLuxuryGold ? 'bg-amber-500/20 text-amber-200 font-bold border border-amber-500/30' : 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    }`}
                  >
                    <div>
                      <p className="leading-snug">{DEFAULT_PROPERTY.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{DEFAULT_PROPERTY.type} ({totalRoomsCount} Rooms)</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Search Spotlight Button */}
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
              window.dispatchEvent(event);
            }}
            className={`hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all group ${
              isLuxuryGold
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-amber-200/70'
                : 'bg-slate-100/80 hover:bg-slate-200/70 border-slate-200/80 text-slate-500'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            <span>Quick Search actions, rooms, guests...</span>
            <kbd className={`px-1.5 py-0.5 text-[10px] rounded border font-mono shadow-2xs ${
              isLuxuryGold ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-white border-slate-300 text-slate-400'
            }`}>
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Luxury Obsidian / Gold Theme Toggle */}
          <button
            onClick={toggleLuxuryTheme}
            className={`p-2 rounded-xl transition-all border flex items-center gap-1.5 ${
              isLuxuryGold
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-slate-50 text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 border-slate-200'
            }`}
            title={isLuxuryGold ? "Active: Royal Obsidian Gold Theme (Click to switch to Slate)" : "Switch to 5-Star Luxury Gold Theme"}
          >
            <Crown className={`w-4 h-4 ${isLuxuryGold ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
            <span className="hidden xl:inline text-[11px] font-bold">
              {isLuxuryGold ? 'Gold Obsidian' : 'Classic Theme'}
            </span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown((prev) => !prev)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Operational Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotificationDropdown && (
              <div 
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">Live Alerts & Tasks</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotificationDropdown(false);
                        if (n.link) router.push(n.link);
                      }}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 items-start ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'urgent' ? (
                          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : n.type === 'success' ? (
                          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-center">
                  <button 
                    onClick={() => { setShowNotificationDropdown(false); router.push('/reports/audit'); }}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    View System Audit Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200"></div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm ${
              currentUser.role === 'SUPER_ADMIN'
                ? 'bg-gradient-to-tr from-purple-700 to-indigo-700 ring-2 ring-purple-300'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
            }`}>
              {currentUser.role === 'SUPER_ADMIN' ? (
                <Crown className="w-4 h-4 text-amber-300" />
              ) : (
                currentUser.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'AD'
              )}
            </div>
            <div className="hidden lg:block text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
                {currentUser.role === 'SUPER_ADMIN' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 uppercase">
                    Super Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{currentUser.email}</p>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Global Command Palette Mounted */}
      <CommandPalette />
    </>
  );
}
