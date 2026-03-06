import { useState } from 'react';
import type { TireCompound, TireAllocation, SeasonTireBank, Difficulty } from '@boxbox/engine';
import { Button } from '../shared/Button';
import { useI18n } from '../../i18n';
import { useGameStore } from '../../stores/game-store';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

interface PreRaceTireSetupProps {
  onConfirm: (allocation: TireAllocation, startingCompound: TireCompound) => void;
  seasonTireBank?: SeasonTireBank | null;
  hideDifficulty?: boolean;
}

const DRY_COMPOUNDS: {
  id: 'soft' | 'medium' | 'hard';
  label: string;
  bg: string;
  ring: string;
  circleColor: string;
}[] = [
  { id: 'soft', label: 'Soft', bg: 'bg-red-500/10', ring: 'ring-red-500/40', circleColor: 'bg-red-500' },
  { id: 'medium', label: 'Medium', bg: 'bg-yellow-500/10', ring: 'ring-yellow-500/40', circleColor: 'bg-yellow-500' },
  { id: 'hard', label: 'Hard', bg: 'bg-white/10', ring: 'ring-white/40', circleColor: 'bg-white' },
];

const TOTAL_SETS = 3;

export function PreRaceTireSetup({ onConfirm, seasonTireBank, hideDifficulty }: PreRaceTireSetupProps) {
  const { t } = useI18n();
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const [allocation, setAllocation] = useState<TireAllocation>({ soft: 1, medium: 1, hard: 1 });
  const [startingCompound, setStartingCompound] = useState<TireCompound>('soft');

  const total = allocation.soft + allocation.medium + allocation.hard;
  const isValid = total === TOTAL_SETS && allocation[startingCompound as 'soft' | 'medium' | 'hard'] > 0;

  const adjustCount = (compound: 'soft' | 'medium' | 'hard', delta: number) => {
    const newValue = allocation[compound] + delta;
    if (newValue < 0 || newValue > TOTAL_SETS) return;
    const newAllocation = { ...allocation, [compound]: newValue };
    const newTotal = newAllocation.soft + newAllocation.medium + newAllocation.hard;
    if (newTotal > TOTAL_SETS) return;

    // Check season budget
    if (seasonTireBank && delta > 0 && newValue > seasonTireBank[compound]) return;

    setAllocation(newAllocation);

    // If starting compound no longer in allocation, reset
    if (newAllocation[startingCompound as 'soft' | 'medium' | 'hard'] === 0) {
      if (newAllocation.soft > 0) setStartingCompound('soft');
      else if (newAllocation.medium > 0) setStartingCompound('medium');
      else if (newAllocation.hard > 0) setStartingCompound('hard');
    }
  };

  return (
    <div className="animate-panel-pop space-y-4 rounded-2xl bg-white/[0.04] p-5">
      <div className="text-center">
        <div className="font-display text-base font-bold uppercase tracking-wide">
          {t('tireSetup.title')}
        </div>
        <p className="mt-1 text-xs text-metal-light">
          {t('tireSetup.subtitle')}
        </p>
      </div>

      {/* Compound allocation */}
      <div className="space-y-2">
        {DRY_COMPOUNDS.map((c) => {
          const count = allocation[c.id];
          const maxForCompound = seasonTireBank ? seasonTireBank[c.id] : TOTAL_SETS;
          const canIncrease = total < TOTAL_SETS && count < maxForCompound;

          return (
            <div
              key={c.id}
              className={`flex items-center gap-3 rounded-xl ${c.bg} px-3 py-2.5`}
            >
              <div className={`h-5 w-5 shrink-0 rounded-full ${c.circleColor}`} />
              <span className="flex-1 text-sm font-bold">{c.label}</span>

              {seasonTireBank && (
                <span className="text-[10px] text-metal-light mr-1">
                  {t('tireSetup.remaining')}: {seasonTireBank[c.id]}
                </span>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => adjustCount(c.id, -1)}
                  disabled={count <= 0}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm font-bold disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-5 text-center font-mono text-sm font-bold">{count}</span>
                <button
                  onClick={() => adjustCount(c.id, 1)}
                  disabled={!canIncrease}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total indicator */}
      <div className="text-center">
        <span className={`font-mono text-sm ${total === TOTAL_SETS ? 'text-hud-green' : 'text-hud-amber'}`}>
          {total}/{TOTAL_SETS} {t('tireSetup.setsSelected')}
        </span>
      </div>

      {/* Starting compound selection */}
      {total === TOTAL_SETS && (
        <div className="space-y-2">
          <div className="text-xs font-display uppercase tracking-wider text-metal-light text-center">
            {t('tireSetup.startingCompound')}
          </div>
          <div className="flex gap-2 justify-center">
            {DRY_COMPOUNDS.filter((c) => allocation[c.id] > 0).map((c) => (
              <button
                key={c.id}
                onClick={() => setStartingCompound(c.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all ${
                  startingCompound === c.id
                    ? `${c.bg} ring-2 ${c.ring}`
                    : 'bg-white/[0.04] hover:bg-white/8'
                }`}
              >
                <div className={`h-4 w-4 rounded-full ${c.circleColor}`} />
                <span className="text-xs font-bold">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inter/Wet info */}
      <div className="flex items-center gap-2 rounded-lg bg-blue-500/5 border border-blue-500/20 px-3 py-2">
        <div className="flex gap-1">
          <div className="h-3.5 w-3.5 rounded-full bg-green-500" />
          <div className="h-3.5 w-3.5 rounded-full bg-blue-500" />
        </div>
        <span className="text-[11px] text-metal-light">
          {t('tireSetup.rainInfo')}
        </span>
      </div>

      {/* Difficulty selector — hidden in season mode (chosen at setup) */}
      {!hideDifficulty && (
        <div className="rounded-xl bg-white/[0.04] px-4 py-3">
          <div className="mb-2 text-[11px] uppercase tracking-wider text-metal-light">{t('difficulty.title')}</div>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-xl px-3 py-2 text-center transition-all ${
                  difficulty === d
                    ? d === 'easy' ? 'bg-hud-green/20 ring-1 ring-hud-green/50 text-hud-green'
                    : d === 'normal' ? 'bg-hud-amber/20 ring-1 ring-hud-amber/50 text-hud-amber'
                    : 'bg-hud-red/20 ring-1 ring-hud-red/50 text-hud-red'
                    : 'bg-white/5 text-metal-light hover:bg-white/10'
                }`}
              >
                <div className="font-display text-xs font-bold uppercase tracking-wide">{t(`difficulty.${d}`)}</div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-metal-light">{t(`difficulty.${difficulty}Desc`)}</p>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!isValid}
        onClick={() => onConfirm(allocation, startingCompound)}
      >
        {t('tireSetup.confirm')}
      </Button>
    </div>
  );
}
