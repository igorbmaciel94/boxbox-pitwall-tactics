import { Routes, Route, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Shell } from './components/layout/Shell';
import { HomeScreen } from './screens/HomeScreen';
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
import { loadBrowserCatalog } from './catalog/browser-loader';
import { loadAllPersistedData, saveLocale, saveSelectedTeam, saveCurrentDeck, saveDeckList, saveBestScore, addRunHistoryEntry, saveSeasonProgress } from './stores/persistence';
import type { SavedDeck } from './lib/types';
import { useI18n } from './i18n';
import { useAudio } from './hooks/use-audio';

export function App() {
  const location = useLocation();
  const setCatalog = useGameStore((s) => s.setCatalog);
  const { locale, setLocale } = useI18n();
  const { setBackgroundTrack } = useAudio();

  // Load catalog and persisted data on startup
  useEffect(() => {
    const catalog = loadBrowserCatalog();
    setCatalog(catalog);

    loadAllPersistedData().then((data) => {
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
    });

    // Subscribe to store changes and persist
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.selectedTeamId !== prev.selectedTeamId && state.selectedTeamId) {
        saveSelectedTeam(state.selectedTeamId);
      }
      if (state.currentDeck !== prev.currentDeck) {
        saveCurrentDeck(state.currentDeck);
      }
      if (state.lastDebrief && state.lastDebrief !== prev.lastDebrief) {
        saveBestScore(state.lastDebrief).then((scores) => useGameStore.getState().setBestScores(scores));
        addRunHistoryEntry(state.lastDebrief).then((history) => useGameStore.getState().setRunHistory(history));
      }
      if (state.savedDecks !== prev.savedDecks) {
        saveDeckList(state.savedDecks);
      }
      if (state.seasonProgress !== prev.seasonProgress) {
        saveSeasonProgress(state.seasonProgress);
      }
    });

    return unsub;
  }, [setCatalog, setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en';
    saveLocale(locale);
  }, [locale]);

  useEffect(() => {
    setBackgroundTrack(location.pathname === '/race' ? 'race' : 'menu');
  }, [location.pathname, setBackgroundTrack]);

  return (
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
  );
}
