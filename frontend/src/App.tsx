import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Logo } from "./components/Logo";
import { ThemeToggle } from "./components/ThemeToggle";
import { AliasListPage } from "./features/aliases/components/AliasListPage";
import { SyncPage } from "./features/aliases/components/SyncPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { SyncProvider } from "./features/aliases/SyncContext";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "text-solaris-blue-600 dark:text-solaris-blue-200 bg-solaris-blue-50 dark:bg-solaris-blue-900/40"
          : "text-solaris-600 dark:text-solaris-400 hover:text-solaris-900 dark:hover:text-solaris-50 hover:bg-solaris-200 dark:hover:bg-solaris-800"
      }`}
    >
      {children}
    </Link>
  );
}

export function App() {
  return (
    <div className="min-h-screen bg-solaris-50 dark:bg-solaris-950 text-solaris-900 dark:text-solaris-50">
      <header className="bg-white dark:bg-solaris-900 border-b border-solaris-200 dark:border-solaris-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9" />
            <span className="text-xl font-bold tracking-tight text-solaris-900 dark:text-solaris-50">Prismel</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <NavLink to="/">Aliases</NavLink>
            <NavLink to="/sync">Sync</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SyncProvider>
          <Routes>
            <Route path="/" element={<AliasListPage />} />
            <Route path="/aliases" element={<AliasListPage />} />
            <Route path="/sync" element={<SyncPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </SyncProvider>
      </main>
    </div>
  );
}
