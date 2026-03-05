import type { RaceEvent } from '@boxbox/engine';
import { EVENT_ICONS, EVENT_COLORS } from '../../lib/constants';
import { useI18n } from '../../i18n';

interface EventCardProps {
  event: RaceEvent;
  animated?: boolean;
}

export function EventCard({ event, animated = false }: EventCardProps) {
  const { getEventName, getEventFlavor, t } = useI18n();
  const icon = EVENT_ICONS[event.type] ?? '?';
  const colors = EVENT_COLORS[event.type] ?? 'border-white/10 bg-white/5';
  const eventName = getEventName(event.type, event.name);
  const eventFlavor = getEventFlavor(event.type, event.flavorIndex, event.flavorText);

  return (
    <div
      className={`rounded-xl border px-3 py-2 ${colors} ${animated ? 'animate-card-flip' : 'animate-panel-pop'}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-bold uppercase tracking-wide text-white leading-tight">
            {eventName}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 shrink-0">
          {event.effect && (
            <span className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-bold text-white/80">
              {formatEffect(event.effect, t)}
            </span>
          )}
          {event.type === 'safety-car' && (
            <span className="rounded-full bg-hud-green/20 px-2.5 py-1 text-xs font-bold text-hud-green whitespace-nowrap">
              {t('race.scFreePit')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatEffect(
  effect: { position?: number; tireWear?: number },
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const parts: string[] = [];
  if (effect.position !== undefined && effect.position !== 0) {
    parts.push(`${t('stats.pos')} ${effect.position > 0 ? '+' : ''}${effect.position}`);
  }
  if (effect.tireWear !== undefined && effect.tireWear !== 0) {
    parts.push(`${t('stats.wear')} ${effect.tireWear > 0 ? '+' : ''}${effect.tireWear}`);
  }
  return parts.join(', ') || t('race.noEffect');
}
