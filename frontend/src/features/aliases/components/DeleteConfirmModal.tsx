import { useState, useEffect } from "react";
import type { Alias } from "@prismel/shared";
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Delete Alias</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {error && (
            <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-slate-900">{alias.email}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
