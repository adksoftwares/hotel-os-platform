"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Plus, Search, Filter, Wrench, 
  CheckCircle2, BedDouble, AlertCircle, RefreshCw, 
  ExternalLink, UserCheck, ShieldCheck, Trash2, X, AlertTriangle
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Panel } from '@/components/ui/Panel';

import { 
  RoomItem, 
  loadHotelRoomsFleet, 
  saveHotelRoomsFleet, 
  SAMPLE_ROOMS_FLEET 
} from '@/lib/hotelRoomsFleet';

export default function RoomBoardPage() {
  const [filter, setFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState<number | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoomItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load persisted rooms from localStorage
  const loadRooms = () => {
    const loaded = loadHotelRoomsFleet();
    setRooms(loaded);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadRooms();
    const handleUpdate = () => loadRooms();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('hotel_rooms_changed', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('hotel_rooms_changed', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const saveRooms = (newRooms: RoomItem[]) => {
    setRooms(newRooms);
    try {
      localStorage.setItem('hotel_room_board_state', JSON.stringify(newRooms));
      window.dispatchEvent(new Event('hotel_rooms_changed'));
    } catch (e) {}
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updated = rooms.filter(r => r.id !== deleteTarget.id);
    saveRooms(updated);
    setDeleteTarget(null);
  };

  const handleConfirmClearAll = () => {
    saveRooms([]);
    setShowClearConfirm(false);
  };

  const handleLoadDemoFleet = () => {
    saveRooms(SAMPLE_ROOMS_FLEET);
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
            {rooms.length > 0 && (
              <button 
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="hotel-button hotel-button-secondary text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                title="Delete all rooms in fleet"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Fleet</span>
              </button>
            )}
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

      {/* Empty Fleet State */}
      {rooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto my-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <BedDouble className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">No Rooms in Fleet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              All demo rooms have been cleared. Click below to add your first room with custom room number and attributes.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/settings/rooms/new"
              className="hotel-button hotel-button-emerald text-xs px-4 py-2.5 flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Room</span>
            </Link>
            <button
              type="button"
              onClick={handleLoadDemoFleet}
              className="hotel-button hotel-button-secondary text-xs px-3.5 py-2"
            >
              <span>Load Sample Fleet</span>
            </button>
          </div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No rooms match the selected filter or search query.
        </div>
      ) : (
        /* Room Grid */
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
                  
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={room.occupancy} size="sm" />
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(room)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      title={`Delete Room ${room.roomNumber}`}
                      aria-label={`Delete Room ${room.roomNumber}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Room Body Details */}
                <div className="p-3.5 space-y-2.5 text-xs flex-1">
                  {/* Guest or Status Info */}
                  {isOccupied ? (
                    <div className="p-2 rounded bg-blue-50/60 border border-blue-100/80">
                      <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{room.currentGuest || 'Registered Guest'}</span>
                      </div>
                      {room.reservation && (
                        <p className="text-[11px] text-blue-700/80 mt-0.5">{room.reservation}</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-between">
                      <span>Rate / Night</span>
                      <span className="font-semibold text-slate-800">Rs. {room.pricePerNight}</span>
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
      )}

      {/* Single Room Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-sm w-full p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50/80 shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Delete Room {deleteTarget.roomNumber}?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              This will permanently remove Room {deleteTarget.roomNumber} ({deleteTarget.type}) from your hotel fleet.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Yes, Delete Room
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Fleet Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-sm w-full p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 ring-8 ring-amber-50/80 shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Clear All Rooms?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              This will remove all {rooms.length} rooms currently configured in your fleet.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Clear Entire Fleet
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
