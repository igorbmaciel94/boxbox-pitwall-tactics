import { useState } from 'react';
import { useGameStore } from '../stores/game-store';
import { CardComponent } from '../components/race/CardComponent';
import { Button } from '../components/shared/Button';
import { FILTER_CATEGORIES } from '../lib/constants';
import { DECK_PRESETS } from '../lib/deck-presets';
import type { CardId } from '@boxbox/engine';
import { useI18n } from '../i18n';

export function DeckBuilderScreen() {
  const { t, getFilterLabel, getCardName } = useI18n();
  const catalog = useGameStore((s) => s.catalog);
  const currentDeck = useGameStore((s) => s.currentDeck);
  const setDeck = useGameStore((s) => s.setDeck);
  const [filter, setFilter] = useState<string>('all');

  if (!catalog) return null;

  const filteredCards = catalog.cards.filter((card) => {
    if (filter === 'all') return true;
    const category = FILTER_CATEGORIES.find((c) => c.key === filter);
    if (!category || !('tags' in category)) return true;
    return card.tags.some((t) => (category.tags as readonly string[]).includes(t));
  });

  const addCard = (id: CardId) => {
    if (currentDeck.length >= 9) return;
    const count = currentDeck.filter((c) => c === id).length;
    if (count >= 2) return;
    setDeck([...currentDeck, id]);
  };

  const removeCard = (index: number) => {
    setDeck(currentDeck.filter((_, i) => i !== index));
  };

  const loadPreset = (cards: CardId[]) => {
    setDeck(cards);
  };

  const isValid = currentDeck.length === 9;

  return (
    <div className="flex flex-col px-5 pt-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{t('deck.title')}</h1>
        <span className={`font-mono text-sm ${isValid ? 'text-hud-green' : 'text-hud-amber'}`}>
          {currentDeck.length}/9
        </span>
      </div>
      <p className="mb-5 text-sm text-metal-light">{t('deck.subtitle')}</p>

      {/* Current deck slots */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
          {t('deck.yourDeck')}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => {
            const cardId = currentDeck[i];
            const card = cardId ? catalog.cards.find((c) => c.id === cardId) : null;
            return (
              <button
                key={i}
                onClick={() => cardId && removeCard(i)}
                className={`flex aspect-[63/88] flex-col items-center justify-center rounded-xl p-2 text-center transition-all
                  ${
                    card
                      ? 'bg-white/8 hover:bg-hud-red/10'
                      : 'border border-dashed border-white/10 bg-transparent text-white/20'
                  }`}
              >
                {card ? (
                  <div className="w-full">
                    <div className="mb-1 font-mono text-[8px] uppercase tracking-wider text-metal-light">Card</div>
                    <div className="font-display text-[10px] font-semibold uppercase tracking-wide leading-tight">
                      {getCardName(card.id, card.name)}
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider">{t('common.empty')}</span>
                )}
              </button>
            );
          })}
        </div>
        {currentDeck.length > 0 && (
          <button
            onClick={() => setDeck([])}
            className="mt-3 text-xs text-hud-red/80 transition-colors hover:text-hud-red"
          >
            {t('deck.clearDeck')}
          </button>
        )}
      </div>

      {/* Suggested decks */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
          {t('deck.suggestedDecks')}
        </div>
        <div className="flex gap-2">
          {DECK_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="ghost"
              size="sm"
              onClick={() => loadPreset(preset.cards)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors
              ${
                filter === cat.key
                  ? 'bg-f1-red text-white'
                  : 'bg-white/5 text-metal-light hover:bg-white/10 hover:text-white'
              }`}
          >
            {getFilterLabel(cat.key)}
          </button>
        ))}
      </div>

      {/* Card catalog */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        {filteredCards.map((card) => {
          const count = currentDeck.filter((c) => c === card.id).length;
          const canAdd = currentDeck.length < 9 && count < 2;
          return (
            <div key={card.id} className="flex justify-center">
              <div className="relative w-full">
                <CardComponent
                  card={card}
                  size="sm"
                  selected={count > 0}
                  disabled={!canAdd && count === 0}
                  onClick={() => canAdd && addCard(card.id)}
                />
              {count > 0 && (
                <span className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-f1-red text-[10px] font-bold text-white shadow">
                  {count}
                </span>
              )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
