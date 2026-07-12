import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Loader2,
  Mail,
} from "lucide-react";

interface SettingsData {
  ovh_endpoint: string;
  ovh_application_key: string;
  ovh_application_secret: string;
  ovh_consumer_key: string;
  redirect_targets: string;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    ovh_endpoint: "",
    ovh_application_key: "",
    ovh_application_secret: "",
    ovh_consumer_key: "",
    redirect_targets: "[]",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showConsumer, setShowConsumer] = useState(false);
  const [redirectTargets, setRedirectTargets] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data: SettingsData) => {
        setSettings(data);
        try {
          const targets = JSON.parse(data.redirect_targets || "[]");
          setRedirectTargets(Array.isArray(targets) ? targets.join("\n") : "");
        } catch {
          setRedirectTargets("");
        }
      })
      .catch((e) => {
        setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to load settings" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SettingsData, value: string) => {
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
      const payload = {
        ...settings,
        redirect_targets: JSON.stringify(targets),
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

  return (
    <div className="max-w-2xl">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage provider configuration</p>
      </div>

      {/* Message Banner */}
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
          <p
            className={`text-sm font-medium ${
              message.type === "success" ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Provider Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Provider</h2>
            <p className="text-xs text-slate-500">API credentials for your email provider</p>
          </div>
        </div>

        {/* Endpoint */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Endpoint</label>
          <input
            type="text"
            value={settings.ovh_endpoint}
            onChange={(e) => handleChange("ovh_endpoint", e.target.value)}
            placeholder="eu.api.ovh.com"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
          />
        </div>

        {/* Application Key */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Application Key</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={settings.ovh_application_key}
              onChange={(e) => handleChange("ovh_application_key", e.target.value)}
              placeholder="d57d46..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Application Secret */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Application Secret</label>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={settings.ovh_application_secret}
              onChange={(e) => handleChange("ovh_application_secret", e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              tabIndex={-1}
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Consumer Key */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Consumer Key</label>
          <div className="relative">
            <input
              type={showConsumer ? "text" : "password"}
              value={settings.ovh_consumer_key}
              onChange={(e) => handleChange("ovh_consumer_key", e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConsumer((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              tabIndex={-1}
            >
              {showConsumer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Redirect Targets */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Redirect Targets</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            One email address per line. These appear as suggestions when creating or editing an alias.
          </p>
          <textarea
            value={redirectTargets}
            onChange={(e) => setRedirectTargets(e.target.value)}
            placeholder={"user@example.com\nother@domain.com"}
            rows={6}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all resize-y font-mono"
          />
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
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
      </div>
    </div>
  );
}
