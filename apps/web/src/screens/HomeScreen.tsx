import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { useI18n } from '../i18n';

const MENU_ITEMS = [
  { labelKey: 'home.menu.quickRaceLabel', descKey: 'home.menu.quickRaceDesc', path: '/race', icon: 'RACE', accent: 'text-hud-green', needsDeck: true },
  { labelKey: 'home.menu.seasonLabel', descKey: 'home.menu.seasonDesc', path: '/season', icon: 'SZN', accent: 'text-f1-red', needsDeck: true },
  { labelKey: 'home.menu.deckBuilderLabel', descKey: 'home.menu.deckBuilderDesc', path: '/decks', icon: 'CARDS', accent: 'text-hud-amber', needsDeck: false },
  { labelKey: 'home.menu.selectTeamLabel', descKey: 'home.menu.selectTeamDesc', path: '/team', icon: 'TEAM', accent: 'text-hud-cyan', needsDeck: false },
  { labelKey: 'home.menu.garageLabel', descKey: 'home.menu.garageDesc', path: '/garage', icon: 'DATA', accent: 'text-metal-light', needsDeck: false },
  { labelKey: 'home.menu.howToPlayLabel', descKey: 'home.menu.howToPlayDesc', path: '/how-to-play', icon: 'GUIDE', accent: 'text-hud-blue', needsDeck: false },
] as const;

export function HomeScreen() {
  const navigate = useNavigate();
  const { t, getTeamName } = useI18n();
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const currentDeck = useGameStore((s) => s.currentDeck);
  const catalog = useGameStore((s) => s.catalog);

  const team = catalog?.teams.find((t) => t.id === selectedTeamId);
  const ready = !!selectedTeamId && currentDeck.length === 9;

  return (
    <div className="flex flex-col px-5 pt-10">
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="pitlane-divider inline-block font-display text-4xl font-black uppercase leading-none tracking-wider">
          {t('home.title')}
        </h1>
        <p className="mt-4 font-display text-xs font-medium uppercase tracking-[0.2em] text-metal-light">
          {t('home.subtitle')}
        </p>
      </div>

      {/* Status bar */}
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-metal-light">{t('home.teamLabel')} </span>
          <span className="font-medium" style={team ? { color: team.color } : undefined}>
            {team ? getTeamName(team.id, team.name) : t('home.teamNone')}
          </span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-metal-light">{t('home.deckLabel')} </span>
          <span className={`font-medium ${ready ? 'text-hud-green' : 'text-hud-amber'}`}>
            {currentDeck.length === 9 ? t('home.deckReady') : t('home.deckNotBuilt')}
          </span>
        </div>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-2.5">
        {MENU_ITEMS.map((item, idx) => {
          const disabled = item.needsDeck && !ready;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              disabled={disabled}
              className={`animate-panel-pop flex items-center gap-4 rounded-2xl bg-white/[0.04] px-4 py-3.5 text-left transition-all duration-150
                ${disabled ? 'pointer-events-none opacity-40' : 'hover:bg-white/[0.08] active:scale-[0.98]'}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 font-mono text-[10px] font-bold tracking-wider ${item.accent}`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[17px] font-semibold uppercase leading-tight tracking-wide">{t(item.labelKey)}</div>
                <div className="mt-0.5 text-[13px] leading-snug text-metal-light">{t(item.descKey)}</div>
              </div>
              <span className="text-sm text-white/30">&rsaquo;</span>
            </button>
          );
        })}
      </div>

      {!ready && (
        <p className="mt-6 text-center text-sm text-metal-light">
          {t('home.readyHint')}
        </p>
      )}
    </div>
  );
}
