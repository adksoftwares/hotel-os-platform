"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Key, CalendarCheck, BedDouble, 
  Utensils, ChefHat, Receipt, Package, Wrench, 
  BarChart3, Settings, Building2, Smartphone, Sparkles
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: "FRONT OFFICE",
    items: [
      { name: "Live Dashboard", path: "/", icon: LayoutDashboard },
      { name: "Front Desk & Stays", path: "/front-desk", icon: Key },
      { name: "Reservations", path: "/reservations", icon: CalendarCheck },
      { name: "Room Board", path: "/rooms", icon: BedDouble },
    ],
  },
  {
    label: "FOOD & BEVERAGE",
    items: [
      { name: "Restaurant POS", path: "/pos", icon: Utensils },
      { name: "Kitchen KDS", path: "/kitchen", icon: ChefHat },
    ],
  },
  {
    label: "FINANCE & OPERATIONS",
    items: [
      { name: "Billing & Cashier", path: "/billing", icon: Receipt },
      { name: "Inventory & Stock", path: "/inventory", icon: Package },
      { name: "Maintenance", path: "/maintenance", icon: Wrench },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { name: "Business Reports", path: "/reports", icon: BarChart3 },
      { name: "Hotel Settings", path: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col shrink-0 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 h-16 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-emerald-600 transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block leading-tight">
              ADK Hotel OS
            </span>
            <span className="text-[11px] text-slate-400 font-medium block">
              Hospitality Workstation
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links Grouped by Department */}
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {group.label}
            </h3>
            <ul className="space-y-0.5 mt-1">
              {group.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                        active
                          ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-emerald-500 pl-2.5'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Mobile / Staff Handheld Portals Shortcuts */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <p className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Staff Portals
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <Link 
            href="/pos/waiter" 
            className="flex items-center gap-1.5 p-2 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-[11px] font-medium"
            title="Waiter Handheld Ordering"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Waiter POS</span>
          </Link>
          <Link 
            href="/rooms/housekeeper" 
            className="flex items-center gap-1.5 p-2 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-[11px] font-medium"
            title="Housekeeper Maid Portal"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Maid Portal</span>
          </Link>
        </div>
      </div>

      {/* Property & System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-400 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-white text-xs font-semibold">Grand ADK Hotel</span>
          </div>
          <span className="text-[10px] text-slate-400">Property Code: ADK001</span>
        </div>
        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
          v2.4
        </span>
      </div>
    </aside>
  );
}
