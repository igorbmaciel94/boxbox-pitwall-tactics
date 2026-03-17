import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { useAuthStore } from '../stores/auth-store';
import { useI18n } from '../i18n';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';
import { DeckPickerModal } from '../components/shared/DeckPickerModal';
import { exportAllForSync, importFromSync, saveLastSynced, loadLastSynced } from '../stores/persistence';
import { fetchSyncData, uploadSyncData } from '../lib/api';
import { mergeSyncData, localDataToSyncPayload } from '../lib/sync-merge';
import type { Locale } from '../i18n';

const MENU_ITEMS = [
  { labelKey: 'home.menu.quickRaceLabel', descKey: 'home.menu.quickRaceDesc', path: '/race', icon: '\u{1F3CE}\u{FE0F}', accent: 'text-hud-green', needsDeck: true, isSeason: false, isQuickRace: true },
  { labelKey: 'home.menu.seasonLabel', descKey: 'home.menu.seasonDesc', path: '/season', icon: '\u{1F3C6}', accent: 'text-f1-red', needsDeck: true, isSeason: true, isQuickRace: false },
  { labelKey: 'home.menu.deckBuilderLabel', descKey: 'home.menu.deckBuilderDesc', path: '/decks', icon: '\u{1F0CF}', accent: 'text-hud-amber', needsDeck: false, isSeason: false, isQuickRace: false },
  { labelKey: 'home.menu.selectTeamLabel', descKey: 'home.menu.selectTeamDesc', path: '/team', icon: '\u{1F3E2}', accent: 'text-hud-cyan', needsDeck: false, isSeason: false, isQuickRace: false },
  { labelKey: 'home.menu.garageLabel', descKey: 'home.menu.garageDesc', path: '/garage', icon: '\u{1F4CA}', accent: 'text-metal-light', needsDeck: false, isSeason: false, isQuickRace: false },
  { labelKey: 'home.menu.howToPlayLabel', descKey: 'home.menu.howToPlayDesc', path: '/how-to-play', icon: '\u{1F4D6}', accent: 'text-hud-blue', needsDeck: false, isSeason: false, isQuickRace: false },
] as const;

function formatTimeAgo(timestamp: number, t: (key: string) => string): string {
  if (!timestamp) return t('sync.never');
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [deckPickerTarget, setDeckPickerTarget] = useState<'race' | 'season'>('race');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const token = useAuthStore((s) => s.token);
  const username = useAuthStore((s) => s.username);
  const userId = useAuthStore((s) => s.userId);
  const isGuest = useAuthStore((s) => s.isGuest);
  const logout = useAuthStore((s) => s.logout);

  const team = catalog?.teams.find((t) => t.id === selectedTeamId);
  const validDecks = savedDecks.filter((d) => d.cards.length === 9);
  const ready = !!selectedTeamId && validDecks.length > 0;

  const hasActiveSeason = seasonProgress
    && seasonProgress.currentRaceIndex < (seasonProgress.raceOrder?.length ?? 0)
    && seasonProgress.raceResults.length > 0;

  const lastSyncedKey = userId ? `boxbox-${userId}-last-synced` : null;
  const [lastSynced, setLastSynced] = useState<number>(() =>
    lastSyncedKey ? Number(localStorage.getItem(lastSyncedKey) || 0) : 0,
  );

  // Load sync date from IDB on mount and reconcile with localStorage
  useEffect(() => {
    if (!userId) return;
    loadLastSynced(userId).then((idbValue) => {
      if (idbValue > 0) {
        setLastSynced((prev) => Math.max(prev, idbValue));
        localStorage.setItem(`boxbox-${userId}-last-synced`, String(idbValue));
      }
    });
  }, [userId]);

  const handleSync = useCallback(async () => {
    if (!token || !userId) {
      setShowRegisterModal(true);
      return;
    }

    setSyncing(true);
    setSyncMessage(null);
    try {
      const localData = await exportAllForSync(userId);
      const remoteData = await fetchSyncData(token);
      const merged = mergeSyncData(
        { ...localData, locale: localData.locale as Locale },
        remoteData,
      );

      // Write merged data to IndexedDB
      await importFromSync(userId, merged);

      // Upload merged data to server
      await uploadSyncData(token, localDataToSyncPayload(merged));

      // Update game store with merged data
      const store = useGameStore.getState();
      if (merged.selectedTeam) store.selectTeam(merged.selectedTeam);
      store.setSavedDecks(merged.savedDecks);
      store.setBestScores(merged.bestScores);
      store.setRunHistory(merged.runHistory);
      store.setSeasonRuns(merged.seasonRuns);
      store.setTrophies(merged.trophies);

      const now = Date.now();
      localStorage.setItem(`boxbox-${userId}-last-synced`, String(now));
      await saveLastSynced(userId, now);
      setLastSynced(now);
      setSyncMessage(t('sync.success'));
    } catch {
      setSyncMessage(t('sync.error'));
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 3000);
    }
  }, [token, userId, t]);

  const handleQuickRaceClick = () => {
    if (validDecks.length === 0) {
      navigate('/decks/new');
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
      if (validDecks.length === 0) {
        navigate('/decks/new');
      } else {
        setDeckPickerTarget('season');
        setShowDeckPicker(true);
      }
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
    if (validDecks.length === 0) {
      navigate('/decks/new');
    } else {
      setDeckPickerTarget('season');
      setShowDeckPicker(true);
    }
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen-safe relative flex flex-col px-5 pt-10">
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

      {/* Top controls */}
      <div className="absolute left-5 right-5 top-4 z-10 flex items-center justify-between">
        {/* Left side: user info */}
        <div className="flex items-center gap-2">
          {username && (
            <span className="text-xs text-metal-light">
              {username}
            </span>
          )}
          {isGuest && (
            <span className="rounded bg-hud-amber/15 px-1.5 py-0.5 text-[10px] font-medium text-hud-amber">
              GUEST
            </span>
          )}
        </div>

        {/* Right side: logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/50 transition-colors hover:bg-white/15 hover:text-white"
            title={t('auth.logoutButton')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

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
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
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

      {/* Sync button */}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="mb-6 flex w-full items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-sm transition-all hover:bg-white/[0.08] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </span>
          <div className="text-left">
            <div className="font-display text-sm font-semibold uppercase tracking-wide">
              {syncing ? t('sync.syncing') : t('sync.button')}
            </div>
            <div className="text-[11px] text-metal-light">
              {syncMessage || (lastSynced ? `${t('sync.lastSynced')}: ${formatTimeAgo(lastSynced, t)}` : t('sync.never'))}
            </div>
          </div>
        </div>
      </button>

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

      {/* Register First Modal (for guests) */}
      <Modal
        open={showRegisterModal}
        title={t('sync.registerFirst')}
        onClose={() => setShowRegisterModal(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-metal-light">
            {t('sync.registerFirstDesc')}
          </p>
          <div className="flex gap-2.5">
            <Button variant="ghost" size="md" className="flex-1" onClick={() => setShowRegisterModal(false)}>
              {t('common.back')}
            </Button>
            <Button variant="primary" size="md" className="flex-1" onClick={() => { setShowRegisterModal(false); navigate('/login'); }}>
              {t('auth.registerButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
