import type { RivalRaceResult } from '@boxbox/engine';
import { getPositionColor } from '../../lib/constants';
import { useI18n } from '../../i18n';

interface RaceClassificationProps {
  classification: RivalRaceResult[];
  playerDriverId: string;
  teams: { id: string; color: string; name: string }[];
}

export function RaceClassification({ classification, playerDriverId, teams }: RaceClassificationProps) {
  const { t, getTeamName } = useI18n();
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
        {t('classification.title')}
      </div>
      <div className="space-y-1">
        {classification.map((entry) => {
          const team = teamMap.get(entry.teamId);
          const isPlayer = entry.driverId === playerDriverId;
          return (
            <div
              key={entry.driverId}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                isPlayer ? 'bg-f1-red/15 ring-1 ring-f1-red/30' : ''
              }`}
            >
              <span className={`w-6 font-mono font-bold ${getPositionColor(entry.position)}`}>
                P{entry.position}
              </span>
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: team?.color ?? '#666' }}
              />
              <span className={`font-mono font-semibold ${isPlayer ? 'text-white' : 'text-metal-light'}`}>
                {entry.abbreviation}
              </span>
              <span className="ml-auto font-mono text-metal-light">
                {entry.points > 0 ? `${entry.points}pts` : '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
