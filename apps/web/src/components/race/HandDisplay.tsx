import type { CardId, GameCatalogData } from '@boxbox/engine';
import { CardComponent } from './CardComponent';
import { useI18n } from '../../i18n';

interface HandDisplayProps {
  hand: CardId[];
  catalog: GameCatalogData;
  selectedCard: CardId | null;
  onSelect: (cardId: CardId) => void;
  disabled?: boolean;
}

export function HandDisplay({ hand, catalog, selectedCard, onSelect, disabled = false }: HandDisplayProps) {
  const { t, getCardName } = useI18n();
  const selectedCardData = selectedCard ? catalog.cards.find((c) => c.id === selectedCard) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-display uppercase tracking-wider text-metal-light">
          {t('race.yourHand')}
        </div>
        {selectedCardData && (
          <div className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-medium text-white/80">
            {t('team.selected')}: {getCardName(selectedCardData.id, selectedCardData.name)}
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {hand.map((cardId, i) => {
          const card = catalog.cards.find((c) => c.id === cardId);
          if (!card) return null;

          return (
            <CardComponent
              key={`${cardId}-${i}`}
              card={card}
              selected={selectedCard === cardId}
              disabled={disabled}
              size="sm"
              onClick={() => onSelect(cardId)}
            />
          );
        })}
      </div>
    </div>
  );
}
