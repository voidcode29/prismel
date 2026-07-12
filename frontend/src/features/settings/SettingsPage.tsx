import { useState, useEffect } from "react";
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  Server,
  Loader2,
  Mail,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";
import { getProviderForm } from "../../providers/registry";

interface SettingsData {
  [key: string]: string;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [redirectTargets, setRedirectTargets] = useState("");
  const [domainPairs, setDomainPairs] = useState<{ domain: string; provider: string }[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [providerList, setProviderList] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/settings/providers").then((r) => r.json()),
    ])
      .then(([data, providers]: [SettingsData, string[]]) => {
        setSettings(data);
        setProviderList(providers);
        try {
          const targets = JSON.parse(data.redirect_targets || "[]");
          setRedirectTargets(Array.isArray(targets) ? targets.join("\n") : "");
        } catch {
          setRedirectTargets("");
        }
        try {
          const domains = JSON.parse(data.alias_domains || "[]");
          const domainProviders = JSON.parse(data.domain_providers || "{}");
          if (Array.isArray(domains)) {
            setDomainPairs(domains.map((d: string) => ({ domain: d, provider: domainProviders[d] || "" })));
          }
        } catch {
          setDomainPairs([]);
        }
      })
      .catch((e) => {
        setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to load settings" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const targets = redirectTargets
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);
      const domains = domainPairs.map((p) => p.domain.trim()).filter(Boolean);
      const providersObj: Record<string, string> = {};
      for (const p of domainPairs) {
        if (p.domain.trim() && p.provider.trim()) {
          providersObj[p.domain.trim()] = p.provider.trim();
        }
      }
      const payload = {
        ...settings,
        redirect_targets: JSON.stringify(targets),
        alias_domains: JSON.stringify(domains),
        domain_providers: JSON.stringify(providersObj),
      };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        throw new Error(err.error || "Save failed");
      }
      setMessage({ type: "success", text: "Settings saved" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  const SelectedForm = selectedProvider ? getProviderForm(selectedProvider) : null;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage domains, providers and redirect targets</p>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 mb-6 flex items-start gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${message.type === "success" ? "text-emerald-800" : "text-red-800"}`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Domains */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Domains</h2>
                <p className="text-xs text-slate-500">Map each domain to its email provider</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {domainPairs.map((pair, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pair.domain}
                    onChange={(e) => {
                      const next = [...domainPairs];
                      next[i] = { ...next[i], domain: e.target.value };
                      setDomainPairs(next);
                    }}
                    placeholder="domain.com"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                  />
                  <select
                    value={pair.provider}
                    onChange={(e) => {
                      const next = [...domainPairs];
                      next[i] = { ...next[i], provider: e.target.value };
                      setDomainPairs(next);
                    }}
                    className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">—</option>
                    {providerList.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDomainPairs(domainPairs.filter((_, j) => j !== i))}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDomainPairs([...domainPairs, { domain: "", provider: "" }])}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Domain
            </button>
          </div>

          {/* Providers */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Providers</h2>
                <p className="text-xs text-slate-500">Configure API credentials per provider</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select a provider</option>
                {providerList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {SelectedForm && <SelectedForm settings={settings} onChange={handleChange} />}

            {selectedProvider && !SelectedForm && (
              <div className="mt-4">
                <p className="text-sm text-slate-400 italic">{selectedProvider} credentials — coming soon</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Right Column: Redirect Targets */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Redirect Targets</h2>
                <p className="text-xs text-slate-500">Suggested destinations when creating aliases</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-3">
                One email address per line. These appear as suggestions in the redirect field.
              </p>
              <textarea
                value={redirectTargets}
                onChange={(e) => setRedirectTargets(e.target.value)}
                placeholder={"user@example.com\nother@domain.com"}
                rows={10}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all resize-y font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
