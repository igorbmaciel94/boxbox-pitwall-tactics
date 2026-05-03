import type { DriverStanding } from '@apex/engine';
import { getPositionColor } from '../../lib/constants';
import { useI18n } from '../../i18n';

interface ChampionshipStandingsProps {
  standings: DriverStanding[];
  playerDriverId: string;
  teams: { id: string; color: string; name: string }[];
}

export function ChampionshipStandings({ standings, playerDriverId, teams }: ChampionshipStandingsProps) {
  const { t } = useI18n();
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
        {t('standings.title')}
      </div>
      <div className="space-y-1">
        {standings.map((standing, index) => {
          const team = teamMap.get(standing.teamId);
          const isPlayer = standing.driverId === playerDriverId;
          const championshipPos = index + 1;
          return (
            <div
              key={standing.driverId}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                isPlayer ? 'bg-apex-red/15 ring-1 ring-apex-red/30' : ''
              }`}
            >
              <span className={`w-6 font-mono font-bold ${getPositionColor(championshipPos)}`}>
                {championshipPos}.
              </span>
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: team?.color ?? '#666' }}
              />
              <span className={`font-mono font-semibold ${isPlayer ? 'text-white' : 'text-metal-light'}`}>
                {standing.abbreviation}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] text-metal-light">
                  {standing.racePositions.map((p) => `P${p}`).join(' ')}
                </span>
                <span className="font-mono font-bold w-8 text-right">
                  {standing.totalPoints}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
