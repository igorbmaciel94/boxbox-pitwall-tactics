import { describe, it, expect } from 'vitest';
import { buildTimingEntries } from '../src/components/race/TimingTower';

const makeRivals = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    abbreviation: `R${String(i + 1).padStart(2, '0')}`,
    color: '#666',
    strength: 90 - i * 2,
  }));

const player = {
  position: 10,
  abbreviation: 'YOU',
  color: '#ff0000',
  strength: 80,
};

describe('buildTimingEntries', () => {
  it('returns all 18 entries', () => {
    // Rivals at positions 1-9 and 11-18 (skip player at 10)
    const rivals = makeRivals(17).map((r, i) => ({
      ...r,
      position: i < 9 ? i + 1 : i + 2, // skip position 10
    }));

    const entries = buildTimingEntries(rivals, player, 42, 1);
    expect(entries).toHaveLength(18);
  });

  it('includes the player in the entries', () => {
    const rivals = makeRivals(17).map((r, i) => ({
      ...r,
      position: i < 9 ? i + 1 : i + 2,
    }));

    const entries = buildTimingEntries(rivals, player, 42, 1);
    const playerEntry = entries.find((e) => e.isPlayer);
    expect(playerEntry).toBeDefined();
    expect(playerEntry!.abbreviation).toBe('YOU');
    expect(playerEntry!.position).toBe(10);
  });

  it('sorts entries by position', () => {
    const rivals = makeRivals(17).map((r, i) => ({
      ...r,
      position: i < 9 ? i + 1 : i + 2,
    }));

    const entries = buildTimingEntries(rivals, player, 42, 1);
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].position).toBeGreaterThan(entries[i - 1].position);
    }
  });

  it('leader has empty gap, others have positive gap strings', () => {
    const rivals = makeRivals(17).map((r, i) => ({
      ...r,
      position: i < 9 ? i + 1 : i + 2,
    }));

    const entries = buildTimingEntries(rivals, player, 42, 1);
    expect(entries[0].gap).toBe('');
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].gap).toMatch(/^\+\d+\.\d$/);
    }
  });

  it('is deterministic — same seed + turn produces same output', () => {
    const rivals = makeRivals(17).map((r, i) => ({
      ...r,
      position: i < 9 ? i + 1 : i + 2,
    }));

    const a = buildTimingEntries(rivals, player, 42, 3);
    const b = buildTimingEntries(rivals, player, 42, 3);
    expect(a).toEqual(b);
  });

  it('produces different gaps for different turns', () => {
    const rivals = makeRivals(17).map((r, i) => ({
      ...r,
      position: i < 9 ? i + 1 : i + 2,
    }));

    const turn1 = buildTimingEntries(rivals, player, 42, 1);
    const turn5 = buildTimingEntries(rivals, player, 42, 5);
    // At least one gap should differ between turns
    const gaps1 = turn1.map((e) => e.gap);
    const gaps5 = turn5.map((e) => e.gap);
    expect(gaps1).not.toEqual(gaps5);
  });

  it('handles player at P1 — first entry is the player', () => {
    const p1Player = { ...player, position: 1 };
    const rivals = makeRivals(17).map((r, i) => ({
      ...r,
      position: i + 2,
    }));

    const entries = buildTimingEntries(rivals, p1Player, 42, 1);
    expect(entries[0].isPlayer).toBe(true);
    expect(entries[0].position).toBe(1);
    expect(entries).toHaveLength(18);
  });

  it('handles player at P18 — last entry is the player', () => {
    const p18Player = { ...player, position: 18 };
    const rivals = makeRivals(17).map((r, i) => ({
      ...r,
      position: i + 1,
    }));

    const entries = buildTimingEntries(rivals, p18Player, 42, 1);
    expect(entries[entries.length - 1].isPlayer).toBe(true);
    expect(entries[entries.length - 1].position).toBe(18);
    expect(entries).toHaveLength(18);
  });

  it('marks only the player entry as isPlayer=true', () => {
    const rivals = makeRivals(17).map((r, i) => ({
      ...r,
      position: i < 9 ? i + 1 : i + 2,
    }));

    const entries = buildTimingEntries(rivals, player, 42, 1);
    const playerEntries = entries.filter((e) => e.isPlayer);
    expect(playerEntries).toHaveLength(1);
  });
});
