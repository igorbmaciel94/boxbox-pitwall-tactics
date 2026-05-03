/**
 * Image registry — maps content IDs to image paths.
 *
 * Drop images into `public/images/{cards,circuits,teams}/` with the exact
 * filenames listed below. Supported formats: .webp, .png, .jpg
 *
 * The app will auto-detect which images exist and fall back to
 * CSS gradients when an image isn't available.
 *
 * Recommended sizes:
 *   Cards:    400×560  (5:7 ratio, TCG card proportion)
 *   Circuits: 800×400  (2:1 ratio, banner/strip)
 *   Teams:    400×400  (1:1 ratio, badge/logo)
 */

// ---------------------------------------------------------------------------
// Card art
// ---------------------------------------------------------------------------
// Filename format:  public/images/cards/{id}.webp
//
// push-hard.webp        | pit-call.webp          | conserve-tires.webp
// fuel-save.webp        | overtake.webp         | defend-position.webp
// wet-setup.webp        | dry-setup.webp        | undercut.webp
// overcut.webp          | aero-boost.webp       | slipstream.webp
// engine-mode.webp      | battery-deploy.webp   | track-position.webp
// gap-management.webp   | late-brake.webp       | alternate-strategy.webp

export function getCardImageUrl(cardId: string): string {
  return `/images/cards/${cardId}.webp`;
}

// ---------------------------------------------------------------------------
// Circuit banners
// ---------------------------------------------------------------------------
// Filename format:  public/images/circuits/{id}.webp
//
// harbor.webp  | forest-run.webp       | velocity-ring.webp
// north-loop.webp | figure-eight.webp | southbank.webp

export function getCircuitImageUrl(scenarioId: string): string {
  return `/images/circuits/${scenarioId}.webp`;
}

// ---------------------------------------------------------------------------
// Team badges
// ---------------------------------------------------------------------------
// Filename format:  public/images/teams/{id}.webp
//
// crimson.webp | azure.webp  | emerald.webp
// amber.webp   | violet.webp | onyx.webp

export function getTeamImageUrl(teamId: string): string {
  return `/images/teams/${teamId}.webp`;
}

// ---------------------------------------------------------------------------
// Fallback gradients  (used when image fails to load)
// ---------------------------------------------------------------------------

const TAG_GRADIENTS: Record<string, string> = {
  aggressive: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)',
  pit: 'linear-gradient(135deg, #1e40af 0%, #172554 100%)',
  defensive: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)',
  weather: 'linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)',
};

export function getCardFallbackGradient(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_GRADIENTS[tag]) return TAG_GRADIENTS[tag];
  }
  return 'linear-gradient(135deg, #1f2937 0%, #111827 100%)';
}

const TEAM_GRADIENTS: Record<string, string> = {
  crimson: 'linear-gradient(135deg, #DC2626 0%, #7f1d1d 100%)',
  azure: 'linear-gradient(135deg, #2563EB 0%, #1e3a8a 100%)',
  emerald: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
  amber: 'linear-gradient(135deg, #D97706 0%, #78350f 100%)',
  violet: 'linear-gradient(135deg, #7C3AED 0%, #3b0764 100%)',
  onyx: 'linear-gradient(135deg, #4B5563 0%, #1F2937 100%)',
};

export function getTeamFallbackGradient(teamId: string): string {
  return TEAM_GRADIENTS[teamId] ?? 'linear-gradient(135deg, #374151 0%, #111827 100%)';
}

const CIRCUIT_GRADIENTS: Record<string, string> = {
  'harbor': 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 60%), url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'100\' viewBox=\'0 0 200 100\'><path d=\'M20 80 Q50 20 100 50 T180 30\' fill=\'none\' stroke=\'rgba(255,255,255,0.08)\' stroke-width=\'2\'/></svg>")',
  'forest-run': 'linear-gradient(135deg, #1a3f2b 0%, #0a1f15 100%)',
  'velocity-ring': 'linear-gradient(135deg, #4a1a1a 0%, #1a0808 100%)',
  'north-loop': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  'figure-eight': 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
  'southbank': 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
};

export function getCircuitFallbackGradient(scenarioId: string): string {
  return CIRCUIT_GRADIENTS[scenarioId] ?? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)';
}

// ---------------------------------------------------------------------------
// Goal card images
// ---------------------------------------------------------------------------
// Filename format:  public/images/goal-cards/{id}.webp
//
// win-championship.webp  | podium-finish.webp  | top-five.webp
// points-scorer.webp     | beat-teammate.webp  | score-points.webp

export function getGoalCardImageUrl(goalCardId: string): string {
  return `/images/goal-cards/${goalCardId}.webp`;
}

const GOAL_CARD_GRADIENTS: Record<string, string> = {
  'win-championship': 'linear-gradient(135deg, #fbbf24 0%, #92400e 100%)',
  'podium-finish': 'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)',
  'top-five': 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
  'points-scorer': 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
  'beat-teammate': 'linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)',
  'score-points': 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 100%)',
};

export function getGoalCardFallbackGradient(goalCardId: string): string {
  return GOAL_CARD_GRADIENTS[goalCardId] ?? 'linear-gradient(135deg, #374151 0%, #111827 100%)';
}
