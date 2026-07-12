import { useState, useEffect } from "react";
import type { Alias, UpdateAliasInput } from "@prismel/shared";
import { X, Trash2 } from "lucide-react";
import { api } from "../../../lib/api";
import { RedirectCombobox } from "./RedirectCombobox";

interface EditAliasModalProps {
  open: boolean;
  alias: Alias | null;
  visible?: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDelete: () => void;
}

export function EditAliasModal({ open, alias, visible = true, onClose, onUpdated, onDelete }: EditAliasModalProps) {
  const [serviceName, setServiceName] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectTargets, setRedirectTargets] = useState<string[]>([]);

  useEffect(() => {
    if (alias) {
      setServiceName(alias.serviceName || "");
      setDestination(alias.destination || "");
      setDescription(alias.description || "");
      setTags(alias.tags.join(", "));
    }
  }, [alias]);

  useEffect(() => {
    if (open) {
      setError(null);
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data) => {
          try {
            const targets = JSON.parse(data.redirect_targets || "[]");
            setRedirectTargets(Array.isArray(targets) ? targets : []);
          } catch {
            setRedirectTargets([]);
          }
        })
        .catch(() => setRedirectTargets([]));
    }
  }, [open]);

  if (!open || !alias) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input: UpdateAliasInput = {
        destination: destination.trim() || undefined,
        serviceName: serviceName.trim() || undefined,
        description: description.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await api.updateAlias(alias.id, input);
      onUpdated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update alias");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${visible ? "" : "hidden"}`}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Alias</h2>
            <p className="text-sm text-slate-500 mt-0.5">Update alias metadata</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5" autoComplete="off">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-mono">
              {alias.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Redirect To</label>
            <RedirectCombobox
              value={destination}
              onChange={setDestination}
              targets={redirectTargets}
              placeholder="your-real@email.com"
            />
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
              <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500">
                {alias.provider}
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
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl -mx-6 -mb-6 mt-6 flex justify-between gap-3">
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
