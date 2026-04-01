# Lessons

## 2026-03-31

- For synthesized game audio, do not ship the first musical sketch without sanity-checking consonance and bus balance. Favor simple chord-tone melodies, softer voicing, and conservative gain staging before adding color.
- In this project, transient SFX should be mixed as accents over the quiet music bed, not as near-full-scale events. Super casts are the first sound to audit because they stack tones and noise and will dominate the mix fastest.
- If a user says to scrap an audio direction, do not keep iterating around the same musical language. Replace the score and SFX palette wholesale so the next pass is genuinely different, not cosmetically adjusted.

## 2026-03-27

- When a user correction identifies a recurring implementation miss, record it immediately in this file during the same turn.
- For fixed-position HUD controls in Phaser, do not rely only on parent containers for input behavior. Set screen-space UI children explicitly to `scrollFactor(0)` and verify that click targets still work after camera movement.
- For UI text in Phaser, do not assume the initial font size will fit. Audit every text element against its containing button, banner, panel, or screen region, centralize text fitting in a helper, and add a regression test for the fitting logic.
- For battle HUD interactivity in a scrolling Phaser scene, verify clicks with the camera far away from the player base. If hit areas drift, anchor the HUD to camera position in world space instead of assuming visually fixed containers will keep interactive bounds aligned.
- For severe post-battle UI actions like `PLAY AGAIN`, do not nest the only critical CTA inside a scrolling overlay container. Keep the action button as a dedicated screen-anchored control, freeze camera motion once the match ends, and verify the CTA remains clickable even when the player base is off-screen.

## 2026-03-30

- For dense shop cards in Phaser, avoid heavy stroke-plus-shadow label treatments unless they are visually verified in-context. Muddy text can read like stacking even when only one text object exists. Prefer simpler contrast, thinner strokes, and contextual world actions over adding more persistent HUD controls.
- When a reusable button helper owns `setEnabled()` styling, assume it will overwrite any one-off text color work each frame. If a menu card needs custom typography, give it dedicated text objects or override the enabled-state styling explicitly.
- For boss-unit tuning in the current single-lane combat model, protect matchup breakpoints first and buff feel through cost, build time, speed, or damage that does not change hit-count thresholds before adding HP. Small HP bumps can flip the whole duel envelope.
- For pointer-driven camera panning in Phaser, do not use one global edge-scroll zone across both the battlefield and the fixed top HUD. Carve out a shallower top-band rule, or HUD clicks near the left edge will read as camera-pan intent.
- For same-age duel balance in this combat model, ranged range is usually the first stat to audit when lower-cost units outperform higher-cost megas. Expensive units here often already one-shot the mid-tier ranged unit; the real failure mode is never getting into firing range.
