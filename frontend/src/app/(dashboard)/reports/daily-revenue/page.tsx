"use client";
import React from 'react';
import { 
  DollarSign, TrendingUp, Calendar, Printer, 
  Download, PieChart, CreditCard, Utensils, Bed, Sparkles, FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const departmentRevenues = [
  { dept: 'Rooms & Lodging', amount: 2850.00, percentage: 68, icon: Bed, color: 'bg-blue-600' },
  { dept: 'Food & Beverage (POS)', amount: 890.00, percentage: 21, icon: Utensils, color: 'bg-amber-500' },
  { dept: 'Spa & Wellness Center', amount: 280.00, percentage: 7, icon: Sparkles, color: 'bg-purple-600' },
  { dept: 'Chauffeur & Misc Services', amount: 160.00, percentage: 4, icon: DollarSign, color: 'bg-emerald-600' },
];

const paymentSettlements = [
  { method: 'Credit Card (Stripe Gateway)', amount: 3150.00, count: 18 },
  { method: 'Corporate Wire Transfer', amount: 650.00, count: 2 },
  { method: 'Front Desk Cash Drawer', amount: 380.00, count: 7 },
];

export default function DailyRevenueReport() {
  const { toast } = useToast();

  const totalGross = departmentRevenues.reduce((acc, d) => acc + d.amount, 0);
  const taxCollected = totalGross * 0.12;
  const netRevenue = totalGross - taxCollected;

  const exportCSV = () => {
    const headers = 'Department,GrossAmount,Percentage\n';
    const rows = departmentRevenues.map(d => `"${d.dept}",${d.amount},${d.percentage}%`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Daily_Revenue_Summary_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast('Daily Revenue CSV downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Financial Revenue Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Closed Audited Day
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Departmental income breakdown, cashier drawer settlement, and tax liabilities for October 11, 2026.
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

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gross Total Receipts</span>
          <p className="text-3xl font-black text-slate-900 mt-1">${totalGross.toFixed(2)}</p>
          <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.5% over daily target
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Net Operating Revenue</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">${netRevenue.toFixed(2)}</p>
          <span className="text-xs text-slate-400 mt-1 block">Excluding occupancy taxes</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sales & VAT Tax Liability</span>
          <p className="text-3xl font-black text-indigo-600 mt-1">${taxCollected.toFixed(2)}</p>
          <span className="text-xs text-slate-400 mt-1 block">12% blended state/local tax</span>
        </div>
      </div>

      {/* Department Breakdown Visual Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Departmental Revenue Share</h3>
        
        {/* Progress Bar */}
        <div className="h-5 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
          {departmentRevenues.map((d, idx) => (
            <div 
              key={idx} 
              style={{ width: `${d.percentage}%` }} 
              className={`${d.color} transition-all`}
              title={`${d.dept}: ${d.percentage}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {departmentRevenues.map((d, idx) => {
            const Icon = d.icon;
            return (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className={`p-2 rounded-lg text-white ${d.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">${d.amount.toFixed(2)}</p>
                  <span className="text-[11px] text-slate-400">{d.dept} ({d.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Settlements Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-slate-800 text-sm">
          Cashier Settlement Reconciliation
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Settlement Channel</th>
                <th className="p-4">Transaction Count</th>
                <th className="p-4 text-right">Settled Amount</th>
                <th className="p-4 text-right">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentSettlements.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{p.method}</td>
                  <td className="p-4 text-slate-600">{p.count} Transactions</td>
                  <td className="p-4 text-right font-black text-slate-900 text-sm">${p.amount.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      BALANCED (0 VARIANCE)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
