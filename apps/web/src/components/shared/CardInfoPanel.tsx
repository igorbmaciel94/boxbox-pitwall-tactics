import type { CardData } from '@apex/engine';
import { Badge } from './Badge';
import { EffectDelta } from '../race/CardComponent';
import { useI18n } from '../../i18n';

interface CardInfoPanelProps {
  card: CardData | null;
}

export function CardInfoPanel({ card }: CardInfoPanelProps) {
  const { t, getCardName, getCardRulesText, getCardPros, getCardCons } = useI18n();

  if (!card) return null;

  const pros = getCardPros(card.id);
  const cons = getCardCons(card.id);

  return (
    <div className="animate-panel-pop rounded-2xl bg-white/[0.06] border border-white/10 p-4">
      {/* Header: name + tags */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide">
          {getCardName(card.id, card.name)}
        </h3>
        <div className="flex gap-1">
          {card.tags.map((tag) => (
            <Badge key={tag} tag={tag} />
          ))}
        </div>
      </div>

      {/* Rules text */}
      <p className="mb-2.5 text-xs leading-relaxed text-metal-light">
        {getCardRulesText(card.id, card.rulesText)}
      </p>

      {/* Effect deltas */}
      <div className="flex gap-3 mb-3">
        {card.effect.position !== undefined && card.effect.position !== 0 && (
          <EffectDelta label={t('stats.pos')} value={card.effect.position} positive="bad" small />
        )}
        {card.effect.tireWear !== undefined && card.effect.tireWear !== 0 && (
          <EffectDelta label={t('stats.wear')} value={card.effect.tireWear} positive="bad" small />
        )}
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pros */}
        {pros.length > 0 && (
          <div>
            <div className="mb-1.5 text-[10px] font-display uppercase tracking-wider text-hud-green">
              {t('cardDetail.pros')}
            </div>
            <ul className="space-y-1">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug text-white/75">
                  <span className="mt-px text-hud-green shrink-0">+</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {cons.length > 0 && (
          <div>
            <div className="mb-1.5 text-[10px] font-display uppercase tracking-wider text-hud-red">
              {t('cardDetail.cons')}
            </div>
            <ul className="space-y-1">
              {cons.map((con, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug text-white/75">
                  <span className="mt-px text-hud-red shrink-0">-</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
