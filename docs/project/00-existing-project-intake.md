# Existing Project Intake

## Header

- Project: `Age of War`
- Owner: `Producer`
- Date: `2026-03-29`
- Requested outcome: extend the current two-age playable build with the next three ages, `Renaissance`, `Modern`, and `Future`, including gameplay definitions, generated sprites/animations, supers, towers, and verification
- Active platform profile: `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/platforms/browser-first.md`

## Current Playable State

The repo is an existing Phaser + TypeScript + Vite browser game with a playable `Prehistoric -> Medieval` loop already wired.

Observed current state before this loop:
- Title screen renders and launches the battle scene.
- `?scene=battle` still loads the battle scene directly.
- Both sides can progress from `Prehistoric` to `Medieval`.
- The HUD already rebuilds unit/tower menus from the current player age.
- Generated sprite art and lightweight animation exist for:
  - prehistoric units, towers, projectiles, base, and super effects
  - medieval units, towers, projectiles, base, and super effects
- Runtime expectations remain stable:
  - `npm run dev`
  - `npm run preview`
  - `npm run test`
  - `npm run build`

## Docs Reviewed

- [`README.md`](/Users/davis.wang/Documents/aow/README.md)
- [`Age of War (AOW).md`](/Users/davis.wang/Documents/aow/Age%20of%20War%20%28AOW%29.md)
- [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md)
- [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md)
- [`CHANGELOG.md`](/Users/davis.wang/Documents/aow/CHANGELOG.md)
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/index.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/workflows/game-lifecycle.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/platforms/browser-first.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/roles/producer.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/roles/game-developer.md`

## Code Areas Reviewed

- [`src/game/data/ages.ts`](/Users/davis.wang/Documents/aow/src/game/data/ages.ts)
- [`src/game/data/prehistoric.ts`](/Users/davis.wang/Documents/aow/src/game/data/prehistoric.ts)
- [`src/game/data/medieval.ts`](/Users/davis.wang/Documents/aow/src/game/data/medieval.ts)
- [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts)
- [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts)
- [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts)
- [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts)
- [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts)
- [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts)
- [`src/game/config.ts`](/Users/davis.wang/Documents/aow/src/game/config.ts)

## Current Run And Test Commands

- run: `npm run dev`
- preview: `npm run preview`
- build: `npm run build`
- test: `npm run test`

## Known Gaps Relative To Request

- The age registry currently stops at `Medieval`.
- No gameplay definitions exist yet for:
  - `Renaissance`
  - `Modern`
  - `Future`
- No AI script coverage exists yet for late-game age progression.
- The art layer has no later-age unit, tower, projectile, impact, or base sprites.
- Title copy and docs still describe the scope as a two-age build.

## Creative Assumptions Locked For This Loop

The source spec leaves several late-age slots unnamed. The owner asked for implementation and gave permission to hand creative control back if needed, so this loop proceeds with explicit defaults instead of blocking.

| Surface | Spec gap | Chosen default |
| --- | --- | --- |
| Renaissance mega unit | blank | `Cavalier` |
| Renaissance Tower A | blank | `Arquebus Tower` |
| Renaissance Tower B | blank | `Bombard Tower` |
| Renaissance Tower C | blank | `Alchemist Tower` |
| Future ranged unit | blank | `Plasma Ranger` |
| Future mega unit | blank | `Titan Walker` |
| Future Tower A | blank | `Pulse Turret` |
| Future Tower B | blank | `Drone Bay` |
| Future base naming/theme | blank | `Future Citadel` |
| Future super spelling | spec says `Lazer cannon` | keep spec spelling in the user-facing name: `Lazer Cannon` |

## Artifact Status

| Artifact | Status | Notes |
| --- | --- | --- |
| [`README.md`](/Users/davis.wang/Documents/aow/README.md) | `refresh_required` | Current scope still reads like a two-age build. |
| [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md) | `refresh_required` | Gameplay docs need the full age ladder and new content sets. |
| [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md) | `refresh_required` | The architecture doc needs the final five-age registry and projectile coverage. |
| [`CHANGELOG.md`](/Users/davis.wang/Documents/aow/CHANGELOG.md) | `refresh_required` | Needs the three-age expansion note. |
| [`src/game/data/ages.ts`](/Users/davis.wang/Documents/aow/src/game/data/ages.ts) | `refresh_required` | Registry and AI routing stop at Medieval. |
| `src/game/data/*` | `missing` | Renaissance, Modern, and Future content modules do not exist yet. |
| [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts) | `refresh_required` | Age IDs and projectile visuals stop at the current two-age set. |
| [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) | `refresh_required` | Runtime is multi-age now, but it still needs later-age progression coverage and art-facing projectile support. |
| [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts) | `refresh_required` | Current regression coverage only proves the first age-up. |
| [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts) | `refresh_required` | Captions, labels, menus, and projectile animation handling need the late-game assets. |
| [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts) | `refresh_required` | Title copy and hero presentation should reflect all five ages. |
| [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts) | `refresh_required` | Renaissance/Modern/Future sprites and effects are missing. |

## Recommended Loop Scope

- Extend the age registry from two ages to the full five-age ladder.
- Add fully playable content for:
  - `Renaissance`
  - `Modern`
  - `Future`
- Preserve the current battle shape:
  - one lane
  - current camera behavior
  - queue model
  - current win/loss flow
- Keep the implementation data-driven instead of adding age-specific scene hacks.
- Refresh only the docs made stale by this request.

## Preservation Risks To Verify

- `Prehistoric` and `Medieval` content should still work before late-game progression occurs.
- The HUD should keep working as menus rebuild through more than one age transition.
- Late-age projectile visuals should not break the current impact and tint pipeline.
- Base upgrades should keep tower slots aligned through all five base silhouettes.
- Test mode should still provide fast access to the later ages for visual validation.
