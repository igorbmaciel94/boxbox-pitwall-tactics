import { Routes, Route, useLocation, Navigate } from 'react-router';
import { useEffect, useRef } from 'react';
import { Shell } from './components/layout/Shell';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { TeamSelectScreen } from './screens/TeamSelectScreen';
import { DeckMenuScreen } from './screens/DeckMenuScreen';
import { DeckDetailScreen } from './screens/DeckDetailScreen';
import { DeckEditorScreen } from './screens/DeckEditorScreen';
import { RaceScreen } from './screens/RaceScreen';
import { DebriefScreen } from './screens/DebriefScreen';
import { SeasonScreen } from './screens/SeasonScreen';
import { SeasonSetupScreen } from './screens/SeasonSetupScreen';
import { SeasonResultsScreen } from './screens/SeasonResultsScreen';
import { GarageScreen } from './screens/GarageScreen';
import { HowToPlayScreen } from './screens/HowToPlayScreen';
import { useGameStore } from './stores/game-store';
import { useAuthStore } from './stores/auth-store';
import { loadBrowserCatalog } from './catalog/browser-loader';
import { loadAllPersistedData, migrateToUserScoped, saveLocale, saveSelectedTeam, saveCurrentDeck, saveDeckList, saveBestScore, addRunHistoryEntry, saveSeasonProgress } from './stores/persistence';
import type { SavedDeck } from './lib/types';
import { useI18n } from './i18n';
import type { Locale } from './i18n';
import { useAudio } from './hooks/use-audio';

function AuthGate({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const isGuest = useAuthStore((s) => s.isGuest);

  if (!token && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function populateStoreFromData(data: Awaited<ReturnType<typeof loadAllPersistedData>>, setLocale: (l: Locale) => void) {
  const store = useGameStore.getState();
  if (data.locale) setLocale(data.locale);
  if (data.selectedTeam) store.selectTeam(data.selectedTeam);
  if (data.currentDeck.length > 0) store.setDeck(data.currentDeck);
  // Migration: auto-create a saved deck from currentDeck if no saved decks exist
  if (data.savedDecks.length > 0) {
    store.setSavedDecks(data.savedDecks);
  } else if (data.currentDeck.length === 9) {
    const migrated: SavedDeck = {
      id: crypto.randomUUID(),
      name: 'My Deck',
      cards: data.currentDeck,
      createdAt: Date.now(),
    };
    store.setSavedDecks([migrated]);
  }
  if (data.bestScores.length > 0) store.setBestScores(data.bestScores);
  if (data.runHistory.length > 0) store.setRunHistory(data.runHistory);
  if (data.seasonRuns.length > 0) store.setSeasonRuns(data.seasonRuns);
  if (data.trophies.length > 0) store.setTrophies(data.trophies);
  if (data.seasonProgress) store.setSeasonProgress(data.seasonProgress);
}

export function App() {
  const location = useLocation();
  const setCatalog = useGameStore((s) => s.setCatalog);
  const { locale, setLocale } = useI18n();
  const { setBackgroundTrack } = useAudio();
  const userId = useAuthStore((s) => s.userId);
  const prevUserIdRef = useRef<string | null>(null);

  // Load catalog once on startup
  useEffect(() => {
    const catalog = loadBrowserCatalog();
    setCatalog(catalog);
  }, [setCatalog]);

  // Load persisted data when userId changes (login/logout/guest switch)
  useEffect(() => {
    if (!userId) return;

    // Clear game state when switching users
    if (prevUserIdRef.current && prevUserIdRef.current !== userId) {
      useGameStore.getState().clearGameState();
    }
    prevUserIdRef.current = userId;

    // Migrate legacy data if needed, then load
    migrateToUserScoped(userId).then(() =>
      loadAllPersistedData(userId).then((data) => populateStoreFromData(data, setLocale)),
    );
  }, [userId, setLocale]);

  // Subscribe to store changes and persist with userId
  useEffect(() => {
    if (!userId) return;

    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.selectedTeamId !== prev.selectedTeamId && state.selectedTeamId) {
        saveSelectedTeam(userId, state.selectedTeamId);
      }
      if (state.currentDeck !== prev.currentDeck) {
        saveCurrentDeck(userId, state.currentDeck);
      }
      if (state.lastDebrief && state.lastDebrief !== prev.lastDebrief) {
        saveBestScore(userId, state.lastDebrief).then((scores) => useGameStore.getState().setBestScores(scores));
        addRunHistoryEntry(userId, state.lastDebrief).then((history) => useGameStore.getState().setRunHistory(history));
      }
      if (state.savedDecks !== prev.savedDecks) {
        saveDeckList(userId, state.savedDecks);
      }
      if (state.seasonProgress !== prev.seasonProgress) {
        saveSeasonProgress(userId, state.seasonProgress);
      }
    });

    return unsub;
  }, [userId]);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en';
    if (userId) saveLocale(userId, locale);
  }, [locale, userId]);

  useEffect(() => {
    setBackgroundTrack(location.pathname === '/race' ? 'race' : 'menu');
  }, [location.pathname, setBackgroundTrack]);

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route
        path="*"
        element={
          <AuthGate>
            <Shell>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/team" element={<TeamSelectScreen />} />
                <Route path="/decks" element={<DeckMenuScreen />} />
                <Route path="/decks/new" element={<DeckEditorScreen />} />
                <Route path="/decks/:id" element={<DeckDetailScreen />} />
                <Route path="/decks/:id/edit" element={<DeckEditorScreen />} />
                <Route path="/race" element={<RaceScreen />} />
                <Route path="/debrief" element={<DebriefScreen />} />
                <Route path="/season" element={<SeasonScreen />} />
                <Route path="/season/setup" element={<SeasonSetupScreen />} />
                <Route path="/season/results" element={<SeasonResultsScreen />} />
                <Route path="/garage" element={<GarageScreen />} />
                <Route path="/how-to-play" element={<HowToPlayScreen />} />
              </Routes>
            </Shell>
          </AuthGate>
        }
      />
    </Routes>
  );
}
