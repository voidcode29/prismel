import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Alias } from "@/types/alias";
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
  Copy,
  Check,
} from "lucide-react";
import { api } from "../../../lib/api";
import { QuickGenerateModal } from "./QuickGenerateModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { AliasFormModal } from "./AliasFormModal";

const TAG_COLORS: Record<string, string> = {
  public: "bg-solaris-blue-50 dark:bg-solaris-blue-900/30 text-solaris-blue-600 dark:text-solaris-blue-200 border-solaris-blue-100 dark:border-solaris-blue-800",
  contact: "bg-solaris-green-50 dark:bg-solaris-green-900/30 text-solaris-green-500 dark:text-solaris-green-200 border-solaris-green-200 dark:border-solaris-green-800",
  shopping: "bg-solaris-yellow-50 dark:bg-solaris-yellow-900/30 text-solaris-yellow-600 dark:text-solaris-yellow-200 border-solaris-yellow-100 dark:border-solaris-yellow-800",
  perso: "bg-solaris-violet-50 dark:bg-solaris-violet-900/30 text-solaris-violet-500 dark:text-solaris-violet-200 border-solaris-violet-100 dark:border-solaris-violet-800",
  newsletter: "bg-solaris-magenta-50 dark:bg-solaris-magenta-900/30 text-solaris-magenta-500 dark:text-solaris-magenta-200 border-solaris-magenta-100 dark:border-solaris-magenta-800",
  pro: "bg-solaris-cyan-50 dark:bg-solaris-cyan-900/30 text-solaris-cyan-600 dark:text-solaris-cyan-200 border-solaris-cyan-100 dark:border-solaris-cyan-800",
  support: "bg-solaris-green-50 dark:bg-solaris-green-900/30 text-solaris-green-500 dark:text-solaris-green-200 border-solaris-green-200 dark:border-solaris-green-800",
  social: "bg-solaris-violet-50 dark:bg-solaris-violet-900/30 text-solaris-violet-500 dark:text-solaris-violet-200 border-solaris-violet-100 dark:border-solaris-violet-800",
};

function getTagClasses(tag: string): string {
  return TAG_COLORS[tag] || "bg-solaris-50 dark:bg-solaris-950 text-solaris-700 dark:text-solaris-300 border-solaris-100 dark:border-solaris-800";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const ICONS_BY_TAG: Record<string, React.ReactNode> = {
  public: <Mail className="w-5 h-5 text-solaris-blue-500 dark:text-solaris-blue-300" />,
  contact: <Mail className="w-5 h-5 text-solaris-blue-500 dark:text-solaris-blue-300" />,
  shopping: (
    <svg className="w-5 h-5 text-solaris-yellow-500 dark:text-solaris-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  newsletter: (
    <svg className="w-5 h-5 text-solaris-magenta-400 dark:text-solaris-magenta-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  support: (
    <svg className="w-5 h-5 text-solaris-green-400 dark:text-solaris-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  social: (
    <svg className="w-5 h-5 text-solaris-violet-400 dark:text-solaris-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2v-8a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
};

function getRowIcon(alias: Alias): React.ReactNode {
  const tag = alias.tags[0];
  if (tag && ICONS_BY_TAG[tag]) return ICONS_BY_TAG[tag];
  return <Mail className="w-5 h-5 text-solaris-blue-500 dark:text-solaris-blue-300" />;
}

function getRowIconBg(alias: Alias): string {
  const tag = alias.tags[0];
  const bgs: Record<string, string> = {
    public: "bg-solaris-blue-100 dark:bg-solaris-blue-800/30",
    contact: "bg-solaris-blue-100 dark:bg-solaris-blue-800/30",
    shopping: "bg-solaris-yellow-100 dark:bg-solaris-yellow-800/30",
    newsletter: "bg-solaris-magenta-100 dark:bg-solaris-magenta-800/30",
    support: "bg-solaris-green-100 dark:bg-solaris-green-800/30",
    social: "bg-solaris-violet-100 dark:bg-solaris-violet-800/30",
  };
  return bgs[tag || ""] || "bg-solaris-blue-100 dark:bg-solaris-blue-800/30";
}

export function AliasListPage() {
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<"create" | "edit">("create");
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [aliasToDelete, setAliasToDelete] = useState<Alias | null>(null);
  const [aliasToEdit, setAliasToEdit] = useState<Alias | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(true);
  const [sortKey, setSortKey] = useState<keyof Alias | null>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 50, aliases.length));
  }, [aliases.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

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

  const displayedAliases = useMemo(() => {
    if (!sortKey) return filteredAliases;
    const sorted = [...filteredAliases];
    sorted.sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      switch (sortKey) {
        case "email":
          va = a.email.toLowerCase();
          vb = b.email.toLowerCase();
          break;
        case "serviceName":
          va = (a.serviceName || "").toLowerCase();
          vb = (b.serviceName || "").toLowerCase();
          break;
        case "tags":
          va = a.tags.length;
          vb = b.tags.length;
          break;
        case "domain":
          va = a.domain.toLowerCase();
          vb = b.domain.toLowerCase();
          break;
        case "createdAt":
          va = a.createdAt;
          vb = b.createdAt;
          break;
        case "updatedAt":
          va = a.updatedAt;
          vb = b.updatedAt;
          break;
        default:
          return 0;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredAliases, sortKey, sortDir]);

  const handleSort = (key: keyof Alias) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleCopy = (e: React.MouseEvent, email: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  function SortArrow({ column }: { column: keyof Alias }) {
    if (sortKey !== column) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

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
    setFormModalMode("edit");
    setFormModalOpen(true);
    setFormModalVisible(true);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-2 text-solaris-500 dark:text-solaris-400">
          <div className="w-5 h-5 border-2 border-solaris-300 dark:border-solaris-700 border-t-solaris-blue-500 dark:border-t-solaris-blue-400 rounded-full animate-spin" />
          Loading aliases...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block bg-solaris-red-50 dark:bg-solaris-red-900/30 border border-solaris-red-200 dark:border-solaris-red-800 rounded-xl px-6 py-4">
          <p className="text-sm text-solaris-red-500 dark:text-solaris-red-200 font-medium mb-2">Error loading aliases</p>
          <p className="text-sm text-solaris-red-400 dark:text-solaris-red-200">{error}</p>
          <button
            onClick={fetchAliases}
            className="mt-3 px-4 py-2 bg-solaris-red-400 text-white rounded-lg text-sm font-medium hover:bg-solaris-red-500 transition-colors"
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
          <h1 className="text-2xl font-bold text-solaris-900 dark:text-solaris-50">Email Aliases</h1>
          <p className="text-sm text-solaris-500 dark:text-solaris-400 mt-1">Manage and organize your email aliases across domains</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="px-4 py-2.5 bg-white dark:bg-solaris-900 border border-solaris-300 dark:border-solaris-700 rounded-xl text-sm font-medium text-solaris-700 dark:text-solaris-300 hover:bg-solaris-200 dark:hover:bg-solaris-800 hover:border-solaris-400 dark:hover:border-solaris-600 transition-all flex items-center gap-2 shadow-sm"
          >
            <Zap className="w-4 h-4 text-solaris-blue-500 dark:text-solaris-blue-300" />
            Quick Generate
          </button>
          <button
            onClick={() => {
              setFormModalMode("create");
              setAliasToEdit(null);
              setFormModalOpen(true);
            }}
            className="px-4 py-2.5 bg-solaris-blue-500 dark:bg-solaris-blue-400 text-white rounded-xl text-sm font-medium hover:bg-solaris-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-solaris-blue-400/25"
          >
            <Plus className="w-4 h-4" />
            Create Alias
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-solaris-900 p-5 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider">Total</span>
            <div className="w-8 h-8 bg-solaris-blue-50 dark:bg-solaris-blue-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-solaris-blue-500 dark:text-solaris-blue-300" />
            </div>
          </div>
          <div className="text-3xl font-bold text-solaris-900 dark:text-solaris-50">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-solaris-900 p-5 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider">Domains</span>
            <div className="w-8 h-8 bg-solaris-green-50 dark:bg-solaris-green-900/30 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-solaris-green-400 dark:text-solaris-green-200" />
            </div>
          </div>
          <div className="text-3xl font-bold text-solaris-900 dark:text-solaris-50">{stats.domains}</div>
        </div>
        <div className="bg-white dark:bg-solaris-900 p-5 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider">Active</span>
            <div className="w-8 h-8 bg-solaris-green-50 dark:bg-solaris-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-solaris-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-solaris-green-400 dark:text-solaris-green-200">{stats.active}</div>
        </div>
        <div className="bg-white dark:bg-solaris-900 p-5 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider">Tags</span>
            <div className="w-8 h-8 bg-solaris-yellow-50 dark:bg-solaris-yellow-900/30 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-solaris-yellow-500 dark:text-solaris-yellow-200" />
            </div>
          </div>
          <div className="text-3xl font-bold text-solaris-yellow-500 dark:text-solaris-yellow-200">{stats.tags}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-solaris-400 dark:text-solaris-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email, service, or tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-200 dark:border-solaris-800 rounded-lg focus:ring-2 focus:ring-solaris-blue-400 focus:border-solaris-blue-400 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2.5 text-sm font-medium text-solaris-600 dark:text-solaris-400 bg-solaris-50 dark:bg-solaris-950 border border-solaris-200 dark:border-solaris-800 rounded-lg hover:bg-solaris-100 dark:hover:bg-solaris-700 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-3 py-2.5 text-sm font-medium text-solaris-600 dark:text-solaris-400 bg-solaris-50 dark:bg-solaris-950 border border-solaris-200 dark:border-solaris-800 rounded-lg hover:bg-solaris-100 dark:hover:bg-solaris-700 transition-colors flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* Table or Empty State */}
      {aliases.length === 0 ? (
        <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-solaris-100 dark:bg-solaris-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-solaris-400 dark:text-solaris-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-solaris-900 dark:text-solaris-50 mb-2">No aliases yet</h3>
          <p className="text-sm text-solaris-500 dark:text-solaris-400 max-w-sm mx-auto mb-6">
            Create your first email alias to start organizing your online identity.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setFormModalMode("create");
                setAliasToEdit(null);
                setFormModalOpen(true);
              }}
              className="px-5 py-2.5 bg-solaris-blue-500 dark:bg-solaris-blue-400 text-white rounded-xl text-sm font-medium hover:bg-solaris-blue-600 transition-all shadow-lg shadow-solaris-blue-400/25"
            >
              Create Alias
            </button>
            <button
              onClick={() => setGenerateModalOpen(true)}
              className="px-5 py-2.5 bg-white dark:bg-solaris-900 border border-solaris-300 dark:border-solaris-700 text-solaris-700 dark:text-solaris-300 rounded-xl text-sm font-medium hover:bg-solaris-200 dark:hover:bg-solaris-800 transition-all"
            >
              Generate One
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-solaris-50 dark:bg-solaris-950 border-b border-solaris-200 dark:border-solaris-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider cursor-pointer select-none hover:text-solaris-700 dark:hover:text-solaris-300 transition-colors" onClick={() => handleSort("email")}>Email<SortArrow column="email" /></th>
                  <th className="px-6 py-4 text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider cursor-pointer select-none hover:text-solaris-700 dark:hover:text-solaris-300 transition-colors" onClick={() => handleSort("serviceName")}>Service<SortArrow column="serviceName" /></th>
                  <th className="px-6 py-4 text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider cursor-pointer select-none hover:text-solaris-700 dark:hover:text-solaris-300 transition-colors" onClick={() => handleSort("tags")}>Tags<SortArrow column="tags" /></th>
                  <th className="px-6 py-4 text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider cursor-pointer select-none hover:text-solaris-700 dark:hover:text-solaris-300 transition-colors" onClick={() => handleSort("domain")}>Domain<SortArrow column="domain" /></th>
                  <th className="px-6 py-4 text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider cursor-pointer select-none hover:text-solaris-700 dark:hover:text-solaris-300 transition-colors" onClick={() => handleSort("createdAt")}>Created<SortArrow column="createdAt" /></th>
                  <th className="px-6 py-4 text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider cursor-pointer select-none hover:text-solaris-700 dark:hover:text-solaris-300 transition-colors" onClick={() => handleSort("updatedAt")}>Modified<SortArrow column="updatedAt" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-solaris-200 dark:divide-solaris-800">
                {displayedAliases.slice(0, visibleCount).map((alias) => (
                  <tr
                    key={alias.id}
                    onClick={() => openEdit(alias)}
                    className="hover:bg-solaris-200/60 dark:hover:bg-solaris-800/60 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRowIconBg(alias)}`}>
                          {getRowIcon(alias)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-solaris-900 dark:text-solaris-50">{alias.email}</span>
                          <button
                            onClick={(e) => handleCopy(e, alias.email, alias.id)}
                            className="p-0.5 rounded hover:bg-solaris-200 dark:hover:bg-solaris-700 transition-colors flex-shrink-0"
                            title="Copy to clipboard"
                          >
                            {copiedId === alias.id ? (
                              <Check className="w-3.5 h-3.5 text-solaris-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-solaris-400 dark:text-solaris-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-solaris-700 dark:text-solaris-300">
                        {alias.serviceName || "—"}
                      </div>
                      {alias.description && (
                        <div className="text-xs text-solaris-500 dark:text-solaris-400 truncate max-w-[200px]">{alias.description}</div>
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-solaris-100 dark:bg-solaris-800 text-solaris-700 dark:text-solaris-300 border border-solaris-200 dark:border-solaris-800">
                        {alias.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-solaris-500 dark:text-solaris-400 text-xs">{formatDate(alias.createdAt)}</td>
                    <td className="px-6 py-4 text-solaris-500 dark:text-solaris-400 text-xs">{formatDate(alias.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-solaris-50 dark:bg-solaris-950 border-t border-solaris-200 dark:border-solaris-800 text-center">
            <span className="text-sm text-solaris-500 dark:text-solaris-400">
              Showing {Math.min(visibleCount, displayedAliases.length)} of {displayedAliases.length} aliases
              {aliases.length !== displayedAliases.length && <> &middot; {aliases.length} total</>}
            </span>
            <div ref={sentinelRef} className="h-px" />
          </div>
        </div>
      )}

      <AliasFormModal
        open={formModalOpen}
        mode={formModalMode}
        alias={aliasToEdit}
        visible={formModalVisible}
        onClose={() => {
          setFormModalOpen(false);
          setAliasToEdit(null);
        }}
        onSaved={fetchAliases}
        onDelete={
          formModalMode === "edit"
            ? () => {
                if (aliasToEdit) {
                  setFormModalVisible(false);
                  openDelete(aliasToEdit);
                }
              }
            : undefined
        }
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
          setFormModalVisible(true);
          setDeleteModalOpen(false);
          setAliasToDelete(null);
        }}
        onDeleted={() => {
          fetchAliases();
          setFormModalOpen(false);
          setAliasToEdit(null);
        }}
      />
    </div>
  );
}
