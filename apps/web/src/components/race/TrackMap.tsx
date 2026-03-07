import { useMemo } from 'react';
import type { TireCompound } from '@boxbox/engine';

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

/* Label collision avoidance thresholds (SVG units inside 320×140 viewBox) */
const LABEL_COLLISION_DX = 18;
const LABEL_COLLISION_DY = 10;
const SVG_PAD_X = 14;
const SVG_MAX_X = 306;
const SVG_PAD_Y = 6;
const SVG_MAX_Y = 136;

const COMPOUND_COLORS: Record<TireCompound, string> = {
  soft: '#ef4444',
  medium: '#eab308',
  hard: '#ffffff',
  intermediate: '#22c55e',
  wet: '#3b82f6',
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

export function TrackMap({ position, totalPositions = 18, teamColor, circuitId, tireCompound, rivals }: TrackMapProps) {
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
    }));
  }, [rivals, getCarPos]);

  // Collision-resolved label positions for all 18 drivers
  const resolvedLabels = useMemo(() => {
    const candidates = [
      ...rivalPositions.map((r) => ({
        dotX: r.x, dotY: r.y,
        labelX: r.x,
        labelY: r.y < 25 ? r.y + 14 : r.y - 7,
        pos: r.position,
        isPlayer: false,
      })),
      {
        dotX: playerPos.x, dotY: playerPos.y,
        labelX: playerPos.x,
        labelY: playerPos.y < 25 ? playerPos.y + 18 : playerPos.y - 13,
        pos: position,
        isPlayer: true,
      },
    ];

    candidates.sort((a, b) => a.labelX - b.labelX);

    const placed: typeof candidates = [];

    for (const c of candidates) {
      let { labelX, labelY } = c;

      const collides = (lx: number, ly: number) =>
        placed.some(
          (p) => Math.abs(p.labelX - lx) < LABEL_COLLISION_DX && Math.abs(p.labelY - ly) < LABEL_COLLISION_DY,
        );

      if (collides(labelX, labelY)) {
        // Try flipping to opposite side of dot
        const flippedY = c.dotY < 25
          ? c.dotY - (c.isPlayer ? 13 : 7)
          : c.dotY + (c.isPlayer ? 18 : 14);

        if (!collides(labelX, flippedY)) {
          labelY = flippedY;
        } else if (!collides(labelX + 14, labelY)) {
          labelX += 14;
        } else if (!collides(labelX - 14, labelY)) {
          labelX -= 14;
        } else if (!collides(labelX + 14, flippedY)) {
          labelX += 14;
          labelY = flippedY;
        } else {
          labelY = flippedY;
        }
      }

      labelX = Math.max(SVG_PAD_X, Math.min(SVG_MAX_X, labelX));
      labelY = Math.max(SVG_PAD_Y, Math.min(SVG_MAX_Y, labelY));

      placed.push({ ...c, labelX, labelY });
    }

    return placed;
  }, [rivalPositions, playerPos, position]);

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

        {/* Start/finish line marker */}
        {points && (
          <circle cx={points[0][0]} cy={points[0][1]} r={3} fill="rgba(255,255,255,0.3)" />
        )}

        {/* Rival dots */}
        {rivalPositions.map((r, i) => (
          <circle key={`rival-${i}`} cx={r.x} cy={r.y} r={3} fill={r.color} opacity={0.6} />
        ))}

        {/* Player car - colored with compound ring */}
        <circle
          cx={playerPos.x}
          cy={playerPos.y}
          r={5}
          fill={teamColor}
          className="transition-all duration-500"
        />
        {compoundColor && (
          <circle
            cx={playerPos.x}
            cy={playerPos.y}
            r={8}
            fill="none"
            stroke={compoundColor}
            strokeWidth="1.5"
            opacity="0.6"
            className="transition-all duration-500"
          />
        )}
        {!compoundColor && (
          <circle
            cx={playerPos.x}
            cy={playerPos.y}
            r={8}
            fill="none"
            stroke={teamColor}
            strokeWidth="1.5"
            opacity="0.4"
            className="transition-all duration-500"
          />
        )}

        {/* All position labels — collision-resolved */}
        {resolvedLabels.map((l) => (
          <text
            key={`label-${l.pos}`}
            x={l.labelX}
            y={l.labelY}
            textAnchor="middle"
            className={`fill-white font-bold ${l.isPlayer ? 'text-[9px] transition-all duration-500' : 'text-[7px]'}`}
            style={{ fontFamily: 'monospace' }}
          >
            P{l.pos}
          </text>
        ))}
      </svg>
    </div>
  );
}
