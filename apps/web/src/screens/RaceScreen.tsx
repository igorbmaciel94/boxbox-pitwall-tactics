import { useEffect, useState, useCallback } from 'react';
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
import { CompoundSelector } from '../components/race/CompoundSelector';
import { PreRaceTireSetup } from '../components/race/PreRaceTireSetup';
import { Button } from '../components/shared/Button';
import { useAudio } from '../hooks/use-audio';
import { getCircuitImageUrl, getCircuitFallbackGradient } from '../lib/images';
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

  const seasonProgress = useGameStore((s) => s.seasonProgress);
  const deductTireBank = useGameStore((s) => s.deductTireBank);

  const [selectedActionCard, setSelectedActionCard] = useState<CardId | null>(null);
  const [scenarioSelectMode, setScenarioSelectMode] = useState(false);
  const [pendingScenarioId, setPendingScenarioId] = useState<string | null>(null);
  const [pendingRaceSeed, setPendingRaceSeed] = useState<number | undefined>(undefined);
  const [muted, setMuted] = useState(() => audio.isMuted());

  const hasTeamAndDeck = !!selectedTeamId && currentDeck.length === 9;

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
        // Wait for user input
        break;
      case 'resolving':
        timer = setTimeout(() => stepper.advanceToResult(), 500);
        break;
      case 'race-complete':
        sendRadio('generic');
        break;
    }

    return () => clearTimeout(timer);
  }, [turnPhaseUI]);

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
    <div className="relative flex min-h-dvh flex-col">
      {isSC && turnPhaseUI !== 'idle' && turnPhaseUI !== 'turn-summary' && (
        <div className="pointer-events-none fixed inset-0 z-30 bg-hud-yellow/8 animate-sc-pulse" />
      )}
      {isRain && turnPhaseUI !== 'idle' && turnPhaseUI !== 'turn-summary' && (
        <div className="pointer-events-none fixed inset-0 z-30 bg-hud-cyan/5 animate-rain-flash" />
      )}

      <ScenarioStrip scenario={scenario} turn={raceState.currentTurn} />

      <div className="relative px-5 py-1">
        <TrackMap
          position={raceState.position}
          currentEvent={currentEvent}
          teamColor={team.color}
          circuitId={scenario.id}
          tireCompound={raceState.tireCompound}
        />
        {/* Quit race button */}
        <button
          onClick={() => {
            if (window.confirm(t('race.abandonConfirm'))) {
              useGameStore.getState().resetRace();
              navigate('/');
            }
          }}
          className="absolute bottom-2 left-6 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/40 transition-colors hover:bg-white/15 hover:text-hud-red"
          title={t('race.abandon')}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {/* Mute button */}
        <button
          onClick={() => setMuted(audio.toggleMute())}
          className="absolute bottom-2 right-6 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/40 transition-colors hover:bg-white/15 hover:text-white"
          title={muted ? t('race.unmute') : t('race.mute')}
        >
          {muted ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>

      <div className={`flex flex-col gap-2 px-5 py-2 ${
        turnPhaseUI === 'await-action-card' || turnPhaseUI === 'await-mulligan' ? 'pb-20' : 'pb-4'
      }`}>
        <HUD state={raceState} previousPosition={previousPosition} />

        {currentEvent && turnPhaseUI !== 'idle' && turnPhaseUI !== 'turn-summary' && (
          <EventCard event={currentEvent} animated={turnPhaseUI === 'reveal-event'} />
        )}

        {turnPhaseUI === 'await-mulligan' && (
          <>
            <HandDisplay
              hand={raceState.hand}
              catalog={catalog}
              selectedCard={null}
              onSelect={() => {}}
            />
            <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-carbon via-carbon/95 to-transparent px-5 pb-4 pt-3">
              <div className="flex gap-2">
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
          </>
        )}

        <PerkButton
          team={team}
          used={raceState.perkUsed}
          visible={turnPhaseUI === 'await-perk'}
          onActivate={() => stepper.submitPerkChoice(true)}
          onSkip={() => stepper.submitPerkChoice(false)}
        />

        {turnPhaseUI === 'await-action-card' && (
          <>
            <HandDisplay
              hand={raceState.hand}
              catalog={catalog}
              selectedCard={selectedActionCard}
              onSelect={setSelectedActionCard}
            />
            {/* Fixed bottom button for mobile */}
            <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-carbon via-carbon/95 to-transparent px-5 pb-4 pt-3">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                disabled={!selectedActionCard}
                onClick={() => {
                  if (selectedActionCard) {
                    sendRadio('generic');
                    stepper.submitActionCard(selectedActionCard);
                    setSelectedActionCard(null);
                  }
                }}
              >
                {t('race.playCard')}
              </Button>
            </div>
          </>
        )}

        {turnPhaseUI === 'await-compound' && (
          <CompoundSelector
            raceState={raceState}
            onSelect={(compound) => stepper.submitCompoundChoice(compound)}
          />
        )}

        {turnPhaseUI === 'turn-summary' && (
          <div className="animate-panel-pop space-y-3 rounded-2xl bg-white/[0.04] p-5 text-center">
            <div className="font-display text-base font-bold uppercase tracking-wide text-metal-light">
              {t('race.lapComplete', { lap: raceState.currentTurn })}
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                setSelectedActionCard(null);
                stepper.startNextTurn();
              }}
            >
              {t('race.nextLap')}
            </Button>
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
          <div className="animate-panel-pop space-y-3 rounded-2xl bg-white/[0.04] py-6 text-center">
            <div className="font-display text-2xl font-black uppercase tracking-wide">
              {t('race.chequeredFlag')}
            </div>
            <div className="font-display text-3xl font-black text-hud-green">
              P{raceState.position}
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/debrief')}>
              {t('race.viewDebrief')}
            </Button>
          </div>
        )}

      </div>
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
        <div className="mt-2 text-[11px]">
          {scenario.objectives.map((obj) => (
            <span key={obj.id} className="mr-3 inline-block">
              <span className={obj.type === 'main' ? 'font-mono text-hud-amber' : 'font-mono text-metal-light'}>{obj.type === 'main' ? 'M>' : 'B>'}</span>{' '}
              <span className="text-white/60">{getObjectiveDescription(obj.id, obj.description)}</span>
              <span className="text-metal-light"> ({obj.points}{t('common.scorePts')})</span>
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
