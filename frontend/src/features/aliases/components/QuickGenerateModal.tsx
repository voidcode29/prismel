import { useState, useEffect } from "react";
import type { CreateAliasInput } from "@/types/alias";
import { X, RefreshCw } from "lucide-react";
import { api } from "../../../lib/api";

interface QuickGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function QuickGenerateModal({ open, onClose, onCreated }: QuickGenerateModalProps) {
  const [domain, setDomain] = useState<string>("");
  const [serviceName, setServiceName] = useState("");
  const [generated, setGenerated] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setError(null);
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data) => {
          try {
            const domainList = JSON.parse(data.alias_domains || "[]");
            const list = Array.isArray(domainList) ? domainList : [];
            setDomains(list);
            if (!domain && list.length > 0) {
              setDomain(list[0]);
            }
          } catch {
            setDomains([]);
          }
        })
        .catch(() => setDomains([]));
    }
  }, [open]);

  if (!open) return null;

  const doGenerate = async () => {
    try {
      const result = await api.generateAlias(domain);
      setGenerated(result.email);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate alias");
    }
  };

  const handleCreate = async () => {
    if (!generated) return;
    setSubmitting(true);
    setError(null);
    try {
      const input: CreateAliasInput = {
        email: generated,
        domain,
        serviceName: serviceName.trim() || undefined,
      };
      await api.createAlias(input);
      setServiceName("");
      setGenerated("");
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create alias");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-solaris-900/60 dark:bg-solaris-50/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-solaris-900 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-5 border-b border-solaris-100 dark:border-solaris-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-solaris-900 dark:text-solaris-50">Quick Generate</h2>
            <p className="text-sm text-solaris-500 dark:text-solaris-400 mt-0.5">Generate a random alias instantly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-solaris-400 dark:text-solaris-500 hover:text-solaris-600 dark:hover:text-solaris-400 hover:bg-solaris-100 dark:hover:bg-solaris-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 bg-solaris-red-50 dark:bg-solaris-red-900/30 border border-solaris-red-200 dark:border-solaris-red-800 rounded-xl text-sm text-solaris-red-500 dark:text-solaris-red-200">
              {error}
            </div>
          )}
          <div className="bg-solaris-50 dark:bg-solaris-950 rounded-xl p-6 text-center border border-solaris-200 dark:border-solaris-800">
            <div className="text-xs font-semibold text-solaris-500 dark:text-solaris-400 uppercase tracking-wider mb-3">
              Generated Alias
            </div>
            <div className="text-xl font-mono font-semibold text-solaris-900 dark:text-solaris-50 mb-1">
              {generated || "—"}
            </div>
            <div className="text-xs text-solaris-400 dark:text-solaris-500">Random unique identifier</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-solaris-700 dark:text-solaris-300 mb-2">Domain</label>
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setGenerated("");
              }}
              className="w-full px-4 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-xl text-sm text-solaris-700 dark:text-solaris-300 focus:ring-2 focus:ring-solaris-blue-400 outline-none"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-solaris-700 dark:text-solaris-300 mb-2">
              Service Name (optional)
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Shopping, Newsletter..."
              className="w-full px-4 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-xl focus:ring-2 focus:ring-solaris-blue-400 outline-none text-sm"
            />
          </div>
        </div>
        <div className="px-6 py-5 border-t border-solaris-100 dark:border-solaris-800 bg-solaris-50 dark:bg-solaris-950 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={doGenerate}
            className="px-5 py-2.5 text-sm font-medium text-solaris-600 dark:text-solaris-400 hover:bg-solaris-200 dark:hover:bg-solaris-700 rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting || !generated}
            className="px-5 py-2.5 bg-solaris-blue-500 dark:bg-solaris-blue-400 text-white text-sm font-medium rounded-xl hover:bg-solaris-blue-600 transition-all shadow-lg shadow-solaris-blue-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create This Alias"}
          </button>
        </div>
      </div>
    </div>
  );
}
