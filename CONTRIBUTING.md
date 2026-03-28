# Contributing

## Development Setup

Requirements:
- `Node.js 20+`
- `npm`

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Run the release checks:

```bash
npm run test
npm run build
```

## Working Rules

This repository is small, but it already has a few guardrails that matter:

- keep gameplay rules in `src/game/systems/match.ts`
- keep age content in `src/game/data/`
- keep scene code focused on input, rendering, and HUD wiring
- use the text fitting helper for bounded UI copy
- verify HUD click targets after camera movement
- update `tasks/todo.md` while working
- add recurring mistakes to `tasks/lessons.md` after user corrections

## Change Strategy

Prefer changes that keep the current separation intact.

| Area | Preferred home |
| --- | --- |
| Balance values | `src/game/data/prehistoric.ts` |
| Runtime types | `src/game/types.ts` |
| Core combat/economy/AI logic | `src/game/systems/match.ts` |
| Scene layout and controls | `src/game/scenes/` |
| Reusable HUD helpers | `src/game/ui/` |
| Release and architecture docs | `docs/` |

## Before Opening A PR

Run:
- `npm run test`
- `npm run build`

Then confirm:
- text stays inside buttons, panels, and overlays
- HUD controls still work after horizontal camera movement
- `PLAY AGAIN` works with the battlefield scrolled away from the base
- the queue, super, and tower controls still fit the bottom/top HUD layouts
