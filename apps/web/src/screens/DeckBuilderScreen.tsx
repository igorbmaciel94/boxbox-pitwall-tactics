import { useState } from 'react';
import { useGameStore } from '../stores/game-store';
import { CardComponent } from '../components/race/CardComponent';
import { Button } from '../components/shared/Button';
import { FILTER_CATEGORIES } from '../lib/constants';
import { DECK_PRESETS } from '../lib/deck-presets';
import type { CardId } from '@boxbox/engine';

export function DeckBuilderScreen() {
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
    <div className="flex flex-col px-4 pt-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-lg font-bold uppercase tracking-wider">Deck Builder</h1>
        <span className={`font-mono text-sm ${isValid ? 'text-hud-green' : 'text-hud-amber'}`}>
          {currentDeck.length}/9
        </span>
      </div>
      <p className="text-xs text-metal-light mb-4">
        Select 9 cards (max 2 copies each) to build your strategy deck.
      </p>

      {/* Current deck slots */}
      <div className="mb-4">
        <div className="text-[10px] font-display uppercase tracking-wider text-metal-light mb-2">
          Your Deck
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => {
            const cardId = currentDeck[i];
            const card = cardId ? catalog.cards.find((c) => c.id === cardId) : null;
            return (
              <button
                key={i}
                onClick={() => cardId && removeCard(i)}
                className={`rounded border p-2 text-center text-[9px] font-mono transition-all min-h-[52px] flex items-center justify-center
                  ${card ? 'border-metal-light/40 bg-carbon-mid hover:border-hud-red/50 hover:bg-hud-red/5' : 'border-metal-light/10 bg-carbon-mid/50 text-metal-light/30'}`}
              >
                {card ? (
                  <div>
                    <div className="font-display font-semibold uppercase tracking-wider text-[8px]">{card.name}</div>
                  </div>
                ) : (
                  <span>Empty</span>
                )}
              </button>
            );
          })}
        </div>
        {currentDeck.length > 0 && (
          <button
            onClick={() => setDeck([])}
            className="mt-2 text-[10px] text-hud-red hover:text-hud-red/80 transition-colors"
          >
            Clear deck
          </button>
        )}
      </div>

      {/* Suggested decks */}
      <div className="mb-4">
        <div className="text-[10px] font-display uppercase tracking-wider text-metal-light mb-2">
          Suggested Decks
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
      <div className="flex gap-1.5 mb-3">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`rounded px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wider transition-colors
              ${filter === cat.key ? 'bg-hud-blue text-white' : 'bg-metal/30 text-metal-light hover:bg-metal/50'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Card catalog — full art view */}
      <div className="grid grid-cols-2 gap-2.5 pb-4">
        {filteredCards.map((card) => {
          const count = currentDeck.filter((c) => c === card.id).length;
          const canAdd = currentDeck.length < 9 && count < 2;
          return (
            <div key={card.id} className="relative">
              <CardComponent
                card={card}
                selected={count > 0}
                disabled={!canAdd && count === 0}
                onClick={() => canAdd && addCard(card.id)}
              />
              {count > 0 && (
                <span className="absolute top-1 left-1 rounded-full bg-hud-blue text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center z-10 shadow-md">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
