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
      className={`rounded-2xl border p-4 ${colors} ${animated ? 'animate-card-flip' : 'animate-panel-pop'}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 font-mono text-[11px] font-bold tracking-wider text-white/90">
          {icon}
        </div>
        <div className="flex-1">
          <div className="mb-1 font-display text-sm font-bold uppercase tracking-wide text-white">
            {eventName}
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            {eventFlavor}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
            {event.effect && (
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-metal-light">
                {formatEffect(event.effect, t)}
              </span>
            )}
          </div>
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
