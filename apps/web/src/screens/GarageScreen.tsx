import { useState } from 'react';
import { useGameStore } from '../stores/game-store';
import { calculateMedal, MEDAL_COLORS, getPositionColor } from '../lib/constants';

type Tab = 'history' | 'best';

export function GarageScreen() {
  const [tab, setTab] = useState<Tab>('history');
  const runHistory = useGameStore((s) => s.runHistory);
  const bestScores = useGameStore((s) => s.bestScores);
  const catalog = useGameStore((s) => s.catalog);

  return (
    <div className="flex flex-col px-4 pt-6">
      <h1 className="font-display text-lg font-bold uppercase tracking-wider mb-4">Garage</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(['history', 'best'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded py-2 font-display text-[10px] font-semibold uppercase tracking-wider transition-colors
              ${tab === t ? 'bg-hud-blue text-white' : 'bg-metal/30 text-metal-light hover:bg-metal/50'}`}
          >
            {t === 'history' ? 'Run History' : 'Best Scores'}
          </button>
        ))}
      </div>

      {tab === 'history' && (
        <div className="flex flex-col gap-2">
          {runHistory.length === 0 ? (
            <p className="text-center text-xs text-metal-light py-8">
              No races completed yet. Start racing to see your history here.
            </p>
          ) : (
            runHistory.map((entry, i) => {
              const scenario = catalog?.scenarios.find((s) => s.id === entry.scenarioId);
              const team = catalog?.teams.find((t) => t.id === entry.teamId);
              return (
                <div
                  key={i}
                  className="rounded-lg border border-metal-light/20 bg-carbon-mid p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-xs font-semibold uppercase tracking-wider">
                      {scenario?.name ?? entry.scenarioId}
                    </span>
                    <span className="text-[10px] text-metal-light">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className={getPositionColor(entry.debrief.finalPosition)}>
                      P{entry.debrief.finalPosition}
                    </span>
                    <span className="text-metal-light">Score: {entry.debrief.totalScore}</span>
                    {team && (
                      <span style={{ color: team.color }}>{team.name}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'best' && (
        <div className="flex flex-col gap-2">
          {catalog?.scenarios.map((scenario) => {
            const best = bestScores.find((s) => s.scenarioId === scenario.id);
            const medal = best ? calculateMedal(best.score) : null;
            return (
              <div
                key={scenario.id}
                className="rounded-lg border border-metal-light/20 bg-carbon-mid p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-xs font-semibold uppercase tracking-wider">
                      {scenario.name}
                    </div>
                    <div className="text-[9px] text-metal-light">{scenario.circuit}</div>
                  </div>
                  {best ? (
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">{best.score}</div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] ${getPositionColor(best.position)}`}>
                          P{best.position}
                        </span>
                        {medal && (
                          <span className={`font-display text-[10px] font-bold uppercase ${MEDAL_COLORS[medal]}`}>
                            {medal}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-metal-light">No runs</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
