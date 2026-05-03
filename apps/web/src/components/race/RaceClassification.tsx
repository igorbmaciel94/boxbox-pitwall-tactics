import { useMemo } from 'react';
import type { RivalRaceResult } from '@apex/engine';
import { getPositionColor } from '../../lib/constants';
import { useI18n } from '../../i18n';

interface RaceClassificationProps {
  classification: RivalRaceResult[];
  playerDriverId: string;
  teams: { id: string; color: string; name: string }[];
  seed?: number;
}

/** Deterministic hash for seed-based random generation */
function hashSeed(a: number, b: number): number {
  let h = (a ^ (b * 0x9e3779b9 + 0x6d2b79f5)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return h >>> 0;
}

export function RaceClassification({ classification, playerDriverId, teams, seed }: RaceClassificationProps) {
  const { t } = useI18n();
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Generate fictional P1 time and cumulative gaps
  const timeData = useMemo(() => {
    if (seed == null) return null;

    // P1 fictional time: "1:3X:XX.XXX"
    let h = hashSeed(seed, 1001);
    const minutes = 30 + (h % 10); // 30-39
    h = hashSeed(h, 2002);
    const seconds = h % 60;
    h = hashSeed(h, 3003);
    const millis = h % 1000;
    const leaderTime = `1:${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;

    // Cumulative gaps for P2-P18
    const gaps: Map<number, string> = new Map();
    gaps.set(1, leaderTime);
    let cumulative = 0;

    for (let pos = 2; pos <= 18; pos++) {
      h = hashSeed(seed, pos * 7919);
      const increment = 0.3 + ((h % 37) / 10); // 0.3 - 4.0 seconds
      cumulative += increment;
      gaps.set(pos, `+${cumulative.toFixed(1)}s`);
    }

    return gaps;
  }, [seed]);

  // Filter: show P1-P10, plus player if below P10
  const playerEntry = classification.find((e) => e.driverId === playerDriverId);
  const playerPosition = playerEntry?.position ?? 0;

  const visibleEntries = useMemo(() => {
    const top10 = classification.filter((e) => e.position <= 10);
    if (playerPosition > 10 && playerEntry) {
      return [...top10, playerEntry];
    }
    return top10;
  }, [classification, playerPosition, playerEntry]);

  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
        {t('classification.title')}
      </div>
      <div className="space-y-1">
        {visibleEntries.map((entry, idx) => {
          const team = teamMap.get(entry.teamId);
          const isPlayer = entry.driverId === playerDriverId;
          const showSeparator = idx > 0 && entry.position > 10 && visibleEntries[idx - 1].position <= 10;

          return (
            <div key={entry.driverId}>
              {showSeparator && (
                <div className="flex items-center gap-2 py-1 text-metal-light/40">
                  <div className="flex-1 border-t border-dashed border-white/10" />
                  <span className="text-[10px]">···</span>
                  <div className="flex-1 border-t border-dashed border-white/10" />
                </div>
              )}
              <div
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                  isPlayer ? 'bg-apex-red/15 ring-1 ring-apex-red/30' : ''
                }`}
              >
                <span className={`w-6 font-mono font-bold ${getPositionColor(entry.position)}`}>
                  P{entry.position}
                </span>
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: team?.color ?? '#666' }}
                />
                <span className={`font-mono font-semibold ${isPlayer ? 'text-white' : 'text-metal-light'}`}>
                  {entry.abbreviation}
                </span>
                <span className="ml-auto font-mono text-metal-light tabular-nums">
                  {timeData
                    ? (timeData.get(entry.position) ?? '')
                    : (entry.points > 0 ? `${entry.points}pts` : '-')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
