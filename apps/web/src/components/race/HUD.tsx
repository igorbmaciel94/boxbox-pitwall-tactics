import type { RaceState } from '@boxbox/engine';
import { StatBar } from '../shared/StatBar';
import { getPositionColor, getWearColor, getErsColor, getRainColor } from '../../lib/constants';

interface HUDProps {
  state: RaceState;
  previousPosition: number | null;
}

export function HUD({ state, previousPosition }: HUDProps) {
  const gap = previousPosition !== null ? state.position - previousPosition : 0;
  const gapStr = gap === 0 ? '' : gap > 0 ? `+${gap}` : `${gap}`;
  const gapColor = gap < 0 ? 'text-hud-green' : gap > 0 ? 'text-hud-red' : 'text-metal-light';

  return (
    <div className="rounded-lg border border-metal-light/20 bg-carbon-mid p-3 space-y-2">
      {/* Position row */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className={`font-display text-2xl font-black ${getPositionColor(state.position)}`}>
            P{state.position}
          </span>
          {gapStr && (
            <span className={`font-mono text-xs ${gapColor}`}>{gapStr}</span>
          )}
        </div>
        <div className="text-right">
          <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-metal-light">
            LAP {state.currentTurn}/{state.totalTurns}
          </span>
        </div>
      </div>

      {/* Stat bars */}
      <StatBar label="WEAR" value={state.tireWear} max={100} colorFn={getWearColor} flash={state.tireWear >= 80} />
      <StatBar label="ERS" value={state.fuel} max={100} colorFn={getErsColor} flash={state.fuel <= 15} />
      <StatBar label="RAIN" value={state.rainMeter} max={10} colorFn={getRainColor} flash={state.rainMeter >= 7} />
    </div>
  );
}
