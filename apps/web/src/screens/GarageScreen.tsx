import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { calculateMedal, MEDAL_COLORS, getPositionColor } from '../lib/constants';
import { useI18n } from '../i18n';

type Tab = 'history' | 'best' | 'trophies';

const ITEMS_PER_PAGE = 6;

function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 py-3">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-metal-light transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
      >
        &larr;
      </button>
      <span className="font-mono text-xs text-metal-light">
        {page + 1} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages - 1}
        className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-metal-light transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
      >
        &rarr;
      </button>
    </div>
  );
}

export function GarageScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('history');
  const [historyPage, setHistoryPage] = useState(0);
  const [trophyPage, setTrophyPage] = useState(0);
  const { t, getScenarioName, getScenarioCircuit, getTeamName, getMedalLabel } = useI18n();
  const runHistory = useGameStore((s) => s.runHistory);
  const bestScores = useGameStore((s) => s.bestScores);
  const trophies = useGameStore((s) => s.trophies);
  const catalog = useGameStore((s) => s.catalog);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setHistoryPage(0);
    setTrophyPage(0);
  };

  const historyTotalPages = Math.ceil(runHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = runHistory.slice(
    historyPage * ITEMS_PER_PAGE,
    (historyPage + 1) * ITEMS_PER_PAGE,
  );

  const trophyTotalPages = Math.ceil(trophies.length / ITEMS_PER_PAGE);
  const paginatedTrophies = trophies.slice(
    trophyPage * ITEMS_PER_PAGE,
    (trophyPage + 1) * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex flex-col px-5 pt-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
      >
        &larr; {t('common.back')}
      </button>
      <h1 className="mb-5 font-display text-2xl font-bold uppercase tracking-wide">{t('garage.title')}</h1>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5">
        {(['history', 'best', 'trophies'] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => handleTabChange(tabKey)}
            className={`flex-1 rounded-full py-2 text-xs font-medium uppercase tracking-wider transition-colors
              ${
                tab === tabKey
                  ? 'bg-f1-red text-white'
                  : 'bg-white/5 text-metal-light hover:bg-white/10 hover:text-white'
              }`}
          >
            {tabKey === 'history' ? t('garage.runHistory') : tabKey === 'best' ? t('garage.bestScores') : t('garage.trophies')}
          </button>
        ))}
      </div>

      {tab === 'history' && (
        <div className="flex flex-col gap-2">
          {runHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-metal-light">
              {t('garage.noHistory')}
            </p>
          ) : (
            <>
              {paginatedHistory.map((entry, i) => {
                const scenario = catalog?.scenarios.find((s) => s.id === entry.scenarioId);
                const team = catalog?.teams.find((t) => t.id === entry.teamId);
                return (
                  <div
                    key={historyPage * ITEMS_PER_PAGE + i}
                    className="rounded-2xl bg-white/[0.04] p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display text-sm font-semibold uppercase tracking-wide">
                        {scenario ? getScenarioName(scenario.id, scenario.name) : entry.scenarioId}
                      </span>
                      <span className="text-xs text-metal-light">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={getPositionColor(entry.debrief.finalPosition)}>
                        P{entry.debrief.finalPosition}
                      </span>
                      <span className="text-metal-light">{t('garage.scorePrefix')}: {entry.debrief.totalScore}</span>
                      {team && (
                        <span style={{ color: team.color }}>{getTeamName(team.id, team.name)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <PaginationControls
                page={historyPage}
                totalPages={historyTotalPages}
                onPrev={() => setHistoryPage((p) => Math.max(0, p - 1))}
                onNext={() => setHistoryPage((p) => Math.min(historyTotalPages - 1, p + 1))}
              />
            </>
          )}
        </div>
      )}

      {tab === 'best' && (
        <div className="flex flex-col gap-2">
          {catalog?.scenarios.map((scenario) => {
            const best = bestScores.find((s) => s.scenarioId === scenario.id);
            const medal = best ? calculateMedal(best.position) : null;
            return (
              <div
                key={scenario.id}
                className="rounded-2xl bg-white/[0.04] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-xs font-semibold uppercase tracking-wider">
                      {getScenarioName(scenario.id, scenario.name)}
                    </div>
                    <div className="text-xs text-metal-light">{getScenarioCircuit(scenario.id, scenario.circuit)}</div>
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
                            {getMedalLabel(medal, medal)}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-metal-light">{t('garage.noRuns')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'trophies' && (
        <div className="flex flex-col gap-2">
          {trophies.length === 0 ? (
            <p className="py-8 text-center text-sm text-metal-light">
              {t('garage.noTrophies')}
            </p>
          ) : (
            <>
              {paginatedTrophies.map((trophy, i) => {
                const team = catalog?.teams.find((t) => t.id === trophy.teamId);
                const goalCard = catalog?.goalCards.find((g) => g.id === trophy.goalCardId);
                return (
                  <div
                    key={trophyPage * ITEMS_PER_PAGE + i}
                    className={`rounded-2xl p-4 ${
                      trophy.goalAchieved
                        ? 'bg-hud-green/8 border border-hud-green/20'
                        : 'bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {team && (
                          <div
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                        )}
                        <span className="font-display text-sm font-semibold uppercase tracking-wide">
                          {goalCard?.title ?? trophy.goalCardId}
                        </span>
                      </div>
                      <span className="text-xs text-metal-light">
                        {new Date(trophy.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={getPositionColor(trophy.championshipPosition)}>
                        P{trophy.championshipPosition}
                      </span>
                      <span className="text-metal-light">{trophy.finalScore} {t('common.scorePts')}</span>
                      {team && (
                        <span style={{ color: team.color }}>{getTeamName(team.id, team.name)}</span>
                      )}
                      <span className={`ml-auto font-display text-[10px] font-bold uppercase ${
                        trophy.goalAchieved ? 'text-hud-green' : 'text-hud-red'
                      }`}>
                        {trophy.goalAchieved ? t('garage.goalAchieved') : t('garage.goalFailed')}
                      </span>
                    </div>
                  </div>
                );
              })}
              <PaginationControls
                page={trophyPage}
                totalPages={trophyTotalPages}
                onPrev={() => setTrophyPage((p) => Math.max(0, p - 1))}
                onNext={() => setTrophyPage((p) => Math.min(trophyTotalPages - 1, p + 1))}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
