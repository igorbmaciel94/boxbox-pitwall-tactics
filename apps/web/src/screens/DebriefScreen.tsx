import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { getPositionColor, calculateMedal, MEDAL_COLORS, EVENT_ICONS } from '../lib/constants';
import { Button } from '../components/shared/Button';

export function DebriefScreen() {
  const navigate = useNavigate();
  const lastDebrief = useGameStore((s) => s.lastDebrief);
  const catalog = useGameStore((s) => s.catalog);
  const mode = useGameStore((s) => s.mode);
  const advanceSeasonRace = useGameStore((s) => s.advanceSeasonRace);
  const resetRace = useGameStore((s) => s.resetRace);

  if (!lastDebrief || !catalog) {
    return (
      <div className="flex items-center justify-center h-64 text-metal-light text-xs">
        No race data available.
      </div>
    );
  }

  const scenario = catalog.scenarios.find((s) => s.id === lastDebrief.scenarioId);
  const team = catalog.teams.find((t) => t.id === lastDebrief.teamId);
  const medal = calculateMedal(lastDebrief.totalScore);

  const handleContinue = () => {
    if (mode === 'season') {
      advanceSeasonRace(lastDebrief);
      resetRace();
      navigate('/season');
    } else {
      resetRace();
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col px-4 pt-6">
      <h1 className="font-display text-lg font-bold uppercase tracking-wider mb-1">Race Debrief</h1>
      <p className="text-[10px] text-metal-light mb-4">
        {scenario?.name} — {scenario?.circuit}
      </p>

      {/* Position + Score hero */}
      <div className="rounded-lg border border-metal-light/20 bg-carbon-mid p-4 text-center mb-4">
        <div className={`font-display text-4xl font-black ${getPositionColor(lastDebrief.finalPosition)}`}>
          P{lastDebrief.finalPosition}
        </div>
        <div className="mt-2 font-mono text-2xl font-bold">{lastDebrief.totalScore} pts</div>
        {medal && (
          <div className={`mt-1 font-display text-sm font-bold uppercase ${MEDAL_COLORS[medal]}`}>
            {medal} medal
          </div>
        )}
        {team && (
          <div className="mt-1 text-[10px]" style={{ color: team.color }}>
            {team.name}
          </div>
        )}
      </div>

      {/* Score breakdown */}
      <div className="rounded-lg border border-metal-light/20 bg-carbon-mid p-3 mb-4">
        <div className="text-[10px] font-display uppercase tracking-wider text-metal-light mb-2">
          Score Breakdown
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-metal-light">Position (P{lastDebrief.finalPosition})</span>
            <span>{lastDebrief.positionScore} pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-metal-light">Objectives</span>
            <span>{lastDebrief.objectivePoints} pts</span>
          </div>
          {lastDebrief.styleBonus > 0 && (
            <div className="flex justify-between">
              <span className="text-metal-light">Style Bonus</span>
              <span className="text-hud-amber">+{lastDebrief.styleBonus} pts</span>
            </div>
          )}
          <div className="border-t border-metal-light/20 pt-1.5 flex justify-between font-bold">
            <span>Total</span>
            <span>{lastDebrief.totalScore} pts</span>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="rounded-lg border border-metal-light/20 bg-carbon-mid p-3 mb-4">
        <div className="text-[10px] font-display uppercase tracking-wider text-metal-light mb-2">
          Objectives
        </div>
        <div className="space-y-1.5">
          {scenario?.objectives.map((obj) => {
            const completed = lastDebrief.objectivesCompleted.some((o) => o.id === obj.id);
            return (
              <div key={obj.id} className="flex items-center gap-2 text-xs">
                <span className={completed ? 'text-hud-green' : 'text-hud-red'}>
                  {completed ? '[x]' : '[ ]'}
                </span>
                <span className={completed ? 'text-white' : 'text-metal-light'}>
                  {obj.description}
                </span>
                <span className="text-metal-light ml-auto">{obj.points}pts</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Turn timeline */}
      <div className="rounded-lg border border-metal-light/20 bg-carbon-mid p-3 mb-4">
        <div className="text-[10px] font-display uppercase tracking-wider text-metal-light mb-2">
          Lap Summary
        </div>
        <div className="space-y-2">
          {lastDebrief.turnLog.map((turn) => {
            const actionCard = catalog.cards.find((c) => c.id === turn.actionCard);
            const qdCard = turn.quickDecisionCard ? catalog.cards.find((c) => c.id === turn.quickDecisionCard) : null;
            return (
              <div key={turn.turn} className="flex items-start gap-2 text-[10px]">
                <span className="shrink-0 w-8 font-display font-semibold text-metal-light">
                  L{turn.turn}
                </span>
                <div className="flex-1">
                  <span className="text-metal-light">
                    {EVENT_ICONS[turn.event.type] ?? '?'} {turn.event.name}
                  </span>
                  {qdCard && (
                    <span className="text-hud-yellow ml-2">QD: {qdCard.name}</span>
                  )}
                  <span className="text-hud-blue ml-2">{actionCard?.name ?? turn.actionCard}</span>
                  {turn.perkActivated && <span className="text-hud-green ml-2">Perk!</span>}
                </div>
                <span className="shrink-0 text-metal-light">
                  P{turn.stateSnapshot.position}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pb-4">
        <Button variant="ghost" size="md" className="flex-1" onClick={() => { resetRace(); navigate('/'); }}>
          Home
        </Button>
        <Button variant="primary" size="md" className="flex-1" onClick={handleContinue}>
          {mode === 'season' ? 'Continue Season' : 'Done'}
        </Button>
      </div>
    </div>
  );
}
