"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { 
  Plus, Trash2, UserPlus, Users, CheckCircle, Moon, 
  ArrowRight, Check, AlertTriangle, ShieldCheck, DollarSign,
  Printer, LogIn, LogOut, Bed, Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

type AccompanyingGuest = {
  id: string;
  name: string;
  nic: string;
  phone: string;
};

interface ArrivalItem {
  id: string;
  guest: string;
  roomNumber: string;
  roomType: string;
  eta: string;
  status: 'Pending' | 'Checked-In' | 'Due Out';
  accompanying: AccompanyingGuest[];
}

const initialArrivals: ArrivalItem[] = [
  {
    id: 'ARR-101',
    guest: 'Jonathan Sterling',
    roomNumber: '201',
    roomType: 'Deluxe King',
    eta: '14:30',
    status: 'Pending',
    accompanying: [{ id: '1', name: 'Claire Sterling', nic: 'UK-921820', phone: '+44 7700 9001' }]
  },
  {
    id: 'ARR-102',
    guest: 'Beatriz Gomez',
    roomNumber: '102',
    roomType: 'Standard Queen',
    eta: '16:00',
    status: 'Pending',
    accompanying: []
  },
  {
    id: 'ARR-103',
    guest: 'Ambassador Pierre Dubois',
    roomNumber: '401',
    roomType: 'Presidential Suite',
    eta: '11:15',
    status: 'Checked-In',
    accompanying: [{ id: '2', name: 'Marie Dubois', nic: 'FR-88912', phone: '+33 6 1234' }]
  },
  {
    id: 'ARR-104',
    guest: 'Kenji Takahashi',
    roomNumber: '305',
    roomType: 'Executive Suite',
    eta: '19:45',
    status: 'Pending',
    accompanying: []
  }
];

export default function FrontDesk() {
  const { toast } = useToast();
  const [arrivals, setArrivals] = useState<ArrivalItem[]>(initialArrivals);
  const [modalState, setModalState] = useState<{
    type: 'none' | 'walkin' | 'checkin' | 'alert' | 'nightaudit';
    arrivalId?: string;
    message?: string;
  }>({ type: 'none' });

  // Walk-In & Check-In Forms State
  const [primaryGuest, setPrimaryGuest] = useState({ name: '', nic: '', phone: '', roomNumber: '103' });
  const [accompanyingGuests, setAccompanyingGuests] = useState<AccompanyingGuest[]>([]);

  // Night Audit Wizard Step
  const [auditStep, setAuditStep] = useState(1);
  const [auditComplete, setAuditComplete] = useState(false);

  const openWalkIn = () => {
    setPrimaryGuest({ name: '', nic: '', phone: '', roomNumber: '103' });
    setAccompanyingGuests([]);
    setModalState({ type: 'walkin' });
  };

  const openCheckIn = (arrival: ArrivalItem) => {
    setPrimaryGuest({ name: arrival.guest, nic: '', phone: '', roomNumber: arrival.roomNumber });
    setAccompanyingGuests(arrival.accompanying || []);
    setModalState({ type: 'checkin', arrivalId: arrival.id });
  };

  const addAccompanying = () => {
    setAccompanyingGuests([...accompanyingGuests, { id: Date.now().toString(), name: '', nic: '', phone: '' }]);
  };

  const removeAccompanying = (id: string) => {
    setAccompanyingGuests(accompanyingGuests.filter(g => g.id !== id));
  };

  const updateAccompanying = (id: string, field: keyof AccompanyingGuest, value: string) => {
    setAccompanyingGuests(accompanyingGuests.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const submitWalkIn = () => {
    if (primaryGuest.name.trim()) {
      const newArrival: ArrivalItem = {
        id: `WALK-${Math.floor(100 + Math.random() * 900)}`,
        guest: primaryGuest.name,
        roomNumber: primaryGuest.roomNumber,
        roomType: 'Walk-In Special',
        eta: 'Now',
        status: 'Checked-In',
        accompanying: accompanyingGuests
      };
      setArrivals([newArrival, ...arrivals]);
      setModalState({ type: 'none' });
      toast(`Walk-In registered! Room ${primaryGuest.roomNumber} assigned to ${primaryGuest.name}.`, 'success');
    }
  };

  const submitCheckIn = () => {
    if (modalState.arrivalId) {
      setArrivals(prev => prev.map(arr => 
        arr.id === modalState.arrivalId ? { 
          ...arr, 
          status: 'Checked-In', 
          guest: primaryGuest.name,
          accompanying: accompanyingGuests 
        } : arr
      ));
      setModalState({ type: 'none' });
      toast(`Guest ${primaryGuest.name} checked in successfully. Digital keycard encoded.`, 'success');
    }
  };

  const startNightAudit = () => {
    setAuditStep(1);
    setAuditComplete(false);
    setModalState({ type: 'nightaudit' });
  };

  const advanceNightAudit = () => {
    if (auditStep < 4) {
      setAuditStep(auditStep + 1);
    } else {
      setAuditComplete(true);
      toast('Night Audit Complete! Business Date rolled over to Oct 12, 2026.', 'success');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Front Desk Operations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time guest arrivals, walk-in registration, and End-of-Day Night Audit wizard.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={startNightAudit}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Moon className="w-4 h-4 text-indigo-600" />
            <span>Night Audit Wizard</span>
          </button>
          <button 
            onClick={openWalkIn} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> 
            <span>+ New Walk-In</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Metric Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Expected Arrivals</p>
            <p className="text-xl font-bold text-slate-800 mt-1">4 Guests</p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <LogIn className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">In-House Guests</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">12 Guests</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Bed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Departures Today</p>
            <p className="text-xl font-bold text-amber-600 mt-1">3 Check-Outs</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <LogOut className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Occupancy Rate</p>
            <p className="text-xl font-bold text-indigo-600 mt-1">78.5%</p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Arrivals Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Today&apos;s Expected Arrivals
              </h2>
              <span className="text-xs text-slate-400">Total: {arrivals.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Guest Details</th>
                    <th className="px-4 py-3">Assigned Room</th>
                    <th className="px-4 py-3">ETA</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {arrivals.map((arr) => (
                    <tr key={arr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{arr.guest}</div>
                        {arr.accompanying?.length > 0 && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            +{arr.accompanying.length} Accompanying Guest(s)
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-700">Room {arr.roomNumber}</span>
                        <p className="text-[11px] text-slate-400">{arr.roomType}</p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{arr.eta}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          arr.status === 'Checked-In'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {arr.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {arr.status === 'Pending' ? (
                          <button 
                            onClick={() => openCheckIn(arr)} 
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Check-In
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Keycard Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Keycard Encoding & Quick Room Status */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              IoT Keycard Encoder (Assa Abloy)
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center font-bold">
                NFC
              </div>
              <p className="text-xs font-semibold text-slate-700">RFID Encoder Station 1</p>
              <p className="text-[11px] text-slate-400">Place hotel keycard on the desk pad to encode room credentials.</p>
              <button
                onClick={() => toast('Keycard NFC Token programmed for Room 201!', 'success')}
                className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors mt-2"
              >
                Encode Test Keycard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* ENTERPRISE NIGHT AUDIT AUTOMATION WIZARD MODAL */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <Modal 
        isOpen={modalState.type === 'nightaudit'} 
        onClose={() => setModalState({ type: 'none' })} 
        title="Night Audit & EOD Rollover Wizard"
      >
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-bold">
            <div className={`flex items-center gap-1.5 ${auditStep >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${auditStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1</span>
              <span>Validation</span>
            </div>
            <div className={`flex items-center gap-1.5 ${auditStep >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${auditStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2</span>
              <span>Post Charges</span>
            </div>
            <div className={`flex items-center gap-1.5 ${auditStep >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${auditStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>3</span>
              <span>Cashier</span>
            </div>
            <div className={`flex items-center gap-1.5 ${auditStep >= 4 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${auditStep >= 4 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>4</span>
              <span>Rollover</span>
            </div>
          </div>

          {!auditComplete ? (
            <div className="space-y-4">
              {auditStep === 1 && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800 text-sm">Step 1: Pre-Audit Guest Reconciliation</h4>
                  <p className="text-slate-500">Checking for unassigned arrivals, pending check-outs, and open POS bills.</p>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5"><Check className="w-4 h-4" /> 0 Pending Check-Outs</p>
                    <p className="font-bold flex items-center gap-1.5"><Check className="w-4 h-4" /> All Active Folios Balanced</p>
                    <p className="font-bold flex items-center gap-1.5"><Check className="w-4 h-4" /> Kitchen Orders Cleared</p>
                  </div>
                </div>
              )}

              {auditStep === 2 && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800 text-sm">Step 2: Auto-Post Room Rent & Tax Charges</h4>
                  <p className="text-slate-500">Night audit will automatically post tonight&apos;s room rent across all 9 occupied rooms.</p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span>Total In-House Rooms:</span>
                      <span className="font-bold">9 Rooms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Room Revenue to Post:</span>
                      <span className="font-bold text-emerald-600">+LKR 2,840.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Applicable Tax (12%):</span>
                      <span className="font-bold text-slate-700">+LKR 340.80</span>
                    </div>
                  </div>
                </div>
              )}

              {auditStep === 3 && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800 text-sm">Step 3: Cashier Drawer Reconciliation</h4>
                  <p className="text-slate-500">Balancing physical cash drawers against POS ledger settlements.</p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
                    <p className="font-bold">Drawer 1 (Front Desk): Balanced (LKR 450.00)</p>
                    <p className="font-bold">Drawer 2 (Restaurant POS): Balanced (LKR 1,120.00)</p>
                    <p className="text-xs text-blue-700">Zero variance detected across all registers.</p>
                  </div>
                </div>
              )}

              {auditStep === 4 && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800 text-sm">Step 4: Business Date Rollover Confirmation</h4>
                  <p className="text-slate-500">The current business date will close and advance to the next calendar operating date.</p>
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-center space-y-2">
                    <p className="text-xs uppercase font-bold text-indigo-500">Operating Date Transition</p>
                    <p className="text-base font-bold">October 11, 2026 ➔ October 12, 2026</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState({ type: 'none' })}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={advanceNightAudit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>{auditStep === 4 ? 'Confirm & Close Day' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Night Audit Successfully Executed</h4>
                <p className="text-xs text-slate-500 mt-1">All folio charges posted. Business Day October 12, 2026 is officially OPEN.</p>
              </div>
              <button
                onClick={() => setModalState({ type: 'none' })}
                className="px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* WALK-IN MODAL */}
      <Modal isOpen={modalState.type === 'walkin'} onClose={() => setModalState({ type: 'none' })} title="Register New Walk-In Guest">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Guest Name *</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={primaryGuest.name}
              onChange={(e) => setPrimaryGuest({ ...primaryGuest, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Passport / NIC</label>
              <input 
                type="text" 
                placeholder="ID Number"
                value={primaryGuest.nic}
                onChange={(e) => setPrimaryGuest({ ...primaryGuest, nic: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Room</label>
              <input 
                type="text" 
                value={primaryGuest.roomNumber}
                onChange={(e) => setPrimaryGuest({ ...primaryGuest, roomNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button onClick={() => setModalState({ type: 'none' })} className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold">Cancel</button>
            <button onClick={submitWalkIn} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Complete Check-In</button>
          </div>
        </div>
      </Modal>

      {/* CHECK-IN MODAL */}
      <Modal isOpen={modalState.type === 'checkin'} onClose={() => setModalState({ type: 'none' })} title="Confirm Guest Arrival & Check-In">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Guest Name</label>
            <input 
              type="text" 
              value={primaryGuest.name}
              onChange={(e) => setPrimaryGuest({ ...primaryGuest, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-200"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Room</label>
            <p className="font-bold text-slate-900 text-sm">Room {primaryGuest.roomNumber}</p>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button onClick={() => setModalState({ type: 'none' })} className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold">Cancel</button>
            <button onClick={submitCheckIn} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Activate Keycard & Check-In</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
