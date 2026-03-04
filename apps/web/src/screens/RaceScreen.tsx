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
import { QuickDecisionModal } from '../components/race/QuickDecisionModal';
import { PerkButton } from '../components/race/PerkButton';
import { RadioFeed } from '../components/race/RadioFeed';
import { Button } from '../components/shared/Button';
import { useAudio } from '../hooks/use-audio';
import { getCircuitImageUrl, getCircuitFallbackGradient } from '../lib/images';
import type { CardId } from '@boxbox/engine';

export function RaceScreen() {
  const navigate = useNavigate();
  const catalog = useGameStore((s) => s.catalog);
  const raceState = useGameStore((s) => s.raceState);
  const scenario = useGameStore((s) => s.scenario);
  const team = useGameStore((s) => s.team);
  const turnPhaseUI = useGameStore((s) => s.turnPhaseUI);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const needsQuickDecision = useGameStore((s) => s.needsQuickDecision);
  const previousPosition = useGameStore((s) => s.previousPosition);
  const mode = useGameStore((s) => s.mode);
  const startRace = useGameStore((s) => s.startRace);
  const clearRadioMessages = useUIStore((s) => s.clearRadioMessages);

  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const currentDeck = useGameStore((s) => s.currentDeck);

  const stepper = useTurnStepper();
  const { sendRadio, sendEventRadio } = useRadioMessage();
  const audio = useAudio();

  const [selectedActionCard, setSelectedActionCard] = useState<CardId | null>(null);
  const [scenarioSelectMode, setScenarioSelectMode] = useState(false);
  const [muted, setMuted] = useState(() => audio.isMuted());

  const hasTeamAndDeck = !!selectedTeamId && currentDeck.length === 9;

  // Auto-start race if not started yet
  useEffect(() => {
    if (!raceState && catalog && mode !== 'season') {
      setScenarioSelectMode(true);
    }
  }, [raceState, catalog, mode]);

  // Auto-advance through automatic phases
  useEffect(() => {
    if (!raceState || !catalog || !scenario || !team) return;

    let timer: ReturnType<typeof setTimeout>;

    switch (turnPhaseUI) {
      case 'refill-hand':
        timer = setTimeout(() => stepper.advanceToRevealEvent(), 400);
        break;
      case 'reveal-event':
        if (currentEvent) {
          sendEventRadio(currentEvent.type);
        }
        timer = setTimeout(() => stepper.advanceToPreEffects(), 800);
        break;
      case 'pre-effects':
        timer = setTimeout(() => stepper.advanceToQuickDecisionOrPerk(), 600);
        break;
      case 'resolving':
        timer = setTimeout(() => stepper.advanceToPostEffects(), 500);
        break;
      case 'post-effects':
        timer = setTimeout(() => stepper.advanceToClampAndHooks(), 500);
        break;
      case 'race-complete':
        sendRadio('generic');
        break;
    }

    return () => clearTimeout(timer);
  }, [turnPhaseUI]);

  const handleStartScenario = useCallback(
    (scenarioId: string) => {
      clearRadioMessages();
      startRace(scenarioId);
      setScenarioSelectMode(false);
    },
    [startRace, clearRadioMessages],
  );

  // Scenario selection view
  if (scenarioSelectMode && catalog) {
    if (!hasTeamAndDeck) {
      return (
        <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
          <div className="font-display text-sm font-bold uppercase tracking-wider text-metal-light mb-2">
            Not Ready
          </div>
          <p className="text-xs text-metal-light mb-4">
            {!selectedTeamId ? 'Select a team' : 'Build a 9-card deck'} before racing.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate(!selectedTeamId ? '/team' : '/decks')}>
            {!selectedTeamId ? 'Select Team' : 'Build Deck'}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col px-4 pt-6">
        <h1 className="font-display text-lg font-bold uppercase tracking-wider mb-1">Select Circuit</h1>
        <p className="text-xs text-metal-light mb-4">Choose a circuit for your race.</p>
        <div className="flex flex-col gap-3">
          {catalog.scenarios.map((sc) => (
            <CircuitCard key={sc.id} scenario={sc} onSelect={() => handleStartScenario(sc.id)} />
          ))}
        </div>
      </div>
    );
  }

  if (!raceState || !scenario || !team || !catalog) {
    return (
      <div className="flex items-center justify-center h-64 text-metal-light text-xs">
        Loading race...
      </div>
    );
  }

  const isSC = currentEvent?.type === 'safety-car';
  const isVSC = currentEvent?.type === 'vsc';
  const isRain = currentEvent?.type === 'rain' || raceState.rainMeter >= 7;

  return (
    <div className="relative flex flex-col min-h-dvh">
      {/* SC/VSC overlay */}
      {(isSC || isVSC) && turnPhaseUI !== 'idle' && turnPhaseUI !== 'turn-summary' && (
        <div className="pointer-events-none fixed inset-0 z-30 bg-hud-yellow/10 animate-sc-pulse" />
      )}
      {isRain && turnPhaseUI !== 'idle' && turnPhaseUI !== 'turn-summary' && (
        <div className="pointer-events-none fixed inset-0 z-30 bg-hud-cyan/5 animate-rain-flash" />
      )}

      <div className="relative">
        <ScenarioStrip scenario={scenario} turn={raceState.currentTurn} />
        <button
          onClick={() => setMuted(audio.toggleMute())}
          className="absolute top-2 right-2 z-10 text-metal-light hover:text-white text-xs px-1.5 py-0.5 rounded bg-carbon-dark/60 transition-colors"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? 'MUTED' : 'SFX'}
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 pb-6">
        <HUD state={raceState} previousPosition={previousPosition} />

        {currentEvent && turnPhaseUI !== 'idle' && turnPhaseUI !== 'turn-summary' && (
          <EventCard event={currentEvent} animated={turnPhaseUI === 'reveal-event'} />
        )}

        <QuickDecisionModal
          open={turnPhaseUI === 'await-quick-decision' && needsQuickDecision}
          state={raceState}
          catalog={catalog}
          onSubmit={stepper.submitQuickDecision}
        />

        <PerkButton
          team={team}
          used={raceState.perkUsed}
          visible={turnPhaseUI === 'await-perk'}
          onActivate={() => stepper.submitPerkChoice(true)}
          onSkip={() => stepper.submitPerkChoice(false)}
        />

        {turnPhaseUI === 'await-action-card' && (
          <div className="space-y-3">
            <HandDisplay
              hand={raceState.hand}
              catalog={catalog}
              selectedCard={selectedActionCard}
              onSelect={setSelectedActionCard}
            />
            <Button
              variant="primary"
              size="lg"
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
              Play Card
            </Button>
          </div>
        )}

        {turnPhaseUI === 'turn-summary' && (
          <div className="text-center space-y-3">
            <div className="font-display text-sm font-bold uppercase tracking-wider text-metal-light">
              Lap {raceState.currentTurn} Complete
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
              Next Lap
            </Button>
          </div>
        )}

        {turnPhaseUI === 'idle' && raceState.currentTurn === 0 && (
          <div className="text-center space-y-3 py-4">
            <div className="font-display text-sm font-bold uppercase tracking-wider">
              Lights Out!
            </div>
            <p className="text-[10px] text-metal-light">
              Starting P{raceState.position} - {scenario.turns} laps
            </p>
            <Button variant="primary" size="lg" className="w-full" onClick={() => stepper.startNextTurn()}>
              Start Race
            </Button>
          </div>
        )}

        {turnPhaseUI === 'race-complete' && (
          <div className="text-center space-y-3 py-4">
            <div className="font-display text-lg font-black uppercase tracking-wider">
              Chequered Flag!
            </div>
            <div className="font-display text-3xl font-black text-hud-green">
              P{raceState.position}
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/debrief')}>
              View Debrief
            </Button>
          </div>
        )}

        <RadioFeed />
      </div>
    </div>
  );
}

// --- Circuit selection card with background image ---
function CircuitCard({ scenario, onSelect }: { scenario: { id: string; name: string; circuit: string; params: { startingPosition: number; baseTireWear: number; baseFuel: number }; turns: number; objectives: { id: string; type: string; description: string; points: number }[] }; onSelect: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      onClick={onSelect}
      className="relative overflow-hidden rounded-lg border border-metal-light/20 text-left hover:border-metal-light/40 transition-all active:scale-[0.98]"
    >
      {/* Circuit background */}
      <div className="relative h-24 w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-dark via-carbon-dark/60 to-transparent" />
        <div className="absolute bottom-2 left-3">
          <div className="font-display text-sm font-bold uppercase tracking-wider drop-shadow-lg">{scenario.name}</div>
          <div className="text-[10px] text-metal-light drop-shadow">{scenario.circuit}</div>
        </div>
      </div>

      {/* Info section */}
      <div className="bg-carbon-mid p-3">
        <div className="flex gap-3 text-[9px] text-metal-light">
          <span>Start P{scenario.params.startingPosition}</span>
          <span>Wear {scenario.params.baseTireWear}</span>
          <span>ERS {scenario.params.baseFuel}</span>
          <span>{scenario.turns} laps</span>
        </div>
        <div className="mt-1.5 text-[9px]">
          {scenario.objectives.map((obj) => (
            <span key={obj.id} className="mr-3">
              <span className={obj.type === 'main' ? 'text-hud-amber' : 'text-metal-light'}>
                {obj.type === 'main' ? '★' : '·'}
              </span>{' '}
              <span className="text-white/70">{obj.description}</span>
              <span className="text-metal-light"> ({obj.points}pts)</span>
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
