import { useState, useEffect } from "react";
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  Server,
  Loader2,
  Mail,
  Globe,
  Palette,
  Plus,
  Trash2,
} from "lucide-react";
import { getProviderForm } from "../../providers/registry";
import { ThemePicker } from "../../components/ThemePicker";

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
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
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

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ovh_endpoint: settings.ovh_endpoint,
          ovh_application_key: settings.ovh_application_key,
          ovh_application_secret: settings.ovh_application_secret,
          ovh_consumer_key: settings.ovh_consumer_key,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ type: "success", text: "Connection successful" });
      } else {
        setTestResult({ type: "error", text: data.error || "Connection failed" });
      }
    } catch {
      setTestResult({ type: "error", text: "Connection test failed" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-2 text-solaris-500 dark:text-solaris-400">
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
        <h1 className="text-2xl font-bold text-solaris-900 dark:text-solaris-50">Settings</h1>
        <p className="text-sm text-solaris-500 dark:text-solaris-400 mt-1">Manage domains, providers and redirect targets</p>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 mb-6 flex items-start gap-3 ${
            message.type === "success"
              ? "bg-solaris-green-50 dark:bg-solaris-green-900/30 border border-solaris-green-200 dark:border-solaris-green-800"
              : "bg-solaris-red-50 dark:bg-solaris-red-900/30 border border-solaris-red-200 dark:border-solaris-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-solaris-green-400 dark:text-solaris-green-200 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-solaris-red-400 dark:text-solaris-red-200 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${message.type === "success" ? "text-solaris-green-600" : "text-solaris-red-600"}`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Domains */}
          <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-solaris-100 dark:border-solaris-800">
              <div className="w-10 h-10 bg-solaris-blue-50 dark:bg-solaris-blue-900/30 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-solaris-blue-500 dark:text-solaris-blue-300" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-solaris-900 dark:text-solaris-50">Domains</h2>
                <p className="text-xs text-solaris-500 dark:text-solaris-400">Map each domain to its email provider</p>
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
                    className="flex-1 px-3 py-2 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-lg focus:ring-2 focus:ring-solaris-blue-400 focus:border-solaris-blue-400 outline-none text-sm transition-all"
                  />
                  <select
                    value={pair.provider}
                    onChange={(e) => {
                      const next = [...domainPairs];
                      next[i] = { ...next[i], provider: e.target.value };
                      setDomainPairs(next);
                    }}
                    className="w-32 px-3 py-2 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-lg text-sm text-solaris-700 dark:text-solaris-300 focus:ring-2 focus:ring-solaris-blue-400 outline-none"
                  >
                    <option value="">—</option>
                    {providerList.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDomainPairs(domainPairs.filter((_, j) => j !== i))}
                    className="p-2 text-solaris-400 dark:text-solaris-500 hover:text-solaris-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDomainPairs([...domainPairs, { domain: "", provider: "" }])}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-solaris-blue-500 dark:text-solaris-blue-300 hover:bg-solaris-blue-50 dark:hover:bg-solaris-blue-900/30 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Domain
            </button>
          </div>

          {/* Providers */}
          <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-solaris-100 dark:border-solaris-800">
              <div className="w-10 h-10 bg-solaris-blue-50 dark:bg-solaris-blue-900/30 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-solaris-blue-500 dark:text-solaris-blue-300" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-solaris-900 dark:text-solaris-50">Providers</h2>
                <p className="text-xs text-solaris-500 dark:text-solaris-400">Configure API credentials per provider</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-solaris-700 dark:text-solaris-300 mb-2">Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => { setSelectedProvider(e.target.value); setTestResult(null); }}
                className="w-full px-4 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-xl text-sm text-solaris-700 dark:text-solaris-300 focus:ring-2 focus:ring-solaris-blue-400 outline-none"
              >
                <option value="">Select a provider</option>
                {providerList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {SelectedForm && <SelectedForm settings={settings} onChange={handleChange} />}

            {selectedProvider && SelectedForm && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-4 py-2 text-sm font-medium text-solaris-blue-600 dark:text-solaris-blue-300 border border-solaris-blue-300 dark:border-solaris-blue-700 rounded-lg hover:bg-solaris-blue-50 dark:hover:bg-solaris-blue-900/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </button>
              </div>
            )}

            {testResult && (
              <div className={`mt-2 rounded-lg p-3 flex items-start gap-2 text-sm ${
                testResult.type === "success"
                  ? "bg-solaris-green-50 dark:bg-solaris-green-900/30 border border-solaris-green-200 dark:border-solaris-green-800 text-solaris-green-600 dark:text-solaris-green-200"
                  : "bg-solaris-red-50 dark:bg-solaris-red-900/30 border border-solaris-red-200 dark:border-solaris-red-800 text-solaris-red-600 dark:text-solaris-red-200"
              }`}>
                {testResult.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{testResult.text}</span>
              </div>
            )}

            {selectedProvider && !SelectedForm && (
              <div className="mt-4">
                <p className="text-sm text-solaris-400 dark:text-solaris-500 italic">{selectedProvider} credentials — coming soon</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-solaris-blue-500 dark:bg-solaris-blue-400 text-white rounded-xl text-sm font-semibold hover:bg-solaris-blue-600 transition-all shadow-lg shadow-solaris-blue-400/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* UI */}
          <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-solaris-100 dark:border-solaris-800">
              <div className="w-10 h-10 bg-solaris-violet-50 dark:bg-solaris-violet-900/30 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-solaris-violet-500 dark:text-solaris-violet-300" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-solaris-900 dark:text-solaris-50">UI</h2>
                <p className="text-xs text-solaris-500 dark:text-solaris-400">Appearance and theme</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-solaris-700 dark:text-solaris-300 mb-3">Thème</h3>
              <ThemePicker />
            </div>
          </div>

          {/* Redirect Targets */}
          <div className="bg-white dark:bg-solaris-900 rounded-xl border border-solaris-200 dark:border-solaris-800 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-solaris-100 dark:border-solaris-800">
              <div className="w-10 h-10 bg-solaris-blue-50 dark:bg-solaris-blue-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-solaris-blue-500 dark:text-solaris-blue-300" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-solaris-900 dark:text-solaris-50">Redirect Targets</h2>
                <p className="text-xs text-solaris-500 dark:text-solaris-400">Suggested destinations when creating aliases</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-solaris-500 dark:text-solaris-400 mb-3">
                One email address per line. These appear as suggestions in the redirect field.
              </p>
              <textarea
                value={redirectTargets}
                onChange={(e) => setRedirectTargets(e.target.value)}
                placeholder={"user@example.com\nother@domain.com"}
                rows={10}
                className="w-full px-4 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-xl focus:ring-2 focus:ring-solaris-blue-400 focus:border-solaris-blue-400 outline-none text-sm transition-all resize-y font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
