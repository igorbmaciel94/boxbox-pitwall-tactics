import type { CardId } from '@boxbox/engine';

export interface DeckPreset {
  name: string;
  description: string;
  cards: CardId[];
}

export const DECK_PRESETS: DeckPreset[] = [
  {
    name: 'Aggressive',
    description: 'Push hard and overtake at every opportunity',
    cards: [
      'push-hard',
      'push-hard',
      'overtake',
      'drs-attack',
      'late-brake',
      'engine-mode',
      'slipstream',
      'box-box',
      'undercut',
    ],
  },
  {
    name: 'Conservative',
    description: 'Manage tires carefully for the long game',
    cards: [
      'conserve-tires',
      'conserve-tires',
      'defend-position',
      'defend-position',
      'gap-management',
      'gap-management',
      'alternate-strategy',
      'box-box',
      'slipstream',
    ],
  },
  {
    name: 'Balanced',
    description: 'A mix of attack and defense for any situation',
    cards: [
      'push-hard',
      'overtake',
      'conserve-tires',
      'drs-attack',
      'defend-position',
      'gap-management',
      'box-box',
      'undercut',
      'engine-mode',
    ],
  },
];
