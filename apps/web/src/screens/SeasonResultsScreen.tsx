import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { Button } from '../components/shared/Button';
import { getPositionColor, calculateMedal, MEDAL_COLORS } from '../lib/constants';

export function SeasonResultsScreen() {
  const navigate = useNavigate();
  const catalog = useGameStore((s) => s.catalog);
  const seasonProgress = useGameStore((s) => s.seasonProgress);
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const resetAll = useGameStore((s) => s.resetAll);

  if (!catalog || !seasonProgress || seasonProgress.raceResults.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-metal-light text-xs">
        No season data available.
      </div>
    );
  }

  const { raceResults, cumulativeScore } = seasonProgress;
  const team = catalog.teams.find((t) => t.id === selectedTeamId);
  const medal = calculateMedal(cumulativeScore);

  const bestRace = raceResults.reduce((best, r) => (r.totalScore > best.totalScore ? r : best), raceResults[0]);
  const worstRace = raceResults.reduce((worst, r) => (r.totalScore < worst.totalScore ? r : worst), raceResults[0]);

  return (
    <div className="flex flex-col px-4 pt-6">
      <h1 className="font-display text-lg font-bold uppercase tracking-wider mb-1">Season Results</h1>
      {team && (
        <p className="text-[10px] mb-4" style={{ color: team.color }}>{team.name}</p>
      )}

      <div className="rounded-lg border border-metal-light/20 bg-carbon-mid p-6 text-center mb-4">
        <div className="font-display text-sm font-semibold uppercase tracking-wider text-metal-light">Final Score</div>
        <div className="font-display text-4xl font-black mt-1">{cumulativeScore}</div>
        <div className="text-xs text-metal-light mt-1">{raceResults.length} races completed</div>
        {medal && (
          <div className={`mt-2 font-display text-sm font-bold uppercase ${MEDAL_COLORS[medal]}`}>{medal} season</div>
        )}
      </div>

      <div className="rounded-lg border border-metal-light/20 bg-carbon-mid p-3 mb-4">
        <div className="text-[10px] font-display uppercase tracking-wider text-metal-light mb-2">Race Results</div>
        <div className="space-y-2">
          {raceResults.map((result, i) => {
            const sc = catalog.scenarios.find((s) => s.id === result.scenarioId);
            const isBest = result === bestRace;
            const isWorst = result === worstRace;
            return (
              <div
                key={i}
                className={`flex items-center justify-between rounded border p-2 text-xs
                  ${isBest ? 'border-hud-green/30 bg-hud-green/5' : isWorst ? 'border-hud-red/30 bg-hud-red/5' : 'border-metal-light/10 bg-carbon-mid/50'}`}
              >
                <div>
                  <div className="font-display text-[10px] font-semibold uppercase tracking-wider">{sc?.name}</div>
                  <div className="text-[9px] text-metal-light">
                    {isBest && 'Best race '}
                    {isWorst && 'Worst race '}
                    {result.objectivesCompleted.length}/{sc?.objectives.length ?? 0} objectives
                  </div>
                </div>
                <div className="text-right">
                  <div className={getPositionColor(result.finalPosition)}>P{result.finalPosition}</div>
                  <div className="font-mono font-bold">{result.totalScore} pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pb-4">
        <Button variant="ghost" size="md" className="flex-1" onClick={() => { resetAll(); navigate('/'); }}>
          Home
        </Button>
        <Button variant="primary" size="md" className="flex-1" onClick={() => { resetAll(); navigate('/season'); }}>
          New Season
        </Button>
      </div>
    </div>
  );
}
