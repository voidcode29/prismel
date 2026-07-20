import { useTheme } from "../lib/ThemeContext";
import { themes } from "../lib/themes";
import { Check } from "lucide-react";

export function ThemePicker() {
  const { themeId, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {themes.map((theme) => {
        const selected = theme.id === themeId;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => setTheme(theme.id)}
            className={`relative text-left rounded-xl border bg-white p-3 shadow-sm transition-all duration-200 border-solaris-200 dark:border-solaris-800 dark:bg-solaris-900 hover:shadow-md hover:border-solaris-violet-300 dark:hover:border-solaris-violet-700 focus:outline-none focus:ring-2 focus:ring-solaris-violet-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-solaris-900 ${
              selected
                ? "ring-2 ring-solaris-violet-500 dark:ring-solaris-violet-400 ring-offset-2 ring-offset-white dark:ring-offset-solaris-900"
                : ""
            }`}
            aria-pressed={selected}
            aria-label={`Select ${theme.name} theme`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
              <div
                className="absolute inset-0"
                style={{
                  background: theme.preview.light,
                  clipPath: "polygon(0 0, 100% 0, 0 100%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: theme.preview.dark,
                  clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                }}
              />
              {selected && (
                <span className="absolute top-2 right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-solaris-violet-500 text-white shadow-sm">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="mt-3 text-sm font-medium text-center text-solaris-700 dark:text-solaris-300">
              {theme.name}
            </p>
          </button>
        );
      })}
    </div>
  );
}
