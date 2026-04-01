# Implementation Plan

## Header

- Project: `Age of War`
- Owner: `Game Developer`
- Date: `2026-03-31`
- Status: `approved`

## Build Strategy

1. Add a lightweight combat-audio event queue to the simulation layer so SFX hook into authoritative gameplay without changing rules.
2. Add a shared synthesized audio controller for browser-safe unlock behavior, low-mix battle music, SFX playback, and persisted on/off state.
3. Add one small reusable top-right speaker toggle for the title and battle scenes.
4. Wire the battle scene to start/stop music and consume combat audio events.
5. Refresh only the request-affected docs and current-loop artifacts after verification.

## Planned Code Changes

| Area | Planned change |
| --- | --- |
| [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts) | Add match audio event types to the shared runtime contract. |
| [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) | Emit combat audio events for projectiles, melee hits, supers, deaths, and base damage/destruction. |
| [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts) | Add regression coverage for the new audio event surface. |
| `src/game/audio/*` | Add the synthesized audio controller and persisted preference helper. |
| [`src/game/ui/audioToggle.ts`](/Users/davis.wang/Documents/aow/src/game/ui/audioToggle.ts) | Add a shared fixed-corner speaker toggle helper. |
| [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts) | Add the title-scene toggle and unlock flow. |
| [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts) | Add battle music lifecycle, event consumption, and battle-scene toggle placement. |
| [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts) | Add speaker and muted icon textures to the generated HUD icon set. |

## Verification Plan

- `npm run test`
- `npm run build`
- local browser verification covering:
  - title-screen speaker toggle render
  - battle-scene speaker toggle render
  - no visible HUD/camera regressions
  - direct `?scene=battle` boot path still works
  - request-affected docs refreshed after the runtime work is stable
