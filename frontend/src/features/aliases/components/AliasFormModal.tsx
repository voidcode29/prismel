import { useState, useEffect } from "react";
import type { Alias, CreateAliasInput, UpdateAliasInput } from "@prismel/shared";
import { X, RefreshCw, Trash2 } from "lucide-react";
import { api } from "../../../lib/api";
import { RedirectCombobox } from "./RedirectCombobox";

interface AliasFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  alias?: Alias | null;
  visible?: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDelete?: () => void;
}

export function AliasFormModal({
  open,
  mode,
  alias,
  visible = true,
  onClose,
  onSaved,
  onDelete,
}: AliasFormModalProps) {
  const [prefix, setPrefix] = useState("");
  const [domain, setDomain] = useState<string>("");
  const [destination, setDestination] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectTargets, setRedirectTargets] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);

  // Initialize form when opening in edit mode
  useEffect(() => {
    if (mode === "edit" && alias) {
      setServiceName(alias.serviceName || "");
      setDestination(alias.destination || "");
      setDescription(alias.description || "");
      setTags(alias.tags.join(", "));
    }
  }, [mode, alias]);

  // Fetch settings on open
  useEffect(() => {
    if (open) {
      setError(null);
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data) => {
          try {
            const targets = JSON.parse(data.redirect_targets || "[]");
            const list = Array.isArray(targets) ? targets : [];
            setRedirectTargets(list);
            if (mode === "create" && list.length > 0 && !destination) {
              setDestination(list[0]);
            }
          } catch {
            setRedirectTargets([]);
          }
          try {
            const domainList = JSON.parse(data.alias_domains || "[]");
            setDomains(Array.isArray(domainList) ? domainList : []);
            if (mode === "create" && !domain) {
              setDomain(domainList[0] || "");
            }
          } catch {
            setDomains([]);
          }
        })
        .catch(() => {
          setRedirectTargets([]);
          setDomains([]);
        });
    }
  }, [open, mode]);

  if (!open) return null;

  const isEdit = mode === "edit";

  const handleGenerate = async () => {
    try {
      const result = await api.generateAlias(domain);
      setPrefix(result.prefix);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate alias");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !prefix.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && alias) {
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
      } else {
        const input: CreateAliasInput = {
          email: `${prefix.trim()}@${domain}`,
          domain,
          destination: destination.trim() || undefined,
          serviceName: serviceName.trim() || undefined,
          description: description.trim() || undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        };
        await api.createAlias(input);
        setPrefix("");
        setDestination("");
        setServiceName("");
        setDescription("");
        setTags("");
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to ${isEdit ? "update" : "create"} alias`);
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit ? "Edit Alias" : "Create New Alias";
  const subtitle = isEdit ? "Update alias metadata" : "Add a new email alias to your account";
  const submitLabel = isEdit ? (submitting ? "Saving..." : "Save Changes") : (submitting ? "Creating..." : "Create Alias");

  return (
    <div
      className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
        visible ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
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

          {/* Email Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            {isEdit ? (
              <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-mono">
                {alias!.email}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex flex-1 shadow-sm">
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
                    {domains.map((d) => (
                      <option key={d} value={d}>
                        @{d}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  title="Generate"
                  className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex-shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Redirect To */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Redirect To</label>
            <RedirectCombobox
              value={destination}
              onChange={setDestination}
              targets={redirectTargets}
              placeholder={isEdit ? "your-real@email.com" : "your-real@email.com (defaults to alias itself)"}
            />
          </div>

          {/* Service Name + spacer (replaces old provider column) */}
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

          {/* Description */}
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

          {/* Tags */}
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

          {/* Footer */}
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl -mx-6 -mb-6 mt-6 flex justify-between gap-3">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            ) : (
              <div />
            )}
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
                disabled={submitting || (!isEdit && !prefix.trim())}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
