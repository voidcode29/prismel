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
        <h1 className="text-2xl font-bold text-solaris-900 dark:text-solaris-50">Sync Aliases</h1>
        <p className="text-sm text-solaris-500 dark:text-solaris-400 mt-1">Synchronize with configured providers</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-solaris-900 p-5 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-solaris-blue-50 dark:bg-solaris-blue-900/30 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-solaris-blue-500 dark:text-solaris-blue-300" />
          </div>
          <div>
            <div className="text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider">Local Aliases</div>
            <div className="text-2xl font-bold text-solaris-900 dark:text-solaris-50 mt-0.5">
              {loading ? "—" : aliases.length}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-solaris-900 p-5 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-solaris-green-50 dark:bg-solaris-green-900/30 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-solaris-green-400 dark:text-solaris-green-200" />
          </div>
          <div>
            <div className="text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider">Provider</div>
            <div className="text-2xl font-bold text-solaris-900 dark:text-solaris-50 mt-0.5">—</div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-semibold text-solaris-900 dark:text-solaris-50 mb-2">What does sync do?</h3>
        <p className="text-sm text-solaris-500 dark:text-solaris-400 leading-relaxed">
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
          className="px-8 py-4 bg-solaris-blue-500 dark:bg-solaris-blue-400 text-white rounded-xl text-base font-semibold hover:bg-solaris-blue-600 transition-all shadow-lg shadow-solaris-blue-400/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3"
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
        <div className="bg-solaris-red-50 dark:bg-solaris-red-900/30 border border-solaris-red-200 dark:border-solaris-red-800 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-solaris-red-400 dark:text-solaris-red-200 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-solaris-red-600">Error</p>
              <p className="text-sm text-solaris-red-500 dark:text-solaris-red-200 mt-1">{error || fetchError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Cards */}
      {result && (
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-solaris-green-400 dark:text-solaris-green-200" />
            <span className="text-sm font-semibold text-solaris-900 dark:text-solaris-50">Sync complete</span>
            <span className="text-sm text-solaris-500 dark:text-solaris-400">{result.total} total aliases</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-solaris-green-50 dark:bg-solaris-green-900/30 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-solaris-green-400 dark:text-solaris-green-200" />
                </div>
                <span className="text-sm font-medium text-solaris-600 dark:text-solaris-400">New imported</span>
              </div>
              <div className="text-3xl font-bold text-solaris-green-400 dark:text-solaris-green-200">{result.new}</div>
            </div>
            <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-solaris-yellow-50 dark:bg-solaris-yellow-900/30 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-solaris-yellow-500 dark:text-solaris-yellow-200" />
                </div>
                <span className="text-sm font-medium text-solaris-600 dark:text-solaris-400">Updated</span>
              </div>
              <div className="text-3xl font-bold text-solaris-yellow-500 dark:text-solaris-yellow-200">{result.updated}</div>
            </div>
            <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-solaris-blue-50 dark:bg-solaris-blue-900/30 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-solaris-blue-500 dark:text-solaris-blue-300" />
                </div>
                <span className="text-sm font-medium text-solaris-600 dark:text-solaris-400">Total synced</span>
              </div>
              <div className="text-3xl font-bold text-solaris-blue-500 dark:text-solaris-blue-300">{result.total}</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-solaris-red-50 dark:bg-solaris-red-900/30 border border-solaris-red-200 dark:border-solaris-red-800 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-solaris-red-400 dark:text-solaris-red-200 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-solaris-red-600">
                    {result.errors.length} error{result.errors.length > 1 ? "s" : ""} during sync
                  </p>
                </div>
              </div>
              <ul className="space-y-2 mt-2">
                {result.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-solaris-red-500 dark:text-solaris-red-200 bg-solaris-red-100/50 dark:bg-solaris-red-800/30 rounded-lg px-3 py-2">
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
        <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-solaris-500 dark:text-solaris-400" />
            <h3 className="text-sm font-semibold text-solaris-900 dark:text-solaris-50">Sync Log</h3>
            {syncing && (
              <span className="text-xs text-solaris-400 dark:text-solaris-500 ml-auto">Streaming...</span>
            )}
          </div>
          <div
            ref={logsRef}
            className="bg-solaris-900 dark:bg-solaris-50 text-solaris-300 dark:text-solaris-600 rounded-lg p-4 font-mono text-xs max-h-80 overflow-y-auto"
          >
            {logs.length === 0 ? (
              <span className="text-solaris-500 dark:text-solaris-400 italic">Waiting for sync to start...</span>
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
