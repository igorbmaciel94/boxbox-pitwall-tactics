import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';

const MENU_ITEMS = [
  { label: 'Quick Race', desc: 'Jump into a single race', path: '/race', icon: '▸', accent: 'border-hud-green', needsDeck: true },
  { label: 'Season', desc: '6-race championship', path: '/season', icon: '◆', accent: 'border-hud-blue', needsDeck: true },
  { label: 'Deck Builder', desc: 'Build your 9-card strategy', path: '/decks', icon: '▦', accent: 'border-hud-amber', needsDeck: false },
  { label: 'Select Team', desc: 'Choose your constructor', path: '/team', icon: '◈', accent: 'border-hud-cyan', needsDeck: false },
  { label: 'Garage', desc: 'Run history & best scores', path: '/garage', icon: '◇', accent: 'border-metal-light', needsDeck: false },
  { label: 'How to Play', desc: 'Learn the rules & strategy', path: '/how-to-play', icon: '?', accent: 'border-hud-cyan', needsDeck: false },
] as const;

export function HomeScreen() {
  const navigate = useNavigate();
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const currentDeck = useGameStore((s) => s.currentDeck);
  const catalog = useGameStore((s) => s.catalog);

  const team = catalog?.teams.find((t) => t.id === selectedTeamId);
  const ready = !!selectedTeamId && currentDeck.length === 9;

  return (
    <div className="flex flex-col px-4 pt-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-black uppercase tracking-wider">Box Box</h1>
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-metal-light mt-1">
          Pit Wall Tactics
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-metal-light/20 bg-carbon-mid p-3 text-xs">
        <div>
          <span className="text-metal-light">Team: </span>
          <span style={team ? { color: team.color } : undefined}>
            {team ? team.name : 'None'}
          </span>
        </div>
        <div>
          <span className="text-metal-light">Deck: </span>
          <span className={ready ? 'text-hud-green' : 'text-hud-amber'}>
            {currentDeck.length === 9 ? '9 cards' : 'Not built'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {MENU_ITEMS.map((item) => {
          const disabled = item.needsDeck && !ready;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              disabled={disabled}
              className={`flex items-center gap-4 rounded-lg border bg-carbon-mid p-4 text-left transition-all duration-150
                ${item.accent} ${disabled ? 'opacity-40 pointer-events-none' : 'hover:bg-metal-dark active:scale-[0.98]'}`}
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="font-display text-sm font-semibold uppercase tracking-wider">{item.label}</div>
                <div className="text-[10px] text-metal-light">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {!ready && (
        <p className="mt-6 text-center text-[10px] text-metal-light">
          Select a team and build a deck to start racing
        </p>
      )}
    </div>
  );
}
