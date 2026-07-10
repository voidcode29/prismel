import { useState } from "react";
import type { Alias, CreateAliasInput } from "@prismel/shared";
import { X, RefreshCw } from "lucide-react";
import { api } from "../../../lib/api";

interface CreateAliasModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateAliasModal({ open, onClose, onCreated }: CreateAliasModalProps) {
  const [prefix, setPrefix] = useState("");
  const [domain, setDomain] = useState("tical.fr");
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [generated, setGenerated] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleGenerate = async () => {
    try {
      const result = await api.generateAlias(domain);
      setPrefix(result.prefix);
      setGenerated(result.email);
    } catch {
      // fallback client-side generation
      const words = ["green", "silent", "rapid", "bright", "cool", "happy", "swift", "lucky", "wild", "calm"];
      const nouns = ["river", "otter", "mountain", "forest", "star", "wave", "bird", "tree", "cloud", "stone"];
      const word = words[Math.floor(Math.random() * words.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const num = Math.floor(Math.random() * 900) + 100;
      const alias = `${word}-${noun}-${num}`;
      setPrefix(alias);
      setGenerated(`${alias}@${domain}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefix.trim()) return;
    setSubmitting(true);
    try {
      const input: CreateAliasInput = {
        email: `${prefix.trim()}@${domain}`,
        domain,
        serviceName: serviceName.trim() || undefined,
        description: description.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await api.createAlias(input);
      setPrefix("");
      setServiceName("");
      setDescription("");
      setTags("");
      setGenerated("");
      onCreated();
      onClose();
    } catch {
      // error handled by caller via toast or similar
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Alias</h2>
            <p className="text-sm text-slate-500 mt-0.5">Add a new email alias to your account</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="flex shadow-sm">
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="alias-name"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-l-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
              />
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="px-4 py-2.5 border border-l-0 border-slate-300 rounded-r-xl bg-slate-50 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none min-w-[140px]"
              >
                <option value="tical.fr">@tical.fr</option>
                <option value="marzin.org">@marzin.org</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Service Name</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Newsletter"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Provider</label>
              <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                OVH
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this alias for?"
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="shopping, newsletter, work..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
            />
            <p className="text-xs text-slate-400 mt-1.5">Separate tags with commas</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Random
            </button>
            {generated && (
              <span className="text-sm text-indigo-600 font-mono font-medium">{generated}</span>
            )}
          </div>
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl -mx-6 -mb-6 mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !prefix.trim()}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Alias"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
