"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Package, AlertCircle, X, Layers, Sparkles } from "lucide-react";
import { loadInventoryStock, saveInventoryStock, InventoryItem as RawInventoryItem } from "@/lib/inventoryStorage";

interface StocktakeItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  systemQuantity: number;
  actualQuantity: number | null;
}

export default function StocktakePage() {
  const router = useRouter();
  const [items, setItems] = useState<StocktakeItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [adjustedSummary, setAdjustedSummary] = useState({ count: 0, time: '' });

  useEffect(() => {
    const rawStock = loadInventoryStock();
    const mapped: StocktakeItem[] = rawStock.map(item => ({
      id: item.sku,
      sku: item.sku,
      name: item.name,
      category: item.category,
      unit: item.unit,
      systemQuantity: item.qty,
      actualQuantity: null,
    }));
    setItems(mapped);
  }, []);

  const handleQuantityChange = (id: string, value: string) => {
    if (value === "") {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, actualQuantity: null } : item));
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, actualQuantity: numValue } : item));
  };

  const handleSubmit = async () => {
    const filledItems = items.filter((i) => i.actualQuantity !== null);
    if (filledItems.length === 0) {
      setWarningMessage("Please enter at least one actual quantity before submitting adjustments.");
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Update the master stock ledger in localStorage
    const currentStock = loadInventoryStock();
    const updatedStock = currentStock.map(stockItem => {
      const match = items.find(i => i.sku === stockItem.sku);
      if (match && match.actualQuantity !== null) {
        return { ...stockItem, qty: match.actualQuantity };
      }
      return stockItem;
    });

    saveInventoryStock(updatedStock);

    setAdjustedSummary({
      count: filledItems.length,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        systemQuantity: item.actualQuantity !== null ? item.actualQuantity : item.systemQuantity,
        actualQuantity: null,
      }))
    );
    setSubmitting(false);
    setShowSuccessModal(true);
  };

  const calculateVariance = (system: number, actual: number | null) => {
    if (actual === null) return null;
    return actual - system;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Physical Stocktake</h1>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Adjustments"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <th className="p-4 font-semibold">Item Name</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold text-right">System Qty</th>
              <th className="p-4 font-semibold text-center w-48">Actual Qty</th>
              <th className="p-4 font-semibold text-right w-32">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => {
              const variance = calculateVariance(item.systemQuantity, item.actualQuantity);
              const hasVariance = variance !== null && variance !== 0;
              
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-800">
                    <span className="font-semibold block">{item.name}</span>
                    <span className="text-xs font-mono text-slate-400">{item.sku}</span>
                  </td>
                  <td className="p-4 text-gray-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-700 font-semibold">
                    {item.systemQuantity} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 justify-center">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={item.actualQuantity === null ? "" : item.actualQuantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-28 border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-sm font-semibold"
                        placeholder="Count"
                      />
                      <span className="text-xs text-slate-400 w-10 text-left">{item.unit}</span>
                    </div>
                  </td>
                  <td className={`p-4 text-right font-medium ${
                    variance === null ? "text-gray-400" :
                    variance > 0 ? "text-green-600 font-bold" :
                    variance < 0 ? "text-red-600 font-bold" : "text-gray-500"
                  }`}>
                    {variance === null ? "-" : (variance > 0 ? `+${variance.toFixed(1)} ${item.unit}` : `${variance.toFixed(1)} ${item.unit}`)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {items.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No items found for stocktake.
          </div>
        )}
      </div>

      {/* Warning Popup Modal with Blurred Background */}
      {warningMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300"
            onClick={() => setWarningMessage(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-sm w-full p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setWarningMessage(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 ring-8 ring-amber-50/80 shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Quantity Required
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              {warningMessage}
            </p>
            <button
              type="button"
              onClick={() => setWarningMessage(null)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Success Popup Modal with Blurred Background */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 sm:p-8 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50/80 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              Stocktake Reconciled!
            </h3>
            
            <p className="text-xs text-slate-500 mb-5">
              Physical inventory count has been verified and system records updated.
            </p>

            {/* Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left mb-6 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  Adjusted Line Items
                </span>
                <span className="font-bold text-slate-800">{adjustedSummary.count} items updated</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Reconciliation Time
                </span>
                <span className="font-semibold text-slate-700">{adjustedSummary.time || 'Just now'}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  Inventory Ledger
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Reconciled • Balances Synced
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => router.push('/inventory')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>View Full Inventory Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Continue Stocktake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

