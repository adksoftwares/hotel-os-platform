"use client";
import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { io } from 'socket.io-client';
import { 
  Users, BedDouble, Key, LogOut, CheckCircle2, 
  Utensils, ChefHat, Clock, AlertTriangle, RefreshCw, 
  IndianRupee, CreditCard, Receipt, Wrench, Sparkles, 
  ArrowUpRight, Plus, ExternalLink, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Panel } from '@/components/ui/Panel';
import { loadHotelRoomsFleet } from '@/lib/hotelRoomsFleet';

const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (_) {
    return null;
  }
};

interface LiveOperationalMetrics {
  hotel: {
    totalRooms: number;
    occupancyRate: number;
    occupiedRooms: number;
    vacantRooms: number;
    reservedRooms: number;
    todayArrivals: number;
    todayDepartures: number;
    inHouseGuests: number;
  };
  housekeeping: {
    dirtyRooms: number;
    cleaningRooms: number;
    readyRooms: number;
    maintenanceRooms: number;
    inspectionRooms: number;
  };
  restaurant: {
    activeOrders: number;
    activeKots: number;
    preparingKots: number;
    readyKots: number;
    occupiedTables: number;
    delayedKots: number;
  };
  financial: {
    todayRevenue: number;
    todayPayments: number;
    outstanding: number;
  };
}

const fallbackData: LiveOperationalMetrics = {
  hotel: {
    totalRooms: 12,
    occupancyRate: 0,
    occupiedRooms: 0,
    vacantRooms: 12,
    reservedRooms: 0,
    todayArrivals: 0,
    todayDepartures: 0,
    inHouseGuests: 0,
  },
  housekeeping: {
    dirtyRooms: 0,
    cleaningRooms: 0,
    readyRooms: 12,
    maintenanceRooms: 0,
    inspectionRooms: 0,
  },
  restaurant: {
    activeOrders: 0,
    activeKots: 0,
    preparingKots: 0,
    readyKots: 0,
    occupiedTables: 0,
    delayedKots: 0,
  },
  financial: {
    todayRevenue: 0.00,
    todayPayments: 0.00,
    outstanding: 0.00,
  },
};

const computeLiveOperationalState = (): LiveOperationalMetrics => {
  if (typeof window === 'undefined') return fallbackData;

  // 1. Live Rooms & Housekeeping
  const rooms = loadHotelRoomsFleet();
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.occupancy === 'Occupied').length;
  const vacantRooms = rooms.filter(r => r.occupancy === 'Vacant').length;
  const reservedRooms = rooms.filter(r => r.occupancy === 'Reserved').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const dirtyRooms = rooms.filter(r => r.housekeeping === 'Dirty').length;
  const cleaningRooms = rooms.filter(r => r.housekeeping === 'Cleaning').length;
  const readyRooms = rooms.filter(r => r.housekeeping === 'Clean' || r.housekeeping === 'Inspected').length;
  const inspectionRooms = rooms.filter(r => r.housekeeping === 'Inspected').length;

  // 2. Live Maintenance
  let maintenanceCount = rooms.filter(r => r.operational === 'Out of Order').length;
  try {
    const rawIssues = localStorage.getItem('hotel_maintenance_issues');
    if (rawIssues) {
      const parsed = JSON.parse(rawIssues);
      if (Array.isArray(parsed)) {
        const openIssues = parsed.filter((i: any) => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
        maintenanceCount = Math.max(maintenanceCount, openIssues);
      }
    }
  } catch (_) {}

  const inHouseGuests = rooms.filter(r => r.occupancy === 'Occupied' && r.currentGuest && r.currentGuest !== 'None' && r.currentGuest !== 'Vacant').length;

  // 3. Live Cashier & Billing Folios
  let todayRevenue = 0;
  let todayPayments = 0;
  let outstanding = 0;
  try {
    const rawFolios = localStorage.getItem('hotel_billing_folios');
    if (rawFolios) {
      const folios = JSON.parse(rawFolios);
      if (Array.isArray(folios) && folios.length > 0) {
        todayRevenue = folios.reduce((sum: number, f: any) => sum + (Number(f.grandTotal) || 0), 0);
        todayPayments = folios.reduce((sum: number, f: any) => sum + (Number(f.paidAmount) || 0), 0);
        outstanding = folios.reduce((sum: number, f: any) => sum + (Number(f.balance) || 0), 0);
      }
    }
  } catch (_) {}

  // 4. Live Restaurant KOTs & Tables
  let kots: any[] = [];
  try {
    const rawKots = localStorage.getItem('kds_kots');
    if (rawKots) {
      const parsed = JSON.parse(rawKots);
      if (Array.isArray(parsed)) kots = parsed;
    }
  } catch (_) {}

  const activeKotsList = kots.filter((k: any) => k.status !== 'DONE' && k.status !== 'SERVED');
  const activeKots = activeKotsList.length;
  const preparingKots = activeKotsList.filter((k: any) => k.status === 'PREPARING').length;
  const readyKots = activeKotsList.filter((k: any) => k.status === 'READY').length;
  const delayedKots = activeKotsList.filter((k: any) => k.urgent).length;

  const tableSet = new Set<string>();
  activeKotsList.forEach((k: any) => {
    if (k.table) tableSet.add(k.table);
  });
  const occupiedTables = tableSet.size;
  const activeOrders = activeKotsList.length;

  // 5. Live Arrivals & Departures
  let todayArrivals = 0;
  let todayDepartures = 0;
  try {
    const rawArrivals = localStorage.getItem('hotel_frontdesk_arrivals');
    if (rawArrivals) {
      const arr = JSON.parse(rawArrivals);
      if (Array.isArray(arr)) {
        todayArrivals = arr.filter((a: any) => a.status === 'Pending').length;
        todayDepartures = arr.filter((a: any) => a.status === 'Due Out').length;
      }
    }
  } catch (_) {}

  return {
    hotel: {
      totalRooms,
      occupancyRate,
      occupiedRooms,
      vacantRooms,
      reservedRooms,
      todayArrivals,
      todayDepartures,
      inHouseGuests,
    },
    housekeeping: {
      dirtyRooms,
      cleaningRooms,
      readyRooms,
      maintenanceRooms: maintenanceCount,
      inspectionRooms,
    },
    restaurant: {
      activeOrders,
      activeKots,
      preparingKots,
      readyKots,
      occupiedTables,
      delayedKots,
    },
    financial: {
      todayRevenue,
      todayPayments,
      outstanding,
    },
  };
};

export default function Dashboard() {
  const propertyId = 'default-property-id';
  const { data, error, isLoading } = useSWR(
    `http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`,
    fetcher,
    { refreshInterval: 5000, revalidateOnFocus: true }
  );

  const [socketConnected, setSocketConnected] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState<LiveOperationalMetrics>(fallbackData);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live');

  // Reactively calculate live operational data
  useEffect(() => {
    const handleLiveSync = () => {
      setLiveMetrics(computeLiveOperationalState());
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    handleLiveSync();

    // Universal live listeners for all cross-module actions
    window.addEventListener('hotel_rooms_changed', handleLiveSync);
    window.addEventListener('billing_updated', handleLiveSync);
    window.addEventListener('maintenance_updated', handleLiveSync);
    window.addEventListener('kots_updated', handleLiveSync);
    window.addEventListener('pos_updated', handleLiveSync);
    window.addEventListener('storage', handleLiveSync);
    window.addEventListener('focus', handleLiveSync);

    return () => {
      window.removeEventListener('hotel_rooms_changed', handleLiveSync);
      window.removeEventListener('billing_updated', handleLiveSync);
      window.removeEventListener('maintenance_updated', handleLiveSync);
      window.removeEventListener('kots_updated', handleLiveSync);
      window.removeEventListener('pos_updated', handleLiveSync);
      window.removeEventListener('storage', handleLiveSync);
      window.removeEventListener('focus', handleLiveSync);
    };
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3001', { query: { propertyId }, reconnectionAttempts: 3, timeout: 2000 });
    
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('connect_error', () => setSocketConnected(false));
    
    socket.on('dashboard.updated', () => {
      mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`);
      setLiveMetrics(computeLiveOperationalState());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const displayData = (data && data.hotel) ? data : liveMetrics;

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="hotel-page">
      {/* Header with Practical Staff Metadata */}
      <PageHeader
        title="Operational Command Center"
        description="Live hospitality operations overview for Front Desk, Housekeeping, Restaurant, and Cashier."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {socketConnected ? 'Live Real-Time Cloud Sync' : 'Live Real-Time Active'}
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentDateStr} • <span className="text-emerald-700 font-semibold">{lastSyncTime}</span>
            </span>
            <button
              onClick={() => {
                setLiveMetrics(computeLiveOperationalState());
                setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`);
              }}
              className="hotel-button hotel-button-secondary text-xs"
              title="Refresh metrics"
              aria-label="Refresh operational metrics"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* Operational Flow Strip: High Priority Metrics */}
      <section aria-label="Key Hotel Operations" className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {/* Occupancy Card */}
          <Link 
            href="/rooms" 
            className="hotel-panel p-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Occupancy</span>
              <BedDouble className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {displayData.hotel.occupancyRate}%
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {displayData.hotel.occupiedRooms} occupied / {displayData.hotel.vacantRooms} vacant
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-700 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, displayData.hotel.occupancyRate)}%` }}
              />
            </div>
          </Link>

          {/* Today's Arrivals */}
          <Link 
            href="/front-desk" 
            className="hotel-panel p-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Today's Arrivals</span>
              <Key className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {displayData.hotel.todayArrivals}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Guests expected</p>
            </div>
            <span className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
              Front Desk Check-in <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>

          {/* Today's Departures */}
          <Link 
            href="/front-desk" 
            className="hotel-panel p-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Today's Departures</span>
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {displayData.hotel.todayDepartures}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Folios to settle</p>
            </div>
            <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
              Express Checkout <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>

          {/* In-House Guests */}
          <Link 
            href="/reservations" 
            className="hotel-panel p-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>In-House Guests</span>
              <Users className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {displayData.hotel.inHouseGuests}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Currently registered</p>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              Guest Ledger <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>

          {/* Reserved Rooms */}
          <Link 
            href="/reservations" 
            className="hotel-panel p-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group col-span-2 md:col-span-1"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Upcoming Bookings</span>
              <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-purple-700 transition-colors" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {displayData.hotel.reservedRooms}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Confirmed future</p>
            </div>
            <span className="text-[11px] text-purple-700 font-medium flex items-center gap-1">
              Booking Grid <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </section>

      {/* Main Departmental Workstations Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Rooms & Housekeeping Readiness */}
        <Panel
          title="Rooms & Housekeeping Readiness"
          description="Live state of hotel rooms for check-in eligibility"
          action={
            <Link 
              href="/rooms" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-300 text-xs font-semibold shrink-0 whitespace-nowrap transition-colors"
            >
              <span>Room Board</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span>Clean & Ready</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {displayData.housekeeping.readyRooms}
              </p>
              <span className="text-[11px] text-emerald-700">Immediate check-in</span>
            </div>

            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
              <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
                <span>In Cleaning</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                {displayData.housekeeping.cleaningRooms}
              </p>
              <span className="text-[11px] text-amber-700">Housekeeper active</span>
            </div>

            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50">
              <div className="flex items-center justify-between text-xs text-rose-800 font-medium">
                <span>Dirty / Checkout</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-rose-900 mt-1">
                {displayData.housekeeping.dirtyRooms}
              </p>
              <span className="text-[11px] text-rose-700">Needs service</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
                <span>Maintenance</span>
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {displayData.housekeeping.maintenanceRooms}
              </p>
              <span className="text-[11px] text-slate-500">Out of order</span>
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Quick Housekeeping Portal</span>
            <Link 
              href="/rooms/housekeeper" 
              className="font-semibold text-emerald-800 hover:text-emerald-900 hover:underline"
            >
              Open Maid Terminal →
            </Link>
          </div>
        </Panel>

        {/* Column 2: Restaurant & Kitchen Pulse */}
        <Panel
          title="Restaurant & Kitchen Pulse"
          description="Live dining orders, KDS tickets, and table turns"
          action={
            <Link 
              href="/pos" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-300 text-xs font-semibold shrink-0 whitespace-nowrap transition-colors"
            >
              <span>Launch POS</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Active Tables</span>
                <Utensils className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {displayData.restaurant.occupiedTables}
              </p>
              <span className="text-[11px] text-slate-500">Dining guests</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>KOTs in Prep</span>
                <ChefHat className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {displayData.restaurant.preparingKots}
              </p>
              <span className="text-[11px] text-slate-500">Kitchen cooking</span>
            </div>

            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span>Ready to Serve</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {displayData.restaurant.readyKots}
              </p>
              <span className="text-[11px] text-emerald-700">Expedite to table</span>
            </div>

            <div className={`p-3 rounded-lg border ${
              displayData.restaurant.delayedKots > 0 
                ? 'border-rose-300 bg-rose-50/60' 
                : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center justify-between text-xs text-rose-800 font-medium">
                <span>Delayed KOTs</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className={`text-2xl font-bold mt-1 ${
                displayData.restaurant.delayedKots > 0 ? 'text-rose-900' : 'text-slate-700'
              }`}>
                {displayData.restaurant.delayedKots}
              </p>
              <span className="text-[11px] text-rose-700">&gt; 15 mins prep time</span>
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Live Kitchen KDS Screen</span>
            <Link 
              href="/kitchen" 
              className="font-semibold text-emerald-800 hover:text-emerald-900 hover:underline"
            >
              Open Kitchen KDS →
            </Link>
          </div>
        </Panel>

        {/* Column 3: Daily Financial Pulse */}
        <Panel
          title="Daily Cashier & Folio Pulse"
          description="Audited revenues, collections, and open guest balances"
          action={
            <Link 
              href="/billing" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-300 text-xs font-semibold shrink-0 whitespace-nowrap transition-colors"
            >
              <span>Cashier Desk</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </Link>
          }
        >
          <div className="space-y-3 mb-4">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">Today's Settled Revenue</span>
                <span className="text-xl font-bold text-slate-900 block mt-0.5">
                  Rs. {displayData.financial.todayRevenue.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-400">Rooms + POS + Services</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">Collected Payments</span>
                <span className="text-xl font-bold text-slate-900 block mt-0.5">
                  Rs. {displayData.financial.todayPayments.toFixed(2)}
                </span>
                <span className="text-[11px] text-emerald-700">Cash, Cards & Bank Transfers</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">Outstanding Guest Balance</span>
                <span className="text-xl font-bold text-rose-700 block mt-0.5">
                  Rs. {displayData.financial.outstanding.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-400">Due at checkout</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Daily Revenue Audit Report</span>
            <Link 
              href="/reports/daily-revenue" 
              className="font-semibold text-emerald-800 hover:text-emerald-900 hover:underline"
            >
              View Full Report →
            </Link>
          </div>
        </Panel>

      </div>
    </div>
  );
}
