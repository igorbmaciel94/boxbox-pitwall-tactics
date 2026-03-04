import { useUIStore } from '../../stores/ui-store';

export function RadioFeed() {
  const messages = useUIStore((s) => s.radioMessages);

  if (messages.length === 0) return null;

  return (
    <div className="rounded-lg border border-metal-light/10 bg-carbon-mid/50 p-2 max-h-24 overflow-y-auto">
      <div className="text-[9px] font-display uppercase tracking-wider text-metal-light mb-1">
        Radio
      </div>
      <div className="space-y-1">
        {messages.slice(-5).map((msg, i) => (
          <div
            key={msg.timestamp}
            className="text-[10px] text-white/60 animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="text-hud-blue mr-1">ENG:</span>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}
