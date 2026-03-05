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
    };
    expect(() => cardSchema.parse(valid)).not.toThrow();
  });

  it('rejects card missing id', () => {
    const invalid = {
      name: 'Test Card',
      rulesText: 'Does something.',
      effect: {},
      tags: [],
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
        name: 'Turbo Boost',
        description: 'Gain positions.',
        effect: { position: -2, tireWear: 10 },
      },
    };
    expect(() => teamSchema.parse(valid)).not.toThrow();
  });

  it('rejects team with missing perk id', () => {
    const invalid = {
      id: 'test',
      name: 'Test',
      color: '#000',
      perk: {
        name: 'Perk',
        description: 'Desc.',
        effect: {},
      },
    };
    expect(() => teamSchema.parse(invalid)).toThrow();
  });

  it('accepts team with effect-only perk', () => {
    const valid = {
      id: 'test',
      name: 'Test',
      color: '#000',
      perk: {
        id: 'perk',
        name: 'Perk',
        description: 'Desc.',
        effect: { tireWear: -10 },
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
        eventWeights: {
          'safety-car': 15,
          'rain': 10,
          'rival-pits': 15,
          'traffic': 10,
          'clear-air': 15,
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
        eventWeights: {
          'safety-car': -1,
          'rain': 10,
          'rival-pits': 10,
          'traffic': 10,
          'clear-air': 10,
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
        eventWeights: {
          'safety-car': 10,
          'rain': 10,
          'rival-pits': 10,
          'traffic': 10,
          'clear-air': 10,
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
