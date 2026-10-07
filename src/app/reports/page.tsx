'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Bed, 
  Calendar, 
  ChefHat, 
  ChevronDown, 
  CircleDollarSign, 
  ClipboardList, 
  Download, 
  FileText, 
  Filter, 
  Hotel, 
  Package, 
  Printer, 
  Users 
} from 'lucide-react';

type TabType = 'dashboard' | 'hotel' | 'housekeeping' | 'reservations' | 'restaurant' | 'financial' | 'inventory';
type DateRangeType = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'this_year' | 'custom';

// Mock Data
const kpiData = [
  { label: 'Total Revenue', value: '$24,500.00', change: '+12.5%', trend: 'up' },
  { label: 'Occupancy Rate', value: '85%', change: '+5.2%', trend: 'up' },
  { label: 'RevPAR', value: '$145.20', change: '+8.1%', trend: 'up' },
  { label: 'ADR', value: '$170.50', change: '-2.3%', trend: 'down' },
];

const mockReservations = [
  { id: 'RES-1001', guest: 'John Doe', room: '101', type: 'Deluxe', checkIn: '2026-10-02', checkOut: '2026-10-05', status: 'Checked In', amount: '$450.00' },
  { id: 'RES-1002', guest: 'Jane Smith', room: '205', type: 'Suite', checkIn: '2026-10-02', checkOut: '2026-10-04', status: 'Confirmed', amount: '$600.00' },
  { id: 'RES-1003', guest: 'Robert Johnson', room: '112', type: 'Standard', checkIn: '2026-10-01', checkOut: '2026-10-03', status: 'Checked In', amount: '$240.00' },
  { id: 'RES-1004', guest: 'Emily Davis', room: '304', type: 'Suite', checkIn: '2026-10-03', checkOut: '2026-10-10', status: 'Pending', amount: '$2100.00' },
];

const mockHousekeeping = [
  { room: '101', type: 'Deluxe', status: 'Occupied Clean', housekeeper: 'Maria G.', priority: 'Low' },
  { room: '102', type: 'Standard', status: 'Vacant Dirty', housekeeper: 'Unassigned', priority: 'High' },
  { room: '103', type: 'Standard', status: 'Vacant Clean', housekeeper: '-', priority: 'Low' },
  { room: '201', type: 'Suite', status: 'Occupied Dirty', housekeeper: 'Elena S.', priority: 'Medium' },
  { room: '202', type: 'Suite', status: 'Out of Order', housekeeper: 'Maintenance', priority: 'High' },
];

const mockFinancials = [
  { date: '2026-10-01', description: 'Room Charges', category: 'Revenue', amount: '+$5,240.00' },
  { date: '2026-10-01', description: 'Restaurant POS', category: 'Revenue', amount: '+$1,120.50' },
  { date: '2026-10-01', description: 'Laundry Services', category: 'Expense', amount: '-$350.00' },
  { date: '2026-10-02', description: 'Room Charges', category: 'Revenue', amount: '+$4,800.00' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dateRange, setDateRange] = useState<DateRangeType>('today');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Management Dashboard', icon: <BarChart3 className="w-4 h-4 mr-2" /> },
    { id: 'hotel', label: 'Hotel Reports', icon: <Hotel className="w-4 h-4 mr-2" /> },
    { id: 'housekeeping', label: 'Housekeeping', icon: <Bed className="w-4 h-4 mr-2" /> },
    { id: 'reservations', label: 'Reservations', icon: <ClipboardList className="w-4 h-4 mr-2" /> },
    { id: 'restaurant', label: 'Restaurant', icon: <ChefHat className="w-4 h-4 mr-2" /> },
    { id: 'financial', label: 'Financials', icon: <CircleDollarSign className="w-4 h-4 mr-2" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 p-6 flex flex-col gap-6">
      {/* Header & Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporting Center</h1>
          <p className="text-sm text-gray-500">Comprehensive insights and data management.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeType)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range...</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
          </div>
          
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            Filters
          </button>
          
          <button className="flex items-center px-4 py-2 bg-indigo-600 border border-transparent text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200">
        <div className="flex gap-2 pb-[-1px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-transparent">
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => (
                <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reservations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-semibold text-gray-800">Recent Arrivals & Departures</h3>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">View All</button>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-5 py-3">Guest</th>
                        <th className="px-5 py-3">Room</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockReservations.slice(0, 4).map((res, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-900">{res.guest}</td>
                          <td className="px-5 py-3 text-gray-600">{res.room} - {res.type}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                              res.status === 'Checked In' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                              res.status === 'Confirmed' ? 'bg-green-50 text-green-700 border border-green-200' : 
                              'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}>
                              {res.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Priority Housekeeping */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-semibold text-gray-800">Priority Housekeeping Tasks</h3>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">View All</button>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-5 py-3">Room</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Assigned To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockHousekeeping.filter(h => h.priority === 'High' || h.priority === 'Medium').map((hk, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-900">{hk.room}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                              hk.status.includes('Dirty') ? 'bg-red-50 text-red-700 border border-red-200' : 
                              hk.status === 'Out of Order' ? 'bg-gray-100 text-gray-700 border border-gray-300' : 
                              'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                              {hk.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{hk.housekeeper}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">Reservation Reports</h3>
              <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><Printer className="w-4 h-4" /></button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><FileText className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Res ID</th>
                    <th className="px-6 py-4 font-semibold">Guest Name</th>
                    <th className="px-6 py-4 font-semibold">Room & Type</th>
                    <th className="px-6 py-4 font-semibold">Dates</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockReservations.map((res, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-indigo-600 font-medium cursor-pointer">{res.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{res.guest}</td>
                      <td className="px-6 py-4 text-gray-600">{res.room} ({res.type})</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{res.checkIn} to {res.checkOut}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                          res.status === 'Checked In' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                          res.status === 'Confirmed' ? 'bg-green-50 text-green-700 border border-green-200' : 
                          'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">{res.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm">
              <span className="text-gray-500">Showing 1 to {mockReservations.length} of {mockReservations.length} entries</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-500 disabled:opacity-50">Prev</button>
                <button className="px-3 py-1 border border-indigo-600 rounded bg-indigo-50 text-indigo-700 font-medium">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-500 disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">Financial Transactions</h3>
              <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><Printer className="w-4 h-4" /></button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><FileText className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockFinancials.map((fin, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{fin.date}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{fin.description}</td>
                      <td className="px-6 py-4 text-gray-600">{fin.category}</td>
                      <td className={`px-6 py-4 text-right font-medium ${fin.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {fin.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholders for other tabs */}
        {['hotel', 'housekeeping', 'restaurant', 'inventory'].includes(activeTab) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
               {activeTab === 'hotel' && <Hotel className="w-8 h-8" />}
               {activeTab === 'housekeeping' && <Bed className="w-8 h-8" />}
               {activeTab === 'restaurant' && <ChefHat className="w-8 h-8" />}
               {activeTab === 'inventory' && <Package className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">{activeTab} Reports</h3>
            <p className="text-gray-500 max-w-md">
              Detailed reporting and analytics for the {activeTab} department are currently being populated. Check back soon for comprehensive data views.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
