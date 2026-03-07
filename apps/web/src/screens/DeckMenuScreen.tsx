import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { useI18n } from '../i18n';

export function DeckMenuScreen() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const savedDecks = useGameStore((s) => s.savedDecks);

  return (
    <div className="flex flex-col px-5 pt-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
      >
        &larr; {t('common.back')}
      </button>

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          {t('deckMenu.title')}
        </h1>
        <span className="font-mono text-sm text-metal-light">
          {savedDecks.length} {savedDecks.length === 1 ? 'deck' : 'decks'}
        </span>
      </div>

      <p className="mb-5 text-sm text-metal-light">
        {t('home.menu.deckBuilderDesc')}
      </p>

      <div className="grid grid-cols-2 gap-3 pb-24">
        {/* Create new deck tile */}
        <button
          onClick={() => navigate('/decks/new')}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] transition-all hover:border-f1-red/50 hover:bg-white/[0.04] active:scale-[0.97]"
        >
          <span className="text-3xl text-white/40">+</span>
          <span className="text-xs font-display uppercase tracking-wider text-metal-light">
            {t('deckMenu.createNew')}
          </span>
        </button>

        {/* Saved deck tiles */}
        {savedDecks.map((deck) => (
          <button
            key={deck.id}
            onClick={() => navigate(`/decks/${deck.id}`)}
            className="flex aspect-[4/3] flex-col justify-between rounded-2xl bg-white/[0.06] p-3.5 text-left transition-all hover:bg-white/[0.10] active:scale-[0.97]"
          >
            <div>
              <div className="font-display text-sm font-bold uppercase tracking-wide leading-tight line-clamp-2">
                {deck.name}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-metal-light">
                {deck.cards.length}/9 {deck.cards.length === 1 ? 'card' : 'cards'}
              </span>
              <span className={`text-[10px] font-mono ${deck.cards.length === 9 ? 'text-hud-green' : 'text-hud-amber'}`}>
                {deck.cards.length === 9 ? '✓' : '…'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {savedDecks.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-metal-light">{t('deckMenu.noDecks')}</p>
        </div>
      )}
    </div>
  );
}
