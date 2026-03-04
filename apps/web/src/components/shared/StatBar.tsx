interface StatBarProps {
  label: string;
  value: number;
  max: number;
  colorFn: (value: number) => string;
  showValue?: boolean;
  flash?: boolean;
}

export function StatBar({ label, value, max, colorFn, showValue = true, flash = false }: StatBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-[10px] font-display font-semibold uppercase tracking-wider text-metal-light">
        {label}
      </span>
      <div className="relative flex-1 h-3 rounded-full bg-metal-dark overflow-hidden border border-metal-light/20">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorFn(value)} ${flash ? 'animate-pulse' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="w-8 text-right text-xs font-mono text-metal-light">
          {value}
        </span>
      )}
    </div>
  );
}
