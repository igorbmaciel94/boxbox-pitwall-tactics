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
      className={`rounded-xl border p-3 ${colors} ${animated ? 'animate-card-flip' : 'animate-panel-pop'}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-[10px] font-bold tracking-wider text-white/90">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-xs font-bold uppercase tracking-wide text-white">
            {eventName}
          </div>
          <p className="mt-0.5 text-xs leading-snug text-white/70 line-clamp-2">
            {eventFlavor}
          </p>
          {event.effect && (
            <span className="mt-1 inline-block rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-metal-light">
              {formatEffect(event.effect, t)}
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
