import type { TeamData } from '@boxbox/engine';
import { Button } from '../shared/Button';
import { useI18n } from '../../i18n';

interface PerkButtonProps {
  team: TeamData;
  used: boolean;
  visible: boolean;
  onActivate: () => void;
  onSkip: () => void;
}

export function PerkButton({ team, used, visible, onActivate, onSkip }: PerkButtonProps) {
  const { t, getPerkName, getPerkDescription } = useI18n();
  if (!visible || used || team.perk.timing !== 'standard') return null;

  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <div className="mb-1.5 text-xs font-display uppercase tracking-wider text-metal-light">
        {t('race.teamPerkAvailable')}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-display text-sm font-semibold uppercase tracking-wide" style={{ color: team.color }}>
            {getPerkName(team.perk.id, team.perk.name)}
          </span>
          <p className="mt-0.5 text-sm text-metal-light">{getPerkDescription(team.perk.id, team.perk.description)}</p>
        </div>
        <div className="ml-3 flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {t('race.skip')}
          </Button>
          <Button variant="primary" size="sm" onClick={onActivate}>
            {t('race.activate')}
          </Button>
        </div>
      </div>
    </div>
  );
}
