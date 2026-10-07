"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    roomNumber: '',
    building: 'Main',
    floor: '1',
    roomType: 'Standard',
    adults: 2,
    children: 0,
    extraBeds: 0,
    bedConfiguration: '1 King',
    facilities: [] as string[],
    images: [] as string[],
  });

  const availableFacilities = ['AC', 'WiFi', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'Bathtub'];

  const handleToggleFacility = (facility: string) => {
    setFormData(prev => {
      const facilities = prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility];
      return { ...prev, facilities };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving room', formData);
    alert('Room successfully created!');
    router.push('/rooms'); // or settings
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/settings" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Settings</Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Room</h1>
          <p className="text-gray-500">Create a new room and specify its attributes and capacity.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number/Name *</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} placeholder="e.g. 101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.roomType} onChange={e => setFormData({...formData, roomType: e.target.value})}>
                  <option>Standard</option>
                  <option>Deluxe</option>
                  <option>Suite</option>
                  <option>Presidential</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})} placeholder="e.g. Main Building" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} placeholder="e.g. 1" />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Capacity & Bedding</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Adults</label>
                <input type="number" min="1" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.adults} onChange={e => setFormData({...formData, adults: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Children</label>
                <input type="number" min="0" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.children} onChange={e => setFormData({...formData, children: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Extra Beds</label>
                <input type="number" min="0" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.extraBeds} onChange={e => setFormData({...formData, extraBeds: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bed Configuration</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.bedConfiguration} onChange={e => setFormData({...formData, bedConfiguration: e.target.value})} placeholder="e.g. 1 King, 2 Twin" />
            </div>
          </div>

          {/* Facilities */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Facilities & Amenities</h2>
            <div className="flex flex-wrap gap-3">
              {availableFacilities.map(facility => (
                <button 
                  key={facility} 
                  type="button"
                  onClick={() => handleToggleFacility(facility)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${formData.facilities.includes(facility) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Images</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600 font-medium block">Click to upload images</span>
              <span className="text-gray-400 text-sm mt-1 block">JPG, PNG up to 5MB</span>
            </div>
          </div>

        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button type="button" onClick={() => router.back()} className="px-5 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
            Create Room
          </button>
        </div>
      </form>
    </div>
  );
}
