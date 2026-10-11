"use client";
import React from 'react';
import Link from 'next/link';
import DateFilter from '@/components/reports/DateFilter';

const reportCategories = [
  {
    title: 'Hotel',
    reports: [
      { name: 'Room Revenue', href: '/reports/room-revenue' },
      { name: 'Occupancy Rate', href: '/reports/occupancy' },
      { name: 'Arrivals & Departures', href: '/reports/arrivals-departures' },
    ]
  },
  {
    title: 'Housekeeping',
    reports: [
      { name: 'Room Status Summary', href: '/reports/room-status' },
      { name: 'Housekeeper Productivity', href: '/reports/housekeeper-productivity' },
    ]
  },
  {
    title: 'Maintenance',
    reports: [
      { name: 'Work Orders', href: '/reports/work-orders' },
      { name: 'Asset Maintenance', href: '/reports/asset-maintenance' },
    ]
  },
  {
    title: 'Guest',
    reports: [
      { name: 'Guest History', href: '/reports/guest-history' },
      { name: 'Feedback & Ratings', href: '/reports/feedback' },
    ]
  },
  {
    title: 'Restaurant',
    reports: [
      { name: 'POS Sales', href: '/reports/pos-sales' },
      { name: 'Menu Item Performance', href: '/reports/menu-performance' },
    ]
  },
  {
    title: 'Financial',
    reports: [
      { name: 'Daily Revenue', href: '/reports/daily-revenue' },
      { name: 'Tax Report', href: '/reports/tax' },
      { name: 'Payment Transactions', href: '/reports/transactions' },
    ]
  },
  {
    title: 'Inventory',
    reports: [
      { name: 'Stock Levels', href: '/reports/stock-levels' },
      { name: 'Purchase Orders', href: '/reports/purchase-orders' },
    ]
  },
  {
    title: 'Staff Audit',
    reports: [
      { name: 'System Logs', href: '/reports/system-logs' },
      { name: 'Shift Reports', href: '/reports/shift-reports' },
    ]
  },
];

export default function ReportsCenterPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Report Center
          </h2>
        </div>
      </div>

      <div className="mb-8">
        <DateFilter onFilterChange={(range, start, end) => console.log(range, start, end)} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reportCategories.map((category) => (
          <div key={category.title} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{category.title}</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <ul className="space-y-3">
                {category.reports.map((report) => (
                  <li key={report.name}>
                    <Link href={report.href} className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center">
                      <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      {report.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

