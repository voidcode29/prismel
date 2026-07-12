import { useState, useEffect, useRef } from "react";
import type { Alias } from "@prismel/shared";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Database,
  Mail,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useSync } from "../SyncContext";

export function SyncPage() {
  const { syncing, logs, result, error, startSync } = useSync();
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const logsRef = useRef<HTMLDivElement>(null);

  const fetchAliases = async () => {
    try {
      const data = await api.getAliases();
      setAliases(data);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load aliases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAliases();
  }, []);

  // Refresh alias count when sync completes
  useEffect(() => {
    if (result) {
      fetchAliases();
    }
  }, [result]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Sync Aliases</h1>
        <p className="text-sm text-slate-500 mt-1">Synchronize with configured providers</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Local Aliases</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {loading ? "—" : aliases.length}
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">—</div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">What does sync do?</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Sync pulls all email aliases from your configured providers and imports them into Prismel.
          New aliases are added, existing ones are updated, and any local discrepancies are resolved.
          This ensures your local database stays in perfect sync with your providers.
        </p>
      </div>

      {/* Sync Button */}
      <div className="flex items-center justify-center mb-8">
        <button
          onClick={startSync}
          disabled={syncing}
          className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-base font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {syncing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Sync Now
            </>
          )}
        </button>
      </div>

      {/* Error State */}
      {(error || fetchError) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error || fetchError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Cards */}
      {result && (
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-900">Sync complete</span>
            <span className="text-sm text-slate-500">{result.total} total aliases</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">New imported</span>
              </div>
              <div className="text-3xl font-bold text-emerald-600">{result.new}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Updated</span>
              </div>
              <div className="text-3xl font-bold text-amber-600">{result.updated}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Total synced</span>
              </div>
              <div className="text-3xl font-bold text-indigo-600">{result.total}</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    {result.errors.length} error{result.errors.length > 1 ? "s" : ""} during sync
                  </p>
                </div>
              </div>
              <ul className="space-y-2 mt-2">
                {result.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-100/50 rounded-lg px-3 py-2">
                    <ArrowRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Live Sync Log */}
      {(syncing || logs.length > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Sync Log</h3>
            {syncing && (
              <span className="text-xs text-slate-400 ml-auto">Streaming...</span>
            )}
          </div>
          <div
            ref={logsRef}
            className="bg-slate-900 text-slate-300 rounded-lg p-4 font-mono text-xs max-h-80 overflow-y-auto"
          >
            {logs.length === 0 ? (
              <span className="text-slate-500 italic">Waiting for sync to start...</span>
            ) : (
              logs.map((line, i) => (
                <div key={i} className="leading-relaxed break-words">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
