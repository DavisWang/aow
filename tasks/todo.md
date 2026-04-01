# Age of War v0.1 Release Prep

## 2026-03-31 Audio Mix Retune

### Plan

- [x] Audit the current synthesized music voicing and SFX gain staging after user feedback.
- [x] Replace the harsher detuned/gliding battle loop with a more consonant progression and softer voicing.
- [x] Pull the SFX bus and per-event levels down so supers and other combat cues sit below the previous mix.
- [x] Re-run `npm run test` and `npm run build`.

### Review

- Retuned [`src/game/audio/controller.ts`](/Users/davis.wang/Documents/aow/src/game/audio/controller.ts) to use a simpler, more consonant four-bar battle progression with softer pad, bass, and lead voicing.
- Removed the harsher music-side detune/glide choices that were making the loop sound dissonant.
- Reduced overall SFX gain and cut per-event volumes substantially, with the largest reductions applied to:
  - `super-cast`
  - base-hit / base-destroyed pulses
  - projectile impact families
- Softened the mix compressor so the audio bus feels less aggressive overall.
- Verification:
  - `npm run test` passes
  - `npm run build` passes

## 2026-03-31 Audio Rewrite 2

### Plan

- [x] Scrap the current synthesized music and SFX design instead of layering another small retune on top.
- [x] Replace the battle theme with a new consonant score and simpler instrumentation.
- [x] Replace the combat SFX palette with a new quieter family set while preserving the existing audio toggle and event routing.
- [x] Re-run `npm run test` and `npm run build`.

### Review

- Replaced [`src/game/audio/controller.ts`](/Users/davis.wang/Documents/aow/src/game/audio/controller.ts) with a new implementation rather than incrementally patching the prior synth design.
- The new music loop now uses a straightforward diatonic `D minor -> Bb -> F -> C` progression with softer pad, bass, lead, and percussion voices.
- The new SFX set was rebuilt from scratch around quieter filtered-noise and sine/triangle tones, with far lower transient levels than the first audio pass.
- Preserved the existing scene wiring, toggle behavior, unlock flow, and match-event routing so the rewrite stayed isolated to the audio layer.
- Verification:
  - `npm run test` passes
  - `npm run build` passes

## 2026-03-30 Omega Range Ceiling

### Plan

- [x] Raise `Omega Colossus` range above the tower ceiling without overshooting more than needed.
- [x] Add a regression that locks `Omega Colossus` above the max tower range.
- [x] Re-run `npm run test` and `npm run build`.

### Review

- Increased `Omega Colossus` range in `src/game/data/future.ts` from `300` to `520`, which now clears the current tower ceiling of `490`.
- Added a range-ceiling regression in `src/game/data/ageBalance.test.ts` so future tower buffs cannot silently undo the capstone unit’s intended siege reach.
- Verification:
  - `npm run test` passes
  - `npm run build` passes

## 2026-03-30 Unit Speed And Duel Ordering

### Plan

- [x] Audit same-age unit duels to find where lower-cost ranged units are beating higher-cost units in 1v1s.
- [x] Nerf `Plasma Ranger` range and speed up the roster generally, with larger movement buffs on mega units and `Omega Colossus`.
- [x] Tune the remaining same-age offenders so higher-cost units are favored in 1v1s.
- [x] Add regression coverage for same-age duel ordering and the `Omega Colossus` vs `Plasma Ranger` matchup.
- [x] Re-run `npm run test` and `npm run build`.

### Review

- Increased movement speed across the full unit roster, with the largest gains on mega units:
  - `Dino Rider`, `Knight`, `Cavalier`, `Tank`, `Titan Walker`, and `Omega Colossus`
- Nerfed overly long ranged pressure on:
  - `Plasma Ranger` in `src/game/data/future.ts`
  - `Cannoneer` in `src/game/data/renaissance.ts`
  - `Machine Gunner` in `src/game/data/modern.ts`
- Updated `Tank` engagement stats so it now properly beats `Machine Gunner` in a same-age duel instead of dying before firing.
- Expanded `src/game/systems/match.test.ts` to lock:
  - same-age higher-cost units beating lower-cost units in 1v1 duels
  - `Omega Colossus` staying favored over `Plasma Ranger`
- Verification:
  - `npm run test` passes
  - `npm run build` passes

## 2026-03-30 Camera Edge Scroll Safe Zone

### Plan

- [x] Trace the pointer-driven camera scroll path around the top controls and confirm why HUD clicks can trigger horizontal pan.
- [x] Narrow the edge-scroll activation zone in the top screen band while preserving the wider edge zone across the rest of the battlefield.
- [x] Add a regression for the top-band edge-scroll carveout.
- [x] Re-run `npm run test` and `npm run build`.

### Review

- Moved the edge-scroll math into `src/game/ui/cameraScroll.ts` and updated `src/game/scenes/BattleScene.ts` to use a narrower activation zone across the top `240px` of the screen.
- Added left/right arrow-key camera panning through the same helper path so keyboard and pointer scrolling share one movement rule.
- Added `src/game/ui/cameraScroll.test.ts` to lock the intended carveout:
  - no pan when the pointer is in the top band but not hugging the edge
  - pan still works in the top band at the literal screen edge
  - the wider activation zone still applies deeper in the battlefield
  - left/right arrows pan the camera horizontally
- Verification:
  - `npm run test` passes
  - `npm run build` passes

## 2026-03-30 Future Ultimate Unit

### Plan

- [x] Review the current `Future` roster, approved unit proposal, and unit-menu layout constraint.
- [x] Add the approved capstone `Future` unit definition plus AI access.
- [x] Add art/animation coverage and widen the unit menu for 4-card ages.
- [x] Add a combat regression for the approved `Omega Colossus` vs `Titan Walker` matchup intent.
- [x] Re-run `npm run test` and `npm run build`.

### Review

- Added `Omega Colossus` to `src/game/data/future.ts` as a fourth `Future` unit and extended the late-game enemy AI script so the capstone unit can enter live battles.
- Followed up on live playtest feedback by tuning `Omega Colossus` upward through cost/build-time/speed/off-threshold damage instead of HP, so it feels better without breaking the `2 Titans wins / 4 Titans loses` envelope.
- Added art and animation coverage for the new boss unit in `src/game/render/art.ts`.
- Updated `src/game/scenes/BattleScene.ts` so the unit menu scales to 4-card ages instead of clipping the `Future` roster.
- Added a combat regression in `src/game/systems/match.test.ts` that locks the approved matchup envelope:
  - `1 Omega Colossus` beats `2 Titan Walkers`
  - `1 Omega Colossus` loses to `4 Titan Walkers`
- Standardized every age super to a shared `45s` cooldown and added a regression in `src/game/data/ageBalance.test.ts`.
- Verification:
  - `npm run test` passes
  - `npm run build` passes

## 2026-03-30 Hard Breakpoint Balance Pass

### Plan

- [x] Audit the current cross-age hit-count relationships for units, towers, and supers.
- [x] Rebalance age data so 2-age-up attackers generally kill lower-age non-mega units in 1-2 hits, with looser mega-unit exceptions.
- [x] Add regression coverage for the 2-age breakpoint rule.
- [x] Re-run `npm run test` and `npm run build`.

### Review

- Rebalanced core age data in:
  - `src/game/data/prehistoric.ts`
  - `src/game/data/medieval.ts`
  - `src/game/data/renaissance.ts`
  - `src/game/data/modern.ts`
  - `src/game/data/future.ts`
- Added breakpoint regression coverage in:
  - `src/game/data/ageBalance.test.ts`
- New 2-age gap summary:
  - Renaissance vs Prehistoric: units non-mega `<= 2` hits, towers `<= 2`, super `<= 2`, melee vs mega `4`
  - Modern vs Medieval: units non-mega `<= 1` hit, towers `<= 2`, super `<= 2`, melee vs mega `3`
  - Future vs Renaissance: units non-mega `<= 1` hit, towers `<= 2`, super `<= 1`, melee vs mega `2`
- Verification:
  - `npm run test` passes
  - `npm run build` passes

## 2026-03-30 Tower UI Cleanup

### Plan

- [x] Review the screenshot and trace the current top-control, tower-selection, and menu-label render path.
- [x] Simplify the super and age button labels while preserving the icon-led treatment.
- [x] Remove tower health bars and move tower selling onto a floating close action over the selected tower.
- [x] Simplify shop-card label styling so names and prices read cleanly without muddy stacking.
- [x] Re-run `npm run test` and `npm run build`.

### Review

- Updated `src/game/scenes/BattleScene.ts` to:
  - change the top-control labels to `SUPER` and `ADVANCE`
  - remove the HUD sell button
  - add a floating `X` sell action over the selected player tower
  - hide tower health bars
  - split shop-card names and prices into dedicated text objects so generic button state styling no longer muddies the labels
- Updated `tasks/lessons.md` with the screenshot-driven UI readability lesson from this correction loop.
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - local preview confirmed at `http://127.0.0.1:4190/`

## 2026-03-29 Combat UX And Performance Follow-Up

### Plan

- [x] Trace the request-affected gameplay, HUD, menu, and tower-targeting code paths.
- [x] Add tower selling, shared tower firing range, and battlefield tower-selection UX without changing unrelated combat rules.
- [x] Refresh the buy menus and top controls so labels stay readable, build times are removed from unit purchases, and super/age actions use sprite-led buttons.
- [x] Remove built-tower captions from the battlefield and add the minimal sell affordance needed to replace them.
- [x] Write a concrete frame-rate plan tied to the actual hot paths in the current implementation.
- [x] Re-run `npm run test` and `npm run build`.

### Review

- Updated gameplay and HUD flow in:
  - `src/game/systems/match.ts`
  - `src/game/scenes/BattleScene.ts`
  - `src/game/render/art.ts`
- Added regression coverage in:
  - `src/game/systems/match.test.ts`
- Refreshed harness overlay artifacts in:
  - `docs/project/04-implementation-plan.md`
  - `docs/project/10-performance-plan.md`
- Requested outcomes covered:
  - tower sell flow with refund
  - no battlefield tower labels
  - shared tower targeting regardless of tower slot order
  - sprite-based super and age buttons
  - unit menu labels without build times
  - stronger unit/tower menu label readability without clipping
  - concrete frame-rate mitigation plan based on current hot paths
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - local preview confirmed at `http://127.0.0.1:4188/`

## Plan

- [x] Set up Phaser + TypeScript + Vite app shell.
- [x] Implement prehistoric data definitions and typed runtime contracts.
- [x] Build title screen and battle scene.
- [x] Implement unit, tower, projectile, super, economy, and enemy AI systems.
- [x] Document the current architecture, release scope, and local workflow.
- [x] Run final release verification for `v0.1.0`.
- [x] Create the GitHub repository and push `main`.
- [x] Confirm the GitHub Pages deployment path is wired correctly.

## Review

- Release docs added:
  - `README.md`
  - `CHANGELOG.md`
  - `CONTRIBUTING.md`
  - `docs/ARCHITECTURE.md`
  - `docs/GAMEPLAY.md`
  - `docs/RELEASE_v0.1.0.md`
- Release automation added:
  - `.github/workflows/deploy-pages.yml`
- Final verification:
  - `npm run test` passes
  - `npm run build` passes
- Published outputs:
  - repository: `https://github.com/DavisWang/aow`
  - live site: `https://daviswang.github.io/aow/`
- Remaining non-blocker:
  - production bundle is still large because Phaser ships as a large chunk

## 2026-03-29 Art Polish Loop

### Plan

- [x] Read the existing repo docs, code, and the Pwner Studios producer workflow artifacts.
- [x] Capture the current playable state, run/test commands, and request-affected surfaces.
- [x] Create the harness overlay artifacts under `docs/project/`.
- [x] Add a dedicated generated-art layer for sprites, UI textures, and render-only effects.
- [x] Refresh the title and battle scenes without changing gameplay logic.
- [x] Re-run browser/build/test verification and refresh current-state docs.

### Review

- Added generated sprite art and light animation polish through:
  - `src/game/render/art.ts`
  - `src/game/scenes/TitleScene.ts`
  - `src/game/scenes/BattleScene.ts`
- Added producer artifacts:
  - `docs/project/00-existing-project-intake.md`
  - `docs/project/01-work-order.md`
- Refreshed current-state docs:
  - `README.md`
  - `docs/ARCHITECTURE.md`
  - `CHANGELOG.md`
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - local browser captures taken from the preview build at `http://127.0.0.1:4180/`
- Preserved behavior boundaries:
  - no gameplay-system changes in `src/game/systems/match.ts`
  - no balance or AI tuning changes

## 2026-03-29 Sprite Overflow Fix

### Plan

- [x] Reproduce the sprite-fit regressions in the updated title/battle presentation layer.
- [x] Constrain sprite-driven render surfaces to explicit bounds without changing gameplay logic.
- [x] Re-run browser/build/test verification.

### Review

- Added a reusable sprite fit helper in `src/game/render/art.ts`.
- Tightened sprite bounds for:
  - title hero art
  - base/unit/tower scene sprites
  - unit and tower purchase-menu icons
- Re-fit menu copy after moving it below the icon area so the icon+label stack no longer relies on overflow-prone spacing.
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - browser screenshots re-captured from the local preview

## 2026-03-29 Health Bar Polish

### Plan

- [x] Inspect the current sprite-era health bar treatment in the live battle scene.
- [x] Tighten the health-bar render helper so the bar reads clearly as HP without affecting mechanics.
- [x] Re-run browser/build/test verification.

### Review

- Updated `src/game/scenes/BattleScene.ts` health-bar rendering only:
  - replaced the washed-out empty segment with a proper damage-track color
  - aligned the fill to the full inner track
  - added a subtle highlight so the fill reads as health rather than a generic progress strip
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - browser screenshot re-captured from the local preview at `http://127.0.0.1:4183/?scene=battle`

## 2026-03-29 Projectile Effects Refresh

### Plan

- [x] Inspect the current projectile and hit-effect render path in the battle scene.
- [x] Replace the existing projectile sprites and impact visuals without touching combat logic.
- [x] Re-run build/test verification and do a browser spot check on the updated battle scene.

### Review

- Updated `src/game/render/art.ts`:
  - added distinct animated projectile sprite frames for stone, fossil, ember, and meteor shots
  - replaced the generic radial hit effect with projectile-specific impact textures so hits no longer read like a sunburst
- Updated `src/game/scenes/BattleScene.ts`:
  - switched projectile views to animated sprites
  - added style-specific in-flight motion so rocks and fossils spin while ember and meteor shots feel directional
  - preserved the existing simulation and damage behavior
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - browser spot check re-run against the local preview at `http://127.0.0.1:4183/?scene=battle`

## 2026-03-29 Test Mode

### Plan

- [x] Trace how the title scene launches battles and where match state is initialized.
- [x] Add a title-screen test-mode entry point without changing standard-mode behavior.
- [x] Apply test-mode-only overrides for resources, XP, enemy pressure, and super cooldowns.
- [x] Re-run build/test verification and spot-check the title and battle scenes in the browser.

### Review

- Updated `src/game/scenes/TitleScene.ts`:
  - added a `TEST MODE` button beside `NEW GAME`
  - launches battle with explicit mode data instead of overloading standard mode
- Updated `src/game/scenes/BattleScene.ts`:
  - carries the selected mode through create/retry flows
  - in test mode, pins player money and XP to high values
  - removes the player super cooldown by resetting readiness each frame
  - pins enemy money high and keeps the enemy queue filled so waves stay constant
  - adds a visible test-mode subtitle in the battle header
- Updated `src/game/types.ts`:
  - added the shared `MatchMode` type
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - browser spot check confirmed the new title button and the test-mode battle launch

## 2026-03-29 Base Grounding Fix

### Plan

- [x] Inspect the base render stack to confirm whether the hover read comes from state positioning or sprite geometry.
- [x] Fix the grounded look in the render layer only.
- [x] Re-run build/test verification and spot-check the battle scene.

### Review

- Updated `src/game/render/art.ts`:
  - extended the visible base foundation down into the previously empty lower part of the sprite texture
  - preserved the existing gameplay/base position while making the sprite sit on the ground visually
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - browser spot check re-run against `http://127.0.0.1:4183/?scene=battle`

## 2026-03-29 Medieval Age Expansion

### Plan

- [x] Normalize the Medieval-age request into the current brownfield overlay artifacts and repo task tracker.
- [x] Refactor the age/content layer so the match can progress beyond the prehistoric slice without hard-coded prehistoric assumptions.
- [x] Add a fully playable Medieval age:
  - player and enemy age progression
  - Medieval units, towers, base, and super definitions
  - Medieval AI behavior
  - Medieval sprite and animation coverage
- [x] Update the battle HUD, purchase menus, and age-up UX so the next-age button actually works.
- [x] Refresh stale docs for the new playable scope.
- [x] Re-run `npm run test`, `npm run build`, and a local browser verification pass.

### Review

- Added a shared age registry and new Medieval content through:
  - `src/game/data/ages.ts`
  - `src/game/data/medieval.ts`
  - `src/game/data/prehistoric.ts`
- Refactored the simulation layer for side-aware ages and functional age-up logic in:
  - `src/game/systems/match.ts`
  - `src/game/types.ts`
- Added regression coverage in:
  - `src/game/systems/match.test.ts`
- Updated live UI and generated art for Medieval progression in:
  - `src/game/scenes/BattleScene.ts`
  - `src/game/scenes/TitleScene.ts`
  - `src/game/render/art.ts`
- Refreshed request-affected docs:
  - `README.md`
  - `docs/GAMEPLAY.md`
  - `docs/ARCHITECTURE.md`
  - `CHANGELOG.md`
- Closed the lightweight harness loop with:
  - `docs/project/04-implementation-plan.md`
  - `docs/project/05-build-note.md`
  - `docs/project/06-test-verdict.md`
  - `docs/project/07-mock-player-memo.md`
  - `docs/project/08-release-backlog-summary.md`
  - `docs/project/09-future-directions.md`
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - local browser preview checked at `http://127.0.0.1:4174/?scene=battle&mode=test`
  - browser evidence confirmed the updated HUD and enemy Medieval progression in live play
- Remaining verification gap:
  - player-side age-up click path was covered by regression test and code-path review, but full browser canvas-click automation was unreliable in this environment

## 2026-03-29 Full Age Ladder Expansion

### Plan

- [x] Refresh the current harness artifacts for the remaining age-expansion request and record the chosen creative assumptions where the product spec leaves blanks.
- [x] Add fully playable `Renaissance`, `Modern`, and `Future` ages to the shared age registry, including AI progression across all five ages.
- [x] Add unit, tower, base, super, projectile, and impact art/animation coverage for the three new ages.
- [x] Update title/battle presentation, captions, and docs for the full five-age playable build.
- [x] Expand regression coverage and re-run browser/build/test verification.

### Review

- Added the remaining age content in:
  - `src/game/data/renaissance.ts`
  - `src/game/data/modern.ts`
  - `src/game/data/future.ts`
  - `src/game/data/ages.ts`
- Expanded the shared contracts and regression coverage in:
  - `src/game/types.ts`
  - `src/game/systems/match.test.ts`
- Extended live presentation and generated art for the full ladder in:
  - `src/game/scenes/BattleScene.ts`
  - `src/game/scenes/TitleScene.ts`
  - `src/game/render/art.ts`
- Refreshed request-affected docs and close-out artifacts:
  - `README.md`
  - `docs/GAMEPLAY.md`
  - `docs/ARCHITECTURE.md`
  - `CHANGELOG.md`
  - `docs/project/05-build-note.md`
  - `docs/project/06-test-verdict.md`
  - `docs/project/07-mock-player-memo.md`
  - `docs/project/08-release-backlog-summary.md`
  - `docs/project/09-future-directions.md`
- Verification:
  - `npm run test` passes
  - `npm run build` passes
  - local preview rendered at `http://127.0.0.1:4186/?scene=battle&mode=test`
- Remaining verification gap:
  - full browser automation for Phaser canvas clicks is still unreliable in this environment, so browser validation confirmed load/HUD state while ladder-wide progression remains primarily covered by the regression test
