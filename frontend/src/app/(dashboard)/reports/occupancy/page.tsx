"use client";
import React from 'react';
import { 
  Bed, TrendingUp, Users, Calendar, Download, 
  Printer, ArrowUpRight, BarChart2, PieChart, ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const roomTiers = [
  { tier: 'Deluxe King Suites', totalRooms: 4, occupied: 4, occupancyRate: 100, adr: 220.00, revPar: 220.00 },
  { tier: 'Standard Queen', totalRooms: 3, occupied: 2, occupancyRate: 67, adr: 140.00, revPar: 93.80 },
  { tier: 'Executive Suites', totalRooms: 2, occupied: 2, occupancyRate: 100, adr: 350.00, revPar: 350.00 },
  { tier: 'Presidential Suite', totalRooms: 1, occupied: 1, occupancyRate: 100, adr: 800.00, revPar: 800.00 },
];

const weeklyOccupancy = [
  { day: 'Mon', rate: 65 },
  { day: 'Tue', rate: 70 },
  { day: 'Wed', rate: 75 },
  { day: 'Thu', rate: 82 },
  { day: 'Fri', rate: 95 },
  { day: 'Sat', rate: 100 },
  { day: 'Sun', rate: 90 },
];

export default function OccupancyReport() {
  const { toast } = useToast();

  const totalRooms = roomTiers.reduce((acc, t) => acc + t.totalRooms, 0);
  const totalOccupied = roomTiers.reduce((acc, t) => acc + t.occupied, 0);
  const overallOccupancy = Math.round((totalOccupied / totalRooms) * 100);
  const averageRevPar = (roomTiers.reduce((acc, t) => acc + (t.revPar * t.totalRooms), 0) / totalRooms);

  const exportCSV = () => {
    const headers = 'RoomCategory,TotalInventory,Occupied,OccupancyRate,ADR,RevPAR\n';
    const rows = roomTiers.map(t => `"${t.tier}",${t.totalRooms},${t.occupied},${t.occupancyRate}%,$${t.adr},$${t.revPar}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Occupancy_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast('Occupancy Report CSV downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hotel Occupancy & RevPAR Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Room Capacity
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time room occupancy percentages, Revenue Per Available Room (RevPAR), and capacity utilization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Occupancy</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{overallOccupancy}%</p>
          <span className="text-xs text-slate-500 mt-1 block">{totalOccupied} of {totalRooms} rooms occupied</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average RevPAR</span>
          <p className="text-3xl font-black text-blue-600 mt-1">${averageRevPar.toFixed(2)}</p>
          <span className="text-xs text-slate-500 mt-1 block">Revenue per available key</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Available Rooms</span>
          <p className="text-3xl font-black text-slate-800 mt-1">{totalRooms - totalOccupied} Rooms</p>
          <span className="text-xs text-slate-400 mt-1 block">Ready for walk-in booking</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Surge Pricing Status</span>
          <p className="text-3xl font-black text-indigo-600 mt-1">ACTIVE</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">+15% surge rate applied</span>
        </div>
      </div>

      {/* Weekly Occupancy SVG Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">7-Day Occupancy Rate Curve</h3>
            <p className="text-xs text-slate-400">Weekly utilization curve tracking weekend surge</p>
          </div>
          <span className="text-xs font-bold text-emerald-600">Peak Saturday: 100%</span>
        </div>

        <div className="h-40 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-2">
          {weeklyOccupancy.map((w, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {w.rate}%
              </span>
              <div 
                style={{ height: `${w.rate}%` }}
                className={`w-full max-w-[44px] rounded-t-xl transition-all shadow-xs ${
                  w.rate >= 90 ? 'bg-gradient-to-t from-emerald-600 to-teal-400' : 'bg-gradient-to-t from-blue-600 to-indigo-400'
                }`}
              />
              <span className="text-[11px] font-medium text-slate-500">{w.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-slate-800 text-sm">
          Occupancy & RevPAR by Room Category
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Room Category</th>
                <th className="p-4">Total Inventory</th>
                <th className="p-4">Occupied</th>
                <th className="p-4">Occupancy %</th>
                <th className="p-4 text-right">Average Daily Rate (ADR)</th>
                <th className="p-4 text-right">RevPAR Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roomTiers.map((tier, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{tier.tier}</td>
                  <td className="p-4 text-slate-600">{tier.totalRooms} Units</td>
                  <td className="p-4 font-semibold text-slate-800">{tier.occupied} Units</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          style={{ width: `${tier.occupancyRate}%` }} 
                          className={`h-full rounded-full ${tier.occupancyRate === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{tier.occupancyRate}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-semibold text-slate-800">${tier.adr.toFixed(2)}</td>
                  <td className="p-4 text-right font-black text-blue-600 text-sm">${tier.revPar.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
