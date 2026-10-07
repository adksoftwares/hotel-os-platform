"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export default function InventoryDashboard() {
  const [stock, setStock] = useState([
    { sku: 'ING-BEEF', name: 'Premium Beef Tenderloin', qty: 45.5, unit: 'KG', location: 'Main Cold Store', status: 'OK' },
    { sku: 'ING-POT', name: 'Russet Potatoes', qty: 12.0, unit: 'KG', location: 'Dry Store A', status: 'LOW' },
    { sku: 'BEV-COLA', name: 'Craft Cola Syrup', qty: 5.0, unit: 'LITER', location: 'Bar Store', status: 'CRITICAL' },
  ]);

  const [modalState, setModalState] = useState<{type: 'none' | 'grn' | 'alert', message?: string}>({type: 'none'});
  const [grnQty, setGrnQty] = useState('');

  const handleCreatePO = () => {
    setModalState({ type: 'alert', message: 'Purchase Order draft created successfully.' });
  };

  const handleReceiveGoodsSubmit = () => {
    const qty = Number(grnQty);
    if (qty && !isNaN(qty)) {
      setStock(stock.map(s => 
        s.sku === 'BEV-COLA' 
          ? { ...s, qty: s.qty + qty, status: (s.qty + qty) > 20 ? 'OK' : 'LOW' } 
          : s
      ));
      setGrnQty('');
      setModalState({ type: 'alert', message: `Goods Received Note generated. Added ${qty} Liters of Craft Cola.` });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Inventory & Purchasing</h1>
        <div className="flex gap-2">
          <button onClick={handleCreatePO} className="bg-white border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50 text-sm font-medium">Create PO</button>
          <button onClick={() => setModalState({ type: 'grn' })} className="btn-primary">Receive Goods (GRN)</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">Stock Balances</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Item Name</th>
                <th className="px-4 py-2 text-right">Quantity</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stock.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.sku}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {item.qty.toFixed(2)} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.location}</td>
                  <td className="px-4 py-3">
                    {item.status === 'OK' && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">HEALTHY</span>}
                    {item.status === 'LOW' && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">LOW STOCK</span>}
                    {item.status === 'CRITICAL' && <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded animate-pulse">REORDER NOW</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalState.type === 'grn'} onClose={() => setModalState({ type: 'none' })} title="Receive Goods">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Enter quantity of 'Craft Cola Syrup' received (Liters)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="e.g. 20" 
              value={grnQty} 
              onChange={e => setGrnQty(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setModalState({ type: 'none' })} className="px-4 py-2 rounded-md hover:bg-slate-100 text-slate-700 font-medium transition-colors">Cancel</button>
            <button onClick={handleReceiveGoodsSubmit} className="btn-primary">Process GRN</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalState.type === 'alert'} onClose={() => setModalState({ type: 'none' })} title="Inventory Notification">
        <div className="space-y-6">
          <p className="text-slate-700 font-medium">{modalState.message}</p>
          <div className="flex justify-end">
            <button onClick={() => setModalState({ type: 'none' })} className="btn-primary">OK</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
