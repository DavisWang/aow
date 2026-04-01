# Existing Project Intake

## Header

- Project: `Age of War`
- Owner: `Producer`
- Date: `2026-03-31`
- Requested outcome: add low-mix background music, combat sound effects, and an inconspicuous corner toggle that turns sound and music on or off without disturbing the current five-age browser build
- Active platform profile: `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/platforms/browser-first.md`

## Current Playable State

The repo is an existing `Phaser` + `TypeScript` + `Vite` browser game with a playable five-age lane battler already in place.

Observed current state for this intake:
- Title screen renders and starts the battle scene.
- `?scene=battle` still loads the battle scene directly.
- Standard mode and `TEST MODE` both work as current entry paths.
- The player and AI can progress from `Prehistoric` through `Future`.
- Units, towers, supers, projectiles, generated art, HUD controls, and replay flow are already live.
- The HUD remains camera-anchored and the top-left utility controls are already occupied by `SUPER` and `ADVANCE`.
- No music, no sound effects, no audio preference persistence, and no mute toggle exist yet.

Baseline verification completed on `2026-03-31`:
- `npm run test`: `pass` (`17/17` tests)
- `npm run build`: `pass` (existing bundle-size warning unchanged)
- local dev server responding at `http://127.0.0.1:4174/`

## Docs Reviewed

- [`AGENTS.md`](/Users/davis.wang/Documents/aow/AGENTS.md)
- [`README.md`](/Users/davis.wang/Documents/aow/README.md)
- [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md)
- [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md)
- [`docs/RELEASE_v0.1.0.md`](/Users/davis.wang/Documents/aow/docs/RELEASE_v0.1.0.md)
- [`CHANGELOG.md`](/Users/davis.wang/Documents/aow/CHANGELOG.md)
- [`docs/project/00-existing-project-intake.md`](/Users/davis.wang/Documents/aow/docs/project/00-existing-project-intake.md)
- [`docs/project/01-work-order.md`](/Users/davis.wang/Documents/aow/docs/project/01-work-order.md)
- [`docs/project/04-implementation-plan.md`](/Users/davis.wang/Documents/aow/docs/project/04-implementation-plan.md)
- [`docs/project/05-build-note.md`](/Users/davis.wang/Documents/aow/docs/project/05-build-note.md)
- [`docs/project/06-test-verdict.md`](/Users/davis.wang/Documents/aow/docs/project/06-test-verdict.md)
- [`docs/project/07-mock-player-memo.md`](/Users/davis.wang/Documents/aow/docs/project/07-mock-player-memo.md)
- [`docs/project/08-release-backlog-summary.md`](/Users/davis.wang/Documents/aow/docs/project/08-release-backlog-summary.md)
- [`docs/project/09-future-directions.md`](/Users/davis.wang/Documents/aow/docs/project/09-future-directions.md)
- [`docs/project/10-performance-plan.md`](/Users/davis.wang/Documents/aow/docs/project/10-performance-plan.md)
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/index.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/workflows/game-lifecycle.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/platforms/browser-first.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/roles/producer.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/templates/existing-project-intake.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/templates/work-order.md`

## Code Areas Reviewed

- [`src/main.ts`](/Users/davis.wang/Documents/aow/src/main.ts)
- [`src/game/config.ts`](/Users/davis.wang/Documents/aow/src/game/config.ts)
- [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts)
- [`src/game/data/ages.ts`](/Users/davis.wang/Documents/aow/src/game/data/ages.ts)
- [`src/game/data/prehistoric.ts`](/Users/davis.wang/Documents/aow/src/game/data/prehistoric.ts)
- [`src/game/data/medieval.ts`](/Users/davis.wang/Documents/aow/src/game/data/medieval.ts)
- [`src/game/data/renaissance.ts`](/Users/davis.wang/Documents/aow/src/game/data/renaissance.ts)
- [`src/game/data/modern.ts`](/Users/davis.wang/Documents/aow/src/game/data/modern.ts)
- [`src/game/data/future.ts`](/Users/davis.wang/Documents/aow/src/game/data/future.ts)
- [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts)
- [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts)
- [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts)
- [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts)
- [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts)

## Current Run And Test Commands

- install: `npm install`
- run: `npm run dev`
- active local URL: `http://127.0.0.1:4174/`
- preview: `npm run preview`
- build: `npm run build`
- test: `npm run test`

## Known Bugs And Quality Gaps

- No shared audio layer exists for scene-to-scene music control, event-based SFX, or preference persistence.
- No audio assets exist in the repo today.
- The battle scene has no clean event surface for hit/death/projectile/super sounds; combat effects are visual-only.
- Browser autoplay rules will block background music unless audio is unlocked from a user gesture.
- Current docs still treat audio as missing or future work.

## Artifact Status

| Artifact | Status | Notes |
| --- | --- | --- |
| [`README.md`](/Users/davis.wang/Documents/aow/README.md) | `refresh_required` | Current scope still says audio is not included. |
| [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md) | `refresh_required` | Needs audio controls and sensory behavior after implementation. |
| [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md) | `refresh_required` | Needs the shared audio layer and event-routing boundary after implementation. |
| [`CHANGELOG.md`](/Users/davis.wang/Documents/aow/CHANGELOG.md) | `refresh_required` | Needs an audio-pass entry after implementation. |
| [`docs/RELEASE_v0.1.0.md`](/Users/davis.wang/Documents/aow/docs/RELEASE_v0.1.0.md) | `out_of_scope` | Historical release note; do not rewrite for this loop. |
| [`docs/project/00-existing-project-intake.md`](/Users/davis.wang/Documents/aow/docs/project/00-existing-project-intake.md) | `refresh_required` | The previous file described the March five-age expansion, not the current audio request. |
| [`docs/project/01-work-order.md`](/Users/davis.wang/Documents/aow/docs/project/01-work-order.md) | `refresh_required` | The previous file described the March five-age expansion, not the current audio request. |
| [`docs/project/04-implementation-plan.md`](/Users/davis.wang/Documents/aow/docs/project/04-implementation-plan.md) | `reusable` | Useful source material for preservation expectations only; not the active artifact for this loop. |
| [`docs/project/05-build-note.md`](/Users/davis.wang/Documents/aow/docs/project/05-build-note.md) | `reusable` | Captures the current five-age baseline and should remain as prior-loop evidence. |
| [`docs/project/06-test-verdict.md`](/Users/davis.wang/Documents/aow/docs/project/06-test-verdict.md) | `reusable` | Prior-loop validation still stands as baseline evidence. |
| [`docs/project/07-mock-player-memo.md`](/Users/davis.wang/Documents/aow/docs/project/07-mock-player-memo.md) | `reusable` | Already flags missing ceremony/feel, which supports the audio direction. |
| [`docs/project/08-release-backlog-summary.md`](/Users/davis.wang/Documents/aow/docs/project/08-release-backlog-summary.md) | `reusable` | Still valid backlog context; not the active artifact for this loop. |
| [`docs/project/09-future-directions.md`](/Users/davis.wang/Documents/aow/docs/project/09-future-directions.md) | `reusable` | Already names audio follow-up ideas; no rewrite needed during proposal intake. |
| [`docs/project/10-performance-plan.md`](/Users/davis.wang/Documents/aow/docs/project/10-performance-plan.md) | `out_of_scope` | Do not reopen unless the audio pass introduces measurable performance regressions. |
| [`src/main.ts`](/Users/davis.wang/Documents/aow/src/main.ts) | `reusable` | Bootstrap is already thin and can likely remain unchanged. |
| [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts) | `refresh_required` | Needs the fixed audio toggle and title-to-battle audio handoff behavior. |
| [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts) | `refresh_required` | Needs music lifecycle, toggle rendering, and SFX consumption. |
| [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) | `refresh_required` | Best place to emit clean combat audio events without changing gameplay rules. |
| [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts) | `refresh_required` | Should prove the event layer does not regress core combat behavior. |
| [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts) | `refresh_required` | Needs audio event contract types if the simulation emits them. |
| [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts) | `refresh_required` | Likely needs small speaker / muted icon textures for the corner toggle. |
| `src/game/audio/*` | `missing` | No shared audio controller, preference helper, or event-to-sound mapping exists. |
| `public/audio/*` | `missing` | No background music or sound-effect assets exist. |

## Recommended Loop Scope

- Refresh only the producer intake and work order now; do not rewrite the full artifact chain.
- If the proposal is approved, run a targeted implementation loop only on the stale or request-affected areas:
  - `TitleScene`
  - `BattleScene`
  - `match.ts`
  - `types.ts`
  - `art.ts`
  - missing audio folders/assets
  - request-affected docs
- Preserve the current five-age gameplay loop, test mode, camera behavior, HUD layout, and replay flow.
- Treat March project artifacts under [`docs/project/04-implementation-plan.md`](/Users/davis.wang/Documents/aow/docs/project/04-implementation-plan.md) through [`docs/project/10-performance-plan.md`](/Users/davis.wang/Documents/aow/docs/project/10-performance-plan.md) as prior-loop source material, not rewrite targets.
- Verify autoplay-safe unlock behavior, mute persistence, low-volume mix balance, and no UI/camera regressions before closing the implementation loop.
