import type { TeamData } from '@boxbox/engine';
import { Button } from '../shared/Button';

interface PerkButtonProps {
  team: TeamData;
  used: boolean;
  visible: boolean;
  onActivate: () => void;
  onSkip: () => void;
}

export function PerkButton({ team, used, visible, onActivate, onSkip }: PerkButtonProps) {
  if (!visible || used || team.perk.timing !== 'standard') return null;

  return (
    <div className="rounded-lg border border-metal-light/20 bg-carbon-mid p-3">
      <div className="text-[10px] font-display uppercase tracking-wider text-metal-light mb-1">
        Team Perk Available
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-display text-xs font-semibold" style={{ color: team.color }}>
            {team.perk.name}
          </span>
          <p className="text-[9px] text-metal-light mt-0.5">{team.perk.description}</p>
        </div>
        <div className="flex gap-1.5 shrink-0 ml-3">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
          <Button variant="primary" size="sm" onClick={onActivate}>
            Activate
          </Button>
        </div>
      </div>
    </div>
  );
}
