"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, CheckCircle, ChefHat, AlertCircle, ArrowRight, 
  Volume2, VolumeX, Flame, BellRing, Sparkles, RotateCcw
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/components/ui/Toast';

interface OrderItem {
  name: string;
  qty: number;
  notes?: string;
}

interface KOT {
  id: string;
  table: string;
  server: string;
  time: string;
  timestamp: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
  items: OrderItem[];
  urgent?: boolean;
}

const initialMockKots: KOT[] = [];

export default function KitchenDisplaySystem() {
  const { toast } = useToast();
  const [kots, setKots] = useState<KOT[]>(initialMockKots);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play Kitchen Order Bell Chime using Web Audio API
  const playKitchenChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Bell chime tone 1 (Higher ping)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.8);

      // Bell chime tone 2 (Warm harmonic)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.08); // A6
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.warn('Audio chime note could not play', e);
    }
  };

  useEffect(() => {
    // Sync with local storage
    const syncLocalKots = (playSound = false) => {
      try {
        const stored = localStorage.getItem('kds_kots');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const mapped = parsed.map((p: any) => ({
              ...p,
              timestamp: p.timestamp || Date.now(),
              status: (p.status === 'NEW' || !p.status) ? 'PENDING' : p.status,
            }));
            setKots(mapped);
            if (playSound && mapped.length > 0) {
              playKitchenChime();
            }
          }
        }
      } catch (e) {}
    };

    // Run immediately on component mount!
    syncLocalKots(false);

    const handleUpdate = () => syncLocalKots(true);
    window.addEventListener('kots_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', () => syncLocalKots(false));

    // Socket listener
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket: Socket = io(apiBase, {
      query: { propertyId: 'default-property-id' }
    });

    socket.on('KOT_CREATED', (data: any) => {
      playKitchenChime();
      toast('🔔 New Order Ticket Fired to Kitchen!', 'info');
      syncLocalKots(true);
    });

    return () => {
      window.removeEventListener('kots_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', () => syncLocalKots(false));
      socket.disconnect();
    };
  }, [soundEnabled]);

  const updateStatus = (id: string, newStatus: KOT['status']) => {
    const updated = kots.map(k => k.id === id ? { ...k, status: newStatus } : k);
    setKots(updated);
    try {
      localStorage.setItem('kds_kots', JSON.stringify(updated));
      window.dispatchEvent(new Event('kots_updated'));
    } catch (e) {}
    playKitchenChime();
    if (newStatus === 'READY') {
      toast(`Ticket ${id} is READY for Pickup! Server notified.`, 'success');
    } else if (newStatus === 'PREPARING') {
      toast(`Ticket ${id} moved to Prep station.`, 'info');
    }
  };

  const getElapsedTime = (timestamp: number) => {
    const elapsedMinutes = Math.floor((Date.now() - timestamp) / 60000);
    return Math.max(1, elapsedMinutes);
  };

  const renderColumn = (title: string, status: KOT['status'], icon: React.ReactNode, count: number) => {
    const columnKots = kots.filter(k => 
      status === 'PENDING' 
        ? (k.status === 'PENDING' || (k.status as any) === 'NEW') 
        : k.status === status
    );

    return (
      <div className="flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 p-4 h-full">
        {/* Column Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="font-bold text-slate-800 text-sm">{title}</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
            {columnKots.length}
          </span>
        </div>

        {/* Tickets Scroll Container */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {columnKots.length === 0 ? (
            <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
              <ChefHat className="w-6 h-6 opacity-40" />
              <p>No active orders in {title.toLowerCase()}</p>
            </div>
          ) : (
            columnKots.map(kot => {
              const elapsedMins = getElapsedTime(kot.timestamp);
              const isOverdue = elapsedMins >= 20;
              const isWarning = elapsedMins >= 10 && elapsedMins < 20;

              return (
                <div
                  key={kot.id}
                  className={`bg-white rounded-xl shadow-xs border transition-all overflow-hidden ${
                    isOverdue
                      ? 'border-rose-400 ring-2 ring-rose-200 animate-pulse'
                      : isWarning
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className={`p-3 border-b flex items-center justify-between ${
                    isOverdue ? 'bg-rose-50/80 border-rose-100' :
                    isWarning ? 'bg-amber-50/70 border-amber-100' :
                    'bg-slate-50/60 border-slate-100'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{kot.id}</span>
                        {isOverdue && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-extrabold uppercase flex items-center gap-1">
                            <Flame className="w-3 h-3" /> RUSH
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                        {kot.table} · Server: {kot.server}
                      </p>
                    </div>

                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold ${
                      isOverdue ? 'bg-rose-100 text-rose-700 border-rose-300' :
                      isWarning ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsedMins}m</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-3.5 space-y-2 text-xs">
                    {kot.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                          {item.qty}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 leading-snug">{item.name}</p>
                          {item.notes && (
                            <p className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded mt-0.5 border border-rose-100 inline-block">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Station Action Footer */}
                  <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 flex gap-2">
                    {status === 'PENDING' && (
                      <button
                        onClick={() => updateStatus(kot.id, 'PREPARING')}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>Start Cooking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {status === 'PREPARING' && (
                      <button
                        onClick={() => updateStatus(kot.id, 'READY')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Ready for Service</span>
                      </button>
                    )}
                    {status === 'READY' && (
                      <button
                        onClick={() => updateStatus(kot.id, 'SERVED')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        <span>Order Served (Clear)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-4">
      {/* KDS Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ChefHat className="text-amber-600 w-5 h-5" />
              Kitchen Display System (KDS 2.0)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Cooking Stations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ticket dispatching, elapsed cook times, and audio chimes.
          </p>
        </div>

        {/* Audio Chime Controls & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playKitchenChime();
              toast('Audio chime test played!', 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-600" />
            <span>Test Chime</span>
          </button>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              toast(soundEnabled ? 'Kitchen sound muted' : 'Kitchen sound enabled', 'info');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              soundEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* 3 Cooking Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0">
        {renderColumn('Pending Queue', 'PENDING', <AlertCircle className="text-blue-500 w-4 h-4" />, kots.filter(k => k.status === 'PENDING' || (k.status as any) === 'NEW').length)}
        {renderColumn('Cooking Station', 'PREPARING', <Flame className="text-amber-500 w-4 h-4" />, kots.filter(k => k.status === 'PREPARING').length)}
        {renderColumn('Ready for Waiter', 'READY', <CheckCircle className="text-emerald-500 w-4 h-4" />, kots.filter(k => k.status === 'READY').length)}
      </div>
    </div>
  );
}
