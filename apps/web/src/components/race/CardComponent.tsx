import { useState } from 'react';
import type { CardData } from '@apex/engine';
import { Badge } from '../shared/Badge';
import { getCardImageUrl, getCardFallbackGradient } from '../../lib/images';
import { useI18n } from '../../i18n';

type CardSize = 'sm' | 'md';

interface CardComponentProps {
  card: CardData;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  size?: CardSize;
  onClick?: () => void;
}

export function EffectDelta({ label, value, positive, small }: { label: string; value: number; positive: 'good' | 'bad'; small?: boolean }) {
  if (value === 0) return null;
  const isGood =
    (positive === 'good' && value < 0) || (positive === 'bad' && value > 0)
      ? false
      : true;
  const color = isGood ? 'text-hud-green' : 'text-hud-red';
  const sign = value > 0 ? '+' : '';

  return (
    <span className={`${small ? 'text-[10px]' : 'text-sm'} font-mono ${color}`}>
      {label} {sign}{value}
    </span>
  );
}

export function CardComponent({ card, selected = false, disabled = false, compact = false, size, onClick }: CardComponentProps) {
  const { getCardName, getCardRulesText, t } = useI18n();
  const [imgFailed, setImgFailed] = useState(false);

  const fallbackGradient = getCardFallbackGradient(card.tags);
  const isSmall = size === 'sm';

  // Small cards: image as full background, text overlay at bottom
  if (isSmall) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ aspectRatio: '3 / 4.2' }}
        className={`group relative w-full overflow-hidden rounded-xl text-left transition-all duration-150
          ${selected ? 'ring-2 ring-apex-red/60 ring-offset-2 ring-offset-carbon' : ''}
          ${disabled ? 'pointer-events-none opacity-40' : 'hover:brightness-110 active:scale-[0.98]'}
          ${selected ? 'z-10 -translate-y-3 scale-[1.04] shadow-lg shadow-apex-red/20' : ''}
        `}
      >
        {/* Full background image or gradient */}
        {!imgFailed ? (
          <img
            src={getCardImageUrl(card.id)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: fallbackGradient }} />
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Text content at bottom */}
        <div className="absolute inset-x-0 bottom-0 p-2">
          <div className="mb-0.5 font-display text-xs font-semibold uppercase tracking-wide drop-shadow">
            {getCardName(card.id, card.name)}
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-1">
            {card.effect.position !== undefined && card.effect.position !== 0 && (
              <EffectDelta label={t('stats.pos')} value={card.effect.position} positive="bad" small />
            )}
            {card.effect.tireWear !== undefined && card.effect.tireWear !== 0 && (
              <EffectDelta label={t('stats.wear')} value={card.effect.tireWear} positive="bad" small />
            )}
          </div>
          {!compact && (
            <div className="flex gap-1 overflow-hidden">
              {card.tags.map((tag) => (
                <Badge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>

        {selected && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 rounded-b-xl bg-apex-red" />}
      </button>
    );
  }

  // Medium cards: separate art area + info area (original layout)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full overflow-hidden rounded-2xl text-left transition-all duration-150
        ${selected ? 'ring-2 ring-apex-red/60 ring-offset-2 ring-offset-carbon' : 'bg-white/[0.04]'}
        ${disabled ? 'pointer-events-none opacity-40' : 'hover:brightness-110 active:scale-[0.98]'}
      `}
    >
      {/* Card art area */}
      <div className="relative w-full h-28 overflow-hidden">
        {!imgFailed ? (
          <img
            src={getCardImageUrl(card.id)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: fallbackGradient }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/30 to-transparent" />
      </div>

      {/* Card info area */}
      <div className="p-3">
        <div className="mb-0.5 font-display text-sm font-semibold uppercase tracking-wide">
          {getCardName(card.id, card.name)}
        </div>
        <p className="mb-2 text-xs leading-relaxed text-metal-light">
          {getCardRulesText(card.id, card.rulesText)}
        </p>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-1.5">
          {card.effect.position !== undefined && card.effect.position !== 0 && (
            <EffectDelta label={t('stats.pos')} value={card.effect.position} positive="bad" />
          )}
          {card.effect.tireWear !== undefined && card.effect.tireWear !== 0 && (
            <EffectDelta label={t('stats.wear')} value={card.effect.tireWear} positive="bad" />
          )}
        </div>
        <div className="flex gap-1">
          {card.tags.map((tag) => (
            <Badge key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </button>
  );
}
