"use client";

import React, { useState } from 'react';

export default function ReservationsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showNewModal, setShowNewModal] = useState(false);

  // Mock Data
  const reservations: any[] = [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-500">Manage all guest bookings and availability.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              List View
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Calendar View
            </button>
          </div>
          <button onClick={() => setShowNewModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors text-sm font-medium">
            + New Reservation
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Guest Name</th>
                  <th className="px-6 py-4">Check-in</th>
                  <th className="px-6 py-4">Check-out</th>
                  <th className="px-6 py-4">Room Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map(res => (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{res.id}</td>
                    <td className="px-6 py-4 text-gray-900">{res.guest}</td>
                    <td className="px-6 py-4 text-gray-600">{res.checkIn}</td>
                    <td className="px-6 py-4 text-gray-600">{res.checkOut}</td>
                    <td className="px-6 py-4 text-gray-600">{res.roomType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        res.status === 'In House' ? 'bg-green-100 text-green-700' :
                        res.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-blue-600 font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500 min-h-[400px] flex items-center justify-center">
          <p>Calendar view implementation goes here.<br/>(Use a library like react-big-calendar or build a custom grid)</p>
        </div>
      )}

      {/* New Reservation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Create Reservation</h2>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
                  <input type="date" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
                  <input type="date" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                  <input type="number" min="1" defaultValue="1" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                  <input type="number" min="0" defaultValue="0" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none">
                  <option>Any Type</option>
                  <option>Standard</option>
                  <option>Deluxe</option>
                  <option>Suite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                <input type="text" placeholder="John Doe" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setShowNewModal(false)} className="px-5 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={() => { alert('Reservation created!'); setShowNewModal(false); }} className="px-5 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg">Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
