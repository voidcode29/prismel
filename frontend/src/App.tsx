import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Mail, Bell } from "lucide-react";
import { AliasListPage } from "./features/aliases/components/AliasListPage";
import { SyncPage } from "./features/aliases/components/SyncPage";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "text-indigo-700 bg-indigo-50"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}

export function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Mail className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Prismel</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <NavLink to="/">Aliases</NavLink>
            <NavLink to="/domains">Domains</NavLink>
            <NavLink to="/sync">Sync</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              TD
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<AliasListPage />} />
          <Route path="/aliases" element={<AliasListPage />} />
          <Route path="/sync" element={<SyncPage />} />
        </Routes>
      </main>
    </div>
  );
}
