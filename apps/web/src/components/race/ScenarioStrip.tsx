import { useState } from 'react';
import type { ScenarioData } from '@boxbox/engine';
import { getCircuitImageUrl, getCircuitFallbackGradient } from '../../lib/images';
import { useI18n } from '../../i18n';

interface ScenarioStripProps {
  scenario: ScenarioData;
  turn: number;
}

export function ScenarioStrip({ scenario, turn }: ScenarioStripProps) {
  const { getScenarioName, getScenarioCircuit } = useI18n();
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
      <div className="relative flex items-center justify-between px-5 py-3.5">
        <div>
          <div className="font-display text-base font-bold uppercase leading-none tracking-wide">
            {getScenarioName(scenario.id, scenario.name)}
          </div>
          <div className="mt-1 text-sm text-metal-light">{getScenarioCircuit(scenario.id, scenario.circuit)}</div>
        </div>
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
  );
}
