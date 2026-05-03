import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../../stores/game-store';
import { Modal } from './Modal';
import { useI18n } from '../../i18n';

const DECKS_PER_PAGE = 5;

interface DeckPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (deckId: string) => void;
}

export function DeckPickerModal({ open, onClose, onSelect }: DeckPickerModalProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const savedDecks = useGameStore((s) => s.savedDecks);
  const loadDeckForPlay = useGameStore((s) => s.loadDeckForPlay);

  const validDecks = savedDecks.filter((d) => d.cards.length === 9);

  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(validDecks.length / DECKS_PER_PAGE);
  const pagedDecks = validDecks.slice(page * DECKS_PER_PAGE, (page + 1) * DECKS_PER_PAGE);

  useEffect(() => {
    if (open) setPage(0);
  }, [open]);

  const handleSelect = (deckId: string) => {
    loadDeckForPlay(deckId);
    onSelect(deckId);
  };

  return (
    <Modal open={open} title={t('deckPicker.title')} onClose={onClose}>
      <div className="space-y-2.5">
        {pagedDecks.map((deck) => (
          <button
            key={deck.id}
            onClick={() => handleSelect(deck.id)}
            className="flex w-full items-center justify-between rounded-xl bg-white/[0.06] p-3.5 text-left transition-all hover:bg-white/[0.10] active:scale-[0.98]"
          >
            <div>
              <div className="font-display text-sm font-bold uppercase tracking-wide">
                {deck.name}
              </div>
              <div className="mt-0.5 text-[11px] text-metal-light">
                {deck.cards.length} cards
              </div>
            </div>
            <span className="text-sm text-white/30">&rsaquo;</span>
          </button>
        ))}

        {validDecks.length === 0 && (
          <p className="py-4 text-center text-sm text-metal-light">
            {t('deckMenu.noDecks')}
          </p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-display uppercase tracking-wider text-metal-light transition-colors hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('deckPicker.prev')}
            </button>
            <span className="text-[11px] text-metal-light">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-display uppercase tracking-wider text-metal-light transition-colors hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('deckPicker.next')}
            </button>
          </div>
        )}

        <button
          onClick={() => { onClose(); navigate('/decks/new'); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 p-3 text-xs font-display uppercase tracking-wider text-metal-light transition-colors hover:border-apex-red/50 hover:text-white"
        >
          <span>+</span>
          <span>{t('deckPicker.createNewDeck')}</span>
        </button>
      </div>
    </Modal>
  );
}
