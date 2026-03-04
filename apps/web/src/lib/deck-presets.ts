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
      'battery-deploy',
      'box-box',
    ],
  },
  {
    name: 'Conservative',
    description: 'Manage tires and fuel for the long game',
    cards: [
      'conserve-tires',
      'conserve-tires',
      'fuel-save',
      'fuel-save',
      'defend-position',
      'gap-management',
      'track-position',
      'alternate-strategy',
      'box-box',
    ],
  },
  {
    name: 'Balanced',
    description: 'A mix of attack and defense for any situation',
    cards: [
      'push-hard',
      'overtake',
      'conserve-tires',
      'fuel-save',
      'drs-attack',
      'defend-position',
      'box-box',
      'undercut',
      'wet-setup',
    ],
  },
];
