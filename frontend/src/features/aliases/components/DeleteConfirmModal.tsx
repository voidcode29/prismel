import { useState, useEffect } from "react";
import type { Alias } from "@/types/alias";
import { X, Trash2 } from "lucide-react";
import { api } from "../../../lib/api";

interface DeleteConfirmModalProps {
  open: boolean;
  alias: Alias | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteConfirmModal({ open, alias, onClose, onDeleted }: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  if (!open || !alias) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await api.deleteAlias(alias.id);
      onDeleted();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete alias");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-solaris-900/60 dark:bg-solaris-50/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-solaris-900 rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="px-6 py-5 border-b border-solaris-100 dark:border-solaris-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-solaris-900 dark:text-solaris-50">Delete Alias</h2>
          <button
            onClick={onClose}
            className="p-2 text-solaris-400 dark:text-solaris-500 hover:text-solaris-600 dark:hover:text-solaris-400 hover:bg-solaris-100 dark:hover:bg-solaris-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {error && (
            <div className="px-4 py-3 mb-4 bg-solaris-red-50 dark:bg-solaris-red-900/30 border border-solaris-red-200 dark:border-solaris-red-800 rounded-xl text-sm text-solaris-red-500 dark:text-solaris-red-200">
              {error}
            </div>
          )}
          <p className="text-sm text-solaris-600 dark:text-solaris-400">
            Are you sure you want to delete <span className="font-semibold text-solaris-900 dark:text-solaris-50">{alias.email}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="px-6 py-5 border-t border-solaris-100 dark:border-solaris-800 bg-solaris-50 dark:bg-solaris-950 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-solaris-600 dark:text-solaris-400 hover:bg-solaris-200 dark:hover:bg-solaris-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 bg-solaris-red-400 text-white text-sm font-medium rounded-xl hover:bg-solaris-red-500 transition-all shadow-lg shadow-solaris-red-400/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
