# Apex Tactics

A fictional racing trading card game engine. Players manage a hand of cards to navigate race events, deploy team perks, and maximize their finishing position across a 6-race season.

## Getting Started

```bash
npm install
npm run build
npm test
```

## Project Structure

```
packages/
  content/     # Versioned game data (cards, scenarios, teams, strings) + Zod validation
  engine/      # Pure TypeScript game engine (deterministic, testable)
apps/          # Web and mobile app shell
services/      # Optional API services retained for future online features
deploy/        # Deployment configs for the optional backend/web stack
```

## Packages

### `@apex/content`

Versioned JSON content files and a validated loader:

- **12 action cards** across aggressive, defensive, pit, and weather categories
- **6 fictional race scenarios** across original circuits
- **6 teams** with unique one-time-use perks
- **Event flavor text** and radio message pools

### `@apex/engine`

Deterministic game engine with seeded RNG. Key exports:

- `runRace(scenario, team, catalog, agent, seed)` -- simulate a single 6-turn race
- `runSeason(catalog, teamId, agent, seed)` -- simulate a full 6-race season
- `createRng(seed)` -- create a deterministic random number generator
- `PlayerAgent` interface -- implement to provide game decisions

### Race Turn Loop (8 phases)

1. Refill hand to 3 cards
2. Reveal event (weighted selection with caution constraints)
3. Apply event pre-effects (rain meter, fuel savings, etc.)
4. Quick decision (caution/rain spike response; consumes a card)
5. Team perk (one-time use; standard timing)
6. Play 1 action card
7. Apply post-effects (Rival Pits pressure, Track Limits penalty, Traffic)
8. Clamp values + end-of-turn hooks (Crimson perk, blowout/fuel checks)

## Development

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run build         # Build all packages
npm run lint          # Lint source files
```
