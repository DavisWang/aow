# Work Order

## Header

- Project: `Age of War`
- Work order ID: `AOW-2026-03-31-AUDIO-01`
- Requester: `Davis Wang`
- Owner: `Producer`
- Project mode: `existing project`
- Phase: `brownfield work order`
- Active platform profile: `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/platforms/browser-first.md`

## Objective

Add a browser-safe audio pass that gives the current five-age build a stronger sense of momentum and impact through low-mix triumphant background music, readable combat sound effects, and a small corner toggle that turns all audio on or off without disturbing the existing gameplay loop or HUD/camera stability.

## Requested Change

The requested change is to add:
- background music that feels triumphant, magnificent, and battle-appropriate while staying quiet in the mix
- combat sound effects for supers, hits, deaths, tower/projectile fire, and related battlefield impacts
- one inconspicuous fixed-corner toggle that turns sound and music on or off

## Proposal

| Surface | Proposal | Why |
| --- | --- | --- |
| Music shape | Ship one shared `battle-theme` loop for v1 instead of per-age tracks. | Meets the request without exploding asset scope. |
| Music timing | Start music only after a user interaction unlocks audio; keep it scoped to the battle flow. | Browser autoplay rules require a user gesture. |
| Music mix | Target a low base volume, roughly `0.12-0.16`, with SFX slightly above it. | Matches the request to keep music present but not loud. |
| SFX palette | Use a compact family-based set keyed off combat events: `ui`, `projectile_launch`, `projectile_impact`, `entity_hit`, `entity_death`, `super_cast`, `base_hit`, `base_destroyed`, `result_sting`. `entity_hit` explicitly covers melee contact hits as well as non-lethal damage events. | High coverage without needing a unique clip for every unit. |
| Event routing | Add a lightweight combat-audio event queue in the simulation layer, then let the battle scene consume and play sounds. | Cleaner and more testable than trying to infer all sounds from frame diffs. |
| Toggle placement | Put a small viewport-anchored speaker button in the top-right corner on title and battle scenes. | Keeps it inconspicuous and avoids the battle scene's existing top-left controls. |
| Preference behavior | Persist a single `audioEnabled` preference in `localStorage`; the toggle controls both music and SFX together. | Matches the request for one on/off control. |
| Asset strategy | Use in-browser synthesized audio through a shared controller under `src/game/audio/*`; add static files only if that quality bar fails later. | Keeps runtime deterministic, browser-first, and self-contained. |

## Existing Behavior To Preserve

- Title screen still starts the game.
- `?scene=battle` still opens the battle scene directly.
- The game remains a single-lane base-vs-base battler.
- Standard mode and `TEST MODE` continue to work.
- Current queue behavior, tower-slot behavior, top-left `SUPER` / `ADVANCE` controls, camera edge scroll, keyboard panning, and replay flow stay intact.
- Current gameplay balance and age-progression logic should not change unless required for non-invasive event emission.
- Existing local workflow remains:
  - `npm run dev`
  - `npm run preview`
  - `npm run test`
  - `npm run build`

## In Scope

- Add a shared audio controller layer for music, SFX playback, and persisted on/off state.
- Add one low-mix battle music loop.
- Add SFX coverage for:
  - supers
  - projectile launches
  - projectile impacts
  - non-lethal hits, including melee contact hits
  - unit deaths
  - base damage and base destruction
  - key UI confirms where useful
- Add a small fixed-corner audio toggle on the title and battle scenes.
- Make audio unlock behavior browser-safe after user interaction.
- Refresh only the request-affected docs after implementation.
- Verify the new behavior with targeted tests plus local browser checks.

## Out Of Scope

- Per-age bespoke music tracks.
- Full settings-menu work or separate sliders for music and SFX.
- Voiceover, announcer lines, or narrated UI.
- Mobile-specific audio/touch redesign.
- Core gameplay rebalance unrelated to audio.
- Stack, engine, or platform changes.

## Inputs

- [`docs/project/00-existing-project-intake.md`](/Users/davis.wang/Documents/aow/docs/project/00-existing-project-intake.md)
- [`README.md`](/Users/davis.wang/Documents/aow/README.md)
- [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md)
- [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md)
- [`CHANGELOG.md`](/Users/davis.wang/Documents/aow/CHANGELOG.md)
- [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts)
- [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts)
- [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts)
- [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts)
- [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts)
- [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts)
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/platforms/browser-first.md`
- `/Users/davis.wang/Documents/pwner-studios-dev-team/docs/contracts/roles/producer.md`

## Artifact Status Inputs

| Artifact | Status | Notes |
| --- | --- | --- |
| [`docs/project/00-existing-project-intake.md`](/Users/davis.wang/Documents/aow/docs/project/00-existing-project-intake.md) | `approved` | Use as the current-state source of truth for this audio loop. |
| [`README.md`](/Users/davis.wang/Documents/aow/README.md) | `refresh_required` | Audio scope will make the current feature list stale. |
| [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md) | `refresh_required` | Must document the toggle and audio-enabled battle feedback. |
| [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md) | `refresh_required` | Must document the shared audio controller and event boundary. |
| [`CHANGELOG.md`](/Users/davis.wang/Documents/aow/CHANGELOG.md) | `refresh_required` | Must record the audio pass. |
| [`src/main.ts`](/Users/davis.wang/Documents/aow/src/main.ts) | `reusable` | No evidence yet that bootstrap needs structural change. |
| [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts) | `refresh_required` | Needs the audio toggle and title-side audio behavior. |
| [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts) | `refresh_required` | Needs music lifecycle, toggle placement, and SFX playback. |
| [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) | `refresh_required` | Needs clean combat event emission for audio. |
| [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts) | `refresh_required` | Needs regression coverage for the new non-gameplay event surface. |
| [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts) | `refresh_required` | Needs audio event type definitions if the simulation emits them. |
| [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts) | `refresh_required` | Likely needs a tiny speaker/muted icon texture. |
| `src/game/audio/*` | `missing` | Shared audio controller and catalog do not exist yet. |
| `public/audio/*` | `out_of_scope` | This loop is planned around synthesized in-browser audio rather than static asset files. |
| [`docs/project/04-implementation-plan.md`](/Users/davis.wang/Documents/aow/docs/project/04-implementation-plan.md) through [`docs/project/10-performance-plan.md`](/Users/davis.wang/Documents/aow/docs/project/10-performance-plan.md) | `out_of_scope` | Keep as prior-loop evidence unless the implementation loop later requires fresh specialist artifacts. |

## Constraints

- Preserve current working behavior unless the request explicitly changes it.
- Keep the toggle visually quiet and anchored to the viewport.
- Respect browser autoplay constraints; no broken or noisy first-load behavior.
- Keep music intentionally quieter than combat feedback.
- Prefer event-driven audio over scene-side guesswork.
- Avoid a full repo-wide artifact rewrite; refresh only stale or request-affected areas.

## Escalation Boundary

The owner may decide alone:
- the exact corner placement and icon treatment for the audio toggle
- family grouping for SFX
- default mix levels inside the requested quiet aesthetic
- whether the battle music starts on title interaction or battle start, as long as autoplay rules are respected
- the code architecture for the shared audio controller and event queue

The owner must escalate to the user if:
- the preferred quality bar requires externally sourced or licensed audio assets instead of in-repo generated/authored assets
- the requested musical direction expands from one battle loop to a larger adaptive or per-age soundtrack system
- the audio pass forces a broader settings UI or a platform/runtime change

## Done When

- The current local build still boots and plays normally.
- One low-volume battle music loop is in place and browser-safe.
- Core combat moments have readable SFX:
  - supers
  - hits, including melee contact hits
  - deaths
  - projectile fire/impact
  - base damage/destruction
- A small corner toggle turns all audio on or off in both title and battle scenes.
- The audio preference persists across scene transitions and reloads.
- `npm run test` passes.
- `npm run build` passes.
- A local browser verification pass confirms no obvious HUD/camera/input regressions.

## Next Owner

- `User`
