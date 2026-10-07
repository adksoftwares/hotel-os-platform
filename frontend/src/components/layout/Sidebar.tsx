import Link from 'next/link';

export function Sidebar() {
  const menus = [
    { name: 'Dashboard', path: '/' },
    { name: 'Front Desk', path: '/front-desk' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'Rooms & Housekeeping', path: '/rooms' },
    { name: 'Restaurant POS', path: '/pos' },
    { name: 'Kitchen KDS', path: '/kitchen' },
    { name: 'Billing', path: '/billing' },
    { name: 'Inventory & Purchasing', path: '/inventory' },
    { name: 'Reports', path: '/reports' },
    { name: 'Platform Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-4 flex items-center h-16 border-b border-slate-700">
        <span className="font-bold text-xl tracking-tight text-primary-500">Hotel OS</span>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menus.map((m) => (
            <li key={m.name}>
              <Link href={m.path} className="block px-4 py-2 hover:bg-slate-800 transition-colors text-slate-300 hover:text-white text-sm font-medium">
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        Active Property: Grand Integration
      </div>
    </aside>
  );
}
