import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { TeamData } from '@boxbox/engine';
import { useGameStore } from '../stores/game-store';
import { getTeamImageUrl, getTeamFallbackGradient } from '../lib/images';

export function TeamSelectScreen() {
  const navigate = useNavigate();
  const catalog = useGameStore((s) => s.catalog);
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const selectTeam = useGameStore((s) => s.selectTeam);

  if (!catalog) return null;

  return (
    <div className="flex flex-col px-4 pt-6">
      <h1 className="font-display text-lg font-bold uppercase tracking-wider mb-1">Select Team</h1>
      <p className="text-xs text-metal-light mb-6">
        Choose your constructor. Each team has a unique one-time perk.
      </p>

      <div className="flex flex-col gap-3">
        {catalog.teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            active={selectedTeamId === team.id}
            onSelect={() => {
              selectTeam(team.id);
              navigate('/decks');
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TeamCard({ team, active, onSelect }: {
  team: TeamData;
  active: boolean;
  onSelect: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={`relative overflow-hidden rounded-lg border bg-carbon-mid text-left transition-all duration-150
        ${active ? 'border-white/60 ring-1 ring-white/20' : 'border-metal-light/20 hover:border-metal-light/50'}
        hover:bg-metal-dark active:scale-[0.98]`}
    >
      {/* Team image / gradient banner */}
      <div className="relative h-20 w-full overflow-hidden">
        {!imgFailed ? (
          <img
            src={getTeamImageUrl(team.id)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: getTeamFallbackGradient(team.id) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-mid via-carbon-mid/50 to-transparent" />

        {/* Team name overlaid */}
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <span className="font-display text-sm font-bold uppercase tracking-wider drop-shadow-lg" style={{ color: team.color }}>
            {team.name}
          </span>
          {active && (
            <span className="text-[9px] rounded bg-white/10 px-1.5 py-0.5 text-hud-green font-semibold backdrop-blur-sm">
              SELECTED
            </span>
          )}
        </div>
      </div>

      {/* Perk info */}
      <div className="p-3">
        <div className="mb-1">
          <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-metal-light">
            {team.perk.name}
          </span>
          <span className="ml-2 text-[9px] rounded bg-metal/50 px-1.5 py-0.5 text-metal-light uppercase">
            {team.perk.timing === 'end-of-turn' ? 'Auto' : 'Active'}
          </span>
        </div>

        <p className="text-[10px] text-metal-light leading-relaxed">{team.perk.description}</p>

        <div className="mt-2 flex gap-3 text-[10px]">
          {team.perk.effect.position != null && team.perk.effect.position !== 0 && (
            <span className="text-hud-green">POS {team.perk.effect.position > 0 ? '+' : ''}{team.perk.effect.position}</span>
          )}
          {team.perk.effect.tireWear != null && team.perk.effect.tireWear !== 0 && (
            <span className={(team.perk.effect.tireWear ?? 0) < 0 ? 'text-hud-green' : 'text-hud-red'}>
              WEAR {(team.perk.effect.tireWear ?? 0) > 0 ? '+' : ''}{team.perk.effect.tireWear}
            </span>
          )}
          {team.perk.effect.fuel != null && team.perk.effect.fuel !== 0 && (
            <span className={(team.perk.effect.fuel ?? 0) < 0 ? 'text-hud-green' : 'text-hud-red'}>
              ERS {(team.perk.effect.fuel ?? 0) > 0 ? '+' : ''}{team.perk.effect.fuel}
            </span>
          )}
          {team.perk.effect.rainMeter != null && team.perk.effect.rainMeter !== 0 && (
            <span className={(team.perk.effect.rainMeter ?? 0) < 0 ? 'text-hud-green' : 'text-hud-red'}>
              RAIN {(team.perk.effect.rainMeter ?? 0) > 0 ? '+' : ''}{team.perk.effect.rainMeter}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
