import type { CardId, GameCatalogData, RaceState } from '@boxbox/engine';
import { Modal } from '../shared/Modal';
import { HandDisplay } from './HandDisplay';
import { Button } from '../shared/Button';
import { useState } from 'react';
import { useI18n } from '../../i18n';

interface QuickDecisionModalProps {
  open: boolean;
  state: RaceState;
  catalog: GameCatalogData;
  onSubmit: (cardId: CardId | null) => void;
}

export function QuickDecisionModal({ open, state, catalog, onSubmit }: QuickDecisionModalProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<CardId | null>(null);

  return (
    <Modal open={open} title={t('race.quickDecisionTitle')}>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-metal-light">
          {t('race.quickDecisionDesc')}
        </p>
        <HandDisplay
          hand={state.hand}
          catalog={catalog}
          selectedCard={selected}
          onSelect={setSelected}
          quickDecisionMode
        />
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="md"
            className="flex-1"
            onClick={() => {
              setSelected(null);
              onSubmit(null);
            }}
          >
            {t('race.skip')}
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            disabled={!selected}
            onClick={() => {
              onSubmit(selected);
              setSelected(null);
            }}
          >
            {t('race.playCard')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
