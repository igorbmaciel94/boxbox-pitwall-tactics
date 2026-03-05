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
import { RadioFeed } from '../components/race/RadioFeed';
import { Button } from '../components/shared/Button';
import { useAudio } from '../hooks/use-audio';
import { getCircuitImageUrl, getCircuitFallbackGradient } from '../lib/images';
import type { CardId } from '@boxbox/engine';
import { useI18n } from '../i18n';

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

  const [selectedActionCard, setSelectedActionCard] = useState<CardId | null>(null);
  const [scenarioSelectMode, setScenarioSelectMode] = useState(false);
  const [muted, setMuted] = useState(() => audio.isMuted());

  const hasTeamAndDeck = !!selectedTeamId && currentDeck.length === 9;

  useEffect(() => {
    if (!raceState && catalog && mode !== 'season') {
      setScenarioSelectMode(true);
    }
  }, [raceState, catalog, mode]);

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
        timer = setTimeout(() => stepper.advanceToPerkOrAction(), 800);
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

      <div className="relative">
        <ScenarioStrip scenario={scenario} turn={raceState.currentTurn} />
        <button
          onClick={() => setMuted(audio.toggleMute())}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] text-white/60 transition-colors hover:bg-white/15 hover:text-white"
          title={muted ? t('race.unmute') : t('race.mute')}
        >
          {muted ? t('race.muted') : t('race.sfx')}
        </button>
      </div>

      <div className="flex flex-col gap-3.5 px-5 py-4 pb-6">
        <HUD state={raceState} previousPosition={previousPosition} />

        {currentEvent && turnPhaseUI !== 'idle' && turnPhaseUI !== 'turn-summary' && (
          <EventCard event={currentEvent} animated={turnPhaseUI === 'reveal-event'} />
        )}

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
              {t('race.playCard')}
            </Button>
          </div>
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

        <RadioFeed />
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
