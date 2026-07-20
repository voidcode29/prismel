import { X, ExternalLink } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-solaris-900/60 dark:bg-solaris-50/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-solaris-900 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-solaris-100 dark:border-solaris-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/icon.png" alt="Prismel" className="w-24 h-24 rounded-xl" />
            <div>
              <h3 className="text-lg font-bold text-solaris-900 dark:text-solaris-50">Prismel</h3>
              <p className="text-sm text-solaris-500 dark:text-solaris-400 mt-0.5">Enriched email alias manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-solaris-400 dark:text-solaris-500 hover:text-solaris-600 dark:hover:text-solaris-400 hover:bg-solaris-100 dark:hover:bg-solaris-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">


          <div className="space-y-2 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-solaris-500 dark:text-solaris-400">Version</span>
              <span className="font-mono text-solaris-900 dark:text-solaris-50">
                Build #{__BUILD_NUMBER__} ({__COMMIT_HASH__})
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-solaris-500 dark:text-solaris-400">Commit date</span>
              <span className="font-mono text-solaris-900 dark:text-solaris-50">{__COMMIT_DATE__}</span>
            </div>
          </div>

          <div>
            <a
              href="https://github.com/voidcode29/prismel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-solaris-blue-500 dark:text-solaris-blue-400 hover:text-solaris-blue-600 dark:hover:text-solaris-blue-300 transition-colors"
            >
              github.com/voidcode29/prismel
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-solaris-100 dark:border-solaris-800 bg-solaris-50 dark:bg-solaris-950 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-solaris-600 dark:text-solaris-400 hover:bg-solaris-200 dark:hover:bg-solaris-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
