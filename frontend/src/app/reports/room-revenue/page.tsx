"use client";

import React, { useState } from 'react';
import DateFilter from '@/components/reports/DateFilter';

// Mock Data
const revenueData = [
  { id: 1, date: '2026-10-01', room: '101', type: 'Deluxe', reservationId: 'RES-001', guest: 'John Doe', rate: 150.00, charges: 25.00, total: 175.00 },
  { id: 2, date: '2026-10-01', room: '102', type: 'Standard', reservationId: 'RES-002', guest: 'Jane Smith', rate: 100.00, charges: 0, total: 100.00 },
  { id: 3, date: '2026-10-02', room: '205', type: 'Suite', reservationId: 'RES-003', guest: 'Alice Johnson', rate: 300.00, charges: 50.00, total: 350.00 },
  { id: 4, date: '2026-10-02', room: '101', type: 'Deluxe', reservationId: 'RES-001', guest: 'John Doe', rate: 150.00, charges: 10.00, total: 160.00 },
];

export default function RoomRevenueReport() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const handleExport = (type: string) => {
    alert(`Exporting as ${type}...`);
  };

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Room Revenue Report
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
          <button onClick={() => handleExport('Print')} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            Print
          </button>
          <button onClick={() => handleExport('CSV')} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            Export CSV
          </button>
          <button onClick={() => handleExport('PDF')} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Export PDF
          </button>
        </div>
      </div>

      <div className="mb-6">
        <DateFilter onFilterChange={(range, start, end) => console.log(range, start, end)} />
      </div>

      <div className="bg-white shadow rounded-lg mb-6 p-6 flex items-center justify-between border border-gray-200">
         <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</p>
         </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Room</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Rate</th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Charges</th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Total</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {revenueData.map((row) => (
                    <React.Fragment key={row.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{row.date}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.room}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.type}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${row.rate.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${row.charges.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">${row.total.toFixed(2)}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button onClick={() => toggleRow(row.id)} className="text-blue-600 hover:text-blue-900">
                            {expandedRow === row.id ? 'Hide Drill-down' : 'Drill-down'}
                          </button>
                        </td>
                      </tr>
                      {expandedRow === row.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                             <div className="text-sm text-gray-700">
                                <p><strong>Reservation ID:</strong> {row.reservationId}</p>
                                <p><strong>Guest Name:</strong> {row.guest}</p>
                                <div className="mt-2">
                                  <p className="font-semibold text-gray-900">Breakdown of Charges:</p>
                                  <ul className="list-disc pl-5 text-gray-500 mt-1">
                                    <li>Room Rate: ${row.rate.toFixed(2)}</li>
                                    <li>Additional Charges (Minibar, Room Service, etc.): ${row.charges.toFixed(2)}</li>
                                  </ul>
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
