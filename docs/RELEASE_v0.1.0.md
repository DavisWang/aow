# Release v0.1.0

## Summary

`v0.1.0` is the first public playable cut of the project.

It proves the core loop:
- start a match
- buy units and towers
- manage a build queue
- cast a super
- fight a constant AI opponent
- destroy the opposing base or lose and replay

## Included

| Area | Included in v0.1.0 |
| --- | --- |
| Theme | Prehistoric age |
| Gameplay | Single-lane auto-battler |
| Units | Caveman, Stonethrower, Dino Rider |
| Towers | Three prehistoric placeholders |
| Super | Meteor Shower |
| AI | Scripted enemy with passive income and boosted rewards |
| UX | Title screen, HUD, queue display, win/loss overlay |
| Delivery | GitHub Pages deployment path |

## Validation

Before release:
- `npm run test`
- `npm run build`
- local smoke test via `npm run preview`

## Known Limitations

- only one age exists
- visuals are placeholder-only
- no audio
- no save/progression system
- Phaser bundle size remains large for this release

## Deployment Notes

GitHub Pages is the intended static hosting target.

Expected release flow:
1. push `main`
2. let the Pages workflow build and deploy
3. verify the published URL

