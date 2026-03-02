import { describe, expect, it } from 'vitest';
import { cardSchema, scenarioSchema, teamSchema } from '../src/schemas.js';

describe('cardSchema', () => {
  it('accepts a valid card', () => {
    const valid = {
      id: 'test-card',
      name: 'Test Card',
      rulesText: 'Does something.',
      effect: { position: -1, tireWear: 5 },
      tags: ['aggressive'],
      quickDecisionEligible: false,
    };
    expect(() => cardSchema.parse(valid)).not.toThrow();
  });

  it('rejects card missing id', () => {
    const invalid = {
      name: 'Test Card',
      rulesText: 'Does something.',
      effect: {},
      tags: [],
      quickDecisionEligible: false,
    };
    expect(() => cardSchema.parse(invalid)).toThrow();
  });

  it('rejects card with empty name', () => {
    const invalid = {
      id: 'test',
      name: '',
      rulesText: 'Does something.',
      effect: {},
      tags: [],
      quickDecisionEligible: false,
    };
    expect(() => cardSchema.parse(invalid)).toThrow();
  });

  it('accepts card with empty effect', () => {
    const valid = {
      id: 'test',
      name: 'Test',
      rulesText: 'Does nothing.',
      effect: {},
      tags: [],
      quickDecisionEligible: false,
    };
    expect(() => cardSchema.parse(valid)).not.toThrow();
  });
});

describe('teamSchema', () => {
  it('accepts a valid team', () => {
    const valid = {
      id: 'crimson',
      name: 'Crimson Racing',
      color: '#DC2626',
      perk: {
        id: 'crimson-perk',
        name: 'Late Charge',
        description: 'End-of-turn perk.',
        timing: 'end-of-turn' as const,
        effect: { position: -1 },
      },
    };
    expect(() => teamSchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid perk timing', () => {
    const invalid = {
      id: 'test',
      name: 'Test',
      color: '#000',
      perk: {
        id: 'perk',
        name: 'Perk',
        description: 'Desc.',
        timing: 'invalid',
        effect: {},
      },
    };
    expect(() => teamSchema.parse(invalid)).toThrow();
  });

  it('accepts team with conditional perk', () => {
    const valid = {
      id: 'test',
      name: 'Test',
      color: '#000',
      perk: {
        id: 'perk',
        name: 'Perk',
        description: 'Desc.',
        timing: 'standard' as const,
        effect: { tireWear: -10 },
        condition: 'some-condition',
      },
    };
    expect(() => teamSchema.parse(valid)).not.toThrow();
  });
});

describe('scenarioSchema', () => {
  it('accepts a valid scenario', () => {
    const valid = {
      id: 'test-track',
      name: 'Test Grand Prix',
      circuit: 'Test Circuit',
      turns: 6,
      params: {
        startingPosition: 10,
        baseTireWear: 5,
        baseFuel: 8,
        rainChance: 0.2,
        eventWeights: {
          'safety-car': 15,
          'vsc': 10,
          'rain': 10,
          'rival-pits': 15,
          'track-limits': 10,
          'traffic': 10,
          'clear-air': 15,
          'drs-train': 10,
          'mechanical-issue': 5,
        },
      },
      objectives: [
        {
          id: 'test-main',
          description: 'Finish top 5',
          type: 'main' as const,
          evaluate: 'finish-above',
          params: { position: 5 },
          points: 10,
        },
      ],
    };
    expect(() => scenarioSchema.parse(valid)).not.toThrow();
  });

  it('rejects scenario with negative event weight', () => {
    const invalid = {
      id: 'test',
      name: 'Test',
      circuit: 'Test',
      turns: 6,
      params: {
        startingPosition: 10,
        baseTireWear: 5,
        baseFuel: 8,
        rainChance: 0.2,
        eventWeights: {
          'safety-car': -1,
          'vsc': 10,
          'rain': 10,
          'rival-pits': 10,
          'track-limits': 10,
          'traffic': 10,
          'clear-air': 10,
          'drs-train': 10,
          'mechanical-issue': 10,
        },
      },
      objectives: [
        {
          id: 'obj',
          description: 'Desc',
          type: 'main' as const,
          evaluate: 'test',
          params: {},
          points: 5,
        },
      ],
    };
    expect(() => scenarioSchema.parse(invalid)).toThrow();
  });

  it('rejects scenario with starting position out of range', () => {
    const invalid = {
      id: 'test',
      name: 'Test',
      circuit: 'Test',
      turns: 6,
      params: {
        startingPosition: 25,
        baseTireWear: 5,
        baseFuel: 8,
        rainChance: 0.2,
        eventWeights: {
          'safety-car': 10,
          'vsc': 10,
          'rain': 10,
          'rival-pits': 10,
          'track-limits': 10,
          'traffic': 10,
          'clear-air': 10,
          'drs-train': 10,
          'mechanical-issue': 10,
        },
      },
      objectives: [
        {
          id: 'obj',
          description: 'Desc',
          type: 'main' as const,
          evaluate: 'test',
          params: {},
          points: 5,
        },
      ],
    };
    expect(() => scenarioSchema.parse(invalid)).toThrow();
  });
});
