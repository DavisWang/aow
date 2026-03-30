# Implementation Plan

## Header

- Project: `Age of War`
- Owner: `Game Developer`
- Date: `2026-03-29`
- Status: `approved`

## Build Strategy

1. Add the missing tower-sell interaction in the simulation layer first so the UI can stay thin.
2. Remove battlefield tower labels and replace them with explicit tower selection plus a sell button.
3. Normalize tower targeting around a shared frontline firing anchor so tower slot order stops affecting damage reach.
4. Refresh buy-menu readability and replace text-heavy utility buttons with compact sprite-led controls.
5. Capture a concrete frame-rate plan based on current hot loops rather than generic optimization advice.

## Planned Code Changes

| Area | Planned change |
| --- | --- |
| `src/game/systems/match.ts` | Add sell-tower support, expose refund values, remove tower-slot range penalties, and shave obvious repeated-scan hot paths. |
| `src/game/scenes/BattleScene.ts` | Add tower selection, sell affordance, icon-driven top controls, stronger menu labels, and remove battlefield tower captions. |
| `src/game/render/art.ts` | Add simple HUD icon textures for age-up and sell actions, and expose helper lookups for the new top controls. |
| `src/game/systems/match.test.ts` | Add regression coverage for selling towers and shared tower firing range behavior. |
| `docs/project/10-performance-plan.md` | Record likely bottlenecks, quick wins already landed, and the next optimization phases. |
| `tasks/todo.md` | Track the request-specific plan, review, and verification outcome. |

## Verification Plan

- `npm run test`
- `npm run build`
- local browser preview pass covering:
  - top-control icon buttons
  - buy-menu readability on unit and tower cards
  - tower selection and sell flow
  - no tower-label clutter on the battlefield
  - shared tower firing behavior during dense waves
