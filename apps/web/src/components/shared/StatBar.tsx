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
    <div className="flex items-center gap-2.5">
      <span className="w-11 text-[11px] font-display font-semibold uppercase tracking-wider text-metal-light">
        {label}
      </span>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/8">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorFn(value)} ${flash ? 'animate-pulse' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="w-8 text-right text-xs font-mono text-white/80">
          {value}
        </span>
      )}
    </div>
  );
}
