"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { A4TaxInvoiceModal } from '@/components/ui/A4TaxInvoiceModal';
import { CashierShiftModal } from '@/components/ui/CashierShiftModal';
import { 
  CreditCard, Banknote, Receipt, Printer, Plus, 
  RotateCcw, CheckCircle2, ShieldCheck, FileText, Search,
  Globe, Lock
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface FolioItem {
  id: string;
  guest: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  status: 'OPEN' | 'SETTLED' | 'PARTIALLY_SETTLED';
  balance: number;
  totalCharges: number;
  paidAmount: number;
  charges: { date: string; description: string; amount: number }[];
}

const initialFolios: FolioItem[] = [];

const CURRENCIES = [
  { code: 'LKR', symbol: 'Rs. ', rate: 1.0, label: 'LKR (Rs.)' },
  { code: 'INR', symbol: 'Rs. ', rate: 1.0, label: 'INR (Rs.)' },
  { code: 'USD', symbol: '$', rate: 0.0033, label: 'USD ($)' },
  { code: 'EUR', symbol: '€', rate: 0.0030, label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', rate: 0.0026, label: 'GBP (£)' },
  { code: 'AED', symbol: 'AED ', rate: 0.012, label: 'AED (د.إ)' },
];

export default function BillingDashboard() {
  const { toast } = useToast();
  const [folios, setFolios] = useState<FolioItem[]>(initialFolios);
  const [selectedFolio, setSelectedFolio] = useState<FolioItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Multi-Currency & Shift Close State
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [showShiftModal, setShowShiftModal] = useState(false);

  const formatCur = (amountUSD: number) => {
    return `${selectedCurrency.symbol}${((amountUSD || 0) * selectedCurrency.rate).toFixed(2)}`;
  };

  // Refund / Void modal state
  const [refundAction, setRefundAction] = useState<{ id: string; type: 'Refund' | 'Void' } | null>(null);
  const [refundReason, setRefundReason] = useState('');

  // A4 Tax Invoice modal state
  const [showA4Invoice, setShowA4Invoice] = useState(false);

  const loadFolios = () => {
    try {
      const saved = localStorage.getItem('hotel_billing_folios');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFolios(parsed);
          setSelectedFolio(prev => (parsed.some(p => p.id === prev?.id) ? prev : parsed[0]));
          return;
        }
      }
      setFolios([]);
      setSelectedFolio(null);
    } catch (_) {
      setFolios([]);
      setSelectedFolio(null);
    }
  };

  React.useEffect(() => {
    loadFolios();
    const handleUpdate = () => loadFolios();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('billing_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('billing_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const saveFolios = (newFolios: FolioItem[]) => {
    setFolios(newFolios);
    try {
      localStorage.setItem('hotel_billing_folios', JSON.stringify(newFolios));
      window.dispatchEvent(new Event('billing_updated'));
    } catch (_) {}
  };

  // Create Folio Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolioData, setNewFolioData] = useState({
    guest: '',
    room: '',
    description: 'Room Rental Charges',
    amount: '',
  });

  const handleOpenCreateModal = () => {
    setNewFolioData({ guest: '', room: '', description: 'Room Stay & Incidental Deposit', amount: '' });
    setShowCreateModal(true);
  };

  const handleConfirmCreateFolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolioData.guest.trim()) {
      toast('Guest or Account name is required.', 'error');
      return;
    }
    const amountVal = Number(newFolioData.amount) || 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const newId = `FOL-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;

    const newFolio: FolioItem = { 
      id: newId, 
      guest: newFolioData.guest.trim(), 
      room: newFolioData.room.trim() || 'General', 
      roomType: 'Hotel Folio',
      checkIn: todayStr,
      checkOut: tomorrowStr,
      nights: 1,
      status: 'OPEN', 
      balance: amountVal,
      totalCharges: amountVal,
      paidAmount: 0,
      charges: amountVal > 0 ? [
        { date: todayStr, description: newFolioData.description, amount: amountVal }
      ] : []
    };

    const updated = [newFolio, ...folios];
    saveFolios(updated);
    setSelectedFolio(newFolio);
    setShowCreateModal(false);
    toast(`Folio ${newId} created for ${newFolio.guest}.`, 'success');
  };

  const handleSettle = (method: string) => {
    if (!selectedFolio) {
      toast('Please select a folio from the table first before processing payment.', 'error');
      return;
    }
    if ((selectedFolio.balance ?? 0) <= 0) {
      toast('This folio is already fully settled.', 'info');
      return;
    }
    
    const amount = selectedFolio.balance;
    const updated = folios.map(f => f.id === selectedFolio.id ? { 
      ...f, 
      status: 'SETTLED' as const, 
      balance: 0,
      paidAmount: f.totalCharges 
    } : f);

    saveFolios(updated);
    setSelectedFolio({ ...selectedFolio, status: 'SETTLED', balance: 0, paidAmount: selectedFolio.totalCharges });
    toast(`Payment of ${formatCur(amount)} processed via ${method}! Folio settled.`, 'success');
  };

  const submitRefund = () => {
    if (!refundReason.trim()) {
      toast('Please provide an official refund reason.', 'error');
      return;
    }
    const targetId = refundAction?.id;
    const actionType = refundAction?.type || 'Refund';
    const todayStr = new Date().toISOString().split('T')[0];

    const updated = folios.map(f => {
      if (f.id === targetId) {
        const refundAmt = f.paidAmount > 0 ? f.paidAmount : f.balance;
        const newPaid = actionType === 'Void' ? 0 : Math.max(0, f.paidAmount - refundAmt);
        const newCharges = [...f.charges, { date: todayStr, description: `${actionType}: ${refundReason}`, amount: -refundAmt }];
        return {
          ...f,
          status: 'PARTIALLY_SETTLED' as const,
          paidAmount: newPaid,
          balance: Math.max(0, f.totalCharges - newPaid),
          charges: newCharges,
        };
      }
      return f;
    });

    saveFolios(updated);
    if (selectedFolio && selectedFolio.id === targetId) {
      const match = updated.find(u => u.id === targetId);
      if (match) setSelectedFolio(match);
    }
    toast(`${actionType} processed for Folio ${targetId}. Ledger updated.`, 'info');
    setRefundAction(null);
    setRefundReason('');
  };

  const filteredFolios = folios.filter(f => 
    f.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.room.includes(searchQuery)
  );

  const invoiceData = selectedFolio ? {
    invoiceNumber: `INV-${selectedFolio.id.replace('FOL-', '')}`,
    date: new Date().toISOString().split('T')[0],
    folioId: selectedFolio.id,
    guestName: selectedFolio.guest,
    roomNumber: selectedFolio.room,
    roomType: selectedFolio.roomType,
    checkIn: selectedFolio.checkIn,
    checkOut: selectedFolio.checkOut,
    nights: selectedFolio.nights,
    items: selectedFolio.charges,
    subtotal: selectedFolio.totalCharges,
    tax: selectedFolio.totalCharges * 0.12,
    grandTotal: selectedFolio.totalCharges * 1.12,
    paidAmount: selectedFolio.paidAmount,
    balanceDue: selectedFolio.balance,
    paymentMethod: 'Credit Card (Stripe)'
  } : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing & Folio Settlement</h1>
          <p className="text-sm text-slate-500 mt-1">
            Master routing accounts, payment processing, tax invoice printing, and refunds.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Multi-Currency Live Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500 font-semibold">Currency:</span>
            <select
              value={selectedCurrency.code}
              onChange={(e) => {
                const cur = CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0];
                setSelectedCurrency(cur);
                toast(`Switched billing currency to ${cur.label} (Rate: ${cur.rate})`, 'info');
              }}
              className="bg-white text-slate-800 text-xs font-bold rounded-lg px-2 py-1 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Cashier Shift Balancing Action */}
          <button
            onClick={() => setShowShiftModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Generate Cashier Shift End X-Report & Z-Report"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Shift Balancing (X/Z-Report)</span>
          </button>

          {/* Create Folio */}
          <button 
            onClick={handleOpenCreateModal} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Folio</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folios List Left 2 Cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search folio ID, guest name, room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <span className="text-xs text-slate-400">{filteredFolios.length} Active Folios</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Folio ID</th>
                    <th className="px-4 py-3">Guest Details</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Balance Due</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFolios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No active billing folios found. Click "+ Create Master Folio" to open a guest folio.
                      </td>
                    </tr>
                  ) : (
                    filteredFolios.map((folio) => {
                      const isSelected = selectedFolio?.id === folio.id;

                      return (
                        <tr 
                        key={folio.id} 
                        onClick={() => setSelectedFolio(folio)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{folio.id}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900">{folio.guest}</p>
                          <p className="text-[11px] text-slate-400">{folio.nights} Nights Stay</p>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">Room {folio.room}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            folio.status === 'SETTLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {folio.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-sm text-slate-900">
                          {formatCur(folio.balance || 0)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {folio.status === 'SETTLED' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRefundAction({ id: folio.id, type: 'Refund' });
                              }}
                              className="px-2.5 py-1 text-slate-600 hover:text-rose-600 font-semibold text-[11px] rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              Refund
                            </button>
                          ) : (
                            <span className="text-blue-600 text-xs font-semibold">Select →</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Folio Settlement Drawer Right Col */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target Folio</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedFolio?.id || 'No Selection'}</h3>
              </div>
              {selectedFolio && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  selectedFolio.status === 'SETTLED' ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700' : 'bg-amber-900/60 text-amber-400 border border-amber-700'
                }`}>
                  {selectedFolio.status}
                </span>
              )}
            </div>

            {selectedFolio ? (
              <>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Guest:</span>
                    <span className="font-semibold text-white">{selectedFolio.guest}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Assigned Room:</span>
                    <span className="font-semibold text-white">Room {selectedFolio.room}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Stay Duration:</span>
                    <span className="font-semibold text-white">{selectedFolio.nights} Nights</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                    <span>Total Folio Charges:</span>
                    <span className="font-bold text-white">{formatCur(selectedFolio.totalCharges)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Paid to Date:</span>
                    <span className="font-bold">-{formatCur(selectedFolio.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-800 text-emerald-400">
                    <span>Balance Due:</span>
                    <span>{formatCur(selectedFolio.balance)}</span>
                  </div>
                </div>

                {/* Settlement Triggers */}
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Fast Settle</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleSettle('Card')} 
                      className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Settle Card</span>
                    </button>
                    <button 
                      onClick={() => handleSettle('Cash')} 
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Settle Cash</span>
                    </button>
                  </div>

                  {/* Print A4 Tax Invoice Action */}
                  <button
                    onClick={() => setShowA4Invoice(true)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Print Official A4 Tax Invoice</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Select a folio from the table to process payment.</p>
            )}
          </div>
        </div>
      </div>

      {/* A4 Tax Invoice Modal */}
      {showA4Invoice && invoiceData && (
        <A4TaxInvoiceModal
          isOpen={showA4Invoice}
          onClose={() => setShowA4Invoice(false)}
          invoice={invoiceData}
        />
      )}

      {/* Cashier Shift Balancing Modal (80mm Thermal X/Z Report) */}
      <CashierShiftModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        currencySymbol={selectedCurrency.symbol}
        currencyRate={selectedCurrency.rate}
      />

      {/* Create New Folio Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Hotel Folio">
        <form onSubmit={handleConfirmCreateFolio} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Guest or Account Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe or Corporate Banquet"
              value={newFolioData.guest}
              onChange={(e) => setNewFolioData({ ...newFolioData, guest: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room or Department</label>
              <input
                type="text"
                placeholder="e.g. 101 or Banquets"
                value={newFolioData.room}
                onChange={(e) => setNewFolioData({ ...newFolioData, room: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Charge Amount (Rs.)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newFolioData.amount}
                onChange={(e) => setNewFolioData({ ...newFolioData, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Charge Description</label>
            <input
              type="text"
              placeholder="e.g. Room Stay Deposit"
              value={newFolioData.description}
              onChange={(e) => setNewFolioData({ ...newFolioData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Create Folio</button>
          </div>
        </form>
      </Modal>

      {/* Refund / Void Modal */}
      <Modal isOpen={!!refundAction} onClose={() => setRefundAction(null)} title={`${refundAction?.type} Transaction Authorization`}>
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Authorization required to {refundAction?.type.toLowerCase()} transactions for folio {refundAction?.id}.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mandatory Business Reason *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Guest checked out early due to family emergency; authorized by General Manager."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => setRefundAction(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Cancel</button>
            <button onClick={submitRefund} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold">Authorize {refundAction?.type}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
