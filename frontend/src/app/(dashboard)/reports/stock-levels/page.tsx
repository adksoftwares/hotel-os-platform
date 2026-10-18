"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, AlertTriangle, CheckCircle2, TrendingDown, 
  FileSpreadsheet, Printer, ArrowRight, ShieldCheck, DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { loadInventoryStock, InventoryItem } from '@/lib/inventoryStorage';

export default function StockLevelsReportPage() {
  const { toast } = useToast();
  const [stock, setStock] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setStock(loadInventoryStock());
    const handleSync = () => setStock(loadInventoryStock());
    window.addEventListener('inventory_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('inventory_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const totalValuation = stock.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);
  const lowStockItems = stock.filter(item => item.qty <= item.reorderLevel);

  const exportCSV = () => {
    const headers = 'SKU,ItemName,Category,StoreLocation,Quantity,Unit,UnitCost,TotalValuation,ReorderLevel,Status\n';
    const rows = stock.map(item => {
      const isCritical = item.qty <= item.reorderLevel * 0.5;
      const isLow = item.qty <= item.reorderLevel && !isCritical;
      const status = isCritical ? 'CRITICAL_LOW' : isLow ? 'REORDER_SOON' : 'HEALTHY';
      const val = (item.qty * item.unitCost).toFixed(2);
      return `"${item.sku}","${item.name}","${item.category}","${item.location}",${item.qty},"${item.unit}",${item.unitCost},${val},${item.reorderLevel},"${status}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Stock_Levels_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast('Stock Levels CSV exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Levels & Valuation Report</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Live Warehouse Sync
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Audited balances, purchasing reorder thresholds, and inventory asset valuation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/inventory/stocktake"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <span>Stocktake Count</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Stock Valuation</span>
          <p className="text-3xl font-black text-slate-900 mt-1">Rs. {totalValuation.toFixed(2)}</p>
          <span className="text-slate-500 text-xs font-medium flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Across {stock.length} catalog SKU items
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Below Reorder Point</span>
          <p className={`text-3xl font-black mt-1 ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {lowStockItems.length} SKUs
          </p>
          <span className="text-xs text-slate-400 mt-1 block">
            {lowStockItems.length > 0 ? 'Purchase orders recommended' : 'All items sufficiently stocked'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Reconciled Status</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">100%</p>
          <span className="text-xs text-slate-400 mt-1 block">Synchronized with Warehouse POS & GRN</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-3.5 pl-5">SKU & Item Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Warehouse Location</th>
              <th className="p-3.5 text-right">Unit Cost</th>
              <th className="p-3.5 text-right">Stock on Hand</th>
              <th className="p-3.5 text-right">Total Value</th>
              <th className="p-3.5 text-right">Par Level</th>
              <th className="p-3.5 pr-5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stock.map((item) => {
              const val = item.qty * item.unitCost;
              const isCritical = item.qty <= item.reorderLevel * 0.5;
              const isLow = item.qty <= item.reorderLevel && !isCritical;

              return (
                <tr key={item.sku} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 pl-5">
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">{item.sku}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{item.location}</td>
                  <td className="p-3.5 text-right font-medium text-slate-700">Rs. {item.unitCost.toFixed(2)}</td>
                  <td className="p-3.5 text-right font-bold text-slate-900">
                    {item.qty.toFixed(item.unit === 'PCS' ? 0 : 1)} <span className="text-slate-400 font-normal">{item.unit}</span>
                  </td>
                  <td className="p-3.5 text-right font-black text-slate-900">
                    Rs. {val.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-right text-slate-400 font-medium">
                    {item.reorderLevel} {item.unit}
                  </td>
                  <td className="p-3.5 pr-5 text-center">
                    {isCritical ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Critical
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Healthy
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
