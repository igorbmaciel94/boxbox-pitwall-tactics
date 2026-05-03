import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { CardComponent } from '../components/race/CardComponent';
import { CardInfoPanel } from '../components/shared/CardInfoPanel';
import { Button } from '../components/shared/Button';
import { FILTER_CATEGORIES } from '../lib/constants';
import { DECK_PRESETS } from '../lib/deck-presets';
import type { CardId } from '@apex/engine';
import { useI18n } from '../i18n';

export function DeckEditorScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t, getFilterLabel, getCardName } = useI18n();
  const catalog = useGameStore((s) => s.catalog);
  const savedDecks = useGameStore((s) => s.savedDecks);
  const createSavedDeck = useGameStore((s) => s.createSavedDeck);
  const updateSavedDeck = useGameStore((s) => s.updateSavedDeck);

  const isEditMode = !!id;
  const existingDeck = isEditMode ? savedDecks.find((d) => d.id === id) : null;

  const [deckName, setDeckName] = useState(existingDeck?.name ?? '');
  const [cards, setCards] = useState<CardId[]>(existingDeck?.cards ?? []);
  const [filter, setFilter] = useState<string>('all');
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);

  if (!catalog) return null;

  // Redirect if editing a deck that doesn't exist
  if (isEditMode && !existingDeck) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 px-5 text-center">
        <div className="font-display text-base font-bold uppercase tracking-wide text-metal-light">
          Deck not found
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/decks')}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const filteredCards = catalog.cards.filter((card) => {
    if (filter === 'all') return true;
    const category = FILTER_CATEGORIES.find((c) => c.key === filter);
    if (!category || !('tags' in category)) return true;
    return card.tags.some((t) => (category.tags as readonly string[]).includes(t));
  });

  const addCard = (cardId: CardId) => {
    if (cards.length >= 9) return;
    const count = cards.filter((c) => c === cardId).length;
    if (count >= 2) return;
    setCards([...cards, cardId]);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const loadPreset = (presetCards: CardId[]) => {
    setCards(presetCards);
  };

  const handleSave = () => {
    const trimmedName = deckName.trim();
    if (!trimmedName) {
      setError(t('deckEditor.nameRequired'));
      return;
    }

    // Check unique name (exclude current deck in edit mode)
    const nameTaken = savedDecks.some(
      (d) => d.name.toLowerCase() === trimmedName.toLowerCase() && d.id !== id,
    );
    if (nameTaken) {
      setError(t('deckEditor.nameTaken'));
      return;
    }

    if (cards.length !== 9) return;

    if (isEditMode && id) {
      updateSavedDeck(id, trimmedName, cards);
      navigate(`/decks/${id}`);
    } else {
      const newId = createSavedDeck(trimmedName, cards);
      navigate(`/decks/${newId}`);
    }
  };

  const isValid = cards.length === 9;
  const focusedCard = focusedCardId ? catalog.cards.find((c) => c.id === focusedCardId) ?? null : null;
  const backPath = isEditMode && id ? `/decks/${id}` : '/decks';

  return (
    <div className="flex flex-col px-5 pt-6">
      <button
        onClick={() => navigate(backPath)}
        className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
      >
        &larr; {t('common.back')}
      </button>

      <h1 className="font-display text-2xl font-bold uppercase tracking-wide mb-4">
        {isEditMode ? t('deckEditor.editTitle') : t('deckEditor.createTitle')}
      </h1>

      {/* Deck name input */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-display uppercase tracking-wider text-metal-light">
          {t('deckEditor.deckName')}
        </label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => { setDeckName(e.target.value); setError(null); }}
          placeholder={t('deckEditor.deckNamePlaceholder')}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-apex-red/50 focus:bg-white/[0.06]"
          maxLength={30}
        />
        {error && (
          <p className="mt-1.5 text-xs text-hud-red">{error}</p>
        )}
      </div>

      {/* Current deck slots */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-display uppercase tracking-wider text-metal-light">
            {t('deck.yourDeck')}
          </span>
          <span className={`font-mono text-sm ${isValid ? 'text-hud-green' : 'text-hud-amber'}`}>
            {cards.length}/9
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => {
            const cardId = cards[i];
            const card = cardId ? catalog.cards.find((c) => c.id === cardId) : null;
            return card ? (
              <div key={i} className="relative">
                <CardComponent
                  card={card}
                  size="sm"
                  compact
                  onClick={() => removeCard(i)}
                />
              </div>
            ) : (
              <button
                key={i}
                disabled
                className="flex aspect-[63/88] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-transparent text-white/20"
              >
                <span className="text-[10px] uppercase tracking-wider">{t('common.empty')}</span>
              </button>
            );
          })}
        </div>
        {cards.length > 0 && (
          <button
            onClick={() => setCards([])}
            className="mt-3 text-xs text-hud-red/80 transition-colors hover:text-hud-red"
          >
            {t('deck.clearDeck')}
          </button>
        )}
      </div>

      {/* Save button (top) */}
      <div className="mb-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!isValid || !deckName.trim()}
          onClick={handleSave}
        >
          {t('deckEditor.saveDeck')}
        </Button>
      </div>

      {/* Suggested decks — only in create mode */}
      {!isEditMode && (
        <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
          <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
            {t('deckEditor.startWith')}
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
      )}

      {/* Card info panel — between deck/presets and filter tabs */}
      {focusedCard && (
        <div ref={infoPanelRef} className="mb-4">
          <CardInfoPanel card={focusedCard} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors
              ${
                filter === cat.key
                  ? 'bg-apex-red text-white'
                  : 'bg-white/5 text-metal-light hover:bg-white/10 hover:text-white'
              }`}
          >
            {getFilterLabel(cat.key)}
          </button>
        ))}
      </div>

      {/* Defensive card tip — shown when tactics filter active */}
      {filter === 'tactics' && (
        <div className="mb-4 rounded-xl bg-blue-950/30 border border-blue-400/20 px-3.5 py-2.5 text-[11px] leading-relaxed text-blue-200/80">
          {t('deckEditor.defensiveTip')}
        </div>
      )}

      {/* Card catalog */}
      <div className="grid grid-cols-3 gap-2">
        {filteredCards.map((card) => {
          const count = cards.filter((c) => c === card.id).length;
          const canAdd = cards.length < 9 && count < 2;
          return (
            <div
              key={card.id}
              className="flex justify-center"
              onClick={() => setFocusedCardId(card.id)}
            >
              <div className="relative w-full">
                <CardComponent
                  card={card}
                  size="sm"
                  selected={count > 0}
                  disabled={!canAdd && count === 0}
                  onClick={() => { if (canAdd) addCard(card.id); }}
                />
                {count > 0 && (
                  <span className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-apex-red text-[10px] font-bold text-white shadow">
                    {count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card info panel (bottom) */}
      {focusedCard && (
        <div className="mt-4">
          <CardInfoPanel card={focusedCard} />
        </div>
      )}

      {/* Save button */}
      <div className="mt-6 pb-24">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!isValid || !deckName.trim()}
          onClick={handleSave}
        >
          {t('deckEditor.saveDeck')}
        </Button>
      </div>
    </div>
  );
}
