import { Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg transition-colors text-solaris-400 hover:text-solaris-600 hover:bg-solaris-200 dark:hover:bg-solaris-800"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
