import { useMemo } from 'react';
import type { TireCompound } from '@boxbox/engine';
import { COMPOUND_COLORS } from '../../lib/constants';

export interface RivalDot {
  position: number;
  color: string;
  abbreviation?: string;
  strength?: number;
}

interface TrackMapProps {
  position: number;
  totalPositions?: number;
  teamColor: string;
  circuitId?: string;
  tireCompound?: TireCompound;
  rivals?: RivalDot[];
  playerAbbreviation?: string;
}

// Stylized circuit layouts — each unique and loosely inspired by real tracks
// Defined within a 320×140 viewBox, coordinates trace the circuit clockwise from start/finish
const CIRCUIT_PATHS: Record<string, [number, number][]> = {
  // Monaco: Tight street circuit with sharp hairpin and chicanes
  monaco: [
    [260, 28], [280, 25], [295, 32], [300, 48],
    [295, 62], [278, 68], [255, 65], [235, 72],
    [215, 85], [195, 100], [170, 110], [140, 115],
    [110, 112], [85, 102], [65, 88], [50, 72],
    [38, 55], [30, 40], [32, 28], [45, 20],
    [65, 18], [85, 24], [105, 38], [120, 45],
    [140, 42], [165, 35], [190, 26], [220, 22],
    [245, 24],
  ],
  // Spa: Flowing elevation changes, Eau Rouge sweep, La Source hairpin
  spa: [
    [275, 32], [295, 42], [298, 58], [288, 72],
    [265, 82], [240, 92], [210, 100], [178, 108],
    [148, 110], [120, 105], [95, 95], [72, 80],
    [52, 62], [38, 45], [30, 32], [35, 22],
    [52, 18], [75, 20], [100, 25], [122, 35],
    [138, 48], [148, 58], [158, 48], [170, 35],
    [188, 25], [210, 20], [235, 22], [258, 26],
  ],
  // Monza: Temple of speed — long straights, tight chicanes
  monza: [
    [285, 45], [298, 55], [300, 68], [292, 80],
    [275, 88], [248, 94], [210, 98], [165, 100],
    [120, 98], [80, 92], [52, 82], [35, 68],
    [28, 52], [32, 40], [45, 32], [62, 30],
    [78, 36], [88, 44], [92, 36], [102, 28],
    [125, 22], [160, 18], [200, 18], [235, 22],
    [260, 28], [275, 36],
  ],
  // Silverstone: Fast flowing corners, Maggots-Becketts complex
  silverstone: [
    [275, 50], [288, 62], [285, 78], [268, 90],
    [245, 98], [215, 104], [185, 102], [158, 95],
    [132, 82], [112, 68], [92, 55], [72, 48],
    [50, 45], [35, 52], [30, 65], [38, 75],
    [55, 72], [75, 62], [95, 50], [118, 42],
    [145, 36], [172, 32], [200, 28], [228, 26],
    [252, 30], [268, 40],
  ],
  // Suzuka: Figure-8 with distinctive crossover
  suzuka: [
    [270, 55], [288, 65], [292, 80], [282, 92],
    [262, 100], [238, 105], [212, 102], [190, 92],
    [172, 78], [158, 62], [148, 48], [135, 38],
    [115, 32], [92, 30], [72, 35], [55, 45],
    [42, 58], [35, 72], [38, 86], [50, 96],
    [68, 102], [90, 104], [112, 98], [132, 88],
    [152, 72], [168, 55], [185, 42], [205, 34],
    [228, 30], [250, 35], [265, 45],
  ],
  // Interlagos: Counter-clockwise, short and punchy
  interlagos: [
    [265, 38], [285, 48], [292, 65], [285, 80],
    [268, 92], [242, 100], [212, 105], [178, 106],
    [145, 102], [115, 92], [88, 78], [65, 62],
    [48, 48], [35, 35], [32, 24], [42, 16],
    [60, 14], [85, 16], [115, 20], [148, 24],
    [182, 28], [215, 30], [242, 33],
  ],
};

/** Calculate total length of a polyline */
function polylineLength(points: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    total += Math.sqrt(dx * dx + dy * dy);
  }
  // Close the loop
  const dx = points[0][0] - points[points.length - 1][0];
  const dy = points[0][1] - points[points.length - 1][1];
  total += Math.sqrt(dx * dx + dy * dy);
  return total;
}

/** Get point at distance along a closed polyline */
function getPointAtDistance(points: [number, number][], distance: number): { x: number; y: number } {
  const totalLen = polylineLength(points);
  let d = ((distance % totalLen) + totalLen) % totalLen;

  const allSegments = [...points.map((p, i) => [p, points[(i + 1) % points.length]] as const)];

  for (const [a, b] of allSegments) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (d <= segLen) {
      const t = segLen > 0 ? d / segLen : 0;
      return { x: a[0] + dx * t, y: a[1] + dy * t };
    }
    d -= segLen;
  }

  return { x: points[0][0], y: points[0][1] };
}

/** Build smooth SVG path from points using Catmull-Rom splines (closed) */
function buildSmoothPath(points: [number, number][]): string {
  if (points.length < 3) return '';
  const n = points.length;
  const tension = 0.3;

  let d = `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }

  return d;
}

export function TrackMap({ position, totalPositions = 18, teamColor, circuitId, tireCompound, rivals, playerAbbreviation = 'YOU' }: TrackMapProps) {
  const width = 320;
  const height = 140;

  const points = circuitId && CIRCUIT_PATHS[circuitId] ? CIRCUIT_PATHS[circuitId] : null;

  const { getCarPos, pathD } = useMemo(() => {
    if (!points) {
      // Fallback oval
      const cx = width / 2;
      const cy = height / 2;
      const rx = 140;
      const ry = 45;
      return {
        getCarPos: (pos: number) => {
          const fraction = (pos - 1) / totalPositions;
          const angle = -Math.PI / 2 + fraction * 2 * Math.PI;
          return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
        },
        pathD: null,
      };
    }

    const totalLen = polylineLength(points);
    return {
      getCarPos: (pos: number) => {
        const fraction = (pos - 1) / totalPositions;
        return getPointAtDistance(points, fraction * totalLen);
      },
      pathD: buildSmoothPath(points),
    };
  }, [points, totalPositions]);

  const playerPos = getCarPos(position);
  const compoundColor = tireCompound ? COMPOUND_COLORS[tireCompound] : null;

  // Pre-compute rival positions
  const rivalPositions = useMemo(() => {
    if (!rivals) return [];
    return rivals.map(r => ({
      ...getCarPos(r.position),
      color: r.color,
      position: r.position,
      abbreviation: r.abbreviation ?? '???',
    }));
  }, [rivals, getCarPos]);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Track surface */}
        {pathD ? (
          <>
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            <ellipse cx={width / 2} cy={height / 2} rx={140} ry={45} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
            <ellipse cx={width / 2} cy={height / 2} rx={140} ry={45} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
          </>
        )}

        {/* Finish line marker — slightly ahead of P1 */}
        {(() => {
          // P1 is at fraction 0/totalPositions; place finish line a bit ahead
          const finishPt = getCarPos(0.5);
          return (
            <g>
              <line
                x1={finishPt.x - 4}
                y1={finishPt.y - 6}
                x2={finishPt.x - 4}
                y2={finishPt.y + 6}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
              />
              {/* Checkered pattern (simplified) */}
              {[0, 1, 2].map((row) =>
                [0, 1].map((col) => (
                  <rect
                    key={`flag-${row}-${col}`}
                    x={finishPt.x - 4 + col * 2.5}
                    y={finishPt.y - 6 + row * 4}
                    width={2.5}
                    height={4}
                    fill={(row + col) % 2 === 0 ? 'white' : 'rgba(0,0,0,0.8)'}
                    opacity={0.7}
                  />
                )),
              )}
            </g>
          );
        })()}

        {/* Rival dots — team color, no text */}
        {rivalPositions.map((r, i) => (
          <g key={`rival-${i}`}>
            <circle
              cx={r.x}
              cy={r.y}
              r={6}
              fill={r.color}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="0.8"
            />
          </g>
        ))}

        {/* Labels for adjacent rivals (position +/- 1 from player) */}
        {rivalPositions
          .filter((r) => Math.abs(r.position - position) === 1)
          .map((r, i) => (
            <g key={`rival-label-${i}`}>
              <rect
                x={r.x - 10}
                y={r.y - 14}
                width={20}
                height={8}
                rx={2}
                fill="rgba(255,255,255,0.85)"
              />
              <text
                x={r.x}
                y={r.y - 8}
                textAnchor="middle"
                fill="black"
                style={{ fontSize: '5px', fontFamily: 'monospace', fontWeight: 700 }}
              >
                {r.abbreviation}
              </text>
            </g>
          ))}

        {/* Player car — team color dot with label above + compound/team ring */}
        <circle
          cx={playerPos.x}
          cy={playerPos.y}
          r={12}
          fill="none"
          stroke={compoundColor ?? teamColor}
          strokeWidth="1.5"
          opacity={compoundColor ? 0.7 : 0.5}
          className="transition-all duration-500"
        />
        <circle
          cx={playerPos.x}
          cy={playerPos.y}
          r={8}
          fill={teamColor}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1"
          className="transition-all duration-500"
        />
        {/* Player name label above dot */}
        <rect
          x={playerPos.x - 12}
          y={playerPos.y - 21}
          width={24}
          height={9}
          rx={2}
          fill="rgba(255,255,255,0.9)"
          className="transition-all duration-500"
        />
        <text
          x={playerPos.x}
          y={playerPos.y - 14}
          textAnchor="middle"
          fill="black"
          className="transition-all duration-500"
          style={{ fontSize: '5.5px', fontFamily: 'monospace', fontWeight: 700 }}
        >
          {playerAbbreviation}
        </text>
      </svg>
    </div>
  );
}
