"use client";
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChefHat, AlertCircle, ArrowRight } from 'lucide-react';

interface OrderItem {
  name: string;
  qty: number;
  notes?: string;
}

interface KOT {
  id: string;
  table: string;
  server: string;
  time: string;
  status: 'NEW' | 'PREPARING' | 'READY';
  items: OrderItem[];
  urgent?: boolean;
}

const mockKots: KOT[] = [];

export default function KitchenDisplaySystem() {
  const [kots, setKots] = useState<KOT[]>(mockKots);

  const loadKots = () => {
    const saved = localStorage.getItem('kds_kots');
    if (saved) {
      // In a real app we'd merge or use WS. For now, let's keep mock state if nothing in local storage.
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) {
        setKots(parsed);
      }
    }
  };

  useEffect(() => {
    loadKots();
    window.addEventListener('kots_updated', loadKots);
    window.addEventListener('storage', loadKots);
    return () => {
      window.removeEventListener('kots_updated', loadKots);
      window.removeEventListener('storage', loadKots);
    };
  }, []);

  const updateStatus = (id: string, newStatus: 'NEW' | 'PREPARING' | 'READY' | 'DONE') => {
    if (newStatus === 'DONE') {
      const updated = kots.filter(k => k.id !== id);
      setKots(updated);
      localStorage.setItem('kds_kots', JSON.stringify(updated));
    } else {
      const updated = kots.map(k => k.id === id ? { ...k, status: newStatus } : k);
      setKots(updated);
      localStorage.setItem('kds_kots', JSON.stringify(updated));
    }
    window.dispatchEvent(new Event('kots_updated'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'border-blue-500 bg-blue-50';
      case 'PREPARING': return 'border-amber-500 bg-amber-50';
      case 'READY': return 'border-emerald-500 bg-emerald-50';
      default: return 'border-slate-500 bg-slate-50';
    }
  };

  const renderColumn = (title: string, status: 'NEW' | 'PREPARING' | 'READY', icon: React.ReactNode) => {
    const columnKots = kots.filter(k => k.status === status);
    
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-100/50 rounded-xl p-4 border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="font-semibold text-slate-800 text-lg">{title}</h2>
          </div>
          <span className="bg-slate-200 text-slate-700 py-1 px-3 rounded-full text-sm font-medium">
            {columnKots.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {columnKots.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-400 italic">
              No tickets in {title.toLowerCase()}
            </div>
          ) : (
            columnKots.map(kot => (
              <div 
                key={kot.id} 
                className={`border-l-4 rounded-r-lg shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${getStatusColor(status)}`}
              >
                <div className="p-3 border-b border-slate-100 flex justify-between items-start bg-white/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{kot.id}</h3>
                      {kot.urgent && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          <AlertCircle size={10} /> Urgent
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Table {kot.table} • Server: {kot.server}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-sm font-medium bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                    <Clock size={14} className={kot.urgent ? 'text-red-500' : 'text-slate-400'} />
                    <span className={kot.urgent ? 'text-red-600 font-bold' : ''}>{kot.time}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-white">
                  <ul className="space-y-3">
                    {kot.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-800">
                        <div className="flex items-start gap-3">
                          <span className="font-bold bg-slate-100 border border-slate-200 rounded min-w-[24px] h-[24px] flex items-center justify-center text-slate-700">
                            {item.qty}
                          </span>
                          <div className="flex-1 pt-0.5">
                            <span className="font-medium text-[15px] block leading-none">{item.name}</span>
                            {item.notes && (
                              <span className="text-xs text-red-600 block mt-1.5 font-medium bg-red-50 px-2 py-1 rounded inline-block">
                                ** {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 flex gap-2">
                  {status === 'NEW' && (
                    <button 
                      onClick={() => updateStatus(kot.id, 'PREPARING')} 
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-md transition-colors text-sm"
                    >
                      Start Preparing <ArrowRight size={16} />
                    </button>
                  )}
                  {status === 'PREPARING' && (
                    <button 
                      onClick={() => updateStatus(kot.id, 'READY')} 
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-md transition-colors text-sm"
                    >
                      Mark as Ready <CheckCircle size={16} />
                    </button>
                  )}
                  {status === 'READY' && (
                    <button 
                      onClick={() => updateStatus(kot.id, 'DONE')} 
                      className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 rounded-md transition-colors text-sm"
                    >
                      Serve (Done)
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ChefHat className="text-amber-600" />
            Kitchen Display System
          </h1>
          <p className="text-sm text-slate-500 mt-1">Live order tracking and management</p>
        </div>
        <button onClick={() => { localStorage.removeItem('kds_kots'); window.dispatchEvent(new Event('kots_updated')); location.reload(); }} className="px-4 py-2 bg-white text-red-600 rounded-full border border-red-200 shadow-sm hover:bg-red-50 text-sm font-medium">Clear Queue</button><div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-600">Live Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {renderColumn('New Orders', 'NEW', <AlertCircle className="text-blue-500" size={20} />)}
        {renderColumn('Preparing', 'PREPARING', <ChefHat className="text-amber-500" size={20} />)}
        {renderColumn('Ready for Pickup', 'READY', <CheckCircle className="text-emerald-500" size={20} />)}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}

