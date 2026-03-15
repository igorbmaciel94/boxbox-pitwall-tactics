import { useState } from 'react';
import type { ScenarioData } from '@boxbox/engine';
import { getCircuitImageUrl, getCircuitFallbackGradient } from '../../lib/images';
import { useI18n } from '../../i18n';

interface ScenarioStripProps {
  scenario: ScenarioData;
  turn: number;
  onQuit?: () => void;
}

export function ScenarioStrip({ scenario, turn, onQuit }: ScenarioStripProps) {
  const { getScenarioName, getScenarioCircuit, t } = useI18n();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Background circuit image */}
      <div className="absolute inset-0">
        {!imgFailed ? (
          <img
            src={getCircuitImageUrl(scenario.id)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: getCircuitFallbackGradient(scenario.id) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-carbon/90 via-carbon/75 to-carbon/60" />
      </div>

      {/* Content */}
      <div className="relative flex items-center gap-3 px-5 py-3.5">
        {/* Quit button */}
        {onQuit && (
          <button
            onClick={onQuit}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-white/40 transition-colors hover:bg-white/15 hover:text-hud-red"
            title={t('race.abandon')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-bold uppercase leading-none tracking-wide">
            {getScenarioName(scenario.id, scenario.name)}
          </div>
          <div className="mt-1 truncate text-sm text-metal-light">{getScenarioCircuit(scenario.id, scenario.circuit)}</div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: scenario.turns }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-4 rounded-full transition-all duration-200 ${
                  i < turn
                    ? 'bg-hud-green'
                    : i === turn
                      ? 'bg-f1-red'
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
