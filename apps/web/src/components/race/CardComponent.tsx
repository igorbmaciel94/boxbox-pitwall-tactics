import { useState } from 'react';
import type { CardData } from '@boxbox/engine';
import { Badge } from '../shared/Badge';
import { getCardImageUrl, getCardFallbackGradient } from '../../lib/images';

type CardSize = 'sm' | 'md';

interface CardComponentProps {
  card: CardData;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  size?: CardSize;
  onClick?: () => void;
}

function EffectDelta({ label, value, positive, small }: { label: string; value: number; positive: 'good' | 'bad'; small?: boolean }) {
  if (value === 0) return null;
  const isGood =
    (positive === 'good' && value < 0) || (positive === 'bad' && value > 0)
      ? false
      : true;
  const color = isGood ? 'text-hud-green' : 'text-hud-red';
  const sign = value > 0 ? '+' : '';

  return (
    <span className={`${small ? 'text-[9px]' : 'text-xs'} font-mono ${color}`}>
      {label} {sign}{value}
    </span>
  );
}

export function CardComponent({ card, selected = false, disabled = false, compact = false, size, onClick }: CardComponentProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const borderColor = selected
    ? 'border-hud-blue shadow-lg shadow-hud-blue/20'
    : 'border-metal-light/30 hover:border-metal-light/60';

  const fallbackGradient = getCardFallbackGradient(card.tags);

  const isSmall = size === 'sm';
  const showArt = !compact;
  const artHeight = isSmall ? 'h-14' : 'h-24';
  const infoPadding = isSmall ? 'p-1.5' : 'p-2.5';
  const nameSize = isSmall ? 'text-[9px]' : 'text-xs';
  const rulesSize = isSmall ? 'text-[8px] mb-1 leading-snug' : 'text-[10px] mb-2 leading-relaxed';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full rounded-lg border overflow-hidden text-left transition-all duration-150
        ${borderColor}
        ${disabled ? 'opacity-40 pointer-events-none' : 'hover:scale-[1.02] active:scale-[0.98]'}
        ${selected ? 'ring-1 ring-hud-blue/40' : ''}
      `}
    >
      {/* Card art area — top portion */}
      {showArt && (
        <div className={`relative w-full ${artHeight} overflow-hidden`}>
          {!imgFailed ? (
            <img
              src={getCardImageUrl(card.id)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgFailed(true)}
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: fallbackGradient }}
            />
          )}
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-carbon-dark/90 via-carbon-dark/40 to-transparent" />
          {/* QD badge on art */}
          {card.quickDecisionEligible && (
            <span className={`absolute top-1 right-1 bg-hud-yellow/90 text-carbon-dark font-black rounded ${isSmall ? 'text-[7px] px-1 py-0' : 'text-[9px] px-1.5 py-0.5'}`}>
              QD
            </span>
          )}
        </div>
      )}

      {/* Card info area */}
      <div className={`${infoPadding} bg-carbon-mid`}>
        {/* QD indicator for compact mode */}
        {compact && card.quickDecisionEligible && (
          <span className="absolute top-1.5 right-1.5 text-hud-yellow text-[10px] font-bold" title="Quick Decision eligible">
            QD
          </span>
        )}

        {/* Name */}
        <div className={`font-display ${nameSize} font-semibold uppercase tracking-wider mb-0.5`}>
          {card.name}
        </div>

        {/* Rules text — shown when not compact */}
        {!compact && (
          <p className={`${rulesSize} text-metal-light`}>
            {card.rulesText}
          </p>
        )}

        {/* Effects */}
        <div className={`flex flex-wrap gap-x-2 gap-y-0.5 ${isSmall ? 'mb-0.5' : 'mb-1.5'}`}>
          {card.effect.position !== undefined && card.effect.position !== 0 && (
            <EffectDelta label="POS" value={card.effect.position} positive="bad" small={isSmall} />
          )}
          {card.effect.tireWear !== undefined && card.effect.tireWear !== 0 && (
            <EffectDelta label="WEAR" value={card.effect.tireWear} positive="bad" small={isSmall} />
          )}
          {card.effect.fuel !== undefined && card.effect.fuel !== 0 && (
            <EffectDelta label="ERS" value={card.effect.fuel} positive="bad" small={isSmall} />
          )}
          {card.effect.rainMeter !== undefined && card.effect.rainMeter !== 0 && (
            <EffectDelta label="RAIN" value={card.effect.rainMeter} positive="bad" small={isSmall} />
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-1">
          {card.tags.map((tag) => (
            <Badge key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </button>
  );
}
