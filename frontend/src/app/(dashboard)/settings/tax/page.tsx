"use client";
import { useEffect } from 'react';
import React, { useState } from 'react';

type TaxConfig = {
  id: string;
  name: string;
  rate: number;
  inclusive: boolean;
  active: boolean;
};

const initialTaxes: TaxConfig[] = [
  { id: '1', name: 'VAT', rate: 20, inclusive: false, active: true },
  { id: '2', name: 'City Tax', rate: 5, inclusive: true, active: true },
];

const STORAGE_KEY = 'hotel_tax_configs';

const loadTaxes = (): TaxConfig[] => {
  if (typeof window === 'undefined') return initialTaxes;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return initialTaxes;
};

const saveTaxes = (data: TaxConfig[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('taxes_updated'));
  } catch (_) {}
};

export default function TaxConfiguration() {
  const [taxes, setTaxes] = useState<TaxConfig[]>(initialTaxes);
  const [showModal, setShowModal] = useState(false);
  const [newTax, setNewTax] = useState<Partial<TaxConfig>>({
    name: '', rate: 0, inclusive: false, active: true
  });

  useEffect(() => {
    setTaxes(loadTaxes());
  }, []);

  const handleAddTax = (e: React.FormEvent) => {
    e.preventDefault();
    const tax: TaxConfig = {
      id: Math.random().toString(),
      name: newTax.name || '',
      rate: newTax.rate || 0,
      inclusive: newTax.inclusive || false,
      active: newTax.active ?? true,
    };
    const updated = [...taxes, tax];
    setTaxes(updated);
    saveTaxes(updated);
    setShowModal(false);
    setNewTax({ name: '', rate: 0, inclusive: false, active: true });
  };

  // Escape key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') { try { setShowModal(false); } catch(_){} } };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tax Configuration</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Add New Tax
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {taxes.map((tax) => (
              <tr key={tax.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tax.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tax.rate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tax.inclusive ? 'Inclusive' : 'Exclusive'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tax.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tax.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Tax</h2>
            <form onSubmit={handleAddTax}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                  value={newTax.name}
                  onChange={(e) => setNewTax({...newTax, name: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                  value={newTax.rate}
                  onChange={(e) => setNewTax({...newTax, rate: parseFloat(e.target.value)})}
                />
              </div>
              <div className="mb-4 flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={newTax.inclusive}
                  onChange={(e) => setNewTax({...newTax, inclusive: e.target.checked})}
                />
                <label className="ml-2 block text-sm text-gray-900">Tax is Inclusive</label>
              </div>
              <div className="mb-6 flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={newTax.active}
                  onChange={(e) => setNewTax({...newTax, active: e.target.checked})}
                />
                <label className="ml-2 block text-sm text-gray-900">Active</label>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  Save Tax
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

