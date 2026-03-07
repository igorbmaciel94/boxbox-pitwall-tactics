import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { CardComponent } from '../components/race/CardComponent';
import { CardInfoPanel } from '../components/shared/CardInfoPanel';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { Button } from '../components/shared/Button';
import { useI18n } from '../i18n';

export function DeckDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const catalog = useGameStore((s) => s.catalog);
  const savedDecks = useGameStore((s) => s.savedDecks);
  const deleteSavedDeck = useGameStore((s) => s.deleteSavedDeck);

  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deck = savedDecks.find((d) => d.id === id);

  if (!deck || !catalog) {
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

  const focusedCard = focusedCardId ? catalog.cards.find((c) => c.id === focusedCardId) ?? null : null;

  const handleDelete = () => {
    deleteSavedDeck(deck.id);
    navigate('/decks');
  };

  const createdDate = new Date(deck.createdAt).toLocaleDateString();

  return (
    <div className="flex flex-col px-5 pt-6">
      <button
        onClick={() => navigate('/decks')}
        className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
      >
        &larr; {t('common.back')}
      </button>

      <h1 className="font-display text-2xl font-bold uppercase tracking-wide mb-1">
        {deck.name}
      </h1>
      <p className="mb-5 text-sm text-metal-light">
        {t('deckDetail.created')} {createdDate}
      </p>

      {/* Deck cards — 3x3 grid */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
          {t('deck.yourDeck')} ({deck.cards.length}/9)
        </div>
        <div className="grid grid-cols-3 gap-2">
          {deck.cards.map((cardId, i) => {
            const card = catalog.cards.find((c) => c.id === cardId);
            return card ? (
              <div
                key={i}
                className="relative cursor-pointer"
                onClick={() => setFocusedCardId(card.id)}
              >
                <CardComponent card={card} size="sm" compact selected={focusedCardId === card.id} />
              </div>
            ) : (
              <div key={i} className="flex aspect-[63/88] items-center justify-center rounded-xl border border-dashed border-white/10 text-white/20 text-[10px]">
                ?
              </div>
            );
          })}
        </div>
      </div>

      {/* Card info panel — read-only */}
      {focusedCard && (
        <div className="mb-4">
          <CardInfoPanel card={focusedCard} />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2.5 mb-8">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={() => navigate(`/decks/${deck.id}/edit`)}
        >
          {t('deckDetail.edit')}
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={() => setShowDeleteConfirm(true)}
        >
          {t('deckDetail.delete')}
        </Button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={t('deckMenu.deleteConfirm')}
        message={t('deckMenu.deleteConfirmMsg')}
        confirmLabel={t('deckDetail.delete')}
        cancelLabel={t('common.back')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
