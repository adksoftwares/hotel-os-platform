"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function RoomBoardPage() {
  const [filter, setFilter] = useState('All');
  
  // Mock Data
  const [rooms, setRooms] = useState<any[]>([]);

  const handleAction = (id: string, action: string) => {
    setRooms(rooms.map(room => {
      if (room.id === id) {
        if (action === 'Mark Dirty') return { ...room, housekeeping: 'Dirty' };
        if (action === 'Mark Clean') return { ...room, housekeeping: 'Clean' };
        if (action === 'Inspect') return { ...room, housekeeping: 'Inspected' };
        if (action === 'Report Maintenance') return { ...room, operational: 'Out of Order' };
      }
      return room;
    }));
  };

  const filteredRooms = rooms.filter(room => {
    if (filter === 'All') return true;
    if (filter === 'Vacant') return room.occupancy === 'Vacant';
    if (filter === 'Occupied') return room.occupancy === 'Occupied';
    if (filter === 'Dirty') return room.housekeeping === 'Dirty';
    if (filter === 'Clean') return room.housekeeping === 'Clean' || room.housekeeping === 'Inspected';
    if (filter === 'Maintenance') return room.operational !== 'In Service';
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Board</h1>
          <p className="text-gray-500">Real-time room status, housekeeping, and operations.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/settings/rooms/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors text-sm font-medium">
            + Add Room
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {['All', 'Vacant', 'Occupied', 'Dirty', 'Clean', 'Maintenance'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map(room => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
              <div>
                <Link href={`/rooms/${room.id}`} className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                  {room.id}
                </Link>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{room.type}</div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className={`px-2 py-1 text-xs font-bold rounded ${room.occupancy === 'Occupied' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {room.occupancy}
                </span>
                {room.reservation !== 'None' && (
                   <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                     {room.reservation}
                   </span>
                )}
              </div>
            </div>
            
            <div className="p-4 flex-grow flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Housekeeping:</span>
                <span className={`font-medium ${room.housekeeping === 'Dirty' ? 'text-red-600' : room.housekeeping === 'Clean' ? 'text-blue-600' : 'text-green-600'}`}>
                  {room.housekeeping}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Operational:</span>
                <span className={`font-medium ${room.operational === 'In Service' ? 'text-green-600' : 'text-orange-600'}`}>
                  {room.operational}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2 justify-center">
              {room.housekeeping === 'Clean' && (
                <button onClick={() => handleAction(room.id, 'Inspect')} className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 shadow-sm">Inspect</button>
              )}
              {(room.housekeeping === 'Clean' || room.housekeeping === 'Inspected') && (
                <button onClick={() => handleAction(room.id, 'Mark Dirty')} className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 shadow-sm">Mark Dirty</button>
              )}
              {room.housekeeping === 'Dirty' && (
                <button onClick={() => handleAction(room.id, 'Mark Clean')} className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 shadow-sm">Mark Clean</button>
              )}
              {room.operational === 'In Service' && (
                <button onClick={() => handleAction(room.id, 'Report Maintenance')} className="px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded text-xs font-medium hover:bg-red-50 shadow-sm">Maintenance</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
