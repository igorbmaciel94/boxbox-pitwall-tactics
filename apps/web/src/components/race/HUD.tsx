import type { RaceState, TireCompound } from '@boxbox/engine';
import { StatBar } from '../shared/StatBar';
import { getPositionColor, getWearColor } from '../../lib/constants';
import { useI18n } from '../../i18n';
import { useUIStore, type RadioMessage } from '../../stores/ui-store';

interface HUDProps {
  state: RaceState;
  previousPosition: number | null;
}

const COMPOUND_COLORS: Record<TireCompound, { bg: string; text: string; label: string }> = {
  soft: { bg: 'bg-red-500', text: 'text-red-300', label: 'S' },
  medium: { bg: 'bg-yellow-500', text: 'text-yellow-300', label: 'M' },
  hard: { bg: 'bg-white', text: 'text-white', label: 'H' },
  intermediate: { bg: 'bg-green-500', text: 'text-green-300', label: 'I' },
  wet: { bg: 'bg-blue-500', text: 'text-blue-300', label: 'W' },
};

export function HUD({ state, previousPosition }: HUDProps) {
  const { t, getEventFlavor, getRadioMessage } = useI18n();
  const messages = useUIStore((s) => s.radioMessages);
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const gap = previousPosition !== null ? state.position - previousPosition : 0;
  const gapStr = gap === 0 ? '' : gap > 0 ? `+${gap}` : `${gap}`;
  const gapColor = gap < 0 ? 'text-hud-green' : gap > 0 ? 'text-hud-red' : 'text-metal-light';
  const compound = COMPOUND_COLORS[state.tireCompound];

  const needsPit = !state.hasPitted && state.currentTurn >= state.totalTurns - 2 && state.currentTurn > 0;

  return (
    <div className="animate-panel-pop space-y-1.5 rounded-2xl bg-white/[0.04] p-3">
      {/* Position row */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wider text-metal-light">{t('stats.pos')}</span>
          <span className={`font-display text-2xl font-black ${getPositionColor(state.position)}`}>
            P{state.position}
          </span>
          {gapStr && (
            <span className={`font-mono text-sm ${gapColor}`}>{gapStr}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Tire compound badge */}
          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${compound.bg}`}>
            <span className="text-[10px] font-black text-carbon">{compound.label}</span>
          </div>
          <div className="rounded-full bg-white/8 px-3 py-1">
            <span className="font-mono text-xs text-white/70">
              {t('stats.lap')} {state.currentTurn}/{state.totalTurns}
            </span>
          </div>
        </div>
      </div>

      {/* Pit stop warning */}
      {needsPit && (
        <div className="flex items-center gap-2 rounded-lg bg-hud-amber/10 border border-hud-amber/30 px-3 py-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-hud-amber animate-pulse">PIT</span>
          <span className="text-[11px] text-hud-amber/80 truncate">{t('race.pitRequired')}</span>
        </div>
      )}

      {/* Tire wear bar */}
      <StatBar label={t('stats.wear')} value={state.tireWear} max={100} colorFn={getWearColor} flash={state.tireWear >= 80} />

      {/* Inline radio message */}
      {lastMsg && (
        <div key={lastMsg.timestamp} className="animate-fade-in truncate text-[11px] leading-snug text-white/60">
          <span className="mr-1 font-mono text-[10px] text-f1-red/70">{lastMsg.source === 'event' ? 'PIT>' : 'ENG>'}</span>
          {lastMsg.source === 'event'
            ? getEventFlavor(lastMsg.key, lastMsg.flavorIndex)
            : getRadioMessage(lastMsg.key, lastMsg.flavorIndex)}
        </div>
      )}
    </div>
  );
}
