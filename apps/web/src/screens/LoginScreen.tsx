import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/auth-store';
import { useI18n } from '../i18n';
import { Button } from '../components/shared/Button';
import { LanguageBar } from '../components/layout/LanguageBar';
import { exportAllForSync, importFromSync, saveLastSynced } from '../stores/persistence';
import { fetchSyncData, uploadSyncData } from '../lib/api';
import { mergeSyncData, localDataToSyncPayload } from '../lib/sync-merge';
import { useGameStore } from '../stores/game-store';
import type { Locale } from '../i18n';

type AuthMode = 'login' | 'register';

export function LoginScreen() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { login, register, playAsGuest, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (username.length < 3 || password.length < 6) return;

    if (isRegister) {
      await register(username, password);
    } else {
      await login(username, password);
    }

    const state = useAuthStore.getState();
    if (state.isAuthenticated()) {
      // Only attempt cloud sync when we have a valid token (online login)
      if (state.token && state.userId) {
        try {
          if (isRegister) {
            // Auto-upload local data after registration (from the userId namespace)
            const localData = await exportAllForSync(state.userId);
            const payload = localDataToSyncPayload({ ...localData, locale: localData.locale as Locale });
            await uploadSyncData(state.token, payload);
            const now = Date.now();
            localStorage.setItem(`boxbox-${state.userId}-last-synced`, String(now));
            await saveLastSynced(state.userId, now);
          } else {
            // Auto-sync from cloud after login
            const remoteData = await fetchSyncData(state.token);
            if (remoteData.lastSyncedAt > 0) {
              const localData = await exportAllForSync(state.userId);
              const merged = mergeSyncData(
                { ...localData, locale: localData.locale as Locale },
                remoteData,
              );
              await importFromSync(state.userId, merged);
              const store = useGameStore.getState();
              if (merged.selectedTeam) store.selectTeam(merged.selectedTeam);
              store.setSavedDecks(merged.savedDecks);
              store.setBestScores(merged.bestScores);
              store.setRunHistory(merged.runHistory);
              store.setSeasonRuns(merged.seasonRuns);
              store.setTrophies(merged.trophies);
              const now = Date.now();
              localStorage.setItem(`boxbox-${state.userId}-last-synced`, String(now));
              await saveLastSynced(state.userId, now);
            }
          }
        } catch {
          // Sync failure is not critical, user can retry later
        }
      }
      navigate('/');
    }
  };

  const handleGuest = () => {
    playAsGuest();
    navigate('/');
  };

  const toggleMode = () => {
    clearError();
    setMode(isRegister ? 'login' : 'register');
  };

  const errorMessage = error
    ? t(`auth.${error}` as Parameters<typeof t>[0]) || error
    : null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-y-auto px-5">
      <div className="fixed inset-x-0 top-0 z-50 safe-area-pt">
        <LanguageBar />
      </div>

      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'url(/images/backgrounds/home-bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-carbon/80 via-carbon/60 to-carbon" />

      {/* Title */}
      <div className="mb-10 text-center">
        <h1 className="pitlane-divider inline-block font-display text-4xl font-black uppercase leading-none tracking-wider">
          {t('home.title')}
        </h1>
        <p className="mt-4 font-display text-xs font-medium uppercase tracking-[0.2em] text-metal-light">
          {t('home.subtitle')}
        </p>
      </div>

      {/* Auth Form */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.usernamePlaceholder')}
              minLength={3}
              autoComplete="username"
              className="w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition-all focus:bg-white/[0.08] focus:ring-white/25"
            />
            {username.length > 0 && username.length < 3 && (
              <p className="mt-1 text-xs text-hud-amber">{t('auth.usernameMin')}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition-all focus:bg-white/[0.08] focus:ring-white/25"
            />
            {password.length > 0 && password.length < 6 && (
              <p className="mt-1 text-xs text-hud-amber">{t('auth.passwordMin')}</p>
            )}
          </div>

          {isRegister && username.length >= 3 && (
            <div className="rounded-xl bg-white/[0.04] px-4 py-2.5 text-xs text-metal-light">
              {t('auth.playerCodePreview')}: <span className="font-mono font-bold text-white">{username.slice(0, 3).toUpperCase()}</span>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl bg-hud-red/15 px-4 py-2.5 text-xs font-medium text-hud-red">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading || username.length < 3 || password.length < 6}
          >
            {isLoading
              ? '...'
              : isRegister
                ? t('auth.registerButton')
                : t('auth.loginButton')}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2.5">
          <button
            onClick={toggleMode}
            className="w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-metal-light transition-all hover:bg-white/[0.08] hover:text-white"
          >
            {isRegister ? t('auth.switchToLogin') : t('auth.switchToRegister')}
          </button>

          <button
            onClick={handleGuest}
            className="w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-metal-light transition-all hover:bg-white/[0.08] hover:text-white"
          >
            {t('auth.guestButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
