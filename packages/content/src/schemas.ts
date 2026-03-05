import { z } from 'zod';

const eventTypes = [
  'safety-car',
  'rain',
  'rival-pits',
  'rival-overtake',
  'traffic',
  'clear-air',
  'mechanical-issue',
] as const;

export const cardEffectSchema = z.object({
  position: z.number().optional(),
  tireWear: z.number().optional(),
});

export const cardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rulesText: z.string().min(1),
  effect: cardEffectSchema,
  tags: z.array(z.string()),
});

export const cardsFileSchema = z.object({
  version: z.string().min(1),
  cards: z.array(cardSchema).min(1),
});

export const objectiveSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['main', 'bonus']),
  evaluate: z.string().min(1),
  params: z.record(z.union([z.number(), z.string()])),
  points: z.number().min(0),
});

const eventWeightsSchema = z.object(
  Object.fromEntries(eventTypes.map((t) => [t, z.number().min(0)])) as Record<
    (typeof eventTypes)[number],
    z.ZodNumber
  >,
);

export const scenarioParamsSchema = z.object({
  startingPosition: z.number().int().min(1).max(20),
  baseTireWear: z.number().min(0),
  eventWeights: eventWeightsSchema,
});

export const scenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  circuit: z.string().min(1),
  turns: z.number().int().min(1),
  params: scenarioParamsSchema,
  objectives: z.array(objectiveSchema).min(1),
});

export const scenariosFileSchema = z.object({
  version: z.string().min(1),
  scenarios: z.array(scenarioSchema).min(1),
});

export const teamPerkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  effect: cardEffectSchema,
});

export const teamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  perk: teamPerkSchema,
});

export const teamsFileSchema = z.object({
  version: z.string().min(1),
  teams: z.array(teamSchema).min(1),
});

const eventStringsSchema = z.object(
  Object.fromEntries(eventTypes.map((t) => [t, z.array(z.string().min(1)).min(1)])) as Record<
    (typeof eventTypes)[number],
    z.ZodArray<z.ZodString>
  >,
);

export const stringsFileSchema = z.object({
  version: z.string().min(1),
  events: eventStringsSchema,
  radio: z.object({
    stayOut: z.array(z.string().min(1)).min(1),
    boxBox: z.array(z.string().min(1)).min(1),
    generic: z.array(z.string().min(1)).min(1),
  }),
});
