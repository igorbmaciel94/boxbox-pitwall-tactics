interface RainMeterProps {
  value: number;
  max?: number;
}

export function RainMeter({ value, max = 10 }: RainMeterProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        const isSpike = i >= 6; // 7+ threshold (0-indexed: 6, 7, 8, 9)
        return (
          <div
            key={i}
            className={`h-2 flex-1 rounded-sm transition-all duration-300
              ${filled
                ? isSpike
                  ? 'bg-hud-cyan animate-pulse'
                  : 'bg-hud-blue'
                : 'bg-metal-dark'
              }`}
          />
        );
      })}
    </div>
  );
}
