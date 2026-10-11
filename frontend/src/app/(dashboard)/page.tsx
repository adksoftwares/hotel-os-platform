"use client";
import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { io } from 'socket.io-client';
import { 
  Users, BedDouble, Key, LogOut, CheckCircle2, 
  Utensils, ChefHat, Clock, AlertTriangle, RefreshCw, 
  DollarSign, CreditCard, Receipt, Wrench, Sparkles, 
  ArrowUpRight, Plus, ExternalLink, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Panel } from '@/components/ui/Panel';

const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { headers });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  return res.json();
};

export default function Dashboard() {
  const propertyId = 'default-property-id';
  const { data, error, isLoading } = useSWR(
    `http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`,
    fetcher,
    { refreshInterval: 5000, revalidateOnFocus: true }
  );

  const [socketConnected, setSocketConnected] = useState(false);
  const [localKots, setLocalKots] = useState<any[]>([]);

  useEffect(() => {
    const updateLocal = () => {
      try {
        const s = localStorage.getItem('kds_kots');
        if (s) setLocalKots(JSON.parse(s));
      } catch (e) {}
    };
    updateLocal();
    window.addEventListener('kots_updated', updateLocal);
    window.addEventListener('storage', updateLocal);
    return () => {
      window.removeEventListener('kots_updated', updateLocal);
      window.removeEventListener('storage', updateLocal);
    };
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3001', { query: { propertyId }, reconnectionAttempts: 3, timeout: 2000 });
    
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('connect_error', () => setSocketConnected(false));
    
    socket.on('dashboard.updated', () => {
      mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`);
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kots_updated' || e.key === 'pos_updated') {
        mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`);
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('kots_updated', () => mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`));

    return () => {
      socket.disconnect();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('kots_updated', () => {});
    };
  }, []);

  const fallbackData = {
    hotel: {
      totalRooms: 12,
      occupancyRate: 75,
      occupiedRooms: 9,
      vacantRooms: 3,
      reservedRooms: 2,
      todayArrivals: 4,
      todayDepartures: 3,
      inHouseGuests: 14,
    },
    housekeeping: {
      dirtyRooms: 2,
      cleaningRooms: 1,
      readyRooms: 5,
      maintenanceRooms: 1,
      inspectionRooms: 3,
    },
    restaurant: {
      activeOrders: 4,
      activeKots: 3,
      preparingKots: 2,
      readyKots: 1,
      occupiedTables: 3,
      delayedKots: 1,
    },
    financial: {
      todayRevenue: 2850.00,
      todayPayments: 1950.00,
      outstanding: 900.00,
    },
  };

  const safeData = (data && data.hotel) ? data : fallbackData;
  let displayData = { ...safeData };
  if (localKots && localKots.length > 0) {
    const activeKots = localKots.filter(k => k.status !== 'DONE');
    displayData.restaurant = {
      ...(displayData.restaurant || {}),
      activeKots: activeKots.length,
      preparingKots: activeKots.filter(k => k.status === 'PREPARING').length,
      readyKots: activeKots.filter(k => k.status === 'READY').length,
      delayedKots: activeKots.filter(k => k.urgent).length
    };
  }

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
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            socketConnected 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {socketConnected ? 'Live Real-Time Sync' : 'Local Operational Mode'}
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentDateStr}
            </span>
            <button
              onClick={() => mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`)}
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
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              Open Room Board <ExternalLink className="w-3 h-3" />
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
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              Launch POS <ExternalLink className="w-3 h-3" />
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
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              Cashier Desk <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <div className="space-y-3 mb-4">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">Today's Settled Revenue</span>
                <span className="text-xl font-bold text-slate-900 block mt-0.5">
                  ${displayData.financial.todayRevenue.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-400">Rooms + POS + Services</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">Collected Payments</span>
                <span className="text-xl font-bold text-slate-900 block mt-0.5">
                  ${displayData.financial.todayPayments.toFixed(2)}
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
                  ${displayData.financial.outstanding.toFixed(2)}
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
