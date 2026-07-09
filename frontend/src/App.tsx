import { Routes, Route, Link } from "react-router-dom";
import { AliasListPage } from "./features/aliases/pages/AliasListPage";

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold text-gray-900">
            Prismel
          </Link>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link to="/aliases" className="hover:text-gray-900">
              Aliases
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<AliasListPage />} />
          <Route path="/aliases" element={<AliasListPage />} />
        </Routes>
      </main>
    </div>
  );
}
