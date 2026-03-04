import type { CardId, GameCatalogData, RaceState } from '@boxbox/engine';
import { Modal } from '../shared/Modal';
import { HandDisplay } from './HandDisplay';
import { Button } from '../shared/Button';
import { useState } from 'react';

interface QuickDecisionModalProps {
  open: boolean;
  state: RaceState;
  catalog: GameCatalogData;
  onSubmit: (cardId: CardId | null) => void;
}

export function QuickDecisionModal({ open, state, catalog, onSubmit }: QuickDecisionModalProps) {
  const [selected, setSelected] = useState<CardId | null>(null);

  return (
    <Modal open={open} title="Quick Decision">
      <div className="space-y-4">
        <p className="text-xs text-metal-light">
          A critical moment! You may play a quick-decision card from your hand, or skip.
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
            Skip
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
            Play Card
          </Button>
        </div>
      </div>
    </Modal>
  );
}
