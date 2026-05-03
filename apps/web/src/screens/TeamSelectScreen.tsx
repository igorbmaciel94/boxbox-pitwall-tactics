import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { TeamData } from '@apex/engine';
import { useGameStore } from '../stores/game-store';
import { getTeamImageUrl, getTeamFallbackGradient } from '../lib/images';
import { useI18n } from '../i18n';

export function TeamSelectScreen() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const catalog = useGameStore((s) => s.catalog);
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const selectTeam = useGameStore((s) => s.selectTeam);

  if (!catalog) return null;

  return (
    <div className="flex flex-col px-5 pt-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
      >
        &larr; {t('common.back')}
      </button>
      <h1 className="mb-1 font-display text-2xl font-bold uppercase tracking-wide">{t('team.title')}</h1>
      <p className="mb-5 text-sm text-metal-light">{t('team.subtitle')}</p>

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
  const { t, getTeamName, getPerkName, getPerkDescription } = useI18n();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={`relative overflow-hidden rounded-2xl text-left transition-all duration-150
        ${active ? 'ring-2 ring-apex-red/50 ring-offset-2 ring-offset-carbon' : ''}
        hover:scale-[1.01] active:scale-[0.98]`}
    >
      {/* Team image / gradient banner */}
      <div className="relative h-24 w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-mid/95 via-carbon-mid/40 to-transparent" />

        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <span className="font-display text-xl font-bold uppercase tracking-wide drop-shadow-lg" style={{ color: team.color }}>
            {getTeamName(team.id, team.name)}
          </span>
          {active && (
            <span className="rounded-full bg-hud-green/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-hud-green">
              {t('team.selected')}
            </span>
          )}
        </div>
      </div>

      {/* Perk info */}
      <div className="bg-carbon-mid/60 p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="font-display text-sm font-semibold uppercase tracking-wide text-white/80">
            {getPerkName(team.perk.id, team.perk.name)}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-metal-light">
            {t('team.active')}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-metal-light">{getPerkDescription(team.perk.id, team.perk.description)}</p>

        <div className="mt-2.5 flex flex-wrap gap-3 text-xs">
          {team.perk.effect.position != null && team.perk.effect.position !== 0 && (
            <span className="text-hud-green">{t('stats.pos')} {team.perk.effect.position > 0 ? '+' : ''}{team.perk.effect.position}</span>
          )}
          {team.perk.effect.tireWear != null && team.perk.effect.tireWear !== 0 && (
            <span className={(team.perk.effect.tireWear ?? 0) < 0 ? 'text-hud-green' : 'text-hud-red'}>
              {t('stats.wear')} {(team.perk.effect.tireWear ?? 0) > 0 ? '+' : ''}{team.perk.effect.tireWear}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
