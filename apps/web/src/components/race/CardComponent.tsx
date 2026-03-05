import { useState } from 'react';
import type { CardData } from '@boxbox/engine';
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

function EffectDelta({ label, value, positive, small }: { label: string; value: number; positive: 'good' | 'bad'; small?: boolean }) {
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
  const showArt = !compact;
  const artHeight = isSmall ? 'h-[42%]' : 'h-28';
  const infoPadding = isSmall ? 'p-2' : 'p-3';
  const nameSize = isSmall ? 'text-xs' : 'text-sm';
  const rulesSize = isSmall ? 'mb-1 text-[11px] leading-snug' : 'mb-2 text-xs leading-relaxed';
  const cardStyle = isSmall ? { aspectRatio: '63 / 88' } : undefined;
  const showRules = !compact && !isSmall;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={cardStyle}
      className={`group relative w-full overflow-hidden rounded-2xl text-left transition-all duration-150
        ${selected ? 'ring-2 ring-f1-red/60 ring-offset-2 ring-offset-carbon bg-white/8' : 'bg-white/[0.04]'}
        ${disabled ? 'pointer-events-none opacity-40' : 'hover:bg-white/[0.07] active:scale-[0.98]'}
        ${isSmall ? 'flex flex-col origin-bottom' : ''}
        ${selected && isSmall ? 'z-10 -translate-y-1 scale-[1.02]' : ''}
      `}
    >
      {selected && isSmall && (
        <span className="absolute left-1.5 top-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-f1-red text-[11px] font-black text-white shadow">
          ✓
        </span>
      )}
      {/* Card art area */}
      {showArt && (
        <div className={`relative w-full ${artHeight} overflow-hidden`}>
          {!imgFailed ? (
            <img
              src={getCardImageUrl(card.id)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgFailed(true)}
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: fallbackGradient }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/30 to-transparent" />
        </div>
      )}

      {/* Card info area */}
      <div className={`${infoPadding}`}>
        <div className={`mb-0.5 font-display ${nameSize} font-semibold uppercase tracking-wide`}>
          {getCardName(card.id, card.name)}
        </div>

        {showRules && (
          <p className={`${rulesSize} text-metal-light`}>
            {getCardRulesText(card.id, card.rulesText)}
          </p>
        )}

        <div className={`flex flex-wrap gap-x-2 gap-y-0.5 ${isSmall ? 'mb-1' : 'mb-1.5'}`}>
          {card.effect.position !== undefined && card.effect.position !== 0 && (
            <EffectDelta label={t('stats.pos')} value={card.effect.position} positive="bad" small={isSmall} />
          )}
          {card.effect.tireWear !== undefined && card.effect.tireWear !== 0 && (
            <EffectDelta label={t('stats.wear')} value={card.effect.tireWear} positive="bad" small={isSmall} />
          )}
        </div>

        <div className={`flex gap-1 ${isSmall ? 'overflow-hidden' : ''}`}>
          {card.tags.map((tag) => (
            <Badge key={tag} tag={tag} />
          ))}
        </div>
      </div>
      {selected && isSmall && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-f1-red" />}
    </button>
  );
}
