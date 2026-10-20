"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadHotelRoomsFleet, RoomItem } from '@/lib/hotelRoomsFleet';

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState('overview');
  const [room, setRoom] = useState<RoomItem | null>(null);

  useEffect(() => {
    const fetchRoom = () => {
      const fleet = loadHotelRoomsFleet();
      const found = fleet.find(r => r.id === id || r.roomNumber === id);
      if (found) {
        setRoom(found);
      }
    };
    fetchRoom();
    window.addEventListener('storage', fetchRoom);
    window.addEventListener('hotel_rooms_changed', fetchRoom);
    return () => {
      window.removeEventListener('storage', fetchRoom);
      window.removeEventListener('hotel_rooms_changed', fetchRoom);
    };
  }, [id]);

  const defaultFacilities = ['AC', 'WiFi', 'TV'];
  const roomInfo = {
    id: room ? room.roomNumber : id,
    type: room ? room.type : 'Standard Room',
    building: 'Main Wing',
    floor: room ? room.floor : 1,
    status: room ? room.occupancy : 'Vacant',
    housekeeping: room ? room.housekeeping : 'Clean',
    facilities: room?.facilities && room.facilities.length > 0 ? room.facilities : defaultFacilities,
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Room History' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'housekeeping', label: 'Housekeeping' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link href="/rooms" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Rooms</Link>
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room {roomInfo.id}</h1>
          <div className="flex gap-3 text-sm text-gray-500">
            <span>{roomInfo.type}</span>
            <span>&bull;</span>
            <span>Building: {roomInfo.building}</span>
            <span>&bull;</span>
            <span>Floor: {roomInfo.floor}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 font-semibold text-sm">
            Status: {roomInfo.status}
          </div>
          <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 font-semibold text-sm">
            HK: {roomInfo.housekeeping}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Guest</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-600">No active guest checked in</p>
                <p className="text-xs text-gray-400 mt-1">Room is vacant and ready for assignment</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {roomInfo.facilities.map(f => (
                  <span key={f} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{f}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Complete Room History</h3>
            <p className="text-gray-500 italic">No historical events found for this room.</p>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reservation History</h3>
            <p className="text-gray-500 italic">No prior reservation history on record for this room.</p>
          </div>
        )}

        {activeTab === 'housekeeping' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Housekeeping Logs</h3>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-gray-500 italic text-sm">No housekeeping logs recorded yet for this room.</p>
              <p className="text-xs text-gray-400 mt-1">Logs will appear as housekeepers perform service.</p>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Maintenance Tickets</h3>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm text-sm font-medium mb-4">+ Report Issue</button>
            <p className="text-gray-500 italic">No active maintenance tickets.</p>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Timeline</h3>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-gray-500 italic text-sm">No timeline activity recorded yet for this room.</p>
              <p className="text-xs text-gray-400 mt-1">Check-ins, service requests, and inspections will be logged here chronologically.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
