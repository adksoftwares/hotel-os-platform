"use client";
import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { io } from 'socket.io-client';
import { 
  Users, Bed, Home, Key, LogOut, CheckCircle, 
  Utensils, ChefHat, Clock, AlertTriangle, RefreshCw, 
  DollarSign, CreditCard, Receipt, Wrench, Ban
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Dashboard() {
  const propertyId = 'default-property-id';
  const { data, error, isLoading } = useSWR(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`, fetcher, { refreshInterval: 1000 });
  const [socketConnected, setSocketConnected] = useState(false);
  const [localKots, setLocalKots] = useState<any[]>([]);

  useEffect(() => {
    const updateLocal = () => {
      try { const s = localStorage.getItem('kds_kots'); if(s) setLocalKots(JSON.parse(s)); } catch(e) {}
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
    const socket = io('http://localhost:3001', { query: { propertyId } });
    
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    
    // Listen to generic invalidation event from backend or cross-tab
    socket.on('dashboard.updated', () => {
      mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`);
    });

    const handleStorage = (e: StorageEvent) => {
      // Also fallback to localStorage events (used by POS/Kitchen in previous prompts)
      if (e.key === 'kots_updated' || e.key === 'pos_updated') {
        mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`);
      }
    };
    window.addEventListener('storage', handleStorage);
    // Also listen to local window events
    window.addEventListener('kots_updated', () => mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`));

    return () => {
      socket.disconnect();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('kots_updated', () => {});
    };
  }, []);

  if (isLoading) return <div className="flex h-64 items-center justify-center"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Failed to load dashboard metrics. Ensure backend is running.</div>;
  if (!data) return null;

  let displayData = { ...data };
  if (localKots && localKots.length > 0) {
    const activeKots = localKots.filter(k => k.status !== 'DONE');
    displayData.restaurant = {
      ...displayData.restaurant,
      activeKots: activeKots.length,
      preparingKots: activeKots.filter(k => k.status === 'PREPARING').length,
      readyKots: activeKots.filter(k => k.status === 'READY').length,
      delayedKots: activeKots.filter(k => k.urgent).length
    };
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Operational Command Center</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
              {socketConnected ? 'Live Connection Active' : 'Live Connection Unavailable (Retrying)'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-400">Updated just now</span>
          </p>
        </div>
        <button onClick={() => mutate(`http://localhost:3001/dashboard/metrics?propertyId=${propertyId}`)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Hotel Operations */}
        <div className="lg:col-span-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Hotel Operations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Link href="/rooms" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500 group-hover:text-primary-600">Occupancy Rate</p>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Home className="w-4 h-4" /></div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{displayData.hotel.occupancyRate}%</p>
              <div className="mt-1 text-xs text-slate-400 flex gap-2">
                <span>{displayData.hotel.occupiedRooms} Occupied</span>
                <span>{displayData.hotel.vacantRooms} Vacant</span>
              </div>
            </Link>
            
            <Link href="/front-desk" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500 group-hover:text-indigo-600">Today's Arrivals</p>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Key className="w-4 h-4" /></div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{displayData.hotel.todayArrivals}</p>
            </Link>

            <Link href="/front-desk" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500 group-hover:text-orange-600">Today's Departures</p>
                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><LogOut className="w-4 h-4" /></div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{displayData.hotel.todayDepartures}</p>
            </Link>

            <Link href="/rooms" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500 group-hover:text-emerald-600">In-House Guests</p>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Users className="w-4 h-4" /></div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{displayData.hotel.inHouseGuests}</p>
            </Link>

            <Link href="/reservations" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500 group-hover:text-purple-600">Reserved Rooms</p>
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Bed className="w-4 h-4" /></div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{displayData.hotel.reservedRooms}</p>
            </Link>
          </div>
        </div>

        {/* Rooms & Housekeeping */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Rooms & Housekeeping</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/rooms" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between">
              <p className="text-sm font-medium text-slate-500">Dirty Rooms</p>
              <p className="text-3xl font-bold text-rose-600 mt-1">{displayData.housekeeping.dirtyRooms}</p>
            </Link>
            <Link href="/rooms" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between">
              <p className="text-sm font-medium text-slate-500">Cleaning</p>
              <p className="text-3xl font-bold text-amber-500 mt-1">{displayData.housekeeping.cleaningRooms}</p>
            </Link>
            <Link href="/rooms" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
              <p className="text-sm font-medium text-slate-500">Ready</p>
              <p className="text-3xl font-bold text-emerald-500 mt-1">{displayData.housekeeping.readyRooms}</p>
            </Link>
            <Link href="/rooms" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between">
              <p className="text-sm font-medium text-slate-500">Maintenance / OOS</p>
              <p className="text-3xl font-bold text-slate-700 mt-1">{displayData.housekeeping.maintenanceRooms}</p>
            </Link>
          </div>
        </div>

        {/* Restaurant Operations */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Restaurant Operations</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/pos" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex justify-between"><p className="text-sm font-medium text-slate-500">Active Orders</p><Utensils className="w-4 h-4 text-slate-400" /></div>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{displayData.restaurant.activeOrders}</p>
            </Link>
            <Link href="/kitchen" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex justify-between"><p className="text-sm font-medium text-slate-500">Active KOTs</p><ChefHat className="w-4 h-4 text-slate-400" /></div>
              <p className="text-3xl font-bold text-orange-600 mt-1">{displayData.restaurant.activeKots}</p>
              <div className="mt-1 text-xs text-slate-400 flex gap-2">
                <span>{displayData.restaurant.preparingKots} Preparing</span>
                <span>{displayData.restaurant.readyKots} Ready</span>
              </div>
            </Link>
            <Link href="/pos" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
              <p className="text-sm font-medium text-slate-500">Occupied Tables</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{displayData.restaurant.occupiedTables}</p>
            </Link>
            <Link href="/kitchen" className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm hover:border-red-300 transition-all flex flex-col justify-between">
              <div className="flex justify-between"><p className="text-sm font-medium text-red-600">Delayed KOTs</p><AlertTriangle className="w-4 h-4 text-red-500" /></div>
              <p className="text-3xl font-bold text-red-700 mt-1">{displayData.restaurant.delayedKots}</p>
            </Link>
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="lg:col-span-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Financial Snapshot (Today)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/billing" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-300 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-500">Today's Revenue</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">${displayData.financial.todayRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600"><DollarSign className="w-6 h-6" /></div>
            </Link>
            <Link href="/billing" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-500">Collected Payments</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">${displayData.financial.todayPayments.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><CreditCard className="w-6 h-6" /></div>
            </Link>
            <Link href="/billing" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-rose-300 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-500">Outstanding Balance</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">${displayData.financial.outstanding.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600"><Receipt className="w-6 h-6" /></div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
