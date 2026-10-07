export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-slate-800">Operational Workspace</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-600">admin@hotel.com</span>
        <button className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
