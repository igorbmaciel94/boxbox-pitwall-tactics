import { useNavigate } from 'react-router';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-hud-amber mb-2">{title}</h2>
      <div className="text-xs text-white/80 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Term({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="font-display text-[10px] font-bold uppercase tracking-wider text-hud-cyan shrink-0 w-16">{label}</span>
      <span className="text-metal-light text-[11px]">{children}</span>
    </div>
  );
}

export function HowToPlayScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col px-4 pt-6 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="text-[10px] text-metal-light uppercase tracking-wider mb-4 text-left hover:text-white transition-colors"
      >
        &larr; Back
      </button>

      <h1 className="font-display text-lg font-black uppercase tracking-wider mb-1">How to Play</h1>
      <p className="text-[10px] text-metal-light mb-6">Your guide to pit wall strategy</p>

      <Section title="Overview">
        <p>
          You are the pit wall strategist for a Formula 1 team. Before each race, you build a 9-card
          deck representing your tactical options. During the race, you draw cards each lap and play
          them to respond to events on track.
        </p>
        <p>
          Your goal is to finish in the best position possible while completing race objectives for
          bonus points.
        </p>
      </Section>

      <Section title="Getting Started">
        <p><strong className="text-white">1. Select a Team</strong> &mdash; Each constructor has a unique perk that activates once per race.</p>
        <p><strong className="text-white">2. Build Your Deck</strong> &mdash; Choose 9 cards (max 2 copies of each). Balance between drive, pit, and tactics cards.</p>
        <p><strong className="text-white">3. Race</strong> &mdash; Pick a circuit and manage 6 laps of strategic decisions.</p>
      </Section>

      <Section title="Race Flow">
        <p>Each lap follows these phases:</p>
        <div className="rounded-lg border border-metal-light/10 bg-carbon-mid p-3 space-y-1.5">
          <Term label="Draw">Your hand refills to 3 cards from your shuffled deck.</Term>
          <Term label="Event">A random event is revealed &mdash; it may affect your car or trigger a quick decision.</Term>
          <Term label="QD">If a Safety Car, VSC, or rain spike occurs, you may play a Quick Decision card instantly.</Term>
          <Term label="Perk">You can activate your team&apos;s unique perk (once per race).</Term>
          <Term label="Play">Choose 1 action card from your hand to play.</Term>
          <Term label="Result">Card effects and event consequences are applied. Next lap begins.</Term>
        </div>
      </Section>

      <Section title="Card Types">
        <div className="space-y-2">
          <div className="rounded border border-hud-green/30 bg-carbon-mid p-2">
            <span className="text-hud-green font-display text-[10px] font-bold uppercase">Drive</span>
            <span className="text-metal-light text-[10px] ml-2">Position-focused. Push for overtakes or defend your spot.</span>
          </div>
          <div className="rounded border border-hud-amber/30 bg-carbon-mid p-2">
            <span className="text-hud-amber font-display text-[10px] font-bold uppercase">Pit</span>
            <span className="text-metal-light text-[10px] ml-2">Manage tires, ERS, and pit strategy.</span>
          </div>
          <div className="rounded border border-hud-blue/30 bg-carbon-mid p-2">
            <span className="text-hud-blue font-display text-[10px] font-bold uppercase">Tactics</span>
            <span className="text-metal-light text-[10px] ml-2">Versatile cards for adapting to changing conditions.</span>
          </div>
        </div>
        <p className="mt-2">
          Cards marked with <span className="text-hud-yellow font-bold">QD</span> can be played
          during Quick Decision moments for an immediate tactical advantage.
        </p>
      </Section>

      <Section title="HUD Gauges">
        <div className="rounded-lg border border-metal-light/10 bg-carbon-mid p-3 space-y-1.5">
          <Term label="POS">Your race position (P1 = leading). Lower is better.</Term>
          <Term label="WEAR">Tire degradation (0-100). High wear hurts performance and worsens position.</Term>
          <Term label="ERS">Energy Recovery System (0-100). Used for overtakes and defending.</Term>
          <Term label="RAIN">Rain intensity meter (0-10). At 7+ a rain spike triggers a Quick Decision.</Term>
        </div>
      </Section>

      <Section title="Events">
        <div className="rounded-lg border border-metal-light/10 bg-carbon-mid p-3 space-y-1.5">
          <Term label="SC">Safety Car &mdash; field bunches up. Triggers QD. Max 1 per race.</Term>
          <Term label="VSC">Virtual Safety Car &mdash; saves fuel but freezes gaps. Triggers QD. Max 1 per race.</Term>
          <Term label="Rain">Rain increases the rain meter. No QD unless rain spike (&ge;7).</Term>
          <Term label="Others">Traffic, rivals pitting, track limits, DRS trains, clear air, mechanical issues &mdash; each affects position, wear, or ERS.</Term>
        </div>
      </Section>

      <Section title="Scoring">
        <p>Your final score combines:</p>
        <div className="rounded-lg border border-metal-light/10 bg-carbon-mid p-3 space-y-1.5">
          <Term label="Finish">Points based on your final position (P1 = 25pts, like real F1).</Term>
          <Term label="Main">Complete the circuit&apos;s main objective for bonus points.</Term>
          <Term label="Bonus">Optional secondary objectives for extra points.</Term>
        </div>
      </Section>

      <Section title="Strategy Tips">
        <ul className="list-disc list-inside space-y-1 text-metal-light text-[11px]">
          <li>Balance your deck &mdash; don&apos;t go all-in on one card type.</li>
          <li>Keep at least 2-3 QD-eligible cards to react to Safety Cars and rain spikes.</li>
          <li>Watch your tire wear &mdash; high wear compounds position loss each lap.</li>
          <li>Save your team perk for a critical moment, not the first opportunity.</li>
          <li>Study the circuit objectives before building your deck.</li>
          <li>Weather-heavy circuits (Spa, Interlagos) reward weather cards in your deck.</li>
        </ul>
      </Section>

      <button
        onClick={() => navigate('/')}
        className="mt-4 w-full rounded-lg border border-metal-light/20 bg-carbon-mid p-3 font-display text-sm font-semibold uppercase tracking-wider text-center hover:bg-metal-dark transition-colors active:scale-[0.98]"
      >
        Back to Menu
      </button>
    </div>
  );
}
