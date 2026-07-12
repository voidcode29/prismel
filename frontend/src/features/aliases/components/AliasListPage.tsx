import { useState, useEffect, useMemo } from "react";
import type { Alias } from "@prismel/shared";
import {
  Mail,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Zap,
  Globe,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { api } from "../../../lib/api";
import { CreateAliasModal } from "./CreateAliasModal";
import { QuickGenerateModal } from "./QuickGenerateModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { EditAliasModal } from "./EditAliasModal";

const TAG_COLORS: Record<string, string> = {
  public: "bg-blue-50 text-blue-700 border-blue-100",
  contact: "bg-emerald-50 text-emerald-700 border-emerald-100",
  shopping: "bg-amber-50 text-amber-700 border-amber-100",
  perso: "bg-purple-50 text-purple-700 border-purple-100",
  newsletter: "bg-rose-50 text-rose-700 border-rose-100",
  pro: "bg-sky-50 text-sky-700 border-sky-100",
  support: "bg-emerald-50 text-emerald-700 border-emerald-100",
  social: "bg-violet-50 text-violet-700 border-violet-100",
};

function getTagClasses(tag: string): string {
  return TAG_COLORS[tag] || "bg-slate-50 text-slate-700 border-slate-100";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const ICONS_BY_TAG: Record<string, React.ReactNode> = {
  public: <Mail className="w-5 h-5 text-indigo-600" />,
  contact: <Mail className="w-5 h-5 text-indigo-600" />,
  shopping: (
    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  newsletter: (
    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  support: (
    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  social: (
    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2v-8a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
};

function getRowIcon(alias: Alias): React.ReactNode {
  const tag = alias.tags[0];
  if (tag && ICONS_BY_TAG[tag]) return ICONS_BY_TAG[tag];
  return <Mail className="w-5 h-5 text-indigo-600" />;
}

function getRowIconBg(alias: Alias): string {
  const tag = alias.tags[0];
  const bgs: Record<string, string> = {
    public: "bg-indigo-100",
    contact: "bg-indigo-100",
    shopping: "bg-amber-100",
    newsletter: "bg-rose-100",
    support: "bg-emerald-100",
    social: "bg-violet-100",
  };
  return bgs[tag || ""] || "bg-indigo-100";
}

export function AliasListPage() {
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [aliasToDelete, setAliasToDelete] = useState<Alias | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [aliasToEdit, setAliasToEdit] = useState<Alias | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(true);

  const fetchAliases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAliases();
      setAliases(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load aliases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAliases();
  }, []);

  const filteredAliases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return aliases;
    return aliases.filter(
      (a) =>
        a.email.toLowerCase().includes(q) ||
        (a.serviceName && a.serviceName.toLowerCase().includes(q)) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [aliases, searchQuery]);

  const stats = useMemo(() => {
    const domains = new Set(aliases.map((a) => a.domain));
    const tags = new Set(aliases.flatMap((a) => a.tags));
    return {
      total: aliases.length,
      domains: domains.size,
      active: aliases.length,
      tags: tags.size,
    };
  }, [aliases]);

  const openDelete = (alias: Alias) => {
    setAliasToDelete(alias);
    setDeleteModalOpen(true);
  };

  const openEdit = (alias: Alias) => {
    setAliasToEdit(alias);
    setEditModalOpen(true);
    setEditModalVisible(true);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-2 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
          Loading aliases...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block bg-red-50 border border-red-200 rounded-xl px-6 py-4">
          <p className="text-sm text-red-700 font-medium mb-2">Error loading aliases</p>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchAliases}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Aliases</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and organize your email aliases across domains</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center gap-2 shadow-sm"
          >
            <Zap className="w-4 h-4 text-indigo-600" />
            Quick Generate
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            Create Alias
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Domains</span>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.domains}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active</span>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">{stats.active}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600">{stats.tags}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email, service, or tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* Table or Empty State */}
      {aliases.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No aliases yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Create your first email alias to start organizing your online identity.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              Create Alias
            </button>
            <button
              onClick={() => setGenerateModalOpen(true)}
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
            >
              Generate One
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAliases.map((alias) => (
                  <tr
                    key={alias.id}
                    onClick={() => openEdit(alias)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRowIconBg(alias)}`}>
                          {getRowIcon(alias)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{alias.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">
                        {alias.serviceName || "—"}
                      </div>
                      {alias.description && (
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{alias.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {alias.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getTagClasses(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {alias.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(alias.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {filteredAliases.length} of {aliases.length} aliases
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-slate-400 bg-white border border-slate-200 rounded-lg cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-400 bg-white border border-slate-200 rounded-lg cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateAliasModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchAliases}
      />
      <QuickGenerateModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onCreated={fetchAliases}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        alias={aliasToDelete}
        onClose={() => {
          setEditModalVisible(true);
          setDeleteModalOpen(false);
          setAliasToDelete(null);
        }}
        onDeleted={() => {
          fetchAliases();
          setEditModalOpen(false);
          setAliasToEdit(null);
        }}
      />
      <EditAliasModal
        open={editModalOpen}
        alias={aliasToEdit}
        visible={editModalVisible}
        onClose={() => {
          setEditModalOpen(false);
          setAliasToEdit(null);
        }}
        onUpdated={fetchAliases}
        onDelete={() => {
          if (aliasToEdit) {
            setEditModalVisible(false);
            openDelete(aliasToEdit);
          }
        }}
      />
    </div>
  );
}
