"use client";

import { useState } from "react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  systemQuantity: number;
  actualQuantity: number | null;
}

const initialItems: InventoryItem[] = [
  { id: "1", name: "Towels (Standard)", category: "Linens", systemQuantity: 150, actualQuantity: null },
  { id: "2", name: "Towels (Large)", category: "Linens", systemQuantity: 100, actualQuantity: null },
  { id: "3", name: "Shampoo (Mini)", category: "Toiletries", systemQuantity: 500, actualQuantity: null },
  { id: "4", name: "Soap Bars", category: "Toiletries", systemQuantity: 450, actualQuantity: null },
  { id: "5", name: "Coffee Pods", category: "Beverages", systemQuantity: 300, actualQuantity: null },
];

export default function StocktakePage() {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [submitting, setSubmitting] = useState(false);

  const handleQuantityChange = (id: string, value: string) => {
    if (value === "") {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, actualQuantity: null } : item));
      return;
    }
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, actualQuantity: numValue } : item));
  };

  const handleSubmit = async () => {
    const anyFilled = items.some((i) => i.actualQuantity !== null);
    if (!anyFilled) {
      alert("Please enter at least one actual quantity before submitting.");
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Stocktake adjustments submitted successfully!");
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        systemQuantity: item.actualQuantity !== null ? item.actualQuantity : item.systemQuantity,
        actualQuantity: null,
      }))
    );
    setSubmitting(false);
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
                  <td className="p-4 text-gray-800">{item.name}</td>
                  <td className="p-4 text-gray-500">{item.category}</td>
                  <td className="p-4 text-right text-gray-600">{item.systemQuantity}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      value={item.actualQuantity === null ? "" : item.actualQuantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      placeholder="Enter qty"
                    />
                  </td>
                  <td className={`p-4 text-right font-medium ${
                    variance === null ? "text-gray-400" :
                    variance > 0 ? "text-green-600" :
                    variance < 0 ? "text-red-600" : "text-gray-500"
                  }`}>
                    {variance === null ? "-" : (variance > 0 ? `+${variance}` : variance)}
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
    </div>
  );
}

