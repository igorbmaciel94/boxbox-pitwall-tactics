import type { RaceEvent } from '@boxbox/engine';
import { EVENT_ICONS, EVENT_COLORS } from '../../lib/constants';

interface EventCardProps {
  event: RaceEvent;
  animated?: boolean;
}

export function EventCard({ event, animated = false }: EventCardProps) {
  const icon = EVENT_ICONS[event.type] ?? '?';
  const colors = EVENT_COLORS[event.type] ?? 'border-metal-light bg-metal/50';

  return (
    <div
      className={`rounded-lg border-2 p-4 ${colors} ${animated ? 'animate-card-flip' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-black/30 font-display text-sm font-black">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-display text-xs font-bold uppercase tracking-wider mb-1">
            {event.name}
          </div>
          <p className="text-[10px] text-white/70 leading-relaxed">
            {event.flavorText}
          </p>

          {/* Effect indicators */}
          <div className="mt-2 flex gap-2 text-[9px]">
            {event.preEffect && (
              <span className="rounded bg-black/20 px-1.5 py-0.5 text-metal-light">
                PRE: {formatEffect(event.preEffect)}
              </span>
            )}
            {event.postEffect && (
              <span className="rounded bg-black/20 px-1.5 py-0.5 text-metal-light">
                POST: {formatEffect(event.postEffect)}
              </span>
            )}
          </div>

          {event.requiresQuickDecision && (
            <div className="mt-1.5 font-display text-[9px] font-bold uppercase tracking-wider text-hud-yellow">
              Quick Decision Required
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatEffect(effect: { position?: number; tireWear?: number; fuel?: number; rainMeter?: number }): string {
  const parts: string[] = [];
  if (effect.position !== undefined && effect.position !== 0) {
    parts.push(`POS ${effect.position > 0 ? '+' : ''}${effect.position}`);
  }
  if (effect.tireWear !== undefined && effect.tireWear !== 0) {
    parts.push(`WEAR ${effect.tireWear > 0 ? '+' : ''}${effect.tireWear}`);
  }
  if (effect.fuel !== undefined && effect.fuel !== 0) {
    parts.push(`ERS ${effect.fuel > 0 ? '+' : ''}${effect.fuel}`);
  }
  if (effect.rainMeter !== undefined && effect.rainMeter !== 0) {
    parts.push(`RAIN ${effect.rainMeter > 0 ? '+' : ''}${effect.rainMeter}`);
  }
  return parts.join(', ') || 'none';
}
