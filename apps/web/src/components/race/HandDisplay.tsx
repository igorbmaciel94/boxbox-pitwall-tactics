import type { CardId, GameCatalogData } from '@boxbox/engine';
import { CardComponent } from './CardComponent';
import { useI18n } from '../../i18n';

interface HandDisplayProps {
  hand: CardId[];
  catalog: GameCatalogData;
  selectedIndex?: number | null;
  onSelectIndex?: (index: number) => void;
  selectedCard?: CardId | null;
  onSelect?: (cardId: CardId) => void;
  disabled?: boolean;
}

export function HandDisplay({ hand, catalog, selectedIndex, onSelectIndex, selectedCard, onSelect, disabled = false }: HandDisplayProps) {
  const { t, getCardName } = useI18n();

  // Resolve selected card data from either index or cardId
  const resolvedSelectedIndex = selectedIndex ?? (selectedCard ? hand.indexOf(selectedCard) : -1);
  const selectedCardData = resolvedSelectedIndex >= 0
    ? catalog.cards.find((c) => c.id === hand[resolvedSelectedIndex])
    : null;

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

          const isSelected = selectedIndex !== undefined && selectedIndex !== null
            ? i === selectedIndex
            : selectedCard === cardId;

          return (
            <CardComponent
              key={`${cardId}-${i}`}
              card={card}
              selected={isSelected}
              disabled={disabled}
              size="sm"
              onClick={() => {
                if (onSelectIndex) onSelectIndex(i);
                else if (onSelect) onSelect(cardId);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
