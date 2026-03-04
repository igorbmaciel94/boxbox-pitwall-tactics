import { useState } from 'react';
import type { ScenarioData } from '@boxbox/engine';
import { getCircuitImageUrl, getCircuitFallbackGradient } from '../../lib/images';

interface ScenarioStripProps {
  scenario: ScenarioData;
  turn: number;
}

export function ScenarioStrip({ scenario, turn }: ScenarioStripProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative overflow-hidden border-b border-metal-light/20">
      {/* Background circuit image */}
      <div className="absolute inset-0">
        {!imgFailed ? (
          <img
            src={getCircuitImageUrl(scenario.id)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: getCircuitFallbackGradient(scenario.id) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-carbon-dark/80 to-carbon-dark/40" />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-between px-4 py-2">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-wider">
            {scenario.name}
          </div>
          <div className="text-[9px] text-metal-light">{scenario.circuit}</div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: scenario.turns }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-4 rounded-full transition-colors ${
                i < turn ? 'bg-hud-green' : i === turn ? 'bg-hud-blue' : 'bg-metal-dark'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
