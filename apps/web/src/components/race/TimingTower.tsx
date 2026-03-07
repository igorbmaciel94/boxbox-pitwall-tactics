import { getPositionColor } from '../../lib/constants';

export interface TimingEntry {
  position: number;
  abbreviation: string;
  teamColor: string;
  gap: string;
  isPlayer: boolean;
}

interface TimingTowerProps {
  entries: TimingEntry[];
}

function TimingRow({ entry }: { entry: TimingEntry }) {
  return (
    <div
      className={`flex items-center gap-0.5 rounded-sm px-1 py-[2px] ${
        entry.isPlayer ? 'bg-f1-red/20' : ''
      }`}
    >
      <span
        className={`w-[14px] text-right font-mono text-[10px] font-bold leading-none ${getPositionColor(entry.position)}`}
      >
        {entry.position}
      </span>

      <div
        className="h-[10px] w-[3px] shrink-0 rounded-[1px]"
        style={{ backgroundColor: entry.teamColor }}
      />

      <span
        className={`font-mono text-[10px] font-semibold leading-none ${
          entry.isPlayer ? 'text-white' : 'text-metal-light'
        }`}
      >
        {entry.abbreviation}
      </span>

      <span className="ml-auto font-mono text-[9px] leading-none text-white/40 tabular-nums">
        {entry.gap}
      </span>
    </div>
  );
}

export function TimingTower({ entries }: TimingTowerProps) {
  // Split entries into 3 columns of 6
  const col1 = entries.slice(0, 6);
  const col2 = entries.slice(6, 12);
  const col3 = entries.slice(12, 18);

  return (
    <div className="grid w-full grid-cols-3 gap-x-3">
      {[col1, col2, col3].map((col, ci) => (
        <div key={ci} className="flex flex-col">
          {col.map((entry) => (
            <TimingRow key={entry.position} entry={entry} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Build timing entries from rival + player data, all 18 positions */
export function buildTimingEntries(
  rivals: Array<{ position: number; abbreviation: string; color: string; strength: number }>,
  player: { position: number; abbreviation: string; color: string; strength: number },
  seed: number,
  turn: number,
): TimingEntry[] {
  const all = [
    ...rivals.map((r) => ({ ...r, isPlayer: false })),
    { ...player, isPlayer: true },
  ].sort((a, b) => a.position - b.position);

  // Compute deterministic gaps
  return all.map((entry, idx) => {
    let gap = '';
    if (idx > 0) {
      const prev = all[idx - 1];
      const strengthDiff = Math.abs(prev.strength - entry.strength);
      const baseGap = 0.3 + (strengthDiff / 100) * 1.5;

      // Deterministic variance from seed + position + turn
      let h = ((seed + entry.position * 7919 + turn * 104729) >>> 0);
      h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
      const variance = ((h % 10) - 5) / 10;
      const gapVal = Math.max(0.1, baseGap + variance);

      gap = `+${gapVal.toFixed(1)}`;
    }

    return {
      position: entry.position,
      abbreviation: entry.abbreviation,
      teamColor: entry.color,
      gap,
      isPlayer: entry.isPlayer,
    };
  });
}
