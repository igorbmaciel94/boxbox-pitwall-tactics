import { useNavigate } from 'react-router';
import { useGameStore } from '../../stores/game-store';
import { Modal } from './Modal';
import { useI18n } from '../../i18n';

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

  const handleSelect = (deckId: string) => {
    loadDeckForPlay(deckId);
    onSelect(deckId);
  };

  return (
    <Modal open={open} title={t('deckPicker.title')} onClose={onClose}>
      <div className="space-y-2.5">
        {validDecks.map((deck) => (
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

        <button
          onClick={() => { onClose(); navigate('/decks/new'); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 p-3 text-xs font-display uppercase tracking-wider text-metal-light transition-colors hover:border-f1-red/50 hover:text-white"
        >
          <span>+</span>
          <span>{t('deckPicker.createNewDeck')}</span>
        </button>
      </div>
    </Modal>
  );
}
