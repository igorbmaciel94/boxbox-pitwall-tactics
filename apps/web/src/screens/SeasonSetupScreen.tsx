import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore, SEASON_TIRE_TOTALS } from '../stores/game-store';
import { Button } from '../components/shared/Button';
import { useI18n } from '../i18n';
import type { Difficulty, SeasonTireBank } from '@boxbox/engine';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

const COMPOUNDS: { key: keyof SeasonTireBank; color: string; label: string }[] = [
  { key: 'soft', color: 'bg-red-500', label: 'S' },
  { key: 'medium', color: 'bg-yellow-500', label: 'M' },
  { key: 'hard', color: 'bg-white', label: 'H' },
];

function defaultBank(total: number): SeasonTireBank {
  const perCompound = Math.floor(total / 3);
  const remainder = total - perCompound * 3;
  return {
    soft: perCompound + (remainder >= 1 ? 1 : 0),
    medium: perCompound + (remainder >= 2 ? 1 : 0),
    hard: perCompound,
  };
}

export function SeasonSetupScreen() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const startSeason = useGameStore((s) => s.startSeason);
  const catalog = useGameStore((s) => s.catalog);
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const currentDeck = useGameStore((s) => s.currentDeck);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const total = SEASON_TIRE_TOTALS[difficulty];
  const [bank, setBank] = useState<SeasonTireBank>(() => defaultBank(SEASON_TIRE_TOTALS['normal']));

  const currentTotal = bank.soft + bank.medium + bank.hard;
  const remaining = total - currentTotal;
  const isValid = remaining === 0 && bank.soft >= 1 && bank.medium >= 1 && bank.hard >= 1;

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    setBank(defaultBank(SEASON_TIRE_TOTALS[d]));
  };

  const adjustCompound = (key: keyof SeasonTireBank, delta: number) => {
    setBank((prev) => {
      const next = prev[key] + delta;
      if (next < 1) return prev;
      const newBank = { ...prev, [key]: next };
      const newTotal = newBank.soft + newBank.medium + newBank.hard;
      if (newTotal > total) return prev;
      return newBank;
    });
  };

  const handleStart = () => {
    if (!catalog || !selectedTeamId || currentDeck.length !== 9 || !isValid) return;
    startSeason(difficulty, bank);
    navigate('/season');
  };

  if (!catalog || !selectedTeamId || currentDeck.length !== 9) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 px-5 text-center">
        <div className="font-display text-base font-bold uppercase tracking-wide text-metal-light">
          {t('race.notReady')}
        </div>
        <p className="text-sm text-metal-light">
          {!selectedTeamId ? t('race.selectTeam') : t('race.buildDeck')} {t('race.beforeRacing')}
        </p>
        <Button variant="primary" size="md" onClick={() => navigate(!selectedTeamId ? '/team' : '/decks')}>
          {!selectedTeamId ? t('race.selectTeam') : t('race.buildDeck')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-5 pt-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
      >
        &larr; {t('common.back')}
      </button>

      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide">
        {t('season.setupTitle')}
      </h1>

      {/* Difficulty selector */}
      <div className="mb-6 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-3 text-[11px] uppercase tracking-wider text-metal-light">{t('difficulty.title')}</div>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => handleDifficultyChange(d)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-center transition-all ${
                difficulty === d
                  ? 'bg-f1-red/20 ring-1 ring-f1-red/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="font-display text-xs font-bold uppercase tracking-wide">{t(`difficulty.${d}`)}</div>
              <div className="mt-0.5 font-mono text-[10px] text-metal-light">
                {SEASON_TIRE_TOTALS[d]} sets
              </div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-metal-light">{t(`difficulty.${difficulty}Desc`)}</p>
      </div>

      {/* Tire budget distributor */}
      <div className="mb-6 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-1 text-[11px] uppercase tracking-wider text-metal-light">{t('season.tireBudget')}</div>
        <p className="mb-4 text-[11px] text-metal-light">
          {t('season.tireBudgetDesc', { total })}
        </p>

        <div className="space-y-3">
          {COMPOUNDS.map(({ key, color, label }) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`h-5 w-5 shrink-0 rounded-full ${color}`} />
              <span className="w-6 font-mono text-sm font-bold">{label}</span>
              <button
                onClick={() => adjustCompound(key, -1)}
                disabled={bank[key] <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-mono text-lg font-bold transition-colors hover:bg-white/20 disabled:opacity-30"
              >
                -
              </button>
              <span className="w-8 text-center font-mono text-lg font-bold">{bank[key]}</span>
              <button
                onClick={() => adjustCompound(key, 1)}
                disabled={remaining <= 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-mono text-lg font-bold transition-colors hover:bg-white/20 disabled:opacity-30"
              >
                +
              </button>
            </div>
          ))}
        </div>

        <div className={`mt-4 text-center font-mono text-sm font-bold ${remaining === 0 ? 'text-hud-green' : 'text-hud-amber'}`}>
          {t('season.totalSets', { current: currentTotal, total })}
        </div>

        {(bank.soft < 1 || bank.medium < 1 || bank.hard < 1) && (
          <p className="mt-2 text-center text-[11px] text-hud-red">{t('season.minOneTire')}</p>
        )}
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!isValid}
        onClick={handleStart}
      >
        {t('season.startSeason')}
      </Button>
    </div>
  );
}
