import { useState, useRef, useEffect } from 'react';
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
  const updateSavedDeck = useGameStore((s) => s.updateSavedDeck);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [nameError, setNameError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  const focusedCardId = focusedIndex !== null ? deck.cards[focusedIndex] : null;
  const focusedCard = focusedCardId ? catalog.cards.find((c) => c.id === focusedCardId) ?? null : null;

  const handleDelete = () => {
    deleteSavedDeck(deck.id);
    navigate('/decks');
  };

  const handleStartEditing = () => {
    setEditName(deck.name);
    setNameError('');
    setIsEditingName(true);
  };

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setNameError(t('deckEditor.nameRequired'));
      return;
    }
    const duplicate = savedDecks.some((d) => d.id !== deck.id && d.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setNameError(t('deckEditor.nameTaken'));
      return;
    }
    updateSavedDeck(deck.id, trimmed, deck.cards);
    setIsEditingName(false);
    setNameError('');
  };

  const handleCancelEditing = () => {
    setIsEditingName(false);
    setEditName('');
    setNameError('');
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') handleCancelEditing();
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

      {/* Editable deck name */}
      {isEditingName ? (
        <div className="mb-1">
          <div className="flex items-center gap-2">
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={(e) => { setEditName(e.target.value); setNameError(''); }}
              onKeyDown={handleNameKeyDown}
              onBlur={handleCancelEditing}
              className="flex-1 rounded-lg border border-white/20 bg-white/[0.06] px-3 py-1.5 font-display text-xl font-bold uppercase tracking-wide text-white outline-none focus:border-apex-red/50"
              maxLength={40}
            />
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSaveName}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-hud-green/20 text-hud-green transition-colors hover:bg-hud-green/30"
              title="Save"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
          {nameError && (
            <p className="mt-1 text-xs text-hud-red">{nameError}</p>
          )}
        </div>
      ) : (
        <div className="mb-1 flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            {deck.name}
          </h1>
          <button
            onClick={handleStartEditing}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-metal-light transition-colors hover:bg-white/10 hover:text-white"
            title="Edit name"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        </div>
      )}
      <p className="mb-5 text-sm text-metal-light">
        {t('deckDetail.created')} {createdDate}
      </p>

      {/* Card info panel — read-only */}
      {focusedCard && (
        <div className="mb-4">
          <CardInfoPanel card={focusedCard} />
        </div>
      )}

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
                onClick={() => setFocusedIndex(i)}
              >
                <CardComponent card={card} size="sm" compact selected={focusedIndex === i} />
              </div>
            ) : (
              <div key={i} className="flex aspect-[63/88] items-center justify-center rounded-xl border border-dashed border-white/10 text-white/20 text-[10px]">
                ?
              </div>
            );
          })}
        </div>
      </div>

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
