import { useMemo } from 'react';
import type { RaceEvent, TireCompound } from '@boxbox/engine';

export interface RivalDot {
  position: number;
  color: string;
}

interface TrackMapProps {
  position: number;
  totalPositions?: number;
  currentEvent: RaceEvent | null;
  teamColor: string;
  circuitId?: string;
  tireCompound?: TireCompound;
  rivals?: RivalDot[];
}

// Simplified but recognizable circuit layouts as polyline points
// Each circuit is defined within a 320×140 viewBox, coordinates clockwise from start/finish
const CIRCUIT_PATHS: Record<string, [number, number][]> = {
  // Monaco: Tight hairpins, narrow street circuit
  monaco: [
    [280, 30], [300, 40], [300, 60], [280, 70],
    [240, 65], [220, 80], [200, 100], [180, 110],
    [140, 115], [100, 110], [80, 95], [60, 80],
    [40, 60], [30, 40], [40, 25], [60, 20],
    [80, 30], [100, 45], [120, 50], [140, 45],
    [160, 35], [180, 25], [200, 20], [240, 22],
  ],
  // Spa: Eau Rouge sweeps, long Kemmel straight, La Source hairpin
  spa: [
    [280, 35], [300, 50], [290, 70], [260, 85],
    [230, 95], [200, 105], [170, 110], [140, 108],
    [110, 100], [80, 85], [55, 65], [40, 50],
    [30, 35], [40, 25], [60, 20], [90, 22],
    [120, 30], [140, 40], [155, 55], [165, 45],
    [175, 30], [195, 22], [220, 20], [250, 25],
  ],
  // Monza: Very fast, long straights, few chicanes
  monza: [
    [290, 50], [300, 65], [295, 80], [280, 90],
    [250, 95], [200, 98], [150, 100], [100, 98],
    [60, 90], [40, 75], [30, 60], [35, 45],
    [50, 35], [70, 30], [90, 35], [100, 45],
    [105, 38], [115, 32], [140, 28], [180, 25],
    [220, 22], [250, 25], [270, 32], [280, 40],
  ],
  // Silverstone: Fast flowing corners, Maggots-Becketts complex
  silverstone: [
    [280, 55], [290, 70], [280, 85], [260, 95],
    [230, 100], [200, 105], [170, 100], [145, 90],
    [120, 75], [100, 60], [80, 50], [55, 45],
    [35, 50], [30, 65], [40, 75], [60, 70],
    [80, 60], [100, 48], [130, 40], [160, 35],
    [190, 30], [220, 28], [250, 32], [270, 42],
  ],
  // Suzuka: Figure-8 layout with crossover
  suzuka: [
    [280, 60], [295, 75], [290, 90], [270, 100],
    [240, 105], [210, 100], [185, 90], [165, 75],
    [150, 60], [140, 45], [125, 35], [100, 30],
    [75, 32], [55, 40], [40, 55], [35, 70],
    [40, 85], [55, 95], [75, 100], [100, 98],
    [130, 88], [155, 72], [175, 58], [200, 45],
    [225, 35], [250, 38], [268, 48],
  ],
  // Interlagos: Counter-clockwise, short, technical
  interlagos: [
    [270, 40], [290, 55], [295, 75], [280, 90],
    [255, 100], [225, 105], [190, 108], [155, 105],
    [120, 95], [90, 80], [65, 65], [45, 50],
    [30, 38], [35, 25], [55, 18], [85, 15],
    [120, 18], [155, 22], [190, 28], [220, 30],
    [250, 33],
  ],
};

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

/** Build SVG path string from points (closed) */
function buildPathD(points: [number, number][]): string {
  if (points.length === 0) return '';
  const parts = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${points[i][0]} ${points[i][1]}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

/** Calculate center of mass of points */
function getCenter(points: [number, number][]): { x: number; y: number } {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p[0], y: acc.y + p[1] }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

export function TrackMap({ position, totalPositions = 20, currentEvent, teamColor, circuitId, tireCompound, rivals }: TrackMapProps) {
  const width = 320;
  const height = 140;

  const points = circuitId && CIRCUIT_PATHS[circuitId] ? CIRCUIT_PATHS[circuitId] : null;

  const { getCarPos, pathD, center } = useMemo(() => {
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
        center: { x: cx, y: cy },
      };
    }

    const totalLen = polylineLength(points);
    return {
      getCarPos: (pos: number) => {
        const fraction = (pos - 1) / totalPositions;
        return getPointAtDistance(points, fraction * totalLen);
      },
      pathD: buildPathD(points),
      center: getCenter(points),
    };
  }, [points, totalPositions]);

  const playerPos = getCarPos(position);
  const compoundColor = tireCompound ? COMPOUND_COLORS[tireCompound] : null;

  const eventIcon = currentEvent ? getEventIcon(currentEvent.type) : null;

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
              strokeLinejoin="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="10"
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

        {/* Rival dots — colored by team, with position labels */}
        {rivals && rivals.map((r, i) => {
          const pos = getCarPos(r.position);
          const labelY = pos.y < 20 ? pos.y + 12 : pos.y - 8;
          return (
            <g key={i}>
              <circle cx={pos.x} cy={pos.y} r={3.5} fill={r.color} opacity={0.75} />
              <text
                x={pos.x}
                y={labelY}
                textAnchor="middle"
                fill="white"
                opacity={0.85}
                style={{ fontSize: '6px', fontFamily: 'monospace', fontWeight: 'bold' }}
              >
                P{r.position}
              </text>
            </g>
          );
        })}

        {/* Player car - larger, colored with compound ring */}
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

        {/* Position label near player — below dot when near top edge */}
        <text
          x={playerPos.x}
          y={playerPos.y < 25 ? playerPos.y + 18 : playerPos.y - 13}
          textAnchor="middle"
          className="fill-white text-[9px] font-bold"
          style={{ fontFamily: 'monospace' }}
        >
          P{position}
        </text>

        {/* Event icon in center */}
        {eventIcon && (
          <text
            x={center.x}
            y={center.y + 4}
            textAnchor="middle"
            className="fill-white/40 text-[10px] font-bold uppercase"
            style={{ fontFamily: 'monospace' }}
          >
            {eventIcon}
          </text>
        )}
      </svg>
    </div>
  );
}

function getEventIcon(type: string): string | null {
  switch (type) {
    case 'safety-car': return '\u{1F6A8}';        // 🚨
    case 'rain': return '\u{1F327}\u{FE0F}';      // 🌧️
    case 'rival-pits': return '\u{1F527}';         // 🔧
    case 'rival-overtake': return '\u{1F3CE}\u{FE0F}'; // 🏎️
    case 'traffic': return '\u{1F6A7}';            // 🚧
    case 'clear-air': return '\u{1F4A8}';          // 💨
    case 'mechanical-issue': return '\u{26A0}\u{FE0F}'; // ⚠️
    default: return null;
  }
}
