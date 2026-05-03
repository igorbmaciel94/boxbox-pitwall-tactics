import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore, SEASON_TIRE_TOTALS } from '../stores/game-store';
import { Button } from '../components/shared/Button';
import { useI18n } from '../i18n';
import { getGoalCardImageUrl, getGoalCardFallbackGradient } from '../lib/images';
import { getGoalCardForTeam } from '@apex/engine';
import type { Difficulty, SeasonTireBank } from '@apex/engine';

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

type SetupStep = 'difficulty' | 'tires';

export function SeasonSetupScreen() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const startSeason = useGameStore((s) => s.startSeason);
  const catalog = useGameStore((s) => s.catalog);
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const currentDeck = useGameStore((s) => s.currentDeck);

  const [step, setStep] = useState<SetupStep>('difficulty');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const total = SEASON_TIRE_TOTALS[difficulty];
  const [bank, setBank] = useState<SeasonTireBank>(() => defaultBank(SEASON_TIRE_TOTALS['normal']));

  const currentTotal = bank.soft + bank.medium + bank.hard;
  const remaining = total - currentTotal;
  const isValid = remaining === 0 && bank.soft >= 1 && bank.medium >= 1 && bank.hard >= 1;

  // Auto-assign goal card based on team tier
  const goalCard = catalog && selectedTeamId
    ? getGoalCardForTeam(catalog.goalCards, selectedTeamId, catalog.drivers)
    : null;

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
    startSeason(difficulty, bank, goalCard?.id ?? null);
    navigate('/season');
  };

  const handleBack = () => {
    if (step === 'tires') setStep('difficulty');
    else navigate('/');
  };

  if (!catalog || !selectedTeamId) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 px-5 text-center">
        <div className="font-display text-base font-bold uppercase tracking-wide text-metal-light">
          {t('race.notReady')}
        </div>
        <p className="text-sm text-metal-light">
          {t('race.selectTeam')} {t('race.beforeRacing')}
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/team')}>
          {t('race.selectTeam')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-5 pt-6">
      <button
        onClick={handleBack}
        className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
      >
        &larr; {t('common.back')}
      </button>

      <h1 className="mb-1 font-display text-2xl font-bold uppercase tracking-wide">
        {t('season.setupTitle')}
      </h1>

      {/* Step indicator */}
      <div className="mb-5 flex gap-1.5">
        {(['difficulty', 'tires'] as const).map((s, i) => {
          const stepOrder = ['difficulty', 'tires'] as const;
          const currentIdx = stepOrder.indexOf(step);
          return (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s === step ? 'bg-apex-red' : i < currentIdx ? 'bg-hud-green' : 'bg-white/10'
              }`}
            />
          );
        })}
      </div>

      {/* Step 1: Difficulty + Goal Card display */}
      {step === 'difficulty' && (
        <>
          {/* Season Goal (auto-assigned) */}
          {goalCard && (
            <GoalCardDisplay card={goalCard} t={t} />
          )}

          <div className="mb-6 rounded-2xl bg-white/[0.04] p-4">
            <div className="mb-3 text-[11px] uppercase tracking-wider text-metal-light">{t('difficulty.title')}</div>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-center transition-all ${
                    difficulty === d
                      ? 'bg-apex-red/20 ring-1 ring-apex-red/50'
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
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setStep('tires')}
          >
            {t('common.next')}
          </Button>
        </>
      )}

      {/* Step 2: Tire Budget */}
      {step === 'tires' && (
        <>
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
        </>
      )}
    </div>
  );
}

function GoalCardDisplay({
  card,
  t,
}: {
  card: { id: string; title: string; description: string; startingPositionRange: [number, number] };
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="mb-4 relative overflow-hidden rounded-2xl">
      <div className="relative h-24 w-full overflow-hidden">
        {!imgFailed ? (
          <img
            src={getGoalCardImageUrl(card.id)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: getGoalCardFallbackGradient(card.id) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-carbon/90 via-carbon/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-4">
          <div className="text-[10px] uppercase tracking-wider text-apex-red/80 mb-0.5">{t('season.yourGoal')}</div>
          <div className="font-display text-base font-bold uppercase tracking-wide">{card.title}</div>
          <div className="mt-0.5 text-xs text-metal-light">{card.description}</div>
          <div className="mt-1 text-[10px] text-metal-light">
            {t('season.startRange')}: P{card.startingPositionRange[0]}-P{card.startingPositionRange[1]}
          </div>
        </div>
      </div>
    </div>
  );
}
