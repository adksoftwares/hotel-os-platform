"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Modal } from '@/components/ui/Modal';
import { 
  ShieldCheck, Key, Plus, Lock, 
  Receipt, BedDouble, Utensils, Users, AlertTriangle, Check
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function PlatformSettings() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([
    { id: 'SUP-901F', initiatedBy: 'admin@hotel.com', expiresAt: '2026-10-12 18:00', status: 'ACTIVE' },
    { id: 'SUP-1A3B', initiatedBy: 'manager@hotel.com', expiresAt: '2026-10-10 12:00', status: 'EXPIRED' }
  ]);

  const handleGrant = () => {
    const newId = `SUP-${Math.random().toString(16).substring(2, 6).toUpperCase()}`;
    setSessions([{ id: newId, initiatedBy: 'admin@hotel.com', expiresAt: '2026-10-13 23:59', status: 'ACTIVE' }, ...sessions]);
    toast('Temporary delegated support session active (24 hours).', 'success');
  };

  const handleRevoke = (id: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, status: 'REVOKED' } : s));
    toast(`Support session ${id} immediately terminated.`, 'info');
  };

  return (
    <div className="hotel-page">
      <PageHeader
        title="Hotel OS Configuration & Security"
        description="Property metadata, staff account credentials, tax settings, and audit permissions."
      />

      {/* Quick Settings Configuration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link
          href="/settings/staff"
          className="hotel-panel p-4 hover:border-slate-300 hover:shadow-xs transition-all group block border-blue-200/80 bg-blue-50/20"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 group-hover:text-indigo-800">
                Staff Accounts
              </h3>
              <p className="text-[11px] text-slate-500">Waiters & Maids logins & passwords</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-800 mt-3 inline-block">
            Manage Staff Accounts →
          </span>
        </Link>

        <Link
          href="/settings/tax"
          className="hotel-panel p-4 hover:border-slate-300 hover:shadow-xs transition-all group block"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 group-hover:text-emerald-800">
                Tax & Levies Master
              </h3>
              <p className="text-[11px] text-slate-500">VAT, City Tax, and Inclusivity rules</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-800 mt-3 inline-block">
            Configure Taxes →
          </span>
        </Link>

        <Link
          href="/settings/rooms/new"
          className="hotel-panel p-4 hover:border-slate-300 hover:shadow-xs transition-all group block"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <BedDouble className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 group-hover:text-blue-800">
                Room Catalog Setup
              </h3>
              <p className="text-[11px] text-slate-500">Register new room keys & configurations</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-800 mt-3 inline-block">
            Add New Room →
          </span>
        </Link>

        <Link
          href="/settings/restaurant/food/new"
          className="hotel-panel p-4 hover:border-slate-300 hover:shadow-xs transition-all group block"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 group-hover:text-amber-800">
                Culinary Menu Master
              </h3>
              <p className="text-[11px] text-slate-500">Dish variants, kitchen routing & pricing</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-800 mt-3 inline-block">
            Create Menu Dish →
          </span>
        </Link>
      </div>

      {/* Support Sessions Panel */}
      <Panel
        title="Delegated Technical Support Sessions"
        description="Generate temporary high-privilege access for support engineers without revealing passwords"
        action={
          <button
            onClick={handleGrant}
            className="hotel-button hotel-button-emerald text-xs"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Grant Support Token</span>
          </button>
        }
      >
        <div className="hotel-table-wrap">
          <table className="hotel-table">
            <thead>
              <tr>
                <th>Session Token</th>
                <th>Initiated By</th>
                <th>Expires Timestamp</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="font-mono text-xs font-semibold text-slate-800">{session.id}</td>
                  <td className="text-slate-600 text-xs">{session.initiatedBy}</td>
                  <td className="text-slate-500 text-xs">{session.expiresAt}</td>
                  <td>
                    {session.status === 'ACTIVE' ? (
                      <span className="hotel-status hotel-status-available">
                        <Check className="w-3 h-3 shrink-0" />
                        Active
                      </span>
                    ) : (
                      <span className="hotel-status hotel-status-neutral">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {session.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleRevoke(session.id)}
                        className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline"
                      >
                        Revoke Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
