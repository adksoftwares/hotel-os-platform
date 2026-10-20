"use client";
import React, { useRef } from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck, Building2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  folioId: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  items: { description: string; date: string; amount: number }[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: string;
}

interface A4TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
}

export function A4TaxInvoiceModal({ isOpen, onClose, invoice }: A4TaxInvoiceModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const downloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('GRAND ADK HOTEL & SUITES', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Main Property Road, Luxury Hospitality District', 14, 26);
    doc.text('Tel: +91 99999 00000 | reservations@adkhotel.com | GST/VAT: 29AAACH7409R1ZX', 14, 30);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 34, 196, 34);

    // Invoice Title & Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('OFFICIAL TAX INVOICE & FOLIO', 14, 44);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 140, 42);
    doc.text(`Invoice Date: ${invoice.date}`, 140, 47);
    doc.text(`Folio Reference: ${invoice.folioId}`, 140, 52);

    // Billed To Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 56, 182, 24, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Guest: ${invoice.guestName}`, 18, 63);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Room: ${invoice.roomNumber} (${invoice.roomType})`, 18, 69);
    doc.text(`Stay Period: ${invoice.checkIn} to ${invoice.checkOut} (${invoice.nights} Nights)`, 18, 75);

    // Itemized Table
    const tableData = invoice.items.map(item => [
      item.date,
      item.description,
      `Rs. ${item.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Date', 'Description of Services', 'Amount (Rs.)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 2: { halign: 'right' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 140;

    // Totals summary
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 140, finalY + 10);
    doc.text(`Rs. ${invoice.subtotal.toFixed(2)}`, 190, finalY + 10, { align: 'right' });

    doc.text('Occupancy & Service Tax (12%):', 140, finalY + 16);
    doc.text(`Rs. ${invoice.tax.toFixed(2)}`, 190, finalY + 16, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total Invoice Amount:', 140, finalY + 24);
    doc.text(`Rs. ${invoice.grandTotal.toFixed(2)}`, 190, finalY + 24, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text(`Payment Settled (${invoice.paymentMethod}):`, 140, finalY + 30);
    doc.text(`-Rs. ${invoice.paidAmount.toFixed(2)}`, 190, finalY + 30, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Balance Due:', 140, finalY + 37);
    doc.text(`Rs. ${invoice.balanceDue.toFixed(2)}`, 190, finalY + 37, { align: 'right' });

    // Footer signature & note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for choosing Grand ADK Hotel & Suites. Computer generated invoice.', 14, 275);
    doc.line(14, 260, 60, 260);
    doc.text('Authorized Front Office Cashier', 14, 265);

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">A4 Official Tax Invoice Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable A4 Invoice Sheet */}
        <div ref={printableRef} className="p-8 sm:p-12 bg-white text-slate-900 text-xs font-sans space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">GRAND ADK HOTEL & SUITES</h1>
              <p className="text-slate-500 text-[11px] mt-1">Main Property Road, Luxury Hospitality District</p>
              <p className="text-slate-500 text-[11px]">Tel: +91 99999 00000 | reservations@adkhotel.com</p>
              <p className="text-slate-500 text-[11px] font-mono mt-0.5">GST/VAT Tax ID: 29AAACH7409R1ZX</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                TAX INVOICE
              </span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-2">{invoice.invoiceNumber}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Date: {invoice.date}</p>
            </div>
          </div>

          {/* Guest Stay Metadata Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Billed Guest</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{invoice.guestName}</p>
              <p className="text-slate-600 text-xs">Room {invoice.roomNumber} · {invoice.roomType}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Stay Dates & Folio</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">
                {invoice.checkIn} to {invoice.checkOut} ({invoice.nights} Nights)
              </p>
              <p className="text-slate-500 font-mono text-[11px]">Folio Ref: {invoice.folioId}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[11px] font-bold uppercase text-slate-600">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Description of Charges</th>
                <th className="py-2.5 text-right">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 font-mono text-slate-500">{item.date}</td>
                  <td className="py-3 font-medium text-slate-800">{item.description}</td>
                  <td className="py-3 text-right font-bold text-slate-900">Rs. {item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Invoice Totals Summary */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">Rs. {invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Occupancy Tax (12%):</span>
                <span className="font-bold text-slate-900">Rs. {invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Folio:</span>
                <span className="text-blue-600">Rs. {invoice.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Paid ({invoice.paymentMethod}):</span>
                <span>-Rs. {invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Balance Due:</span>
                <span>Rs. {invoice.balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer & QR Code verification */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-slate-400 text-[10px]">
            <div>
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-600">Authorized Front Office Signature</p>
              <p className="mt-1">Computer-generated official tax document.</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-slate-500">QR Token: 89a-inv-94819</p>
              <p>Verify at grandhorizon.com/verify</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
