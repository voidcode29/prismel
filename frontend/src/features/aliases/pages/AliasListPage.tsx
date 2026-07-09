import { useState, useEffect } from "react";
import type { Alias } from "@prismel/shared";
import { api } from "../../../lib/api";

export function AliasListPage() {
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAliases()
      .then(setAliases)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Aliases</h1>
      </div>

      {aliases.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No aliases yet. Create your first alias to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {aliases.map((alias) => (
            <div key={alias.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{alias.email}</div>
                {alias.serviceName && (
                  <div className="text-xs text-gray-500">{alias.serviceName}</div>
                )}
              </div>
              <div className="flex gap-1.5">
                {alias.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
