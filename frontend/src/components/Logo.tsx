const Blue = "#3B8ED6";
const Violet = "#8B7ED4";
const Magenta = "#D94D8C";
const Cyan = "#2DAFA0";
const White = "#FFFFFF";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="Prismel">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={Blue} />
          <stop offset="30%" stopColor={Violet} />
          <stop offset="60%" stopColor={Magenta} />
          <stop offset="100%" stopColor={Cyan} />
        </linearGradient>
      </defs>
      <path d="M8 16 L24 28 L40 16 L40 36 A2 2 0 0 1 38 38 L10 38 A2 2 0 0 1 8 36 Z" fill="url(#logo-grad)" opacity="0.85" />
      <path d="M8 16 L24 28 L40 16" fill="none" stroke={White} strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
      <path d="M8 16 L24 28 L24 38" fill="none" stroke={Blue} strokeWidth="1" opacity="0.15" />
    </svg>
  );
}
