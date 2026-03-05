export const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  aggressive: { bg: 'bg-red-950/45', text: 'text-red-200', border: 'border-red-400/65' },
  defensive: { bg: 'bg-blue-950/45', text: 'text-blue-200', border: 'border-blue-400/60' },
  pit: { bg: 'bg-amber-950/45', text: 'text-amber-200', border: 'border-amber-400/65' },
};

export const FILTER_CATEGORIES = [
  { key: 'all' },
  { key: 'drive', tags: ['aggressive'] },
  { key: 'pit', tags: ['pit'] },
  { key: 'tactics', tags: ['defensive'] },
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
  'safety-car': '\u{1F6A8}',        // 🚨
  rain: '\u{1F327}\u{FE0F}',        // 🌧️
  'rival-pits': '\u{1F527}',        // 🔧
  'rival-overtake': '\u{1F3CE}\u{FE0F}', // 🏎️
  traffic: '\u{1F6A7}',             // 🚧
  'clear-air': '\u{1F4A8}',         // 💨
  'mechanical-issue': '\u{26A0}\u{FE0F}', // ⚠️
};

export const EVENT_COLORS: Record<string, string> = {
  'safety-car': 'border-hud-yellow/85 bg-hud-yellow/14',
  rain: 'border-hud-cyan/85 bg-hud-cyan/14',
  'rival-pits': 'border-hud-amber/85 bg-hud-amber/14',
  'rival-overtake': 'border-hud-red/85 bg-hud-red/14',
  traffic: 'border-metal-light/75 bg-metal/50',
  'clear-air': 'border-hud-green/85 bg-hud-green/14',
  'mechanical-issue': 'border-hud-red/85 bg-hud-red/14',
};
