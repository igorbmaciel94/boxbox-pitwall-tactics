import type { CardId } from '@apex/engine';

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
      'aero-boost',
      'late-brake',
      'engine-mode',
      'slipstream',
      'pit-call',
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
      'pit-call',
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
      'aero-boost',
      'defend-position',
      'gap-management',
      'pit-call',
      'undercut',
      'engine-mode',
    ],
  },
];
