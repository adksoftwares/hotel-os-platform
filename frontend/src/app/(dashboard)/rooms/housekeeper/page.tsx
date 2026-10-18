"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowLeft, CheckCircle2, Clock, AlertTriangle, 
  Bed, Smartphone, Plus, Minus, Send, ShieldCheck, 
  RotateCcw, Check, RefreshCw, Wrench, Coffee, Droplets
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface MinibarItem {
  id: string;
  name: string;
  price: number;
  consumed: number;
}

interface AssignedRoom {
  id: string;
  roomNumber: string;
  type: string;
  floor: number;
  cleanType: 'Stayover' | 'Checkout Departure' | 'Deep Clean';
  status: 'DIRTY' | 'CLEANING' | 'CLEAN' | 'INSPECTED';
  priority: 'HIGH' | 'NORMAL' | 'VIP';
  guestName?: string;
  cleaningSeconds: number;
  isTimerRunning: boolean;
  minibar: MinibarItem[];
  checklist: {
    linens: boolean;
    towels: boolean;
    amenities: boolean;
    disinfection: boolean;
  };
}

const INITIAL_ASSIGNED_ROOMS: AssignedRoom[] = [
  {
    id: 'R101',
    roomNumber: '101',
    type: 'Deluxe King',
    floor: 1,
    cleanType: 'Checkout Departure',
    status: 'DIRTY',
    priority: 'HIGH',
    guestName: 'Departed (Robert Fox)',
    cleaningSeconds: 0,
    isTimerRunning: false,
    minibar: [
      { id: 'mb1', name: 'Evian Sparkling Water (500ml)', price: 6.0, consumed: 2 },
      { id: 'mb2', name: 'Belgian Dark Chocolate Bar', price: 8.0, consumed: 1 },
      { id: 'mb3', name: 'Heineken Lager Beer', price: 9.0, consumed: 0 },
      { id: 'mb4', name: 'Gourmet Roasted Cashews', price: 7.0, consumed: 0 },
    ],
    checklist: { linens: false, towels: false, amenities: false, disinfection: false }
  },
  {
    id: 'R102',
    roomNumber: '102',
    type: 'Standard Queen',
    floor: 1,
    cleanType: 'Stayover',
    status: 'CLEANING',
    priority: 'NORMAL',
    guestName: 'In-House (Jane Cooper)',
    cleaningSeconds: 520, // ~8 mins 40 secs
    isTimerRunning: true,
    minibar: [
      { id: 'mb1', name: 'Evian Sparkling Water (500ml)', price: 6.0, consumed: 1 },
      { id: 'mb2', name: 'Belgian Dark Chocolate Bar', price: 8.0, consumed: 0 },
      { id: 'mb3', name: 'Heineken Lager Beer', price: 9.0, consumed: 2 },
      { id: 'mb4', name: 'Gourmet Roasted Cashews', price: 7.0, consumed: 1 },
    ],
    checklist: { linens: true, towels: true, amenities: false, disinfection: false }
  },
  {
    id: 'R201',
    roomNumber: '201',
    type: 'Executive Suite',
    floor: 2,
    cleanType: 'Checkout Departure',
    status: 'DIRTY',
    priority: 'VIP',
    guestName: 'Arriving 2:00 PM (David Chen)',
    cleaningSeconds: 0,
    isTimerRunning: false,
    minibar: [
      { id: 'mb1', name: 'Evian Sparkling Water (500ml)', price: 6.0, consumed: 0 },
      { id: 'mb2', name: 'Belgian Dark Chocolate Bar', price: 8.0, consumed: 0 },
      { id: 'mb3', name: 'Heineken Lager Beer', price: 9.0, consumed: 0 },
      { id: 'mb4', name: 'Gourmet Roasted Cashews', price: 7.0, consumed: 0 },
    ],
    checklist: { linens: false, towels: false, amenities: false, disinfection: false }
  },
  {
    id: 'R202',
    roomNumber: '202',
    type: 'Ocean Deluxe',
    floor: 2,
    cleanType: 'Stayover',
    status: 'CLEAN',
    priority: 'NORMAL',
    guestName: 'In-House (Sarah Miller)',
    cleaningSeconds: 960,
    isTimerRunning: false,
    minibar: [
      { id: 'mb1', name: 'Evian Sparkling Water (500ml)', price: 6.0, consumed: 0 },
      { id: 'mb2', name: 'Belgian Dark Chocolate Bar', price: 8.0, consumed: 0 },
      { id: 'mb3', name: 'Heineken Lager Beer', price: 9.0, consumed: 0 },
      { id: 'mb4', name: 'Gourmet Roasted Cashews', price: 7.0, consumed: 0 },
    ],
    checklist: { linens: true, towels: true, amenities: true, disinfection: true }
  }
];

export default function HousekeeperPortal() {
  const { toast } = useToast();
  const [attendantName] = useState('Priya Selvam');
  const [rooms, setRooms] = useState<AssignedRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintDescription, setMaintDescription] = useState('');
  const [maintPriority, setMaintPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');

  // Load rooms from fleet storage
  const loadFleetRooms = () => {
    try {
      const saved = localStorage.getItem('hotel_room_board_state');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: AssignedRoom[] = parsed.map((p: any) => ({
            id: `R${p.roomNumber || p.id}`,
            roomNumber: String(p.roomNumber || p.id),
            type: p.type || 'Standard',
            floor: typeof p.floor === 'number' ? p.floor : 1,
            cleanType: 'Stayover',
            status: ((p.housekeeping || 'CLEAN').toUpperCase() as any),
            priority: 'NORMAL',
            guestName: p.currentGuest || 'Vacant',
            cleaningSeconds: 0,
            isTimerRunning: false,
            minibar: [
              { id: 'mb1', name: 'Evian Sparkling Water (500ml)', price: 6.0, consumed: 0 },
              { id: 'mb2', name: 'Belgian Dark Chocolate Bar', price: 8.0, consumed: 0 },
              { id: 'mb3', name: 'Heineken Lager Beer', price: 9.0, consumed: 0 },
              { id: 'mb4', name: 'Gourmet Roasted Cashews', price: 7.0, consumed: 0 },
            ],
            checklist: { linens: false, towels: false, amenities: false, disinfection: false }
          }));
          setRooms(mapped);
          setSelectedRoomId(prev => (mapped.some(m => m.id === prev) ? prev : mapped[0]?.id || ''));
          return;
        }
      }
      setRooms([]);
      setSelectedRoomId('');
    } catch (_) {
      setRooms([]);
      setSelectedRoomId('');
    }
  };

  useEffect(() => {
    loadFleetRooms();
    const handleUpdate = () => loadFleetRooms();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('hotel_rooms_changed', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('hotel_rooms_changed', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  // Live Stopwatch Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setRooms(prev => prev.map(r => {
        if (r.isTimerRunning) {
          return { ...r, cleaningSeconds: r.cleaningSeconds + 1 };
        }
        return r;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = (roomId: string) => {
    let nextState = false;
    let targetRoomNumber = '';
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        nextState = !r.isTimerRunning;
        targetRoomNumber = r.roomNumber;
        const newStatus = nextState ? 'CLEANING' : r.status;
        toast(nextState ? `Started cleaning timer for Room ${r.roomNumber}` : `Paused timer for Room ${r.roomNumber}`, 'info');
        return { ...r, isTimerRunning: nextState, status: newStatus };
      }
      return r;
    }));

    if (nextState && targetRoomNumber) {
      try {
        const roomBoard = JSON.parse(localStorage.getItem('hotel_room_board_state') || '[]');
        if (Array.isArray(roomBoard)) {
          const updated = roomBoard.map((r: any) => {
            if (String(r.roomNumber || r.id) === targetRoomNumber) {
              return { ...r, housekeeping: 'Cleaning' };
            }
            return r;
          });
          localStorage.setItem('hotel_room_board_state', JSON.stringify(updated));
          window.dispatchEvent(new Event('hotel_rooms_changed'));
        }
      } catch (_) {}
    }
  };

  const handleUpdateMinibar = (roomId: string, itemId: string, delta: number) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          minibar: r.minibar.map(item => {
            if (item.id === itemId) {
              const newCount = Math.max(0, item.consumed + delta);
              return { ...item, consumed: newCount };
            }
            return item;
          })
        };
      }
      return r;
    }));
  };

  const handlePostMinibarCharges = (room: AssignedRoom) => {
    const consumedTotal = room.minibar.reduce((acc, it) => acc + it.price * it.consumed, 0);
    if (consumedTotal === 0) {
      toast(`No minibar items consumed for Room ${room.roomNumber}`, 'info');
      return;
    }

    // 1. Post to Billing Folios in localStorage
    try {
      const existingFolios = JSON.parse(localStorage.getItem('hotel_billing_folios') || '[]');
      const targetRoom = String(room.roomNumber);
      let folio = existingFolios.find((f: any) => String(f.room) === targetRoom && f.status !== 'SETTLED');
      const consumedNames = room.minibar.filter(it => it.consumed > 0).map(it => `${it.name} x${it.consumed}`).join(', ');
      const newCharge = {
        date: new Date().toISOString().split('T')[0],
        description: `Minibar Restock (${consumedNames})`,
        amount: consumedTotal,
      };

      if (folio) {
        folio.charges = [...(folio.charges || []), newCharge];
        folio.totalCharges = (Number(folio.totalCharges) || 0) + consumedTotal;
        folio.balance = (Number(folio.balance) || 0) + consumedTotal;
      } else {
        const newFolio = {
          id: `FOL-${Math.random().toString(16).substr(2, 4).toUpperCase()}`,
          guest: room.guestName || `Guest in Room ${room.roomNumber}`,
          room: targetRoom,
          roomType: room.type,
          checkIn: new Date().toISOString().split('T')[0],
          checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          nights: 1,
          status: 'OPEN',
          balance: consumedTotal,
          totalCharges: consumedTotal,
          paidAmount: 0,
          charges: [newCharge],
        };
        existingFolios.unshift(newFolio);
      }
      localStorage.setItem('hotel_billing_folios', JSON.stringify(existingFolios));
      window.dispatchEvent(new Event('billing_updated'));
    } catch (_) {}

    toast(`Successfully posted Rs. ${consumedTotal.toFixed(2)} Minibar charges to Room ${room.roomNumber} folio!`, 'success');
  };

  const handleToggleChecklist = (roomId: string, key: keyof AssignedRoom['checklist']) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          checklist: {
            ...r.checklist,
            [key]: !r.checklist[key]
          }
        };
      }
      return r;
    }));
  };

  const handleMarkCleanAndInspect = (room: AssignedRoom) => {
    setRooms(prev => prev.map(r => {
      if (r.id === room.id) {
        return {
          ...r,
          status: 'CLEAN',
          isTimerRunning: false,
        };
      }
      return r;
    }));

    // Update Room Board state
    try {
      const roomBoard = JSON.parse(localStorage.getItem('hotel_room_board_state') || '[]');
      if (Array.isArray(roomBoard)) {
        const updated = roomBoard.map((r: any) => {
          if (String(r.roomNumber || r.id) === String(room.roomNumber)) {
            return { ...r, housekeeping: 'Clean' };
          }
          return r;
        });
        localStorage.setItem('hotel_room_board_state', JSON.stringify(updated));
        window.dispatchEvent(new Event('hotel_rooms_changed'));
      }
    } catch (_) {}

    toast(`Room ${room.roomNumber} marked CLEAN! Sent inspection request to Floor Supervisor.`, 'success');
  };

  const handleReportMaintenance = () => {
    if (!maintDescription.trim()) {
      toast("Please describe the maintenance issue", 'error');
      return;
    }
    const targetRoom = activeRoom?.roomNumber || '';
    
    // 1. Save issue to Maintenance Kanban board
    try {
      const existingIssues = JSON.parse(localStorage.getItem('hotel_maintenance_issues') || '[]');
      const newIssueItem = {
        id: Date.now().toString(),
        roomNumber: targetRoom,
        issue: maintDescription.trim(),
        priority: maintPriority,
        status: 'OPEN',
        reportedAt: 'Just now',
      };
      localStorage.setItem('hotel_maintenance_issues', JSON.stringify([newIssueItem, ...existingIssues]));
      window.dispatchEvent(new Event('maintenance_updated'));

      // 2. Mark room Operational status to 'Out of Order' in Room Board
      const roomBoard = JSON.parse(localStorage.getItem('hotel_room_board_state') || '[]');
      if (Array.isArray(roomBoard)) {
        const updatedRooms = roomBoard.map((r: any) => {
          if (String(r.roomNumber || r.id) === targetRoom) {
            return { ...r, operational: 'Out of Order' };
          }
          return r;
        });
        localStorage.setItem('hotel_room_board_state', JSON.stringify(updatedRooms));
        window.dispatchEvent(new Event('hotel_rooms_changed'));
      }
    } catch (_) {}

    toast(`Maintenance work order logged for Room ${targetRoom} [${maintPriority} priority]`, 'success');
    setShowMaintModal(false);
    setMaintDescription('');
  };

  const stats = {
    dirty: rooms.filter(r => r.status === 'DIRTY').length,
    cleaning: rooms.filter(r => r.status === 'CLEANING').length,
    clean: rooms.filter(r => r.status === 'CLEAN').length,
    inspected: rooms.filter(r => r.status === 'INSPECTED').length,
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-2 sm:px-4">
      {/* Top Mobile Housekeeping Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link 
              href="/rooms" 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
              title="Return to Rooms Management Board"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  HOUSEKEEPER MOBILE MAID PORTAL
                </span>
                <span className="text-xs text-slate-400">Attendant: <strong className="text-slate-200">{attendantName}</strong></span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
                Room Cleaning & Minibar Station
              </h1>
            </div>
          </div>

          {/* Shift KPI Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 font-bold border border-red-500/30">
              {stats.dirty} Dirty
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
              {stats.cleaning} In Progress
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
              {stats.clean} Clean
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Room Roster Left / Detailed Action Pad Right */}
      {rooms.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center mb-4 border border-slate-700">
            <Bed className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">No Assigned Rooms in Fleet</h2>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
            There are currently no rooms created in the hotel fleet. Once rooms are created, they will be listed here for housekeeping tasks and minibar tracking.
          </p>
          <Link
            href="/settings/rooms/new"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Room in Fleet</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Assigned Rooms Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">My Assigned Rooms</h2>
            <span className="text-xs text-slate-500">{rooms.length} Rooms Assigned</span>
          </div>

          <div className="space-y-2.5">
            {rooms.map(room => {
              const isSelected = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition relative overflow-hidden group shadow-sm ${
                    isSelected
                      ? 'bg-slate-800/90 border-sky-500/60 shadow-sky-500/10 ring-1 ring-sky-500/30'
                      : 'bg-slate-900 hover:bg-slate-800/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">Room {room.roomNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          room.priority === 'VIP' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          room.priority === 'HIGH' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                          'bg-slate-700/50 text-slate-300'
                        }`}>
                          {room.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{room.type} • Floor {room.floor}</p>
                      <p className="text-[11px] text-slate-500 mt-1 italic">{room.cleanType} ({room.guestName})</p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                        room.status === 'DIRTY' ? 'bg-red-500/20 text-red-400' :
                        room.status === 'CLEANING' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                        room.status === 'CLEAN' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {room.status}
                      </span>

                      {/* Live stopwatch mini pill */}
                      <div className="mt-2 flex items-center gap-1 text-xs font-mono font-bold text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
                        <Clock className={`w-3 h-3 ${room.isTimerRunning ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} />
                        {formatTimer(room.cleaningSeconds)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Room Cleaning Console */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col shadow-xl space-y-4">
          
          {/* Header of Active Room */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">Room {activeRoom.roomNumber}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {activeRoom.cleanType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeRoom.type} • {activeRoom.guestName}
              </p>
            </div>

            {/* Stopwatch Big Display & Start/Pause Button */}
            <div className="flex items-center gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <div className="text-right font-mono">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Cleaning Duration</div>
                <div className="text-xl font-bold text-emerald-400 tracking-wider">
                  {formatTimer(activeRoom.cleaningSeconds)}
                </div>
              </div>
              <button
                onClick={() => handleToggleTimer(activeRoom.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                  activeRoom.isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
              >
                {activeRoom.isTimerRunning ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    PAUSE TIMER
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    START CLEANING
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 1: Minibar Consumption Tracker */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Minibar Consumption & Restock</h3>
              </div>
              <button
                onClick={() => handlePostMinibarCharges(activeRoom)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Post to Folio
              </button>
            </div>

            <div className="space-y-2">
              {activeRoom.minibar.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="text-slate-400 ml-2 font-mono">Rs. {item.price.toFixed(2)} each</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Consumed:</span>
                    <button
                      onClick={() => handleUpdateMinibar(activeRoom.id, item.id, -1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-white w-4 text-center">{item.consumed}</span>
                    <button
                      onClick={() => handleUpdateMinibar(activeRoom.id, item.id, 1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Turn-down & Sanitation Checklist */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Standard Housekeeping Checklist
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label 
                onClick={() => handleToggleChecklist(activeRoom.id, 'linens')}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer select-none hover:bg-slate-800/50"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                  activeRoom.checklist.linens ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700 bg-slate-800'
                }`}>
                  {activeRoom.checklist.linens && <Check className="w-3 h-3" />}
                </div>
                <span className="text-slate-200 font-medium">Bed linens stripped & changed</span>
              </label>

              <label 
                onClick={() => handleToggleChecklist(activeRoom.id, 'towels')}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer select-none hover:bg-slate-800/50"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                  activeRoom.checklist.towels ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700 bg-slate-800'
                }`}>
                  {activeRoom.checklist.towels && <Check className="w-3 h-3" />}
                </div>
                <span className="text-slate-200 font-medium">Towels & bathrobes replenished</span>
              </label>

              <label 
                onClick={() => handleToggleChecklist(activeRoom.id, 'amenities')}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer select-none hover:bg-slate-800/50"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                  activeRoom.checklist.amenities ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700 bg-slate-800'
                }`}>
                  {activeRoom.checklist.amenities && <Check className="w-3 h-3" />}
                </div>
                <span className="text-slate-200 font-medium">Bathroom amenities & soap restocked</span>
              </label>

              <label 
                onClick={() => handleToggleChecklist(activeRoom.id, 'disinfection')}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer select-none hover:bg-slate-800/50"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                  activeRoom.checklist.disinfection ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700 bg-slate-800'
                }`}>
                  {activeRoom.checklist.disinfection && <Check className="w-3 h-3" />}
                </div>
                <span className="text-slate-200 font-medium">High-touch surfaces disinfected</span>
              </label>
            </div>
          </div>

          {/* Master Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setShowMaintModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition"
            >
              <Wrench className="w-4 h-4" />
              Report Maintenance Issue
            </button>

            <button
              onClick={() => handleMarkCleanAndInspect(activeRoom)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-lg shadow-sky-600/20 flex items-center gap-2 active:scale-95 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              MARK CLEAN & REQUEST INSPECTION
            </button>
          </div>

        </div>
      </div>
      )}

      {/* Maintenance Report Modal */}
      {showMaintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Report Damage / Defect in Room {activeRoom?.roomNumber || ''}
              </h3>
              <button 
                onClick={() => setShowMaintModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >✕</button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Priority Level</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setMaintPriority(p)}
                      className={`py-1.5 rounded-lg font-bold text-center border transition ${
                        maintPriority === p 
                          ? 'bg-amber-600 text-white border-amber-500' 
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Issue Description</label>
                <textarea
                  rows={3}
                  value={maintDescription}
                  onChange={(e) => setMaintDescription(e.target.value)}
                  placeholder="e.g. Bathroom shower head leaking; bedside lamp socket loose..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowMaintModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReportMaintenance}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20"
              >
                Submit Work Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
