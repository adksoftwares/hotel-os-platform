"use client";
import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import DateFilter from '@/components/reports/DateFilter';
import { 
  Building2, Sparkles, Wrench, Users, 
  Utensils, DollarSign, Package, ShieldCheck, 
  ArrowRight, FileSpreadsheet, Download
} from 'lucide-react';

interface ReportCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  reports: { name: string; href: string; desc: string }[];
}

const reportCategories: ReportCategory[] = [
  {
    title: 'Hotel & Stays',
    icon: Building2,
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    reports: [
      { name: 'Room Revenue', href: '/reports/room-revenue', desc: 'RevPAR, ADR, and per-room revenue breakdown' },
      { name: 'Occupancy Rate', href: '/reports/occupancy', desc: 'Historical and projected occupancy timeline' },
      { name: 'Arrivals & Departures', href: '/reports/arrivals-departures', desc: 'Expected guest movements and luggage hold' },
    ]
  },
  {
    title: 'Housekeeping',
    icon: Sparkles,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    reports: [
      { name: 'Room Status Summary', href: '/reports/room-status', desc: 'Inspected vs dirty turnaround metrics' },
      { name: 'Housekeeper Productivity', href: '/reports/housekeeper-productivity', desc: 'Rooms cleaned per attendant shift' },
    ]
  },
  {
    title: 'Maintenance',
    icon: Wrench,
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    reports: [
      { name: 'Work Orders', href: '/reports/work-orders', desc: 'Open repairs, MTTR, and critical issues' },
      { name: 'Asset Maintenance', href: '/reports/asset-maintenance', desc: 'HVAC, generator, and elevator service schedules' },
    ]
  },
  {
    title: 'Guest Relations',
    icon: Users,
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    reports: [
      { name: 'Guest History', href: '/reports/guest-history', desc: 'Repeat VIPs, stay frequency, and preferences' },
      { name: 'Feedback & Ratings', href: '/reports/feedback', desc: 'NPS scores, guest surveys, and review sentiment' },
    ]
  },
  {
    title: 'Food & Beverage',
    icon: Utensils,
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    reports: [
      { name: 'POS Sales', href: '/reports/pos-sales', desc: 'Dining room and room service order breakdown' },
      { name: 'Menu Item Performance', href: '/reports/menu-performance', desc: 'Stars, dogs, and culinary margins matrix' },
    ]
  },
  {
    title: 'Financial & Cashier',
    icon: DollarSign,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    reports: [
      { name: 'Daily Revenue', href: '/reports/daily-revenue', desc: 'Manager daily audited revenue ledger' },
      { name: 'Tax Report', href: '/reports/tax', desc: 'VAT, municipal, and tourism levies report' },
      { name: 'Payment Transactions', href: '/reports/transactions', desc: 'Gateway settled charges, cash, and refunds' },
    ]
  },
  {
    title: 'Inventory & Supply',
    icon: Package,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    reports: [
      { name: 'Stock Levels', href: '/reports/stock-levels', desc: 'Current valuation and below-par warnings' },
      { name: 'Purchase Orders', href: '/reports/purchase-orders', desc: 'Vendor fulfillment and GRN variances' },
    ]
  },
  {
    title: 'Staff & Audit Trail',
    icon: ShieldCheck,
    color: 'text-slate-700 bg-slate-100 border-slate-300',
    reports: [
      { name: 'System Audit Logs', href: '/reports/audit', desc: 'Immutable security log of user actions and diffs' },
      { name: 'Shift Reports', href: '/reports/shift-reports', desc: 'Cash drawer balancing and end-of-day signoffs' },
    ]
  },
];

export default function ReportsCenterPage() {
  return (
    <div className="hotel-page">
      <PageHeader
        title="Business Intelligence & Reports Center"
        description="Comprehensive audit-grade financial statements, operational logs, and department performance reports."
      />

      {/* Date Filter Bar */}
      <div className="mb-6 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <DateFilter onFilterChange={(range, start, end) => console.log(range, start, end)} />
      </div>

      {/* Report Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.title}
              className="hotel-panel p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100">
                  <div className={`p-1.5 rounded-lg border ${category.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    {category.title}
                  </h3>
                </div>

                <ul className="space-y-2.5">
                  {category.reports.map((report) => (
                    <li key={report.name}>
                      <Link
                        href={report.href}
                        className="group block p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                          <span>{report.name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {report.desc}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
