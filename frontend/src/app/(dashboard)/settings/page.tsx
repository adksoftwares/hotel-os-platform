"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export default function PlatformSettings() {
  const [sessions, setSessions] = useState([
    { id: 'SUP-901F', initiatedBy: 'admin@hotel.com', expiresAt: '2024-10-02 18:00', status: 'ACTIVE' },
    { id: 'SUP-1A3B', initiatedBy: 'manager@hotel.com', expiresAt: '2024-10-01 12:00', status: 'EXPIRED' }
  ]);

  const [modalMessage, setModalMessage] = useState('');

  const handleGrant = () => {
    const newId = `SUP-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;
    setSessions([{ id: newId, initiatedBy: 'admin@hotel.com', expiresAt: '2024-12-31 23:59', status: 'ACTIVE' }, ...sessions]);
    setModalMessage('Temporary support access granted.');
  };

  const handleRevoke = (id: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, status: 'REVOKED' } : s));
    setModalMessage('Support access immediately revoked.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings & Security</h1>
        <button onClick={handleGrant} className="btn-primary">Grant Support Access</button>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">Active Support Sessions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-2">Session ID</th>
                <th className="px-4 py-2">Initiated By</th>
                <th className="px-4 py-2">Expires At</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary-600">{session.id}</td>
                  <td className="px-4 py-3">{session.initiatedBy}</td>
                  <td className="px-4 py-3">{session.expiresAt}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${session.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {session.status === 'ACTIVE' && (
                      <button onClick={() => handleRevoke(session.id)} className="text-red-600 hover:text-red-800 font-medium">Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!modalMessage} onClose={() => setModalMessage('')} title="Security Action">
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
