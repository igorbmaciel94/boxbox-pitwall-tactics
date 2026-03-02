import type { SeededRng } from './types.js';

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCombine(a: number, b: number): number {
  let h = (a ^ (b * 0x9e3779b9 + 0x6d2b79f5)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return h >>> 0;
}

export function createRng(seed: number): SeededRng {
  const gen = mulberry32(seed);

  const rng: SeededRng = {
    seed,

    next(): number {
      return gen();
    },

    nextInt(min: number, max: number): number {
      const range = max - min + 1;
      return min + Math.floor(gen() * range);
    },

    shuffle<T>(array: readonly T[]): T[] {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(gen() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },

    weightedSelect<T>(items: readonly T[], weights: readonly number[]): T {
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      if (totalWeight <= 0) {
        throw new Error('Total weight must be positive');
      }
      let roll = gen() * totalWeight;
      for (let i = 0; i < items.length; i++) {
        roll -= weights[i];
        if (roll <= 0) {
          return items[i];
        }
      }
      return items[items.length - 1];
    },

    fork(salt: number): SeededRng {
      return createRng(hashCombine(seed, salt));
    },
  };

  return rng;
}
