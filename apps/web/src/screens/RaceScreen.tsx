import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { useUIStore } from '../stores/ui-store';
import { useTurnStepper } from '../hooks/use-turn-stepper';
import { useRadioMessage } from '../hooks/use-radio-message';
import { HUD } from '../components/race/HUD';
import { ScenarioStrip } from '../components/race/ScenarioStrip';
import { EventCard } from '../components/race/EventCard';
import { HandDisplay } from '../components/race/HandDisplay';
import { PerkButton } from '../components/race/PerkButton';
import { TrackMap } from '../components/race/TrackMap';
import type { RivalDot } from '../components/race/TrackMap';
import { TimingTower, buildTimingEntries } from '../components/race/TimingTower';
import { CompoundSelector } from '../components/race/CompoundSelector';
import { PreRaceTireSetup } from '../components/race/PreRaceTireSetup';
import { Button } from '../components/shared/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { useAudio } from '../hooks/use-audio';
import { getCircuitImageUrl, getCircuitFallbackGradient } from '../lib/images';
import { handHasPitCard } from '@boxbox/engine';
import type { CardId, TireAllocation, TireCompound } from '@boxbox/engine';
import { useI18n } from '../i18n';

function hashCombine(a: number, b: number): number {
  let h = (a ^ (b * 0x9e3779b9 + 0x6d2b79f5)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return h >>> 0;
}

export function RaceScreen() {
  const navigate = useNavigate();
  const { t, getScenarioName, getScenarioCircuit, getObjectiveDescription } = useI18n();
  const catalog = useGameStore((s) => s.catalog);
  const raceState = useGameStore((s) => s.raceState);
  const scenario = useGameStore((s) => s.scenario);
  const team = useGameStore((s) => s.team);
  const turnPhaseUI = useGameStore((s) => s.turnPhaseUI);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const previousPosition = useGameStore((s) => s.previousPosition);
  const mode = useGameStore((s) => s.mode);
  const startRace = useGameStore((s) => s.startRace);
  const clearRadioMessages = useUIStore((s) => s.clearRadioMessages);

  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const currentDeck = useGameStore((s) => s.currentDeck);

  const stepper = useTurnStepper();
  const { sendRadio, sendEventRadio } = useRadioMessage();
  const audio = useAudio();

  const difficulty = useGameStore((s) => s.difficulty);
  const seasonProgress = useGameStore((s) => s.seasonProgress);
  const deductTireBank = useGameStore((s) => s.deductTireBank);

  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);
  const [scWarningShown, setScWarningShown] = useState(false);
  const [scenarioSelectMode, setScenarioSelectMode] = useState(false);
  const [pendingScenarioId, setPendingScenarioId] = useState<string | null>(null);
  const [pendingRaceSeed, setPendingRaceSeed] = useState<number | undefined>(undefined);
  const [muted, setMuted] = useState(() => audio.isMuted());
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showTimingTower, setShowTimingTower] = useState(false);
  const frozenTimingEntries = useRef<{ position: number; abbreviation: string; teamColor: string; gap: string; isPlayer: boolean }[]>([]);

  const hasTeamAndDeck = !!selectedTeamId && currentDeck.length === 9;

  // Generate rival dots from actual driver data — positions shuffle each turn
  // Must be above early returns to satisfy Rules of Hooks
  const rivalDots: RivalDot[] = useMemo(() => {
    if (!catalog || !team || !raceState) return [];

    const playerDriverId = seasonProgress?.playerDriverId
      ?? catalog.drivers.find((d) => d.teamId === team.id)?.id
      ?? '';
    const teamColorMap = new Map(catalog.teams.map((t) => [t.id, t.color]));

    const rivals = catalog.drivers
      .filter((d) => d.id !== playerDriverId)
      .map((d) => ({
        color: teamColorMap.get(d.teamId) ?? '#666',
        abbreviation: d.abbreviation,
        strength: d.strength,
      }));

    // Deterministic shuffle with strength-based ordering + variance
    const turnSeed = (raceState.seed ?? 42) + raceState.currentTurn * 7919;
    let h = turnSeed >>> 0;
    const withScore = rivals.map((r) => {
      h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
      const variance = (h % 30) - 15;
      return { ...r, score: r.strength + variance };
    });
    withScore.sort((a, b) => b.score - a.score);

    // Assign positions 1..18, skip player position
    const dots: RivalDot[] = [];
    let rivalIdx = 0;
    for (let pos = 1; pos <= 18; pos++) {
      if (pos === raceState.position) continue;
      if (rivalIdx < withScore.length) {
        dots.push({
          position: pos,
          color: withScore[rivalIdx].color,
          abbreviation: withScore[rivalIdx].abbreviation,
          strength: withScore[rivalIdx].strength,
        });
        rivalIdx++;
      }
    }
    return dots;
  }, [catalog, team, raceState?.position, raceState?.currentTurn, raceState?.seed, seasonProgress?.playerDriverId]);

  // Build timing tower entries from rival data + player (shown at turn summary)
  const timingEntries = useMemo(() => {
    if (!catalog || !team || !raceState || rivalDots.length === 0) return [];

    const playerDriverId = seasonProgress?.playerDriverId
      ?? catalog.drivers.find((d) => d.teamId === team.id)?.id ?? '';
    const playerDriver = catalog.drivers.find((d) => d.id === playerDriverId);

    const rivals = rivalDots.map((r) => ({
      position: r.position,
      abbreviation: r.abbreviation ?? '???',
      color: r.color,
      strength: r.strength ?? 70,
    }));

    const player = {
      position: raceState.position,
      abbreviation: playerDriver?.abbreviation ?? 'YOU',
      color: team.color,
      strength: playerDriver?.strength ?? 80,
    };

    return buildTimingEntries(rivals, player, raceState.seed ?? 42, raceState.currentTurn);
  }, [rivalDots, raceState, team, catalog, seasonProgress?.playerDriverId]);

  // On mount: scroll to top and reset stale race state if needed
  useEffect(() => {
    window.scrollTo(0, 0);
    if (mode !== 'season' && raceState && turnPhaseUI !== 'idle') {
      // Stale race from a previous session — reset to show circuit selection
      useGameStore.getState().resetRace();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!raceState && catalog) {
      if (mode === 'season' && seasonProgress) {
        // In season mode, auto-set the current race as pending for tire setup
        const currentScenarioId = seasonProgress.raceOrder[seasonProgress.currentRaceIndex];
        const raceSeed = hashCombine(seasonProgress.seed, seasonProgress.currentRaceIndex);
        setPendingScenarioId(currentScenarioId);
        setPendingRaceSeed(raceSeed);
      } else if (mode !== 'season') {
        setScenarioSelectMode(true);
      }
    }
  }, [raceState, catalog, mode, seasonProgress]);

  useEffect(() => {
    if (!raceState || !catalog || !scenario || !team) return;

    let timer: ReturnType<typeof setTimeout>;

    switch (turnPhaseUI) {
      case 'refill-hand':
        if (!raceState.mulliganUsed) {
          timer = setTimeout(() => useGameStore.getState().setTurnPhaseUI('await-mulligan'), 400);
        } else {
          timer = setTimeout(() => stepper.advanceToRevealEvent(), 400);
        }
        break;
      case 'await-mulligan':
        // Wait for user input
        break;
      case 'reveal-event':
        if (currentEvent) {
          sendEventRadio(currentEvent.type);
        }
        timer = setTimeout(() => stepper.advanceToPerkOrAction(), 800);
        break;
      case 'await-compound':
        audio.playPitStop();
        // Wait for user input
        break;
      case 'resolving':
        timer = setTimeout(() => stepper.advanceToResult(), 500);
        break;
      case 'turn-summary':
        // Show timing tower overlay (async — doesn't block game)
        frozenTimingEntries.current = timingEntries;
        setShowTimingTower(true);
        setSelectedHandIndex(null);
        stepper.startNextTurn();
        break;
      case 'race-complete':
        sendRadio('generic');
        break;
    }

    return () => clearTimeout(timer);
  }, [turnPhaseUI]);

  // Auto-hide timing tower after 3 seconds (independent of turn phase)
  useEffect(() => {
    if (!showTimingTower) return;
    const t = setTimeout(() => setShowTimingTower(false), 3000);
    return () => clearTimeout(t);
  }, [showTimingTower]);

  const handleStartScenario = useCallback(
    (scenarioId: string, raceSeed?: number) => {
      setPendingScenarioId(scenarioId);
      setPendingRaceSeed(raceSeed);
      setScenarioSelectMode(false);
    },
    [],
  );

  const handleTireSetupConfirm = useCallback(
    (allocation: TireAllocation, startingCompound: TireCompound) => {
      if (!pendingScenarioId) return;
      // Deduct from season tire bank if in championship
      if (mode === 'season') {
        deductTireBank(allocation);
      }
      clearRadioMessages();
      startRace(pendingScenarioId, pendingRaceSeed, startingCompound, allocation);
      setPendingScenarioId(null);
      setPendingRaceSeed(undefined);
    },
    [pendingScenarioId, pendingRaceSeed, mode, startRace, clearRadioMessages, deductTireBank],
  );

  // Scenario selection view
  if (scenarioSelectMode && catalog) {
    if (!hasTeamAndDeck) {
      return (
        <div className="flex h-64 flex-col items-center justify-center px-5 text-center">
          <div className="mb-2 font-display text-base font-bold uppercase tracking-wide text-metal-light">
            {t('race.notReady')}
          </div>
          <p className="mb-4 text-sm text-metal-light">
            {!selectedTeamId ? t('race.selectTeam') : t('race.buildDeck')} {t('race.beforeRacing')}
          </p>
          <Button variant="primary" size="md" onClick={() => navigate(!selectedTeamId ? '/team' : '/decks')}>
            {!selectedTeamId ? t('race.selectTeam') : t('race.buildDeck')}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col px-5 pt-6">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
        >
          &larr; {t('common.back')}
        </button>
        <h1 className="mb-1 font-display text-2xl font-bold uppercase tracking-wide">{t('race.selectCircuit')}</h1>
        <p className="mb-5 text-sm text-metal-light">{t('race.chooseCircuit')}</p>
        <div className="flex flex-col gap-3">
          {catalog.scenarios.map((sc) => (
            <CircuitCard
              key={sc.id}
              scenario={sc}
              onSelect={() => handleStartScenario(sc.id)}
              getScenarioName={getScenarioName}
              getScenarioCircuit={getScenarioCircuit}
              getObjectiveDescription={getObjectiveDescription}
              t={t}
            />
          ))}
        </div>
      </div>
    );
  }

  // Pre-race tire setup (after circuit selection, before race starts)
  if (pendingScenarioId && !raceState && catalog) {
    const pendingScenario = catalog.scenarios.find((s) => s.id === pendingScenarioId);
    return (
      <div className="flex flex-col px-5 pt-6">
        <button
          onClick={() => {
            setPendingScenarioId(null);
            if (mode !== 'season') {
              setScenarioSelectMode(true);
            } else {
              navigate('/');
            }
          }}
          className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
        >
          &larr; {t('common.back')}
        </button>
        {pendingScenario && (
          <div className="mb-4">
            <h1 className="mb-1 font-display text-xl font-bold uppercase tracking-wide">
              {getScenarioName(pendingScenario.id, pendingScenario.name)}
            </h1>
            <p className="text-sm text-metal-light">
              {getScenarioCircuit(pendingScenario.id, pendingScenario.circuit)}
            </p>
          </div>
        )}
        <PreRaceTireSetup
          onConfirm={handleTireSetupConfirm}
          seasonTireBank={mode === 'season' ? seasonProgress?.tireBank ?? null : null}
          hideDifficulty={mode === 'season'}
        />
      </div>
    );
  }

  if (!raceState || !scenario || !team || !catalog) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-metal-light">
        {t('race.loadingRace')}
      </div>
    );
  }

  const isSC = currentEvent?.type === 'safety-car';
  const isRain = currentEvent?.type === 'rain';

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      {isSC && turnPhaseUI !== 'idle' && (
        <div className="pointer-events-none fixed inset-0 z-30 bg-hud-yellow/8 animate-sc-pulse" />
      )}
      {isRain && turnPhaseUI !== 'idle' && (
        <div className="pointer-events-none fixed inset-0 z-30 bg-hud-cyan/5 animate-rain-flash" />
      )}

      <ScenarioStrip
        scenario={scenario}
        turn={raceState.currentTurn}
        onQuit={() => setShowQuitConfirm(true)}
        onToggleMute={() => setMuted(audio.toggleMute())}
        isMuted={muted}
      />

      {/* Fixed-height wrapper so timing tower and mini-map occupy the same space */}
      <div className="relative px-3 py-1" style={{ minHeight: '9.5rem' }}>
        {showTimingTower && frozenTimingEntries.current.length > 0 ? (
          <div className="mx-auto flex h-full w-full max-w-sm flex-col items-center justify-center animate-fade-in">
            <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-wide text-metal-light">
              {t('race.lapComplete', { lap: Math.max(1, raceState.currentTurn - 1) })}
            </div>
            <div className="flex w-full justify-center">
              <TimingTower entries={frozenTimingEntries.current} />
            </div>
          </div>
        ) : (
          <TrackMap
            position={raceState.position}
            totalPositions={18}
            teamColor={team.color}
            circuitId={scenario.id}
            tireCompound={raceState.tireCompound}
            rivals={rivalDots}
          />
        )}
      </div>

      {/* Mulligan bottom sheet overlay — no backdrop so timing tower / mini-map stays visible */}
      {turnPhaseUI === 'await-mulligan' && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center animate-fade-in">
          <div className="w-full max-w-lg rounded-t-3xl bg-carbon px-5 pb-6 pt-4 shadow-2xl animate-slide-up">
            <div className="mb-3 text-center text-xs font-display uppercase tracking-wider text-metal-light">
              {t('race.yourHand')}
            </div>
            <HandDisplay
              hand={raceState.hand}
              catalog={catalog}
              selectedCard={null}
              onSelect={() => {}}
            />
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => {
                  stepper.submitMulligan();
                  stepper.advanceToRevealEvent();
                }}
              >
                {t('race.mulligan')}
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => stepper.advanceToRevealEvent()}
              >
                {t('race.keepHand')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-2 ${
        (turnPhaseUI === 'await-action-card' && selectedHandIndex !== null) ? 'pb-20' : 'pb-4'
      }`}>
        <HUD state={raceState} previousPosition={previousPosition} />

        {currentEvent && turnPhaseUI !== 'idle' && (
          <EventCard event={currentEvent} animated={turnPhaseUI === 'reveal-event'} />
        )}

        <PerkButton
          team={team}
          used={raceState.perkUsed}
          visible={turnPhaseUI === 'await-perk'}
          onActivate={() => stepper.submitPerkChoice(true)}
          onSkip={() => stepper.submitPerkChoice(false)}
        />

        {turnPhaseUI === 'await-action-card' && (() => {
          const needsPit = !raceState.hasPitted && raceState.currentTurn >= raceState.totalTurns - 2 && raceState.currentTurn > 0;
          const hasPit = handHasPitCard(raceState.hand, catalog);
          const canEmergencyMulligan = needsPit && !hasPit && !raceState.emergencyMulliganUsed;
          const canSkipTurn = needsPit && !hasPit && raceState.emergencyMulliganUsed;
          const showSkipAlways = raceState.underSafetyCar || raceState.position === 1;

          // SC overtake warning: selected card gains positions (posChange < 0) and is not a pit card
          const selectedCardId = selectedHandIndex !== null ? raceState.hand[selectedHandIndex] : null;
          const selectedCardData = selectedCardId ? catalog.cards.find((c) => c.id === selectedCardId) : null;
          const isScOvertakeCard = raceState.underSafetyCar && selectedCardData
            && (selectedCardData.effect.position ?? 0) < 0
            && !selectedCardData.tags.includes('pit');
          // Show SC warning based on difficulty: easy=always, normal=once per race, hard=never
          const showScWarning = isScOvertakeCard && (
            difficulty === 'easy' || (difficulty === 'normal' && !scWarningShown)
          );

          return (
            <>
              {/* Warning: no pit card when pit mandatory */}
              {needsPit && !hasPit && (
                <div className="rounded-lg bg-hud-red/10 border border-hud-red/30 px-3 py-1.5 text-center text-[11px] text-hud-red animate-fade-in">
                  {t('race.noPitCardWarning')}
                </div>
              )}
              <HandDisplay
                hand={raceState.hand}
                catalog={catalog}
                selectedIndex={selectedHandIndex}
                onSelectIndex={(index) =>
                  setSelectedHandIndex((prev) => (prev === index ? null : index))
                }
              />
              {/* Fixed bottom buttons */}
              <div className={`fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-carbon via-carbon/95 to-transparent px-5 pb-4 pt-3 ${selectedHandIndex !== null || canEmergencyMulligan || canSkipTurn || showSkipAlways ? 'animate-slide-up' : 'hidden'}`}>
                {/* Skip / Emergency mulligan — always visible when available */}
                {(canEmergencyMulligan || canSkipTurn || showSkipAlways) && (
                  <div className="flex gap-2 mb-2">
                    {canEmergencyMulligan && (
                      <Button
                        variant="secondary"
                        size="md"
                        className="flex-1"
                        onClick={() => {
                          stepper.submitEmergencyMulligan();
                          setSelectedHandIndex(null);
                        }}
                      >
                        {t('race.emergencyMulligan')}
                      </Button>
                    )}
                    {(canSkipTurn || showSkipAlways) && (
                      <Button
                        variant="secondary"
                        size="md"
                        className="flex-1"
                        onClick={() => {
                          stepper.submitSkipTurn();
                          setSelectedHandIndex(null);
                        }}
                      >
                        {t('race.skipTurn')}
                      </Button>
                    )}
                  </div>
                )}
                {selectedHandIndex !== null && (() => {
                  const posChange = selectedCardData?.effect.position ?? 0;
                  const atP1 = raceState.position === 1 && posChange < 0;
                  const atPLast = raceState.position >= 18 && posChange > 0;
                  return (
                  <>
                    {/* Position boundary hint — same style as SC warning */}
                    {atP1 && (
                      <div className="mb-3 rounded-xl border-2 border-hud-cyan bg-hud-cyan/20 px-4 py-3 text-center animate-fade-in">
                        <div className="font-display text-base font-bold uppercase tracking-wide text-hud-cyan">
                          {t('race.p1NoOvertake')}
                        </div>
                      </div>
                    )}
                    {atPLast && !atP1 && (
                      <div className="mb-3 rounded-xl border-2 border-metal-light bg-metal-light/15 px-4 py-3 text-center animate-fade-in">
                        <div className="font-display text-base font-bold uppercase tracking-wide text-metal-light">
                          {t('race.pLastNoLose')}
                        </div>
                      </div>
                    )}
                    {/* SC overtake warning — visible on easy (always) and normal (once) */}
                    {showScWarning && (
                      <div className="mb-3 rounded-xl border-2 border-hud-yellow bg-hud-yellow/20 px-4 py-3 text-center animate-fade-in">
                        <div className="font-display text-base font-bold uppercase tracking-wide text-hud-yellow">
                          {t('race.scOvertakeWarning')}
                        </div>
                      </div>
                    )}
                    <Button
                      variant={isScOvertakeCard ? 'secondary' : 'primary'}
                      size="md"
                      className="w-full"
                      onClick={() => {
                        const cardId = raceState.hand[selectedHandIndex];
                        if (cardId) {
                          if (isScOvertakeCard && !scWarningShown) {
                            setScWarningShown(true);
                          }
                          sendRadio('generic');
                          stepper.submitActionCard(cardId);
                          setSelectedHandIndex(null);
                        }
                      }}
                    >
                      {isScOvertakeCard ? t('race.scPlayAnyway') : t('race.playCard')}
                    </Button>
                  </>
                  );
                })()}
              </div>
            </>
          );
        })()}

        {/* Tire compound selection — bottom sheet modal */}
        {turnPhaseUI === 'await-compound' && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 animate-fade-in">
            <div className="w-full max-w-lg rounded-t-3xl bg-carbon px-5 pb-6 pt-4 animate-slide-up">
              <CompoundSelector
                raceState={raceState}
                onSelect={(compound) => stepper.submitCompoundChoice(compound)}
              />
            </div>
          </div>
        )}

        {turnPhaseUI === 'idle' && raceState.currentTurn === 0 && (
          <div className="animate-panel-pop space-y-3 rounded-2xl bg-white/[0.04] py-6 text-center">
            <div className="font-display text-xl font-bold uppercase tracking-wide">
              {t('race.lightsOut')}
            </div>
            <p className="text-sm text-metal-light">
              {t('race.startingInfo', { position: raceState.position, laps: scenario.turns })}
            </p>
            <Button variant="primary" size="lg" className="w-full" onClick={() => stepper.startNextTurn()}>
              {t('race.startRace')}
            </Button>
          </div>
        )}

        {turnPhaseUI === 'race-complete' && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 animate-fade-in">
            <div className="w-full max-w-lg rounded-t-3xl bg-carbon px-5 pb-6 pt-5 animate-slide-up text-center space-y-3">
              {raceState.isDNF ? (
                <>
                  <div className="font-display text-2xl font-black uppercase tracking-wide text-hud-red">
                    {t('race.dnfTitle')}
                  </div>
                  <p className="text-sm text-metal-light">{t('race.dnfMessage')}</p>
                </>
              ) : (
                <>
                  <div className="font-display text-xl font-black uppercase tracking-wide">
                    {t('race.chequeredFlag')}
                  </div>
                  <div className="font-display text-4xl font-black text-hud-green">
                    P{raceState.position}
                  </div>
                </>
              )}
              <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/debrief')}>
                {t('race.viewDebrief')}
              </Button>
            </div>
          </div>
        )}

      </div>

      <ConfirmDialog
        open={showQuitConfirm}
        title={t('race.abandon')}
        message={t('race.abandonConfirm')}
        confirmLabel={t('race.abandon')}
        cancelLabel={t('race.abandonCancel')}
        variant="danger"
        onCancel={() => setShowQuitConfirm(false)}
        onConfirm={() => {
          setShowQuitConfirm(false);
          useGameStore.getState().resetRace();
          navigate('/');
        }}
      />
    </div>
  );
}

function CircuitCard({
  scenario,
  onSelect,
  getScenarioName,
  getScenarioCircuit,
  getObjectiveDescription,
  t,
}: {
  scenario: {
    id: string;
    name: string;
    circuit: string;
    params: { startingPosition: number; baseTireWear: number };
    turns: number;
    objectives: { id: string; type: string; description: string; points: number }[];
    traits?: string[];
  };
  onSelect: () => void;
  getScenarioName: (id: string, fallback?: string) => string;
  getScenarioCircuit: (id: string, fallback?: string) => string;
  getObjectiveDescription: (id: string, fallback?: string) => string;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      onClick={onSelect}
      className="animate-glow-in relative overflow-hidden rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.98]"
    >
      {/* Circuit background */}
      <div className="relative h-28 w-full overflow-hidden">
        {!imgFailed ? (
          <img
            src={getCircuitImageUrl(scenario.id)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: getCircuitFallbackGradient(scenario.id) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <div className="font-display text-lg font-bold uppercase tracking-wide drop-shadow-lg">{getScenarioName(scenario.id, scenario.name)}</div>
          <div className="text-sm text-metal-light drop-shadow">{getScenarioCircuit(scenario.id, scenario.circuit)}</div>
        </div>
      </div>

      {/* Info section */}
      <div className="bg-white/[0.04] p-3.5">
        <div className="flex flex-wrap gap-3 text-xs text-metal-light">
          <span>{t('race.start')} P{scenario.params.startingPosition}</span>
          <span>{t('race.wear')} {scenario.params.baseTireWear}</span>
          <span>{scenario.turns} {t('race.laps')}</span>
        </div>
        {scenario.traits && scenario.traits.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {scenario.traits.map((trait) => (
              <span key={trait} className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/60">
                {t(`traits.${trait}`)}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 text-[11px]">
          {scenario.objectives.map((obj) => (
            <span key={obj.id} className="mr-3 inline-block">
              <span className={obj.type === 'main' ? 'text-hud-amber' : 'text-metal-light'}>{obj.type === 'main' ? '\u{1F3C6}' : '\u{2B50}'}</span>{' '}
              <span className="text-white/60">{getObjectiveDescription(obj.id, obj.description)}</span>
              <span className="text-metal-light"> ({obj.points}{t('common.scorePts')})</span>
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
