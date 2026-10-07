"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export default function BillingDashboard() {
  const [folios, setFolios] = useState<any[]>([]);

  const [selectedFolio, setSelectedFolio] = useState(folios[0]);
  const [modalMessage, setModalMessage] = useState('');

  const handleCreateFolio = () => {
    const newId = `FOL-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;
    setFolios([{ id: newId, guest: 'New Master Folio', room: 'N/A', status: 'OPEN', balance: 0.00 }, ...folios]);
    setModalMessage(`Master Folio ${newId} created successfully.`);
  };

  const handleSettle = (method: string) => {
    if (selectedFolio?.balance <= 0) return setModalMessage('Folio is already settled.');
    
    const amount = selectedFolio?.balance;
    const updated = folios.map(f => f.id === selectedFolio?.id ? { ...f, status: 'SETTLED', balance: 0 } : f);
    setFolios(updated);
    setSelectedFolio({ ...selectedFolio, status: 'SETTLED', balance: 0 });
    
    setModalMessage(`Payment of $${amount.toFixed(2)} processed via ${method}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Billing & Folios</h1>
        <button onClick={handleCreateFolio} className="btn-primary">Create Master Folio</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">Active Folios</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-2">Folio #</th>
                    <th className="px-4 py-2">Guest/Account</th>
                    <th className="px-4 py-2">Room</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {folios.map((folio) => (
                    <tr onClick={() => setSelectedFolio(folio)} key={folio.id} className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedFolio?.id === folio.id ? 'bg-slate-50 border-l-2 border-primary-500' : ''}`}>
                      <td className="px-4 py-3 font-medium text-primary-600">{folio.id}</td>
                      <td className="px-4 py-3 text-slate-800">{folio.guest}</td>
                      <td className="px-4 py-3">{folio.room}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${folio.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : folio.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                          {folio.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">${folio.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-slate-800 text-white border-slate-700">
            <h3 className="font-semibold mb-4 text-slate-300">Quick Settlement ({selectedFolio?.id})</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span>Guest</span><span>{selectedFolio?.guest}</span></div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-600 pt-2 text-emerald-400">
                <span>Balance Due</span><span>${selectedFolio?.balance.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleSettle('Card')} className="bg-slate-700 hover:bg-slate-600 py-2 rounded font-medium transition-colors">Card</button>
              <button onClick={() => handleSettle('Cash')} className="bg-slate-700 hover:bg-slate-600 py-2 rounded font-medium transition-colors">Cash</button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!modalMessage} onClose={() => setModalMessage('')} title="Billing Notification">
        <div className="space-y-6">
          <p className="text-slate-700 font-medium">{modalMessage}</p>
          <div className="flex justify-end">
            <button onClick={() => setModalMessage('')} className="btn-primary">OK</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
