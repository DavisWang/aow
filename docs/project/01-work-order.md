# Work Order

## Header

- Project: `Age of War`
- Work order ID: `AOW-2026-03-29-FIVE-AGE-01`
- Requester: `Davis Wang`
- Owner: `Producer`
- Project mode: `existing project`
- Phase: `brownfield work order`
- Active platform profile: `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/platforms/browser-first.md`

## Objective

Extend the current `Prehistoric -> Medieval` build into the full five-age playable ladder by adding `Renaissance`, `Modern`, and `Future` content while preserving the current browser-first loop.

## Requested Change

Generate the next three ages for the game and make them fully playable with:
- unit definitions
- tower definitions
- super behavior
- generated sprites and animations
- HUD/menu support
- AI progression through all ages
- verification of the updated playable build

## Existing Behavior To Preserve

- Title screen starts the game.
- `?scene=battle` continues to open the battle scene directly.
- The game remains a single-lane base-vs-base battler.
- The build queue, tower-slot model, camera edge scroll, replay flow, and desktop-first controls stay intact.
- `Prehistoric` and `Medieval` content remain playable instead of being replaced or broken.
- Existing scripts remain the local workflow:
  - `npm run dev`
  - `npm run preview`
  - `npm run test`
  - `npm run build`

## In Scope

- Add `Renaissance`, `Modern`, and `Future` to the shared age registry.
- Add enemy AI progression through the full five-age ladder.
- Add the new age units, towers, supers, projectiles, impacts, and base art.
- Update title/battle presentation and request-affected docs.
- Expand regression coverage beyond the first age-up.
- Verify the result through tests, build, and local browser checks.

## Out Of Scope

- Save/progression outside the current match.
- Audio.
- Mobile-specific UX redesign.
- Stack or platform changes.
- New game modes beyond the existing standard/test split.

## Inputs

- [`docs/project/00-existing-project-intake.md`](/Users/davis.wang/Documents/aow/docs/project/00-existing-project-intake.md)
- [`Age of War (AOW).md`](/Users/davis.wang/Documents/aow/Age%20of%20War%20%28AOW%29.md)
- [`README.md`](/Users/davis.wang/Documents/aow/README.md)
- [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md)
- [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md)
- [`CHANGELOG.md`](/Users/davis.wang/Documents/aow/CHANGELOG.md)
- [`src/game/data/ages.ts`](/Users/davis.wang/Documents/aow/src/game/data/ages.ts)
- [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts)
- [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts)
- [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts)
- [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts)

## Artifact Routing

| Artifact | Status | Action |
| --- | --- | --- |
| [`docs/project/00-existing-project-intake.md`](/Users/davis.wang/Documents/aow/docs/project/00-existing-project-intake.md) | `approved` | Use as the current-state source of truth for this loop. |
| [`README.md`](/Users/davis.wang/Documents/aow/README.md) | `refresh_required` | Update current scope and feature list after implementation. |
| [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md) | `refresh_required` | Reflect the full age ladder and the new content sets. |
| [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md) | `refresh_required` | Reflect the final registry, AI, projectile, and art coverage. |
| [`CHANGELOG.md`](/Users/davis.wang/Documents/aow/CHANGELOG.md) | `refresh_required` | Add the three-age expansion summary. |
| `src/game/data/*` | `missing` | Add Renaissance, Modern, and Future content modules. |
| [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts) | `refresh_required` | Extend IDs and projectile styles for the remaining ages. |
| [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) | `refresh_required` | Extend progression and keep scene/runtime coupling low. |
| [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts) | `refresh_required` | Add ladder-wide regression coverage. |
| [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts) | `refresh_required` | Add late-age captions, labels, and projectile behavior. |
| [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts) | `refresh_required` | Update title-screen messaging and hero presentation. |
| [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts) | `refresh_required` | Add Renaissance/Modern/Future textures and animations. |

## Constraints

- Preserve the current feel before the first age-up.
- Stay consistent with the existing generated 8-bit sprite language.
- Keep age-specific content data-driven where possible.
- Prefer extending the shared contracts over adding one-off late-age conditionals.
- If a spec slot is blank, keep the chosen default visible in the handoff instead of pretending it was specified.

## Escalation Boundary

The owner may decide alone:
- names and silhouettes for later-age units/towers left blank in the source spec
- balance tuning inside the new ages
- render style within the current generated 8-bit direction
- doc refresh for the changed scope

The owner must escalate if:
- the requested expansion requires a different core progression model than in-match age-ups
- the current art direction is no longer acceptable for the new content
- preserving the current battle flow conflicts with a fully playable five-age implementation

## Done When

- The player can advance from `Prehistoric` through `Future` during a match.
- The enemy can also reach the late ages through the AI loop.
- The new units, towers, bases, supers, sprites, and animations all appear in live gameplay.
- Existing two-age content remains intact and playable.
- `npm run test` passes.
- `npm run build` passes.
- A local browser verification pass confirms the expanded age-up flow and later-age content.

## Next Owner

- `Game Developer`
