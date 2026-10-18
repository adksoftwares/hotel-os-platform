"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { 
  Package, Plus, ClipboardCheck, ArrowDownRight, 
  Search, AlertTriangle, CheckCircle2, Truck
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { 
  InventoryItem, 
  initialStock, 
  loadInventoryStock, 
  saveInventoryStock 
} from '@/lib/inventoryStorage';

export default function InventoryDashboard() {
  const { toast } = useToast();
  const [stock, setStock] = useState<InventoryItem[]>(initialStock);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState('BEV-COLA');
  const [grnQty, setGrnQty] = useState('');

  useEffect(() => {
    setStock(loadInventoryStock());
    const handleSync = () => setStock(loadInventoryStock());
    window.addEventListener('inventory_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('inventory_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleCreatePO = () => {
    toast('Draft Purchase Order PO-9042 generated for below-reorder items.', 'success');
  };

  const handleReceiveGoodsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(grnQty);
    if (!qty || isNaN(qty) || qty <= 0) {
      toast('Please enter a valid positive quantity.', 'error');
      return;
    }

    const updated = stock.map(s => (s.sku === selectedSku ? { ...s, qty: s.qty + qty } : s));
    setStock(updated);
    saveInventoryStock(updated);
    const item = stock.find(s => s.sku === selectedSku);
    toast(`GRN-8810 recorded. Added ${qty} ${item?.unit || ''} to ${item?.name || selectedSku}.`, 'success');
    setIsGrnModalOpen(false);
    setGrnQty('');
  };

  const filteredStock = stock.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const lowStockCount = stock.filter(s => s.qty <= s.reorderLevel).length;

  return (
    <div className="hotel-page">
      <PageHeader
        title="Inventory & Stock Management"
        description="Real-time ingredient balances, purchasing orders, and warehouse physical stock takes."
        badge={
          lowStockCount > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {lowStockCount} Items Below Reorder Point
            </span>
          ) : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/inventory/stocktake"
              className="hotel-button hotel-button-secondary text-xs"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Physical Stocktake</span>
            </Link>
            <button
              onClick={handleCreatePO}
              className="hotel-button hotel-button-secondary text-xs"
            >
              <span>+ Create PO</span>
            </button>
            <button
              onClick={() => setIsGrnModalOpen(true)}
              className="hotel-button hotel-button-emerald text-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Receive Goods (GRN)</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Kitchen', 'Bar', 'Beverages', 'Housekeeping'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU or item name..."
            className="hotel-input pl-8 py-1.5 min-h-[34px] text-xs"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="hotel-table-wrap">
        <table className="hotel-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Store Location</th>
              <th className="text-right">Unit Cost</th>
              <th className="text-right">Stock on Hand</th>
              <th className="text-right">Reorder Level</th>
              <th>Health Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.map((item) => {
              const isCritical = item.qty <= item.reorderLevel * 0.5;
              const isLow = item.qty <= item.reorderLevel && !isCritical;

              return (
                <tr key={item.sku}>
                  <td className="font-mono text-xs font-semibold text-slate-700">{item.sku}</td>
                  <td>
                    <span className="font-semibold text-slate-900 block">{item.name}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="text-slate-500 text-xs">{item.location}</td>
                  <td className="text-right font-medium text-slate-700">
                    Rs. {item.unitCost.toFixed(2)}
                  </td>
                  <td className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.qty.toFixed(item.unit === 'PCS' ? 0 : 1)}
                    </span>{" "}
                    <span className="text-[11px] text-slate-500">{item.unit}</span>
                  </td>
                  <td className="text-right text-slate-400 text-xs">
                    {item.reorderLevel} {item.unit}
                  </td>
                  <td>
                    {isCritical ? (
                      <span className="hotel-status hotel-status-dirty">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Critical Low
                      </span>
                    ) : isLow ? (
                      <span className="hotel-status hotel-status-cleaning">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Reorder Soon
                      </span>
                    ) : (
                      <span className="hotel-status hotel-status-available">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Receive Goods GRN Modal */}
      <Modal
        isOpen={isGrnModalOpen}
        onClose={() => setIsGrnModalOpen(false)}
        title="Receive Goods Note (GRN)"
      >
        <form onSubmit={handleReceiveGoodsSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Item *</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="hotel-input"
            >
              {stock.map(s => (
                <option key={s.sku} value={s.sku}>
                  {s.name} ({s.sku}) — Current: {s.qty} {s.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Quantity Received *
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 25"
              value={grnQty}
              onChange={(e) => setGrnQty(e.target.value)}
              className="hotel-input"
              autoFocus
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsGrnModalOpen(false)}
              className="hotel-button hotel-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="hotel-button hotel-button-emerald"
            >
              Post to Inventory
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
