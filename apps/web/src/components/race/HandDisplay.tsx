import type { CardId, GameCatalogData } from '@boxbox/engine';
import { CardComponent } from './CardComponent';

interface HandDisplayProps {
  hand: CardId[];
  catalog: GameCatalogData;
  selectedCard: CardId | null;
  onSelect: (cardId: CardId) => void;
  disabled?: boolean;
  quickDecisionMode?: boolean;
}

export function HandDisplay({ hand, catalog, selectedCard, onSelect, disabled = false, quickDecisionMode = false }: HandDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-display uppercase tracking-wider text-metal-light">
        {quickDecisionMode ? 'Quick Decision — Select a card' : 'Your Hand'}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {hand.map((cardId, i) => {
          const card = catalog.cards.find((c) => c.id === cardId);
          if (!card) return null;

          const isEligible = !quickDecisionMode || card.quickDecisionEligible;
          return (
            <CardComponent
              key={`${cardId}-${i}`}
              card={card}
              selected={selectedCard === cardId}
              disabled={disabled || !isEligible}
              size="sm"
              onClick={() => isEligible && onSelect(cardId)}
            />
          );
        })}
      </div>
    </div>
  );
}
