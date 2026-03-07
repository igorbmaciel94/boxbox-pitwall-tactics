import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { useI18n } from '../i18n';
import { useAudio } from '../hooks/use-audio';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';
import { DeckPickerModal } from '../components/shared/DeckPickerModal';

const MENU_ITEMS = [
  { labelKey: 'home.menu.quickRaceLabel', descKey: 'home.menu.quickRaceDesc', path: '/race', icon: '\u{1F3CE}\u{FE0F}', accent: 'text-hud-green', needsDeck: true, isSeason: false, isQuickRace: true },
  { labelKey: 'home.menu.seasonLabel', descKey: 'home.menu.seasonDesc', path: '/season', icon: '\u{1F3C6}', accent: 'text-f1-red', needsDeck: true, isSeason: true, isQuickRace: false },
  { labelKey: 'home.menu.deckBuilderLabel', descKey: 'home.menu.deckBuilderDesc', path: '/decks', icon: '\u{1F0CF}', accent: 'text-hud-amber', needsDeck: false, isSeason: false, isQuickRace: false },
  { labelKey: 'home.menu.selectTeamLabel', descKey: 'home.menu.selectTeamDesc', path: '/team', icon: '\u{1F3E2}', accent: 'text-hud-cyan', needsDeck: false, isSeason: false, isQuickRace: false },
  { labelKey: 'home.menu.garageLabel', descKey: 'home.menu.garageDesc', path: '/garage', icon: '\u{1F4CA}', accent: 'text-metal-light', needsDeck: false, isSeason: false, isQuickRace: false },
  { labelKey: 'home.menu.howToPlayLabel', descKey: 'home.menu.howToPlayDesc', path: '/how-to-play', icon: '\u{1F4D6}', accent: 'text-hud-blue', needsDeck: false, isSeason: false, isQuickRace: false },
] as const;

export function HomeScreen() {
  const navigate = useNavigate();
  const { t, getTeamName } = useI18n();
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const savedDecks = useGameStore((s) => s.savedDecks);
  const loadDeckForPlay = useGameStore((s) => s.loadDeckForPlay);
  const catalog = useGameStore((s) => s.catalog);
  const seasonProgress = useGameStore((s) => s.seasonProgress);
  const restoreAbandonedTires = useGameStore((s) => s.restoreAbandonedTires);
  const resetAll = useGameStore((s) => s.resetAll);
  const audio = useAudio();
  const [muted, setMuted] = useState(() => audio.isMuted());
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [deckPickerTarget, setDeckPickerTarget] = useState<'race' | 'season'>('race');

  const team = catalog?.teams.find((t) => t.id === selectedTeamId);
  const validDecks = savedDecks.filter((d) => d.cards.length === 9);
  const ready = !!selectedTeamId && validDecks.length > 0;

  const hasActiveSeason = seasonProgress
    && seasonProgress.currentRaceIndex < (seasonProgress.raceOrder?.length ?? 0)
    && seasonProgress.raceResults.length > 0;

  const handleQuickRaceClick = () => {
    if (validDecks.length === 0) {
      navigate('/decks/new');
    } else if (validDecks.length === 1) {
      loadDeckForPlay(validDecks[0].id);
      navigate('/race');
    } else {
      setDeckPickerTarget('race');
      setShowDeckPicker(true);
    }
  };

  const handleSeasonClick = () => {
    if (hasActiveSeason) {
      setShowSeasonModal(true);
    } else {
      if (seasonProgress) resetAll();
      navigate('/season/setup');
    }
  };

  const handleContinueSeason = () => {
    restoreAbandonedTires();
    setShowSeasonModal(false);
    navigate('/season');
  };

  const handleNewSeason = () => {
    resetAll();
    setShowSeasonModal(false);
    navigate('/season/setup');
  };

  const handleDeckSelected = (_deckId: string) => {
    setShowDeckPicker(false);
    if (deckPickerTarget === 'race') {
      navigate('/race');
    } else {
      navigate('/season/setup');
    }
  };

  const handleMenuClick = (item: typeof MENU_ITEMS[number]) => {
    if (item.isQuickRace) {
      handleQuickRaceClick();
    } else if (item.isSeason) {
      handleSeasonClick();
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pt-10">
      {/* Background image */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <img
          src="/images/backgrounds/home-bg.webp"
          alt=""
          className="h-full w-full object-cover opacity-15"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-carbon/80 via-carbon/60 to-carbon" />
      </div>
      {/* Mute toggle */}
      <button
        onClick={() => setMuted(audio.toggleMute())}
        className="absolute right-5 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/50 transition-colors hover:bg-white/15 hover:text-white"
        title={muted ? t('race.unmute') : t('race.mute')}
      >
        {muted ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

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
          <span className={`font-medium ${validDecks.length > 0 ? 'text-hud-green' : 'text-hud-amber'}`}>
            {validDecks.length > 0
              ? `${validDecks.length} ${validDecks.length === 1 ? 'deck' : 'decks'}`
              : t('home.deckNotBuilt')}
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
              onClick={() => handleMenuClick(item)}
              disabled={disabled}
              className={`animate-panel-pop flex items-center gap-4 rounded-2xl bg-white/[0.04] px-4 py-3.5 text-left transition-all duration-150
                ${disabled ? 'pointer-events-none opacity-40' : 'hover:bg-white/[0.08] active:scale-[0.98]'}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-xl">
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

      {/* Deck Picker Modal */}
      <DeckPickerModal
        open={showDeckPicker}
        onClose={() => setShowDeckPicker(false)}
        onSelect={handleDeckSelected}
      />

      {/* Season Continue/New Modal */}
      <Modal
        open={showSeasonModal}
        title={t('season.continueOrNew')}
        onClose={() => setShowSeasonModal(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-metal-light">
            {t('season.continueOrNewDesc')}
          </p>
          {seasonProgress && (
            <div className="rounded-xl bg-white/[0.04] p-3 text-xs text-metal-light">
              {t('season.raceOf', {
                current: seasonProgress.currentRaceIndex + 1,
                total: seasonProgress.raceOrder.length,
              })}
              {' — '}
              {seasonProgress.cumulativeScore} {t('common.scorePts')}
            </div>
          )}
          <div className="flex gap-2.5">
            <Button variant="ghost" size="md" className="flex-1" onClick={handleNewSeason}>
              {t('season.newSeason')}
            </Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleContinueSeason}>
              {t('season.continueSeason')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
