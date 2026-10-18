"use client";
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, List, Plus, Search, Filter, 
  ChevronLeft, ChevronRight, Bed, User, Clock, CheckCircle2, 
  AlertCircle, DollarSign, ArrowRight, X, Phone, Mail, FileText, Check
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface Reservation {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  roomNumber: string;
  roomType: 'Standard Queen' | 'Deluxe King' | 'Executive Suite' | 'Presidential Suite';
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  totalAmount: number;
  paidAmount: number;
  vip?: boolean;
}

const mockRooms = [
  { number: '101', type: 'Standard Queen', housekeeping: 'CLEAN', floor: '1st Floor' },
  { number: '102', type: 'Standard Queen', housekeeping: 'DIRTY', floor: '1st Floor' },
  { number: '103', type: 'Standard Queen', housekeeping: 'CLEAN', floor: '1st Floor' },
  { number: '201', type: 'Deluxe King', housekeeping: 'INSPECTED', floor: '2nd Floor' },
  { number: '202', type: 'Deluxe King', housekeeping: 'CLEAN', floor: '2nd Floor' },
  { number: '205', type: 'Deluxe King', housekeeping: 'DIRTY', floor: '2nd Floor' },
  { number: '301', type: 'Executive Suite', housekeeping: 'INSPECTED', floor: '3rd Floor' },
  { number: '305', type: 'Executive Suite', housekeeping: 'CLEAN', floor: '3rd Floor' },
  { number: '401', type: 'Presidential Suite', housekeeping: 'INSPECTED', floor: '4th Floor' },
];

const initialReservations: Reservation[] = [];

export default function ReservationsPage() {
  const { toast } = useToast();
  const [view, setView] = useState<'tapechart' | 'list'>('tapechart');
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Tape chart timeline dates generation (10 days starting Oct 11, 2026)
  const baseDate = new Date(2026, 9, 11); // Oct 11, 2026
  const timelineDates = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isToday: i === 0,
    };
  });

  // Modal Escape listener
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewModal(false);
        setSelectedRes(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    roomNumber: '101',
    roomType: 'Standard Queen' as Reservation['roomType'],
    checkIn: '2026-10-11',
    checkOut: '2026-10-13',
    ratePerNight: 160,
    advancePaid: 0,
    vip: false,
  });

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guestName.trim()) {
      toast('Guest name is required', 'error');
      return;
    }
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)));
    const totalAmount = nights * formData.ratePerNight;

    const newRes: Reservation = {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: formData.guestName,
      email: formData.email || 'guest@hotel.com',
      phone: formData.phone || '+1 555 0192',
      roomNumber: formData.roomNumber,
      roomType: formData.roomType,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights,
      status: 'CONFIRMED',
      totalAmount,
      paidAmount: Number(formData.advancePaid) || 0,
      vip: formData.vip,
    };

    setReservations([newRes, ...reservations]);
    setShowNewModal(false);
    toast(`Reservation ${newRes.id} confirmed for ${newRes.guestName}!`, 'success');
  };

  const handleCheckIn = (resId: string) => {
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'CHECKED_IN' } : r));
    if (selectedRes && selectedRes.id === resId) {
      setSelectedRes({ ...selectedRes, status: 'CHECKED_IN' });
    }
    toast('Guest successfully checked in! Keycard encoding trigger sent.', 'success');
  };

  const handleCheckOut = (resId: string) => {
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'CHECKED_OUT' } : r));
    if (selectedRes && selectedRes.id === resId) {
      setSelectedRes({ ...selectedRes, status: 'CHECKED_OUT' });
    }
    toast('Guest checked out. Room marked Dirty for housekeeping inspection.', 'info');
  };

  const handleExtendStay = (resId: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === resId) {
        const d = new Date(r.checkOut);
        d.setDate(d.getDate() + 1);
        const newCheckOut = d.toISOString().split('T')[0];
        const newNights = r.nights + 1;
        const rate = r.totalAmount / r.nights;
        return {
          ...r,
          checkOut: newCheckOut,
          nights: newNights,
          totalAmount: r.totalAmount + rate,
        };
      }
      return r;
    }));
    toast('Stay extended by +1 night. Folio charges updated.', 'success');
  };

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.roomNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Room Rack & Reservations</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Tape Chart
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visual room allocation, timeline occupancy grid, and guest folio management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setView('tapechart')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'tapechart'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Tape Chart</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table List</span>
            </button>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Reservation</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* VIEW 1: INTERACTIVE ROOM RACK TAPE CHART */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {view === 'tapechart' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Tape chart controls & legend */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <span className="font-semibold text-slate-700">Timeline Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                <span className="text-slate-600">Checked-In</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-500"></span>
                <span className="text-slate-600">Confirmed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-purple-500"></span>
                <span className="text-slate-600">VIP Suite</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-300"></span>
                <span className="text-slate-600">Vacant</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">October 2026</span>
            </div>
          </div>

          {/* Gantt Grid Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header: Dates */}
              <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-100/80 text-xs font-semibold text-slate-700">
                <div className="col-span-2 p-3.5 border-r border-slate-200 flex items-center justify-between">
                  <span>Room & Status</span>
                  <span className="text-[10px] text-slate-400 font-normal">9 Rooms</span>
                </div>
                {timelineDates.map((td) => (
                  <div
                    key={td.dateStr}
                    className={`col-span-1 p-2 text-center border-r border-slate-200 last:border-r-0 ${
                      td.isToday ? 'bg-blue-50/80 text-blue-700 font-bold' : td.isWeekend ? 'bg-slate-50' : ''
                    }`}
                  >
                    <div className="text-[10px] uppercase text-slate-400">{td.dayName}</div>
                    <div className="text-sm font-bold">{td.dayNumber}</div>
                  </div>
                ))}
              </div>

              {/* Rows: Rooms & Horizontal Booking Blocks */}
              <div className="divide-y divide-slate-100">
                {mockRooms.map((room) => {
                  const roomReservations = reservations.filter(r => r.roomNumber === room.number && r.status !== 'CANCELLED');

                  return (
                    <div key={room.number} className="grid grid-cols-12 relative min-h-[56px] hover:bg-slate-50/50 transition-colors">
                      {/* Left Room Info Column */}
                      <div className="col-span-2 p-3 border-r border-slate-200 flex items-center justify-between bg-white sticky left-0 z-10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">Room {room.number}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              room.housekeeping === 'INSPECTED' ? 'bg-emerald-100 text-emerald-800' :
                              room.housekeeping === 'CLEAN' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {room.housekeeping[0]}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-none mt-1">{room.type}</p>
                        </div>
                      </div>

                      {/* Day Grid Background Cells */}
                      {timelineDates.map((td) => (
                        <div
                          key={td.dateStr}
                          className={`col-span-1 border-r border-slate-100 last:border-r-0 h-full ${
                            td.isWeekend ? 'bg-slate-50/40' : ''
                          }`}
                        />
                      ))}

                      {/* Overlaid Booking Blocks */}
                      <div className="absolute left-[16.666%] right-0 top-0 bottom-0 pointer-events-none flex items-center">
                        {roomReservations.map((res) => {
                          // Calculate start offset & width
                          const checkInIdx = timelineDates.findIndex(td => td.dateStr === res.checkIn);
                          const checkOutIdx = timelineDates.findIndex(td => td.dateStr === res.checkOut);

                          const startDay = checkInIdx !== -1 ? checkInIdx : 0;
                          const endDay = checkOutIdx !== -1 ? checkOutIdx : (checkInIdx + res.nights);
                          const durationDays = Math.max(1, endDay - startDay);

                          const leftPct = (startDay / 10) * 100;
                          const widthPct = (durationDays / 10) * 100;

                          return (
                            <div
                              key={res.id}
                              onClick={() => setSelectedRes(res)}
                              style={{
                                left: `${leftPct}%`,
                                width: `${Math.min(100 - leftPct, widthPct)}%`,
                              }}
                              className={`absolute pointer-events-auto h-10 rounded-xl px-3 py-1 cursor-pointer shadow-sm hover:shadow-md transition-all flex items-center justify-between text-white text-xs select-none border ${
                                res.vip
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400'
                                  : res.status === 'CHECKED_IN'
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400'
                                  : 'bg-gradient-to-r from-blue-600 to-sky-600 border-blue-400'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <span className="font-bold truncate">{res.guestName}</span>
                                <span className="hidden sm:inline-block text-[10px] text-white/80 ml-1.5">
                                  ({res.nights}n · Rs. {res.totalAmount})
                                </span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-mono shrink-0">
                                {res.status === 'CHECKED_IN' ? 'In-House' : 'Confirmed'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* VIEW 2: FILTERED TABLE LIST VIEW */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {view === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Search & Filters */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search guest name, booking ID, room number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked-In</option>
                <option value="CHECKED_OUT">Checked-Out</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Guest Details</th>
                  <th className="p-4">Room</th>
                  <th className="p-4">Stay Dates</th>
                  <th className="p-4">Billing Status</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No reservations found. Click "+ New Booking Reservation" to create a guest reservation.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">
                      {res.id}
                      {res.vip && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-bold">
                          VIP
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{res.guestName}</p>
                      <p className="text-slate-400 text-[11px]">{res.email} · {res.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">Room {res.roomNumber}</span>
                      <p className="text-[11px] text-slate-400">{res.roomType}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-700 font-medium">{res.checkIn} → {res.checkOut}</span>
                      <p className="text-[11px] text-slate-400">{res.nights} Nights</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">Rs. {res.totalAmount.toFixed(2)}</p>
                      <p className={`text-[11px] ${res.paidAmount >= res.totalAmount ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {res.paidAmount >= res.totalAmount ? 'Fully Settled' : `Due: Rs. ${(res.totalAmount - res.paidAmount).toFixed(2)}`}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        res.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' :
                        res.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedRes(res)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* QUICK RESERVATION DRAWER MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/20 text-white">{selectedRes.id}</span>
                  {selectedRes.vip && <span className="text-xs px-2 py-0.5 rounded bg-purple-500 font-bold">VIP GUEST</span>}
                </div>
                <h2 className="text-xl font-bold mt-1.5">{selectedRes.guestName}</h2>
                <p className="text-xs text-slate-300">Room {selectedRes.roomNumber} · {selectedRes.roomType}</p>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-5 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Check-In Date</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedRes.checkIn}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Check-Out Date</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedRes.checkOut}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedRes.nights} Nights</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Status</span>
                  <p className="font-bold text-emerald-600 mt-0.5">{selectedRes.status}</p>
                </div>
              </div>

              {/* Financial Folio Summary */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span>Room Charges:</span>
                  <span className="font-bold text-slate-900">Rs. {selectedRes.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Advance Paid:</span>
                  <span className="font-bold">-Rs. {selectedRes.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                  <span>Balance Outstanding:</span>
                  <span className="text-blue-600">Rs. {Math.max(0, selectedRes.totalAmount - selectedRes.paidAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* Guest Contact */}
              <div className="flex flex-col gap-1.5 text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedRes.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedRes.phone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {selectedRes.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCheckIn(selectedRes.id)}
                    className="col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Check-In Guest & Issue Keycard</span>
                  </button>
                )}

                {selectedRes.status === 'CHECKED_IN' && (
                  <>
                    <button
                      onClick={() => handleExtendStay(selectedRes.id)}
                      className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold transition-colors"
                    >
                      Extend Stay (+1 Night)
                    </button>
                    <button
                      onClick={() => handleCheckOut(selectedRes.id)}
                      className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors"
                    >
                      Process Check-Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* ENTERPRISE ADD NEW RESERVATION MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create New Reservation</h3>
                <p className="text-xs text-slate-400">Direct booking entry with live room allocation</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Guest Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Christopher Nolan"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+1 555 0192"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-In Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-Out Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allocate Room *</label>
                  <select
                    value={formData.roomNumber}
                    onChange={(e) => {
                      const r = mockRooms.find(m => m.number === e.target.value);
                      setFormData({ 
                        ...formData, 
                        roomNumber: e.target.value,
                        roomType: (r ? r.type : 'Standard Queen') as any,
                        ratePerNight: r?.type.includes('Presidential') ? 800 : r?.type.includes('Executive') ? 350 : r?.type.includes('Deluxe') ? 225 : 160
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {mockRooms.map(r => (
                      <option key={r.number} value={r.number}>
                        Room {r.number} - {r.type} ({r.housekeeping})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rate Per Night (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.ratePerNight}
                    onChange={(e) => setFormData({ ...formData, ratePerNight: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advance Deposit (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={formData.advancePaid}
                    onChange={(e) => setFormData({ ...formData, advancePaid: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vip}
                      onChange={(e) => setFormData({ ...formData, vip: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Flag as VIP Guest</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
