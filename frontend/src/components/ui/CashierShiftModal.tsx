"use client";
import React, { useState } from 'react';
import { 
  Printer, X, CheckCircle, AlertTriangle, ShieldCheck, 
  RotateCcw, DollarSign, CreditCard, Lock, Sparkles, Building
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CashierShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  currencyRate: number;
}

export function CashierShiftModal({ 
  isOpen, 
  onClose, 
  currencySymbol, 
  currencyRate 
}: CashierShiftModalProps) {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<'X' | 'Z'>('X');
  const [declaredCash, setDeclaredCash] = useState<string>('875.00');
  const [isShiftClosed, setIsShiftClosed] = useState(false);

  if (!isOpen) return null;

  // Base USD metrics
  const openingFloatUSD = 200.00;
  const cashPaymentsUSD = 675.00;
  const cardPaymentsUSD = 3200.00;
  const roomTransfersUSD = 1400.00;
  const grossSalesUSD = cashPaymentsUSD + cardPaymentsUSD + roomTransfersUSD;
  const refundsUSD = 0.00;
  const netSalesUSD = grossSalesUSD - refundsUSD;
  const expectedCashUSD = openingFloatUSD + cashPaymentsUSD;

  // Converted values
  const fmt = (usd: number) => `${currencySymbol}${(usd * currencyRate).toFixed(2)}`;

  const declaredNum = parseFloat(declaredCash) || 0;
  const expectedConverted = expectedCashUSD * currencyRate;
  const variance = declaredNum - expectedConverted;

  const handlePrint = () => {
    window.print();
    toast(`${reportType}-Report sent to thermal receipt printer.`, 'success');
  };

  const handleFinalizeZReport = () => {
    setIsShiftClosed(true);
    toast('Z-Report Finalized! Cashier drawer locked & cleared to zero for end of day.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                CASHIER BALANCING
              </span>
              <span className="text-xs text-slate-400">Shift #4208</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              Shift End Drawer & Sales Audit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Selector Pills */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setReportType('X')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              reportType === 'X' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            X-Report (Mid-Shift Reading)
          </button>
          <button
            onClick={() => setReportType('Z')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              reportType === 'Z' 
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Z-Report (EOD Drawer Close)
          </button>
        </div>

        {/* 80mm Thermal Receipt Slip Preview (White thermal receipt paper look) */}
        <div className="p-4 bg-slate-950 flex-1 overflow-y-auto max-h-[460px]">
          <div className="bg-white text-slate-900 p-5 rounded-xl shadow-inner font-mono text-xs border border-slate-200 printable-slip">
            
            {/* Header info */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <h3 className="font-extrabold text-sm uppercase tracking-wide">GRAND HORIZON RESORT</h3>
              <p className="text-[11px] text-slate-600">Marina Bay Front Desk Cashier #01</p>
              <div className="mt-2 text-[10px] text-slate-500">
                <div>DATE: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
                <div>CASHIER: Super Admin [ID #001]</div>
              </div>
              <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white font-bold rounded text-[11px] uppercase tracking-wider">
                {reportType === 'X' ? '★ X-REPORT: MID-SHIFT AUDIT ★' : '🔒 Z-REPORT: END-OF-DAY CLOSE 🔒'}
              </div>
            </div>

            {/* Shift Sales Breakdown */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5">
              <div className="font-bold text-[11px] text-slate-700 uppercase">Settlement Breakdown:</div>
              <div className="flex justify-between">
                <span>Opening Cash Float:</span>
                <span className="font-bold">{fmt(openingFloatUSD)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Payments Received:</span>
                <span className="font-bold">{fmt(cashPaymentsUSD)}</span>
              </div>
              <div className="flex justify-between">
                <span>Credit Card / Stripe:</span>
                <span className="font-bold">{fmt(cardPaymentsUSD)}</span>
              </div>
              <div className="flex justify-between">
                <span>Room Charges (Folios):</span>
                <span className="font-bold">{fmt(roomTransfersUSD)}</span>
              </div>
            </div>

            {/* Totals */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>GROSS REVENUE:</span>
                <span>{fmt(grossSalesUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Refunds / Voids:</span>
                <span>{fmt(refundsUSD)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-300">
                <span>NET REVENUE:</span>
                <span>{fmt(netSalesUSD)}</span>
              </div>
            </div>

            {/* Drawer Cash Balancing */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5">
              <div className="font-bold text-[11px] text-slate-700 uppercase">Drawer Cash Balance:</div>
              <div className="flex justify-between">
                <span>Expected Drawer Cash:</span>
                <span className="font-bold">{currencySymbol}{expectedConverted.toFixed(2)}</span>
              </div>
              
              {reportType === 'Z' && (
                <>
                  <div className="flex justify-between items-center text-blue-700 font-bold">
                    <span>Physical Cash Declared:</span>
                    <span>{currencySymbol}{declaredNum.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between font-extrabold text-xs pt-1 border-t border-slate-200 ${
                    Math.abs(variance) < 0.01 ? 'text-emerald-700' : variance > 0 ? 'text-blue-700' : 'text-rose-700'
                  }`}>
                    <span>DRAWER OVER / (SHORT):</span>
                    <span>
                      {variance >= 0 ? '+' : ''}{currencySymbol}{variance.toFixed(2)} 
                      {Math.abs(variance) < 0.01 ? ' (BALANCED ✅)' : ''}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Verification Signatures */}
            <div className="pt-4 text-center text-[10px] text-slate-500 space-y-3">
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="border-t border-slate-300 pt-1">Cashier Signature</div>
                <div className="border-t border-slate-300 pt-1">Manager Signature</div>
              </div>
              <p className="tracking-widest uppercase">*** END OF REPORT ***</p>
            </div>

          </div>
        </div>

        {/* Z-Report Physical Cash Declaration Input */}
        {reportType === 'Z' && !isShiftClosed && (
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Declare Physical Cash Count in Drawer ({currencySymbol}):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={declaredCash}
                onChange={(e) => setDeclaredCash(e.target.value)}
                placeholder="Enter physical cash counted in register..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                onClick={handleFinalizeZReport}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
              >
                Zero & Close Shift
              </button>
            </div>
          </div>
        )}

        {isShiftClosed && (
          <div className="p-3 bg-emerald-950/40 border-t border-emerald-800/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Shift closed and register reset for tomorrow's business day.
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            Print 80mm Slip
          </button>
        </div>

      </div>
    </div>
  );
}
