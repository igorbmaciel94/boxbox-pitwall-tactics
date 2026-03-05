import type { RaceEvent } from '@boxbox/engine';

interface TrackMapProps {
  position: number;
  totalPositions?: number;
  currentEvent: RaceEvent | null;
  teamColor: string;
}

/**
 * Simplified oval track map showing car positions.
 * Player car = colored dot, rivals = gray dots.
 */
export function TrackMap({ position, totalPositions = 20, currentEvent, teamColor }: TrackMapProps) {
  // Track dimensions
  const width = 320;
  const height = 100;
  const cx = width / 2;
  const cy = height / 2;
  const rx = 140; // x radius
  const ry = 35;  // y radius

  // Distribute positions around the oval
  const getCarPosition = (pos: number) => {
    // Position 1 is at front (right side), positions spread counter-clockwise
    const fraction = (pos - 1) / totalPositions;
    const angle = -Math.PI / 2 + fraction * 2 * Math.PI;
    return {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  };

  const playerPos = getCarPosition(position);

  // Generate rival dots (every 2 positions for visual clarity)
  const rivals = Array.from({ length: totalPositions }, (_, i) => i + 1)
    .filter((p) => p !== position && p % 2 === 0);

  // Event icon position (center of track)
  const eventIcon = currentEvent ? getEventIcon(currentEvent.type) : null;

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Track outline */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="14"
        />

        {/* Start/finish line */}
        <line
          x1={cx + rx}
          y1={cy - 8}
          x2={cx + rx}
          y2={cy + 8}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          strokeDasharray="2 2"
        />

        {/* Rival dots */}
        {rivals.map((p) => {
          const pos = getCarPosition(p);
          return (
            <circle
              key={p}
              cx={pos.x}
              cy={pos.y}
              r={3}
              fill="rgba(255,255,255,0.2)"
            />
          );
        })}

        {/* Player car - larger, colored */}
        <circle
          cx={playerPos.x}
          cy={playerPos.y}
          r={5}
          fill={teamColor}
          className="transition-all duration-500"
        />
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

        {/* Position label near player */}
        <text
          x={playerPos.x}
          y={playerPos.y - 12}
          textAnchor="middle"
          className="fill-white text-[9px] font-bold"
          style={{ fontFamily: 'monospace' }}
        >
          P{position}
        </text>

        {/* Event icon in center */}
        {eventIcon && (
          <text
            x={cx}
            y={cy + 4}
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
    case 'safety-car': return 'SC';
    case 'rain': return 'RAIN';
    case 'rival-overtake': return 'OVT';
    case 'traffic': return 'TFC';
    case 'mechanical-issue': return 'MECH';
    default: return null;
  }
}
