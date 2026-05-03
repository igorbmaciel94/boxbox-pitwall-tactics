import { useUIStore } from '../../stores/ui-store';
import { useI18n } from '../../i18n';

export function RadioFeed() {
  const messages = useUIStore((s) => s.radioMessages);
  const { t, getEventFlavor, getRadioMessage } = useI18n();

  if (messages.length === 0) return null;

  return (
    <div className="max-h-32 overflow-y-auto rounded-2xl bg-white/[0.04] p-3">
      <div className="mb-1.5 text-xs font-display uppercase tracking-wider text-metal-light">
        {t('race.radio')}
      </div>
      <div className="space-y-1">
        {messages.slice(-5).map((msg, i) => (
          <div
            key={msg.timestamp}
            className="animate-fade-in text-sm leading-snug text-white/70"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="mr-1.5 font-mono text-[11px] text-apex-red/80">{msg.source === 'event' ? 'PIT>' : 'ENG>'}</span>
            {msg.source === 'event'
              ? getEventFlavor(msg.key, msg.flavorIndex)
              : getRadioMessage(msg.key, msg.flavorIndex)}
          </div>
        ))}
      </div>
    </div>
  );
}
