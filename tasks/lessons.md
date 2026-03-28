# Lessons

## 2026-03-27

- When a user correction identifies a recurring implementation miss, record it immediately in this file during the same turn.
- For fixed-position HUD controls in Phaser, do not rely only on parent containers for input behavior. Set screen-space UI children explicitly to `scrollFactor(0)` and verify that click targets still work after camera movement.
- For UI text in Phaser, do not assume the initial font size will fit. Audit every text element against its containing button, banner, panel, or screen region, centralize text fitting in a helper, and add a regression test for the fitting logic.
- For battle HUD interactivity in a scrolling Phaser scene, verify clicks with the camera far away from the player base. If hit areas drift, anchor the HUD to camera position in world space instead of assuming visually fixed containers will keep interactive bounds aligned.
- For severe post-battle UI actions like `PLAY AGAIN`, do not nest the only critical CTA inside a scrolling overlay container. Keep the action button as a dedicated screen-anchored control, freeze camera motion once the match ends, and verify the CTA remains clickable even when the player base is off-screen.
