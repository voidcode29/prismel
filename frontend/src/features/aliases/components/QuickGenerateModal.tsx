import { useState } from "react";
import type { CreateAliasInput } from "@prismel/shared";
import { X, RefreshCw } from "lucide-react";
import { api } from "../../../lib/api";

interface QuickGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function QuickGenerateModal({ open, onClose, onCreated }: QuickGenerateModalProps) {
  const [domain, setDomain] = useState("tical.fr");
  const [serviceName, setServiceName] = useState("");
  const [generated, setGenerated] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const doGenerate = async () => {
    try {
      const result = await api.generateAlias(domain);
      setGenerated(result.email);
    } catch {
      const words = ["green", "silent", "rapid", "bright", "cool", "happy", "swift", "lucky", "wild", "calm"];
      const nouns = ["river", "otter", "mountain", "forest", "star", "wave", "bird", "tree", "cloud", "stone"];
      const word = words[Math.floor(Math.random() * words.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const num = Math.floor(Math.random() * 900) + 100;
      setGenerated(`${word}-${noun}-${num}@${domain}`);
    }
  };

  const handleCreate = async () => {
    if (!generated) return;
    setSubmitting(true);
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
    } catch {
      // error handled by caller
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Quick Generate</h2>
            <p className="text-sm text-slate-500 mt-0.5">Generate a random alias instantly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Generated Alias
            </div>
            <div className="text-xl font-mono font-semibold text-slate-900 mb-1">
              {generated || "—"}
            </div>
            <div className="text-xs text-slate-400">Random unique identifier</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Domain</label>
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setGenerated("");
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="tical.fr">tical.fr</option>
              <option value="marzin.org">marzin.org</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Service Name (optional)
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Shopping, Newsletter..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={doGenerate}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting || !generated}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create This Alias"}
          </button>
        </div>
      </div>
    </div>
  );
}
