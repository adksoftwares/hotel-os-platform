"use client";

import React, { useState } from 'react';

export type DateRange = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

interface DateFilterProps {
  onFilterChange: (range: DateRange, startDate?: string, endDate?: string) => void;
}

export default function DateFilter({ onFilterChange }: DateFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const range = e.target.value as DateRange;
    setSelectedRange(range);
    if (range !== 'custom') {
      onFilterChange(range);
    }
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      onFilterChange('custom', startDate, endDate);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <label htmlFor="date-range" className="text-sm font-medium text-gray-700">Date Range:</label>
        <select
          id="date-range"
          value={selectedRange}
          onChange={handleRangeChange}
          className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {selectedRange === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          />
          <button
            onClick={handleCustomApply}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
