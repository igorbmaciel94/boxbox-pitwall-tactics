export const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  aggressive: { bg: 'bg-red-900/50', text: 'text-red-300', border: 'border-red-500' },
  defensive: { bg: 'bg-blue-900/50', text: 'text-blue-300', border: 'border-blue-500' },
  pit: { bg: 'bg-amber-900/50', text: 'text-amber-300', border: 'border-amber-500' },
  weather: { bg: 'bg-cyan-900/50', text: 'text-cyan-300', border: 'border-cyan-500' },
};

export const TAG_DISPLAY_NAMES: Record<string, string> = {
  aggressive: 'Drive',
  defensive: 'Tactics',
  pit: 'Pit',
  weather: 'Tactics',
};

export const FILTER_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'drive', label: 'Drive', tags: ['aggressive'] },
  { key: 'pit', label: 'Pit', tags: ['pit'] },
  { key: 'tactics', label: 'Tactics', tags: ['defensive', 'weather'] },
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
  return 'bg-blue-400';
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
  rain: '🌧',
  'rival-pits': 'PIT',
  'track-limits': 'TL',
  traffic: 'TFC',
  'clear-air': 'AIR',
  'drs-train': 'DRS',
  'mechanical-issue': 'MECH',
};

export const EVENT_COLORS: Record<string, string> = {
  'safety-car': 'border-hud-yellow bg-hud-yellow/10',
  vsc: 'border-hud-yellow bg-hud-yellow/10',
  rain: 'border-hud-cyan bg-hud-cyan/10',
  'rival-pits': 'border-hud-amber bg-hud-amber/10',
  'track-limits': 'border-hud-red bg-hud-red/10',
  traffic: 'border-metal-light bg-metal/50',
  'clear-air': 'border-hud-green bg-hud-green/10',
  'drs-train': 'border-hud-blue bg-hud-blue/10',
  'mechanical-issue': 'border-hud-red bg-hud-red/10',
};
