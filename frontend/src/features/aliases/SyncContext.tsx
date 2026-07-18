import { createContext, useContext, useState, useCallback } from "react";
import type { SyncResult } from "@/types/alias";

interface SyncState {
  syncing: boolean;
  logs: string[];
  result: SyncResult | null;
  error: string | null;
}

interface SyncContextValue extends SyncState {
  startSync: () => void;
}

const SyncContext = createContext<SyncContextValue>({
  syncing: false,
  logs: [],
  result: null,
  error: null,
  startSync: () => {},
});

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    setResult(null);
    setLogs([]);

    try {
      const response = await fetch("/api/aliases/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "log") {
              setLogs((prev) => [...prev, event.message]);
            } else if (event.type === "result") {
              setResult(event.data);
            } else if (event.type === "error") {
              setError(event.message);
            }
          } catch {
            // skip unparseable lines
          }
        }

        if (done) break;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, []);

  return (
    <SyncContext.Provider value={{ syncing, logs, result, error, startSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}
