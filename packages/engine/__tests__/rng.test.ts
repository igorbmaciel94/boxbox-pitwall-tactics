import { describe, expect, it } from 'vitest';
import { createRng } from '../src/rng.js';

describe('createRng', () => {
  it('produces deterministic sequence for same seed', () => {
    const rng1 = createRng(12345);
    const rng2 = createRng(12345);

    const seq1 = Array.from({ length: 100 }, () => rng1.next());
    const seq2 = Array.from({ length: 100 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = createRng(12345);
    const rng2 = createRng(54321);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).not.toEqual(seq2);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('nextInt returns values within range', () => {
    const rng = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const val = rng.nextInt(1, 6);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
    }
  });

  it('nextInt covers the full range', () => {
    const rng = createRng(42);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      seen.add(rng.nextInt(1, 6));
    }
    expect(seen).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it('shuffle is deterministic', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const rng1 = createRng(42);
    const rng2 = createRng(42);

    expect(rng1.shuffle(items)).toEqual(rng2.shuffle(items));
  });

  it('shuffle does not mutate original array', () => {
    const items = [1, 2, 3, 4, 5];
    const original = [...items];
    const rng = createRng(42);
    rng.shuffle(items);
    expect(items).toEqual(original);
  });

  it('shuffle produces a permutation', () => {
    const items = [1, 2, 3, 4, 5];
    const rng = createRng(42);
    const shuffled = rng.shuffle(items);
    expect(shuffled.sort()).toEqual(items.sort());
  });

  it('weightedSelect respects weights', () => {
    const rng = createRng(42);
    const items = ['a', 'b', 'c'];
    const weights = [100, 0, 0];
    const counts = { a: 0, b: 0, c: 0 };

    for (let i = 0; i < 100; i++) {
      const selected = rng.weightedSelect(items, weights);
      counts[selected as keyof typeof counts]++;
    }

    expect(counts.a).toBe(100);
    expect(counts.b).toBe(0);
    expect(counts.c).toBe(0);
  });

  it('weightedSelect throws on zero total weight', () => {
    const rng = createRng(42);
    expect(() => rng.weightedSelect(['a'], [0])).toThrow('Total weight must be positive');
  });

  it('fork produces isolated RNG streams', () => {
    const rng = createRng(42);
    const forked1 = rng.fork(1);
    const forked2 = rng.fork(2);

    const seq1 = Array.from({ length: 10 }, () => forked1.next());
    const seq2 = Array.from({ length: 10 }, () => forked2.next());

    expect(seq1).not.toEqual(seq2);
  });

  it('fork is deterministic', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);

    const forked1 = rng1.fork(99);
    const forked2 = rng2.fork(99);

    const seq1 = Array.from({ length: 10 }, () => forked1.next());
    const seq2 = Array.from({ length: 10 }, () => forked2.next());

    expect(seq1).toEqual(seq2);
  });

  it('fork does not affect parent RNG', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);

    // rng1 forks, rng2 does not
    rng1.fork(1);

    // Both should produce the same next value since fork doesn't consume parent state
    expect(rng1.next()).toEqual(rng2.next());
  });
});
