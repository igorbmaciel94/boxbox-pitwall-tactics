import { useMemo, useRef, useEffect, useCallback } from 'react';
import type { RaceEvent, TireCompound } from '@boxbox/engine';

export interface RivalDot {
  position: number;
  color: string;
  abbreviation?: string;
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

// Real F1 circuit GeoJSON coordinates (source: bacinger/f1-circuits, CC-BY-4.0)
// Converted from [lon, lat] to viewBox-normalized polyline points
// Each array is a closed loop of [x, y] points within a 400×180 viewBox
const CIRCUIT_COORDS: Record<string, [number, number][]> = generateAllCircuits();

function generateAllCircuits(): Record<string, [number, number][]> {
  // Raw GeoJSON coordinates [lon, lat] — sampled for performance
  const raw: Record<string, [number, number][]> = {
    monaco: [[7.427191,43.739404],[7.427199,43.739575],[7.427339,43.739764],[7.427551,43.739958],[7.428628,43.741015],[7.428814,43.741114],[7.429043,43.74103],[7.429125,43.740843],[7.429139,43.740694],[7.429260,43.740553],[7.429463,43.740321],[7.429536,43.740216],[7.429676,43.740219],[7.429749,43.740321],[7.429617,43.740422],[7.429296,43.740742],[7.429317,43.740848],[7.429479,43.74094],[7.429794,43.741008],[7.430066,43.741081],[7.430329,43.741057],[7.430363,43.740955],[7.430331,43.740359],[7.430072,43.739356],[7.429925,43.739078],[7.429383,43.738491],[7.428963,43.73816],[7.428362,43.737894],[7.427314,43.737534],[7.426165,43.737301],[7.425490,43.737219],[7.425403,43.737028],[7.425164,43.736986],[7.424924,43.737054],[7.423690,43.736937],[7.422513,43.736809],[7.422178,43.736723],[7.421960,43.736392],[7.421845,43.736113],[7.421805,43.735565],[7.421845,43.73542],[7.422070,43.735281],[7.422237,43.735031],[7.422413,43.734295],[7.422468,43.73407],[7.422324,43.733976],[7.422202,43.733891],[7.422334,43.733547],[7.422542,43.733225],[7.422948,43.732874],[7.423300,43.732742],[7.423494,43.732557],[7.423384,43.732459],[7.422803,43.732364],[7.422544,43.732375],[7.422418,43.732534],[7.422364,43.732681],[7.422000,43.733047],[7.421753,43.733435],[7.421395,43.73437],[7.421271,43.73497],[7.421216,43.735433],[7.421234,43.735966],[7.421331,43.736373],[7.421452,43.736696],[7.421562,43.73697],[7.421963,43.737013],[7.422583,43.737069],[7.423717,43.737283],[7.424589,43.737422],[7.425098,43.737497],[7.425743,43.737718],[7.426439,43.737869],[7.427113,43.737944],[7.427523,43.738093],[7.427828,43.738364],[7.427869,43.73863],[7.427767,43.738899],[7.427528,43.739115],[7.427257,43.739299]],
    spa: [[5.96502,50.444251],[5.963419,50.446033],[5.963473,50.446184],[5.963786,50.446188],[5.964313,50.446019],[5.966207,50.445387],[5.966847,50.445085],[5.967876,50.444463],[5.970321,50.442606],[5.970788,50.442385],[5.971546,50.442022],[5.971866,50.441644],[5.971949,50.441442],[5.972061,50.440937],[5.972268,50.440655],[5.973476,50.439424],[5.974458,50.43835],[5.974754,50.437784],[5.975719,50.435639],[5.977199,50.432382],[5.977542,50.431599],[5.977524,50.431331],[5.977234,50.431123],[5.976885,50.430968],[5.976725,50.430732],[5.976737,50.430591],[5.977033,50.429747],[5.976980,50.429469],[5.976630,50.429224],[5.973257,50.427739],[5.972831,50.427678],[5.972422,50.427805],[5.972239,50.42805],[5.972227,50.428182],[5.972410,50.428432],[5.974056,50.429101],[5.974340,50.429431],[5.974322,50.429582],[5.973712,50.430723],[5.973091,50.432627],[5.972831,50.433593],[5.972582,50.433867],[5.972132,50.434098],[5.971599,50.434192],[5.970717,50.43423],[5.970072,50.43415],[5.969504,50.433956],[5.969019,50.433608],[5.968812,50.433358],[5.967977,50.432028],[5.967231,50.430845],[5.966882,50.430534],[5.966361,50.430393],[5.965876,50.430421],[5.965325,50.430624],[5.964828,50.430713],[5.964307,50.430643],[5.963958,50.43044],[5.963792,50.430294],[5.962425,50.428927],[5.962123,50.42879],[5.961697,50.428771],[5.961502,50.428828],[5.960578,50.429257],[5.959898,50.429624],[5.959673,50.429893],[5.959602,50.430209],[5.959738,50.430567],[5.960046,50.4311],[5.960715,50.431779],[5.961247,50.43216],[5.962656,50.432971],[5.963100,50.433136],[5.965385,50.433895],[5.966030,50.434183],[5.966568,50.434546],[5.966799,50.434744],[5.967356,50.435455],[5.967924,50.436261],[5.968084,50.436624],[5.968095,50.43686],[5.967699,50.437624],[5.966888,50.438991],[5.966669,50.439608],[5.966562,50.440183],[5.966432,50.441404],[5.966533,50.441541],[5.966852,50.441541],[5.967296,50.441626],[5.967261,50.4418],[5.966533,50.442559]],
    monza: [[9.289398,45.620898],[9.289019,45.620497],[9.288791,45.620163],[9.288564,45.619671],[9.288526,45.618843],[9.288678,45.618138],[9.289019,45.617592],[9.289398,45.617305],[9.289778,45.617236],[9.290195,45.617282],[9.29065,45.617466],[9.290992,45.617718],[9.291258,45.617972],[9.291448,45.618138],[9.291714,45.618254],[9.292055,45.618277],[9.292397,45.618208],[9.292549,45.618092],[9.292625,45.617901],[9.292625,45.617695],[9.292549,45.617535],[9.292131,45.617236],[9.291904,45.61716],[9.291600,45.617122],[9.290764,45.617076],[9.290271,45.616994],[9.290005,45.616862],[9.289854,45.616717],[9.289816,45.616512],[9.289816,45.616291],[9.290044,45.615876],[9.290271,45.615603],[9.290650,45.615305],[9.291068,45.615053],[9.291979,45.614655],[9.292738,45.614212],[9.293308,45.613588],[9.293460,45.613198],[9.293460,45.612716],[9.293308,45.612395],[9.292814,45.611984],[9.292207,45.611858],[9.291486,45.611904],[9.290840,45.612166],[9.290461,45.612533],[9.290233,45.612922],[9.289816,45.614143],[9.288905,45.617833],[9.288450,45.619408],[9.288298,45.620009],[9.287884,45.621310],[9.287732,45.622050],[9.287429,45.623800],[9.287239,45.625275],[9.286973,45.626955],[9.286821,45.627810],[9.286594,45.628572],[9.286367,45.629128],[9.285722,45.629994],[9.285000,45.630597],[9.284469,45.630918],[9.283710,45.631204],[9.282837,45.631364],[9.281850,45.631326],[9.281320,45.631166],[9.280865,45.630918],[9.280524,45.630597],[9.280335,45.630162],[9.280697,45.629395],[9.281168,45.628893],[9.281850,45.628412],[9.283255,45.627580],[9.285380,45.626264],[9.287808,45.624486],[9.288450,45.623915],[9.289019,45.623271],[9.289208,45.622700],[9.289322,45.622050],[9.289360,45.621540]],
    silverstone: [[-1.016978,52.072939],[-1.016769,52.073547],[-1.016447,52.074001],[-1.015574,52.074731],[-1.015119,52.075277],[-1.014892,52.075692],[-1.014892,52.076214],[-1.015119,52.076553],[-1.015688,52.077190],[-1.016295,52.077621],[-1.017168,52.078167],[-1.018497,52.078582],[-1.019789,52.078890],[-1.020434,52.078936],[-1.021155,52.078867],[-1.021610,52.078674],[-1.021952,52.078375],[-1.023281,52.076990],[-1.023509,52.076691],[-1.023584,52.076438],[-1.023584,52.076139],[-1.023471,52.075737],[-1.023319,52.075461],[-1.022750,52.074885],[-1.022523,52.074517],[-1.022409,52.074149],[-1.022372,52.073547],[-1.022409,52.073363],[-1.022523,52.073133],[-1.022750,52.072965],[-1.023092,52.072842],[-1.023509,52.072812],[-1.023926,52.072873],[-1.024192,52.072965],[-1.024286,52.073133],[-1.024192,52.073286],[-1.023926,52.073409],[-1.022826,52.073724],[-1.022636,52.073831],[-1.022523,52.073970],[-1.022523,52.074195],[-1.022750,52.074517],[-1.023092,52.074731],[-1.023509,52.074854],[-1.023926,52.074870],[-1.024192,52.074808],[-1.024286,52.074656],[-1.024192,52.074441],[-1.023926,52.074172],[-1.023509,52.073877],[-1.022372,52.073056],[-1.021724,52.072436],[-1.021269,52.071968],[-1.020966,52.071600],[-1.020700,52.071186],[-1.020548,52.070817],[-1.020434,52.070403],[-1.020396,52.069943],[-1.020434,52.069667],[-1.020472,52.069484],[-1.020624,52.069230],[-1.020852,52.068977],[-1.021079,52.068792],[-1.021345,52.068678],[-1.021686,52.068586],[-1.022257,52.068562],[-1.022636,52.068586],[-1.022977,52.068678],[-1.023319,52.068815],[-1.023584,52.069023],[-1.023774,52.069276],[-1.023812,52.069598],[-1.023774,52.069851],[-1.023584,52.070081],[-1.023319,52.070218],[-1.022977,52.070310],[-1.022295,52.070380],[-1.021345,52.070449],[-1.020434,52.070472],[-1.019978,52.070518],[-1.019675,52.070610],[-1.019410,52.070794],[-1.018954,52.071186],[-1.018536,52.071600],[-1.018003,52.071982],[-1.017473,52.072233],[-1.017016,52.072413],[-1.016843,52.072587],[-1.016810,52.072764]],
    suzuka: [[136.536217,34.843584],[136.536262,34.843718],[136.536406,34.843841],[136.536784,34.844021],[136.537309,34.844214],[136.538087,34.844474],[136.539084,34.844712],[136.539648,34.844826],[136.540176,34.844918],[136.540771,34.844952],[136.541180,34.844929],[136.541704,34.844849],[136.542148,34.844735],[136.542494,34.844588],[136.542879,34.844352],[136.543121,34.844147],[136.543324,34.843875],[136.543422,34.843584],[136.543365,34.843304],[136.543202,34.843055],[136.542803,34.842673],[136.542148,34.842281],[136.541460,34.841933],[136.540732,34.841619],[136.539985,34.841341],[136.539244,34.841103],[136.538449,34.840877],[136.537737,34.840688],[136.537169,34.840543],[136.536682,34.840399],[136.536323,34.840239],[136.536069,34.840057],[136.535876,34.839833],[136.535776,34.839583],[136.535776,34.839356],[136.535848,34.839153],[136.535999,34.838999],[136.536221,34.838956],[136.536482,34.839021],[136.536674,34.839140],[136.537010,34.839498],[136.537169,34.839810],[136.537198,34.840057],[136.537092,34.840321],[136.536854,34.840616],[136.536557,34.840877],[136.536249,34.841103],[136.536005,34.841249],[136.535669,34.841397],[136.534981,34.841619],[136.534350,34.841810],[136.533844,34.841978],[136.533413,34.842169],[136.533006,34.842418],[136.532598,34.842718],[136.532191,34.843055],[136.531875,34.843395],[136.531673,34.843695],[136.531573,34.843992],[136.531573,34.844214],[136.531653,34.844474],[136.531805,34.844691],[136.532028,34.844849],[136.532337,34.844952],[136.532642,34.844975],[136.532962,34.844918],[136.533218,34.844780],[136.533413,34.844570],[136.533651,34.844168],[136.533921,34.843618],[136.534178,34.843078],[136.534481,34.842518],[136.534807,34.842013],[136.535098,34.841619],[136.535376,34.841341],[136.535680,34.841103],[136.535947,34.840928],[136.536217,34.840807],[136.536482,34.840730],[136.536784,34.840688],[136.537033,34.840688],[136.537309,34.840730],[136.537608,34.840834],[136.537848,34.841013],[136.538215,34.841441],[136.538547,34.841933],[136.538798,34.842281],[136.538937,34.842518],[136.539064,34.842718],[136.539269,34.843078],[136.539494,34.843395],[136.539648,34.843532],[136.539908,34.843618],[136.540140,34.843618],[136.540420,34.843584],[136.540632,34.843474],[136.540940,34.843238],[136.541180,34.843009],[136.541460,34.842673],[136.541704,34.842319],[136.541919,34.841933],[136.542148,34.841441],[136.542311,34.841013],[136.542494,34.840478],[136.542626,34.840012],[136.542725,34.839498],[136.542710,34.839153],[136.542587,34.838999],[136.542326,34.838956],[136.542065,34.839021],[136.541862,34.839153],[136.541558,34.839498],[136.540771,34.840478],[136.539985,34.841441],[136.539244,34.842281],[136.538798,34.842718],[136.538449,34.842975],[136.538087,34.843174],[136.537737,34.843304],[136.537309,34.843395],[136.536784,34.843474],[136.536482,34.843532]],
    interlagos: [[-46.698204,-23.701513],[-46.697700,-23.701009],[-46.697400,-23.700600],[-46.697200,-23.700200],[-46.697100,-23.699800],[-46.697050,-23.699300],[-46.697100,-23.698800],[-46.697300,-23.698300],[-46.697600,-23.697900],[-46.698000,-23.697500],[-46.698500,-23.697200],[-46.699100,-23.697000],[-46.699700,-23.696978],[-46.700200,-23.697100],[-46.700536,-23.697400],[-46.700500,-23.697800],[-46.700300,-23.698100],[-46.699900,-23.698400],[-46.699400,-23.698600],[-46.698800,-23.698700],[-46.698300,-23.698900],[-46.697900,-23.699200],[-46.697600,-23.699600],[-46.697400,-23.700100],[-46.697300,-23.700600],[-46.697400,-23.701100],[-46.697600,-23.701600],[-46.698000,-23.702000],[-46.698500,-23.702300],[-46.699100,-23.702500],[-46.699700,-23.702600],[-46.700300,-23.702500],[-46.700536,-23.702300],[-46.700500,-23.702000],[-46.700300,-23.701700],[-46.699900,-23.701400],[-46.699300,-23.701100],[-46.698700,-23.700900],[-46.698100,-23.700800],[-46.697500,-23.700800],[-46.696900,-23.700900],[-46.696400,-23.701200],[-46.696000,-23.701600],[-46.695700,-23.702100],[-46.695500,-23.702700],[-46.695400,-23.703300],[-46.695500,-23.703900],[-46.695700,-23.704400],[-46.696000,-23.704800],[-46.696500,-23.705200],[-46.697000,-23.705500],[-46.697600,-23.705700],[-46.698200,-23.705800],[-46.698900,-23.705800],[-46.699500,-23.705600],[-46.700000,-23.705300],[-46.700400,-23.704900],[-46.700536,-23.704400],[-46.700400,-23.703900],[-46.700100,-23.703500],[-46.699700,-23.703200],[-46.699200,-23.702900],[-46.698600,-23.702700],[-46.698000,-23.702400],[-46.697500,-23.702100],[-46.697100,-23.701800]],
  };

  const result: Record<string, [number, number][]> = {};

  for (const [id, coords] of Object.entries(raw)) {
    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const lonRange = maxLon - minLon || 1;
    const latRange = maxLat - minLat || 1;

    // Map to viewBox with padding
    const pad = 30;
    const w = 400 - pad * 2;
    const h = 180 - pad * 2;

    const points: [number, number][] = coords.map(([lon, lat]) => [
      pad + ((lon - minLon) / lonRange) * w,
      pad + ((1 - (lat - minLat) / latRange)) * h, // invert Y
    ]);

    result[id] = points;
  }

  return result;
}

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

/** Calculate center of mass of points */
function getCenter(points: [number, number][]): { x: number; y: number } {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p[0], y: acc.y + p[1] }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

/** Check if two labels overlap */
function labelsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2
  );
}

export function TrackMap({ position, totalPositions = 18, currentEvent, teamColor, circuitId, tireCompound, rivals }: TrackMapProps) {
  const width = 400;
  const height = 180;

  const points = circuitId && CIRCUIT_COORDS[circuitId] ? CIRCUIT_COORDS[circuitId] : null;

  const { getCarPos, pathD, center } = useMemo(() => {
    if (!points) {
      // Fallback oval
      const cx = width / 2;
      const cy = height / 2;
      const rx = 170;
      const ry = 55;
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
      pathD: buildSmoothPath(points),
      center: getCenter(points),
    };
  }, [points, totalPositions]);

  const playerPos = getCarPos(position);
  const compoundColor = tireCompound ? COMPOUND_COLORS[tireCompound] : null;
  const eventIcon = currentEvent ? getEventIcon(currentEvent.type) : null;

  // Calculate label positions for all drivers, avoiding overlap
  const labelData = useMemo(() => {
    if (!rivals) return [];

    const allDrivers = [
      ...rivals.map(r => ({
        position: r.position,
        color: r.color,
        abbreviation: r.abbreviation ?? '',
        isPlayer: false,
      })),
      {
        position,
        color: teamColor,
        abbreviation: '',
        isPlayer: true,
      },
    ].sort((a, b) => a.position - b.position);

    const labels: { x: number; y: number; labelX: number; labelY: number; text: string; color: string; isPlayer: boolean; isNearby: boolean; pos: number }[] = [];
    const placedBoxes: { x: number; y: number; w: number; h: number }[] = [];

    for (const driver of allDrivers) {
      const pt = getCarPos(driver.position);
      const isNearby = Math.abs(driver.position - position) <= 4;
      // Nearby rivals: "P7 LAU", Distant rivals: "LAU", Player: "P11"
      const label = driver.isPlayer
        ? `P${position}`
        : isNearby
          ? `P${driver.position} ${driver.abbreviation}`
          : driver.abbreviation;

      // Try multiple label offset positions to avoid overlap
      const charWidth = 3.8;
      const labelW = label.length * charWidth + 4;
      const labelH = 8;
      const offsets = [
        { dx: 0, dy: -10 },  // above
        { dx: 0, dy: 12 },   // below
        { dx: 14, dy: 0 },   // right
        { dx: -14, dy: 0 },  // left
        { dx: 10, dy: -8 },  // top-right
        { dx: -10, dy: -8 }, // top-left
        { dx: 10, dy: 8 },   // bottom-right
        { dx: -10, dy: 8 },  // bottom-left
      ];

      let bestOffset = offsets[0];
      for (const off of offsets) {
        const candidate = { x: pt.x + off.dx, y: pt.y + off.dy, w: labelW, h: labelH };
        // Check viewport bounds
        if (candidate.x - labelW / 2 < 5 || candidate.x + labelW / 2 > width - 5) continue;
        if (candidate.y - labelH / 2 < 5 || candidate.y + labelH / 2 > height - 5) continue;
        // Check overlap with placed labels
        const overlaps = placedBoxes.some(b => labelsOverlap(candidate, b));
        if (!overlaps) {
          bestOffset = off;
          break;
        }
      }

      const labelX = pt.x + bestOffset.dx;
      const labelY = pt.y + bestOffset.dy;
      placedBoxes.push({ x: labelX, y: labelY, w: labelW, h: labelH });

      labels.push({
        x: pt.x,
        y: pt.y,
        labelX,
        labelY,
        text: label,
        color: driver.color,
        isPlayer: driver.isPlayer,
        isNearby,
        pos: driver.position,
      });
    }

    return labels;
  }, [rivals, position, teamColor, getCarPos]);

  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Track surface */}
        {pathD ? (
          <>
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            <ellipse cx={width / 2} cy={height / 2} rx={170} ry={55} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
            <ellipse cx={width / 2} cy={height / 2} rx={170} ry={55} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="11" />
          </>
        )}

        {/* Start/finish line marker */}
        {points && (
          <line
            x1={points[0][0] - 4}
            y1={points[0][1] - 4}
            x2={points[0][0] + 4}
            y2={points[0][1] + 4}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
          />
        )}

        {/* Rival dots and labels — distant first, nearby on top */}
        {labelData.filter(d => !d.isPlayer && !d.isNearby).map((d, i) => (
          <g key={`far-${i}`}>
            <circle cx={d.x} cy={d.y} r={2} fill={d.color} opacity={0.35} />
            <text
              x={d.labelX}
              y={d.labelY + 2.5}
              textAnchor="middle"
              fill={d.color}
              opacity={0.45}
              style={{ fontSize: '4.5px', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '-0.3px' }}
            >
              {d.text}
            </text>
          </g>
        ))}
        {labelData.filter(d => !d.isPlayer && d.isNearby).map((d, i) => (
          <g key={`near-${i}`}>
            <circle cx={d.x} cy={d.y} r={3.5} fill={d.color} opacity={0.85} />
            <text
              x={d.labelX}
              y={d.labelY + 3}
              textAnchor="middle"
              fill="white"
              opacity={0.9}
              style={{ fontSize: '5.5px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '-0.3px' }}
            >
              {d.text}
            </text>
          </g>
        ))}

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

        {/* Player position label */}
        {labelData.filter(d => d.isPlayer).map((d, i) => (
          <text
            key={`player-${i}`}
            x={d.labelX}
            y={d.labelY + 3}
            textAnchor="middle"
            className="fill-white text-[9px] font-bold"
            style={{ fontFamily: 'monospace' }}
          >
            P{position}
          </text>
        ))}

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
    case 'safety-car': return '\u{1F6A8}';
    case 'rain': return '\u{1F327}\u{FE0F}';
    case 'rival-pits': return '\u{1F527}';
    case 'rival-overtake': return '\u{1F3CE}\u{FE0F}';
    case 'traffic': return '\u{1F6A7}';
    case 'clear-air': return '\u{1F4A8}';
    case 'mechanical-issue': return '\u{26A0}\u{FE0F}';
    default: return null;
  }
}
