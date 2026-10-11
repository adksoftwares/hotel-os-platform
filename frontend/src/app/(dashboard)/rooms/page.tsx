"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Plus, Search, Filter, Wrench, 
  CheckCircle2, BedDouble, AlertCircle, RefreshCw, 
  ExternalLink, UserCheck, ShieldCheck
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Panel } from '@/components/ui/Panel';

interface RoomItem {
  id: string;
  roomNumber: string;
  type: string;
  floor: number;
  occupancy: 'Vacant' | 'Occupied';
  housekeeping: 'Clean' | 'Dirty' | 'Cleaning' | 'Inspected';
  operational: 'In Service' | 'Out of Order';
  currentGuest?: string;
  reservation?: string;
  pricePerNight: number;
}

const DEFAULT_ROOMS_FLEET: RoomItem[] = [
  { id: '101', roomNumber: '101', type: 'Deluxe King', floor: 1, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'David Miller', reservation: 'RES-4401', pricePerNight: 180 },
  { id: '102', roomNumber: '102', type: 'Deluxe King', floor: 1, occupancy: 'Vacant', housekeeping: 'Dirty', operational: 'In Service', reservation: 'None', pricePerNight: 180 },
  { id: '103', roomNumber: '103', type: 'Twin Executive', floor: 1, occupancy: 'Vacant', housekeeping: 'Inspected', operational: 'In Service', reservation: 'None', pricePerNight: 160 },
  { id: '104', roomNumber: '104', type: 'Twin Executive', floor: 1, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'Elena Rostova', reservation: 'RES-4405', pricePerNight: 160 },
  { id: '201', roomNumber: '201', type: 'Executive Suite', floor: 2, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'Sarah Jenkins (VIP)', reservation: 'RES-4410', pricePerNight: 280 },
  { id: '202', roomNumber: '202', type: 'Executive Suite', floor: 2, occupancy: 'Vacant', housekeeping: 'Cleaning', operational: 'In Service', reservation: 'None', pricePerNight: 280 },
  { id: '203', roomNumber: '203', type: 'Deluxe King', floor: 2, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', reservation: 'None', pricePerNight: 180 },
  { id: '204', roomNumber: '204', type: 'Deluxe King', floor: 2, occupancy: 'Occupied', housekeeping: 'Dirty', operational: 'In Service', currentGuest: 'Carlos Gomez', reservation: 'RES-4412', pricePerNight: 180 },
  { id: '301', roomNumber: '301', type: 'Ocean Panorama Suite', floor: 3, occupancy: 'Vacant', housekeeping: 'Inspected', operational: 'In Service', reservation: 'None', pricePerNight: 350 },
  { id: '302', roomNumber: '302', type: 'Ocean Panorama Suite', floor: 3, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'Michael Chang', reservation: 'RES-4418', pricePerNight: 350 },
  { id: '303', roomNumber: '303', type: 'Family Studio', floor: 3, occupancy: 'Vacant', housekeeping: 'Dirty', operational: 'Out of Order', reservation: 'None', pricePerNight: 220 },
  { id: '401', roomNumber: '401', type: 'Presidential Penthouse', floor: 4, occupancy: 'Occupied', housekeeping: 'Inspected', operational: 'In Service', currentGuest: 'Ambassador Al-Mansoor', reservation: 'RES-4420', pricePerNight: 750 },
];

export default function RoomBoardPage() {
  const [filter, setFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState<number | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<RoomItem[]>(DEFAULT_ROOMS_FLEET);

  // Load persisted room modifications from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hotel_room_board_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRooms(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const saveRooms = (newRooms: RoomItem[]) => {
    setRooms(newRooms);
    try {
      localStorage.setItem('hotel_room_board_state', JSON.stringify(newRooms));
    } catch (e) {}
  };

  const handleAction = (id: string, action: string) => {
    const updated = rooms.map(room => {
      if (room.id === id) {
        if (action === 'Mark Dirty') return { ...room, housekeeping: 'Dirty' as const };
        if (action === 'Mark Cleaning') return { ...room, housekeeping: 'Cleaning' as const };
        if (action === 'Mark Clean') return { ...room, housekeeping: 'Clean' as const };
        if (action === 'Inspect') return { ...room, housekeeping: 'Inspected' as const };
        if (action === 'Report Maintenance') return { ...room, operational: 'Out of Order' as const };
        if (action === 'Clear Maintenance') return { ...room, operational: 'In Service' as const };
      }
      return room;
    });
    saveRooms(updated);
  };

  const filteredRooms = rooms.filter(room => {
    // Floor filter
    if (floorFilter !== 'All' && room.floor !== floorFilter) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = room.roomNumber.toLowerCase().includes(q);
      const matchType = room.type.toLowerCase().includes(q);
      const matchGuest = room.currentGuest?.toLowerCase().includes(q);
      if (!matchNum && !matchType && !matchGuest) return false;
    }

    // Status filter
    if (filter === 'All') return true;
    if (filter === 'Vacant') return room.occupancy === 'Vacant';
    if (filter === 'Occupied') return room.occupancy === 'Occupied';
    if (filter === 'Dirty') return room.housekeeping === 'Dirty';
    if (filter === 'Clean') return room.housekeeping === 'Clean' || room.housekeeping === 'Inspected';
    if (filter === 'Inspected') return room.housekeeping === 'Inspected';
    if (filter === 'Maintenance') return room.operational !== 'In Service';
    return true;
  });

  const totalRooms = rooms.length;
  const vacantRooms = rooms.filter(r => r.occupancy === 'Vacant').length;
  const occupiedRooms = rooms.filter(r => r.occupancy === 'Occupied').length;
  const dirtyRooms = rooms.filter(r => r.housekeeping === 'Dirty').length;
  const cleanRooms = rooms.filter(r => r.housekeeping === 'Clean' || r.housekeeping === 'Inspected').length;
  const maintenanceRooms = rooms.filter(r => r.operational !== 'In Service').length;

  return (
    <div className="hotel-page">
      <PageHeader
        title="Operational Room Board"
        description="Unified visual board for front desk receptionists, room attendants, and executive housekeepers."
        action={
          <div className="flex items-center gap-2">
            <Link 
              href="/rooms/housekeeper" 
              className="hotel-button hotel-button-secondary text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Maid Portal</span>
            </Link>
            <Link 
              href="/settings/rooms/new" 
              className="hotel-button hotel-button-emerald text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Room</span>
            </Link>
          </div>
        }
      />

      {/* Quick Status Pill Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'All', label: 'All Rooms', count: totalRooms },
            { id: 'Vacant', label: 'Vacant', count: vacantRooms },
            { id: 'Occupied', label: 'Occupied', count: occupiedRooms },
            { id: 'Clean', label: 'Clean / Ready', count: cleanRooms },
            { id: 'Dirty', label: 'Dirty', count: dirtyRooms },
            { id: 'Maintenance', label: 'Maintenance', count: maintenanceRooms },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filter === item.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filter === item.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Floor Filter & Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room or guest..."
              className="hotel-input pl-8 py-1.5 min-h-[34px] text-xs"
            />
          </div>

          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
            className="hotel-input min-h-[34px] text-xs py-1 px-2.5 w-auto"
            aria-label="Filter by floor"
          >
            <option value="All">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
            <option value="4">Floor 4 (Penthouse)</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isOccupied = room.occupancy === 'Occupied';
          const isDirty = room.housekeeping === 'Dirty';
          const isMaintenance = room.operational !== 'In Service';
          const isInspected = room.housekeeping === 'Inspected';

          return (
            <div
              key={room.id}
              className={`bg-white rounded-lg border transition-all hover:shadow-md flex flex-col justify-between ${
                isMaintenance 
                  ? 'border-orange-300 ring-1 ring-orange-100' 
                  : isDirty
                  ? 'border-rose-200'
                  : isInspected
                  ? 'border-emerald-300 ring-1 ring-emerald-50'
                  : 'border-slate-200'
              }`}
            >
              {/* Room Header Strip */}
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/rooms/${room.id}`}
                      className="text-xl font-bold text-slate-900 hover:text-emerald-800 transition-colors tracking-tight"
                    >
                      Room {room.roomNumber}
                    </Link>
                    <span className="text-[11px] text-slate-400 font-medium">Floor {room.floor}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{room.type}</p>
                </div>
                
                <StatusBadge status={room.occupancy} size="sm" />
              </div>

              {/* Room Body Details */}
              <div className="p-3.5 space-y-2.5 text-xs flex-1">
                {/* Guest or Status Info */}
                {isOccupied ? (
                  <div className="p-2 rounded bg-blue-50/60 border border-blue-100/80">
                    <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{room.currentGuest}</span>
                    </div>
                    {room.reservation && (
                      <p className="text-[11px] text-blue-700/80 mt-0.5">{room.reservation}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-2 rounded bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-between">
                    <span>Rate / Night</span>
                    <span className="font-semibold text-slate-800">${room.pricePerNight}</span>
                  </div>
                )}

                {/* Status Indicator Pairs */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Housekeeping:</span>
                    <StatusBadge status={room.housekeeping} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Operational:</span>
                    <StatusBadge status={room.operational} size="sm" />
                  </div>
                </div>
              </div>

              {/* Operational Action Buttons Bar */}
              <div className="p-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  {room.housekeeping === 'Dirty' && (
                    <button
                      onClick={() => handleAction(room.id, 'Mark Clean')}
                      className="px-2 py-1 rounded bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold transition-colors"
                      title="Mark room as cleaned"
                    >
                      Cleaned
                    </button>
                  )}
                  {room.housekeeping === 'Clean' && (
                    <button
                      onClick={() => handleAction(room.id, 'Inspect')}
                      className="px-2 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      title="Supervisor inspect and certify room"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      Inspect
                    </button>
                  )}
                  {(room.housekeeping === 'Clean' || room.housekeeping === 'Inspected') && (
                    <button
                      onClick={() => handleAction(room.id, 'Mark Dirty')}
                      className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 text-[11px] font-medium transition-colors"
                      title="Mark room as dirty"
                    >
                      Set Dirty
                    </button>
                  )}
                </div>

                {isMaintenance ? (
                  <button
                    onClick={() => handleAction(room.id, 'Clear Maintenance')}
                    className="px-2 py-1 rounded bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold transition-colors"
                  >
                    Release OOS
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(room.id, 'Report Maintenance')}
                    className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-orange-700 hover:bg-orange-50 text-[11px] font-medium transition-colors"
                    title="Report maintenance issue"
                  >
                    Report Issue
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
