import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";

interface RedirectComboboxProps {
  value: string;
  onChange: (value: string) => void;
  targets: string[];
  placeholder?: string;
}

export function RedirectCombobox({ value, onChange, targets, placeholder }: RedirectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!value) return targets;
    const q = value.toLowerCase();
    return targets.filter((t) => t.toLowerCase().includes(q));
  }, [targets, value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const select = (target: string) => {
    onChange(target);
    setOpen(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlighted >= 0 && highlighted < filtered.length) {
          select(filtered[highlighted]);
        } else {
          setOpen(false);
        }
        break;
      case "Escape":
        setOpen(false);
        setHighlighted(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 pr-10 py-2.5 bg-solaris-50 dark:bg-solaris-950 border border-solaris-300 dark:border-solaris-700 rounded-xl focus:ring-2 focus:ring-solaris-blue-400 focus:border-solaris-blue-400 outline-none text-sm transition-all"
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-solaris-400 dark:text-solaris-500 hover:text-solaris-600 dark:hover:text-solaris-400 rounded"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-solaris-900 border border-solaris-200 dark:border-solaris-800 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1">
          {filtered.map((target, i) => (
            <li
              key={target}
              onMouseDown={(e) => {
                e.preventDefault();
                select(target);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-4 py-2 text-sm cursor-pointer font-mono ${
                i === highlighted
                  ? "bg-solaris-blue-50 dark:bg-solaris-blue-900/30 text-solaris-blue-600 dark:text-solaris-blue-200"
                  : "text-solaris-700 dark:text-solaris-300 hover:bg-solaris-200 dark:hover:bg-solaris-800"
              }`}
            >
              {target}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
