import type { RaceState } from '@boxbox/engine';
import { StatBar } from '../shared/StatBar';
import { getPositionColor, getWearColor, getErsColor, getRainColor } from '../../lib/constants';
import { useI18n } from '../../i18n';

interface HUDProps {
  state: RaceState;
  previousPosition: number | null;
}

export function HUD({ state, previousPosition }: HUDProps) {
  const { t } = useI18n();
  const gap = previousPosition !== null ? state.position - previousPosition : 0;
  const gapStr = gap === 0 ? '' : gap > 0 ? `+${gap}` : `${gap}`;
  const gapColor = gap < 0 ? 'text-hud-green' : gap > 0 ? 'text-hud-red' : 'text-metal-light';

  return (
    <div className="animate-panel-pop space-y-2.5 rounded-2xl bg-white/[0.04] p-4">
      {/* Position row */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wider text-metal-light">{t('stats.pos')}</span>
          <span className={`font-display text-3xl font-black ${getPositionColor(state.position)}`}>
            P{state.position}
          </span>
          {gapStr && (
            <span className={`font-mono text-sm ${gapColor}`}>{gapStr}</span>
          )}
        </div>
        <div className="rounded-full bg-white/8 px-3 py-1">
          <span className="font-mono text-xs text-white/70">
            {t('stats.lap')} {state.currentTurn}/{state.totalTurns}
          </span>
        </div>
      </div>

      {/* Stat bars */}
      <StatBar label={t('stats.wear')} value={state.tireWear} max={100} colorFn={getWearColor} flash={state.tireWear >= 80} />
      <StatBar label={t('stats.ers')} value={state.fuel} max={100} colorFn={getErsColor} flash={state.fuel <= 15} />
      <StatBar label={t('stats.rain')} value={state.rainMeter} max={10} colorFn={getRainColor} flash={state.rainMeter >= 7} />
    </div>
  );
}
