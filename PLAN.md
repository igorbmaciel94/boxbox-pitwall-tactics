# Implementation Plan

## 1. Mulligan UX - Bottom Sheet Modal
**Problem:** Mulligan buttons overlay the track map, hiding content, and auto-scroll is janky.
**Solution:** Use a **half-sheet bottom drawer** pattern (like Marvel Snap card preview). When mulligan phase starts, a semi-transparent overlay slides up from the bottom showing:
- The 3 cards (smaller) in a row
- "Trocar Mao" and "Manter Mao" buttons below
- Tapping outside dismisses (keeps hand)

This is a focused modal that doesn't require scrolling. Cards are visible AND buttons are accessible.

**Files:** `RaceScreen.tsx` - Replace mulligan overlay on map with a bottom sheet modal component.

## 2. Quit Race Button - Pause/Gear Icon
**Problem:** Text button on map is ugly and gets overlapped.
**Solution:** Replace with a small **gear/pause icon** in the ScenarioStrip header (top bar, next to circuit name). Tapping opens a minimal dropdown with "Abandonar Corrida". This is the standard mobile game pattern - settings in the top bar.

**Files:** `RaceScreen.tsx`, `ScenarioStrip.tsx` - Move quit to header area.

## 3. Safety Car / VSC Mechanics
**Problem:** SC currently allows overtaking, pit stops cost full positions.
**Solution:**
- **SC event:** Position changes from the event itself stay at 0 (already is). Card position effects are **halved** (rounded down). Pit stop position penalty reduced to 0 (free pit under SC, like real F1).
- **Add `underSafetyCar` flag** to RaceState that's true when current event is SC. Pass this to `applyCardEffect` and `applyEndOfTurnPenalties`.
- Under SC: no progressive tire degradation position penalties (field is bunched, can't lose positions to wear).

**Files:**
- `packages/engine/src/types.ts` - Add `underSafetyCar: boolean` to RaceState
- `packages/engine/src/event-system.ts` - Set flag when SC
- `packages/engine/src/card-effects.ts` - Halve position penalty, free pit under SC
- `packages/engine/src/clamp.ts` - Skip wear position penalties under SC
- `packages/engine/src/race-engine.ts` - Pass SC state through

## 4. Crash / DNF Mechanic
**Problem:** No risk of retirement, making aggressive play risk-free.
**Solution:** Add a **crash check** at end of turn:
- Base crash chance: 0% normally
- +5% if playing aggressive card (tag: "aggressive") AND tire wear > 70
- +8% if rain AND using dry tires (soft/medium/hard)
- +3% per mechanical-issue event in history
- If crash triggers:
  - 60% chance = heavy damage: +8 positions, tireWear +30 (recoverable)
  - 40% chance = DNF: race ends immediately, position = 20

Add `isDNF: boolean` and `crashEvents: number` to RaceState. Show a special crash event card in UI.

**Files:**
- `packages/engine/src/types.ts` - Add crash fields
- `packages/engine/src/clamp.ts` - Add crash check function
- `packages/engine/src/race-engine.ts` - Call crash check after resolve
- `packages/content/data/strings.json` - Add crash flavor texts
- UI: Show crash event in EventCard, handle DNF in race-complete

## 5. Background Image on Home Menu
**Problem:** Plain dark background on HomeScreen.
**Solution:**
- Create `apps/web/public/images/backgrounds/` folder
- Add a CSS background with gradient overlay on HomeScreen
- User will add their image to the folder

**Files:** `HomeScreen.tsx` - Add background image with dark gradient overlay.

## Implementation Order
1. Engine mechanics first (SC, crash) - since they affect gameplay
2. UI fixes (mulligan bottom sheet, quit button, background)
3. Test everything together
