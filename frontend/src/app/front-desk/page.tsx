"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2, UserPlus, Users, CheckCircle } from 'lucide-react';

type AccompanyingGuest = {
  id: string;
  name: string;
  nic: string;
  phone: string;
};

export default function FrontDesk() {
  const [arrivals, setArrivals] = useState<any[]>([]);

  const [modalState, setModalState] = useState<{type: 'none' | 'walkin' | 'checkin' | 'alert', arrivalId?: string, message?: string}>({type: 'none'});
  
  // Walk-In & Check-In Forms State
  const [primaryGuest, setPrimaryGuest] = useState({ name: '', nic: '', phone: '' });
  const [accompanyingGuests, setAccompanyingGuests] = useState<AccompanyingGuest[]>([]);

  const openWalkIn = () => {
    setPrimaryGuest({ name: '', nic: '', phone: '' });
    setAccompanyingGuests([]);
    setModalState({ type: 'walkin' });
  };

  const openCheckIn = (arrival: typeof arrivals[0]) => {
    setPrimaryGuest({ name: arrival.guest, nic: '', phone: '' });
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
      setArrivals([...arrivals, {
        id: Math.random().toString(36).substr(2, 5),
        guest: primaryGuest.name,
        roomType: 'Walk-In',
        eta: 'Now',
        status: 'Checked-In',
        accompanying: accompanyingGuests
      }]);
      setModalState({ type: 'alert', message: 'Walk-In created & Checked-In successfully!' });
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
      setModalState({ type: 'alert', message: 'Guest Checked-In Successfully. Room assigned.' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Front Desk Operations</h1>
        <button onClick={openWalkIn} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> New Walk-In
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" /> Today's Arrivals
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Guest</th>
                    <th className="px-4 py-3">Room Type</th>
                    <th className="px-4 py-3">ETA</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {arrivals.map((arr) => (
                    <tr key={arr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{arr.guest}</div>
                        {arr.accompanying?.length > 0 && (
                          <div className="text-xs text-slate-500 mt-1">+{arr.accompanying.length} accompanying</div>
                        )}
                      </td>
                      <td className="px-4 py-3">{arr.roomType}</td>
                      <td className="px-4 py-3">{arr.eta}</td>
                      <td className="px-4 py-3">
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${arr.status === 'Checked-In' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                           {arr.status}
                         </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {arr.status === 'Pending' ? (
                          <button onClick={() => openCheckIn(arr)} className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1 justify-end w-full">
                            <CheckCircle className="w-4 h-4" /> Check-In
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {arrivals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No arrivals found for today.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-primary-50 border border-primary-100 shadow-sm">
            <h3 className="text-primary-800 font-semibold mb-3">Arrival Stats</h3>
            <ul className="space-y-3 text-sm text-primary-900">
              <li className="flex justify-between items-center p-2 bg-white rounded-lg border border-primary-100">
                <span className="text-slate-600">Expected Arrivals</span> 
                <span className="font-bold text-lg">{arrivals.length}</span>
              </li>
              <li className="flex justify-between items-center p-2 bg-white rounded-lg border border-primary-100">
                <span className="text-slate-600">Checked-In</span> 
                <span className="font-bold text-lg text-emerald-600">{arrivals.filter(a => a.status === 'Checked-In').length}</span>
              </li>
              <li className="flex justify-between items-center p-2 bg-white rounded-lg border border-primary-100">
                <span className="text-slate-600">Pending</span> 
                <span className="font-bold text-lg text-amber-600">{arrivals.filter(a => a.status === 'Pending').length}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reusable Guest Form Form Modal */}
      {(modalState.type === 'walkin' || modalState.type === 'checkin') && (
        <Modal 
          isOpen={true} 
          onClose={() => setModalState({ type: 'none' })} 
          title={modalState.type === 'walkin' ? "New Walk-In" : "Complete Check-In"}
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            
            {/* Primary Guest */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Primary Guest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" 
                    placeholder="Enter full name" 
                    value={primaryGuest.name} 
                    onChange={e => setPrimaryGuest({...primaryGuest, name: e.target.value})}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">NIC / Passport</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" 
                    placeholder="Document number" 
                    value={primaryGuest.nic} 
                    onChange={e => setPrimaryGuest({...primaryGuest, nic: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" 
                    placeholder="+1 234 567 890" 
                    value={primaryGuest.phone} 
                    onChange={e => setPrimaryGuest({...primaryGuest, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Accompanying Guests */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Accompanying Guests</h3>
                <button onClick={addAccompanying} className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-md">
                  <Plus className="w-3 h-3" /> Add Guest
                </button>
              </div>

              {accompanyingGuests.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-2">No accompanying guests added.</p>
              ) : (
                <div className="space-y-4">
                  {accompanyingGuests.map((guest, index) => (
                    <div key={guest.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg relative group">
                      <button 
                        onClick={() => removeAccompanying(guest.id)} 
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Guest {index + 1} Name</label>
                          <input 
                            type="text" 
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white" 
                            placeholder="Full name" 
                            value={guest.name} 
                            onChange={e => updateAccompanying(guest.id, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">NIC / Passport</label>
                          <input 
                            type="text" 
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white" 
                            placeholder="Document number" 
                            value={guest.nic} 
                            onChange={e => updateAccompanying(guest.id, 'nic', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                          <input 
                            type="text" 
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white" 
                            placeholder="Phone (optional)" 
                            value={guest.phone} 
                            onChange={e => updateAccompanying(guest.id, 'phone', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button onClick={() => setModalState({ type: 'none' })} className="px-4 py-2 rounded-md hover:bg-slate-100 text-slate-700 font-medium transition-colors">Cancel</button>
              <button 
                onClick={modalState.type === 'walkin' ? submitWalkIn : submitCheckIn} 
                className="btn-primary"
              >
                {modalState.type === 'walkin' ? 'Complete Walk-In' : 'Confirm Check-In'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modalState.type === 'alert' && (
        <Modal isOpen={true} onClose={() => setModalState({ type: 'none' })} title="Success">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
              <p className="font-medium text-slate-800">{modalState.message}</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setModalState({ type: 'none' })} className="btn-primary">Done</button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
