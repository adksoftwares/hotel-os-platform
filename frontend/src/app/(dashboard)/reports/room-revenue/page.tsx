"use client";
import React, { useState } from 'react';
import { 
  Download, Printer, TrendingUp, DollarSign, Calendar, 
  ArrowUpRight, BarChart3, ChevronDown, ChevronUp, FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RevenueRecord {
  id: number;
  date: string;
  room: string;
  type: string;
  reservationId: string;
  guest: string;
  rate: number;
  charges: number;
  total: number;
}

const revenueData: RevenueRecord[] = [];

const dailyTrend = [
  { day: 'Oct 05', amount: 1420 },
  { day: 'Oct 06', amount: 1680 },
  { day: 'Oct 07', amount: 1550 },
  { day: 'Oct 08', amount: 1890 },
  { day: 'Oct 09', amount: 2150 },
  { day: 'Oct 10', amount: 2640 },
  { day: 'Oct 11', amount: 2850 },
];

export default function RoomRevenueReport() {
  const { toast } = useToast();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const totalRoomRevenue = revenueData.reduce((acc, curr) => acc + curr.rate, 0);
  const totalAncillary = revenueData.reduce((acc, curr) => acc + curr.charges, 0);
  const grandTotal = totalRoomRevenue + totalAncillary;
  const adr = revenueData.length > 0 ? totalRoomRevenue / revenueData.length : 0;
  const maxTrend = Math.max(...dailyTrend.map(t => t.amount), 1);

  const exportCSV = () => {
    const headers = 'ID,Date,Room,Type,ReservationId,Guest,RoomRate,AncillaryCharges,Total\n';
    const rows = revenueData.map(r => 
      `${r.id},${r.date},${r.room},"${r.type}",${r.reservationId},"${r.guest}",${r.rate},${r.charges},${r.total}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Room_Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast('Room Revenue CSV exported successfully!', 'success');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Grand Horizon Hotel - Room Revenue Report', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Revenue: Rs. ${grandTotal.toFixed(2)}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Date', 'Room', 'Guest', 'Type', 'Room Rate', 'Charges', 'Total']],
      body: revenueData.map(r => [r.date, r.room, r.guest, r.type, `Rs. ${r.rate}`, `Rs. ${r.charges}`, `Rs. ${r.total}`]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save('Room_Revenue_Report.pdf');
    toast('Room Revenue PDF exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Room Revenue & Yield Report</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Audited Data
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Departmental stay charges, ancillary dining spend, and Average Daily Rate (ADR) performance.
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gross Total Revenue</span>
          <p className="text-2xl font-black text-slate-900 mt-1">Rs. {grandTotal.toFixed(2)}</p>
          <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last week
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average Daily Rate (ADR)</span>
          <p className="text-2xl font-black text-blue-600 mt-1">Rs. {adr.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">Across 5 occupied suites</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Room Rent Portion</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">Rs. {totalRoomRevenue.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">79% of total earnings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ancillary & Dining Spend</span>
          <p className="text-2xl font-black text-amber-600 mt-1">Rs. {totalAncillary.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">21% of total earnings</p>
        </div>
      </div>

      {/* 7-Day Revenue Trend Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">7-Day Revenue Trajectory</h3>
            <p className="text-xs text-slate-400">Nightly revenue progression leading to weekend peak</p>
          </div>
          <span className="text-xs font-bold text-emerald-600">Peak: Rs. 2,850.00</span>
        </div>

        {/* SVG Bars */}
        <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-2">
          {dailyTrend.map((t, idx) => {
            const heightPct = Math.round((t.amount / maxTrend) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Rs. {t.amount}
                </span>
                <div 
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all shadow-xs"
                />
                <span className="text-[11px] font-medium text-slate-500">{t.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill-down Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-slate-800 text-sm">
          Itemized Room Revenue Records
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Room & Tier</th>
                <th className="p-4">Guest Details</th>
                <th className="p-4">Booking Ref</th>
                <th className="p-4 text-right">Room Rate</th>
                <th className="p-4 text-right">Ancillary</th>
                <th className="p-4 text-right">Total Revenue</th>
                <th className="p-4 text-center">Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {revenueData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No itemized revenue records found for this period.
                  </td>
                </tr>
              ) : (
                revenueData.map((row) => (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono text-slate-600">{row.date}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">Room {row.room}</p>
                      <span className="text-[11px] text-slate-400">{row.type}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{row.guest}</td>
                    <td className="p-4 font-mono text-blue-600">{row.reservationId}</td>
                    <td className="p-4 text-right font-semibold text-slate-700">Rs. {row.rate.toFixed(2)}</td>
                    <td className="p-4 text-right font-semibold text-amber-600">+Rs. {row.charges.toFixed(2)}</td>
                    <td className="p-4 text-right font-black text-slate-900 text-sm">Rs. {row.total.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleRow(row.id)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        {expandedRow === row.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Breakdown Drawer */}
                  {expandedRow === row.id && (
                    <tr className="bg-blue-50/40">
                      <td colSpan={8} className="p-4">
                        <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-2">
                          <h4 className="font-bold text-slate-800 text-xs">Departmental Breakdown</h4>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400">Accommodations:</span>
                              <p className="font-bold text-slate-900">Rs. {row.rate.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Restaurant & Bar:</span>
                              <p className="font-bold text-amber-600">Rs. {(row.charges * 0.7).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Minibar / Amenities:</span>
                              <p className="font-bold text-purple-600">Rs. {(row.charges * 0.3).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
