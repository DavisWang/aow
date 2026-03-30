# Performance Plan

## Header

- Project: `Age of War`
- Owner: `Game Developer`
- Date: `2026-03-29`
- Status: `proposed`

## What Is Likely Expensive Right Now

| Surface | Why it is expensive now | Suggested next move |
| --- | --- | --- |
| Unit targeting | Every unit scans the full entity list each tick to find enemies and spacing allies. | Split live units by side and keep lightweight frontline ordering so most unit decisions avoid full-list scans. |
| Tower targeting | Every tower scans all enemy units each tick, and late-game waves multiply that cost. | Cache enemy-unit lists per side and add a cheap forward-range candidate pass before exact checks. |
| Projectile impacts | Projectile resolution filters and sorts enemy lists on impact. | Replace sort-based nearest-hit resolution with a linear best-hit scan and pool projectile/impact views. |
| Scene cleanup | World-view teardown used repeated `.some()` / `.find()` checks against live arrays. | Landed in this pass with `Set`-based membership checks; keep this pattern for future sync work. |
| Per-frame layout work | Text fitting and sprite fit math are expensive when repeated every frame. | Keep layout work on creation or content change only; avoid calling fit helpers from steady-state update paths. |
| Object churn | Dense waves create and destroy many projectile, dust, and impact objects. | Introduce Phaser object pools for projectiles and short-lived effects. |

## Quick Wins Landed In This Pass

- Linearized nearest-target searches in the simulation instead of `filter(...).sort(...)` paths.
- Removed battlefield tower captions so the scene stops paying per-frame label upkeep for towers.
- Normalized tower targeting to a shared frontline firing anchor so damage reach no longer depends on buy order.
- Switched entity/projectile cleanup in the battle scene from repeated array scans to `Set` lookups.
- Moved more sprite-fitting work to creation/definition-change paths instead of repeating it every frame.

## Optimization Phases

### Phase 1: Measure Before Tuning

1. Add a lightweight debug overlay for FPS, unit count, projectile count, and active effect count.
2. Add a scripted load-test scene setup that spawns 40, 60, and 80-unit battle states on demand.
3. Record frame-time budgets for simulation, rendering, and object creation separately.

### Phase 2: Cheap Structural Wins

1. Cache per-side live unit arrays once per simulation tick.
2. Rework projectile impact resolution to use linear best-hit scans instead of sorting.
3. Cache HUD/menu text and only re-fit text when content actually changes.
4. Pool projectiles, dust bursts, and impact sprites instead of destroying and recreating them.

### Phase 3: Simulation Scaling

1. Maintain per-side frontline indices so melee units look near the front before scanning everything.
2. Add coarse horizontal buckets for unit and tower targeting queries.
3. Keep a shared per-side combat snapshot each tick so units and towers read from cached data instead of raw state arrays.

### Phase 4: Presentation Scaling

1. Reduce animation complexity or update frequency for distant/off-focus effects during heavy battles.
2. Cap or merge redundant hit effects when many projectiles land in the same window.
3. Consider lower-cost projectile visuals for extreme test-mode densities if the gameplay remains readable.

## Recommended Order

| Priority | Move | Why |
| --- | --- | --- |
| 1 | Add instrumentation + load test | Prevents guessing and makes every later optimization measurable. |
| 2 | Linearize projectile impact resolution | High leverage and low risk to gameplay behavior. |
| 3 | Pool transient visual objects | Likely to reduce GC spikes once wave density rises. |
| 4 | Cache per-side unit snapshots | Sets up the bigger scaling work without a large rewrite. |
| 5 | Add spatial/frontline indexing | Highest payoff, but only after measurement proves the earlier wins are not enough. |
