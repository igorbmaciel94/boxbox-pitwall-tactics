import type { TireCompound } from '@boxbox/engine';
import { isCurrentlyRaining } from '@boxbox/engine';
import type { RaceState } from '@boxbox/engine';
import { useI18n } from '../../i18n';

interface CompoundSelectorProps {
  onSelect: (compound: TireCompound) => void;
  raceState: RaceState;
}

const COMPOUNDS: {
  id: TireCompound;
  name: string;
  bg: string;
  border: string;
  wear: string;
  condition: string;
  isDry: boolean;
}[] = [
  { id: 'soft', name: 'Soft', bg: 'bg-red-500/20', border: 'border-red-500', wear: 'High', condition: 'Dry', isDry: true },
  { id: 'medium', name: 'Medium', bg: 'bg-yellow-500/20', border: 'border-yellow-500', wear: 'Medium', condition: 'Dry', isDry: true },
  { id: 'hard', name: 'Hard', bg: 'bg-white/20', border: 'border-white', wear: 'Low', condition: 'Dry', isDry: true },
  { id: 'intermediate', name: 'Inter', bg: 'bg-green-500/20', border: 'border-green-500', wear: 'Medium', condition: 'Rain', isDry: false },
  { id: 'wet', name: 'Wet', bg: 'bg-blue-500/20', border: 'border-blue-500', wear: 'Low', condition: 'Rain', isDry: false },
];

const COMPOUND_CIRCLE: Record<TireCompound, string> = {
  soft: 'bg-red-500',
  medium: 'bg-yellow-500',
  hard: 'bg-white',
  intermediate: 'bg-green-500',
  wet: 'bg-blue-500',
};

function getRemainingDrySets(
  compound: 'soft' | 'medium' | 'hard',
  allocation: { soft: number; medium: number; hard: number },
  compoundSetsUsed: TireCompound[],
): number {
  const used = compoundSetsUsed.filter((c) => c === compound).length;
  return Math.max(0, allocation[compound] - used);
}

export function CompoundSelector({ onSelect, raceState }: CompoundSelectorProps) {
  const { t } = useI18n();
  const raining = isCurrentlyRaining(raceState);
  const { tireAllocation, compoundSetsUsed } = raceState;

  // Dry compounds: only if remaining sets > 0
  // Rain compounds (Inter/Wet): only if currently raining (wildcards)
  const availableCompounds = COMPOUNDS.filter((c) => {
    if (c.isDry) {
      return getRemainingDrySets(c.id as 'soft' | 'medium' | 'hard', tireAllocation, compoundSetsUsed) > 0;
    }
    return raining;
  });

  return (
    <div className="animate-panel-pop space-y-3 rounded-2xl bg-white/[0.04] p-4">
      <div className="text-center font-display text-sm font-bold uppercase tracking-wide text-metal-light">
        {t('tireSetup.chooseCompound')}
      </div>
      <div className="flex flex-col gap-2">
        {availableCompounds.map((c) => {
          const remaining = c.isDry
            ? getRemainingDrySets(c.id as 'soft' | 'medium' | 'hard', tireAllocation, compoundSetsUsed)
            : null;
          const recommended =
            (raining && (c.id === 'intermediate' || c.id === 'wet')) ||
            (!raining && c.id === 'medium');
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`flex items-center gap-3 rounded-xl border ${c.border}/40 ${c.bg} px-3 py-2.5 text-left transition-all hover:scale-[1.01] active:scale-[0.98] ${recommended ? 'ring-1 ring-white/30' : ''}`}
            >
              <div className={`h-5 w-5 rounded-full ${COMPOUND_CIRCLE[c.id]}`} />
              <div className="flex-1">
                <span className="text-sm font-bold">{c.name}</span>
                <span className="ml-2 text-[11px] text-metal-light">{c.condition}</span>
              </div>
              {remaining !== null && (
                <span className="text-[10px] text-metal-light mr-1">{remaining} left</span>
              )}
              <span className="text-[10px] uppercase tracking-wider text-metal-light">{c.wear} wear</span>
            </button>
          );
        })}
      </div>
      {availableCompounds.length === 0 && (
        <p className="text-center text-xs text-metal-light">{t('tireSetup.noCompoundsLeft')}</p>
      )}
    </div>
  );
}
