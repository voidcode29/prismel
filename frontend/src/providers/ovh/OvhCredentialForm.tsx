import { useState } from "react";
import { Eye, EyeOff, Key } from "lucide-react";

interface OvhCredentialFormProps {
  settings: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function OvhCredentialForm({ settings, onChange }: OvhCredentialFormProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [showConsumer, setShowConsumer] = useState(false);

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-solaris-700 dark:text-solaris-300 mb-2">Endpoint</label>
        <input
          type="text"
          value={settings.ovh_endpoint || ""}
          onChange={(e) => onChange("ovh_endpoint", e.target.value)}
          placeholder="eu.api.ovh.com"
          className="w-full px-4 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-xl focus:ring-2 focus:ring-solaris-blue-400 focus:border-solaris-blue-400 outline-none text-sm transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-solaris-700 dark:text-solaris-300 mb-2">Application Key</label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-solaris-400 dark:text-solaris-500" />
          <input
            type="text"
            value={settings.ovh_application_key || ""}
            onChange={(e) => onChange("ovh_application_key", e.target.value)}
            placeholder="d57d46..."
            className="w-full pl-10 pr-4 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-xl focus:ring-2 focus:ring-solaris-blue-400 focus:border-solaris-blue-400 outline-none text-sm transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-solaris-700 dark:text-solaris-300 mb-2">Application Secret</label>
        <div className="relative">
          <input
            type={showSecret ? "text" : "password"}
            value={settings.ovh_application_secret || ""}
            onChange={(e) => onChange("ovh_application_secret", e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 pr-12 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-xl focus:ring-2 focus:ring-solaris-blue-400 focus:border-solaris-blue-400 outline-none text-sm transition-all"
          />
          <button
            type="button"
            onClick={() => setShowSecret((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-solaris-400 dark:text-solaris-500 hover:text-solaris-600 dark:hover:text-solaris-400 rounded transition-colors"
            tabIndex={-1}
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-solaris-700 dark:text-solaris-300 mb-2">Consumer Key</label>
        <div className="relative">
          <input
            type={showConsumer ? "text" : "password"}
            value={settings.ovh_consumer_key || ""}
            onChange={(e) => onChange("ovh_consumer_key", e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 pr-12 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-xl focus:ring-2 focus:ring-solaris-blue-400 focus:border-solaris-blue-400 outline-none text-sm transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConsumer((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-solaris-400 dark:text-solaris-500 hover:text-solaris-600 dark:hover:text-solaris-400 rounded transition-colors"
            tabIndex={-1}
          >
            {showConsumer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
