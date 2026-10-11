"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const roomInfo = {
    id,
    type: 'Suite',
    building: 'Main',
    floor: '2',
    status: 'Occupied',
    housekeeping: 'Clean',
    facilities: ['AC', 'WiFi', 'Mini Bar', 'Bathtub'],
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
                <p className="font-medium text-gray-900">John Doe (RES-10293)</p>
                <p className="text-sm text-gray-500 mt-1">Check-in: Oct 1, 2026 &bull; Check-out: Oct 5, 2026</p>
                <p className="text-sm text-gray-500">2 Adults &bull; Standard Rate</p>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Res ID</th>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-blue-600">RES-10293</td>
                    <td className="px-4 py-3">John Doe</td>
                    <td className="px-4 py-3">Oct 1 - Oct 5, 2026</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">In House</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-blue-600">RES-10250</td>
                    <td className="px-4 py-3">Jane Smith</td>
                    <td className="px-4 py-3">Sep 25 - Sep 28, 2026</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Checked Out</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'housekeeping' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Housekeeping Logs</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-24 flex-shrink-0 text-sm text-gray-500">Today 10:00</div>
                <div>
                  <p className="font-medium text-gray-900">Room Inspected</p>
                  <p className="text-sm text-gray-500">Inspector: Maria G.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-24 flex-shrink-0 text-sm text-gray-500">Today 09:30</div>
                <div>
                  <p className="font-medium text-gray-900">Room Cleaned</p>
                  <p className="text-sm text-gray-500">Cleaner: Jose M.</p>
                </div>
              </li>
            </ul>
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
            <div className="border-l-2 border-blue-200 ml-3 space-y-6">
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5"></div>
                <p className="font-medium">Check-in (RES-10293)</p>
                <p className="text-sm text-gray-500">Oct 1, 2026 14:30</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-[7px] top-1.5"></div>
                <p className="font-medium">Room Inspected</p>
                <p className="text-sm text-gray-500">Oct 1, 2026 11:15</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
