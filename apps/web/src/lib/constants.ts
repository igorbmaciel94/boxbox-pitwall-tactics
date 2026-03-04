export const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  aggressive: { bg: 'bg-red-950/45', text: 'text-red-200', border: 'border-red-400/65' },
  defensive: { bg: 'bg-blue-950/45', text: 'text-blue-200', border: 'border-blue-400/60' },
  pit: { bg: 'bg-amber-950/45', text: 'text-amber-200', border: 'border-amber-400/65' },
  weather: { bg: 'bg-cyan-950/45', text: 'text-cyan-200', border: 'border-cyan-400/65' },
};

export const FILTER_CATEGORIES = [
  { key: 'all' },
  { key: 'drive', tags: ['aggressive'] },
  { key: 'pit', tags: ['pit'] },
  { key: 'tactics', tags: ['defensive', 'weather'] },
] as const;

export function getPositionColor(position: number): string {
  if (position <= 3) return 'text-hud-green';
  if (position <= 10) return 'text-white';
  if (position <= 15) return 'text-hud-amber';
  return 'text-hud-red';
}

export function getWearColor(wear: number): string {
  if (wear <= 30) return 'bg-hud-green';
  if (wear <= 60) return 'bg-hud-amber';
  return 'bg-hud-red';
}

export function getErsColor(fuel: number): string {
  if (fuel >= 50) return 'bg-hud-blue';
  if (fuel >= 25) return 'bg-hud-amber';
  return 'bg-hud-red';
}

export function getRainColor(rain: number): string {
  if (rain >= 7) return 'bg-hud-cyan';
  if (rain >= 4) return 'bg-hud-blue';
  return 'bg-blue-500';
}

export function calculateMedal(score: number): 'gold' | 'silver' | 'bronze' | null {
  if (score >= 30) return 'gold';
  if (score >= 20) return 'silver';
  if (score >= 10) return 'bronze';
  return null;
}

export const MEDAL_COLORS = {
  gold: 'text-race-gold',
  silver: 'text-race-silver',
  bronze: 'text-race-bronze',
};

export const EVENT_ICONS: Record<string, string> = {
  'safety-car': 'SC',
  vsc: 'VSC',
  rain: 'RAIN',
  'rival-pits': 'PIT',
  'track-limits': 'TL',
  traffic: 'TFC',
  'clear-air': 'AIR',
  'drs-train': 'DRS',
  'mechanical-issue': 'MECH',
};

export const EVENT_COLORS: Record<string, string> = {
  'safety-car': 'border-hud-yellow/85 bg-hud-yellow/14',
  vsc: 'border-hud-yellow/85 bg-hud-yellow/14',
  rain: 'border-hud-cyan/85 bg-hud-cyan/14',
  'rival-pits': 'border-hud-amber/85 bg-hud-amber/14',
  'track-limits': 'border-hud-red/85 bg-hud-red/14',
  traffic: 'border-metal-light/75 bg-metal/50',
  'clear-air': 'border-hud-green/85 bg-hud-green/14',
  'drs-train': 'border-hud-blue/85 bg-hud-blue/14',
  'mechanical-issue': 'border-hud-red/85 bg-hud-red/14',
};
