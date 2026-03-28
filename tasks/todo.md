# Age of War v0.1 Release Prep

## Plan

- [x] Set up Phaser + TypeScript + Vite app shell.
- [x] Implement prehistoric data definitions and typed runtime contracts.
- [x] Build title screen and battle scene.
- [x] Implement unit, tower, projectile, super, economy, and enemy AI systems.
- [x] Document the current architecture, release scope, and local workflow.
- [x] Run final release verification for `v0.1.0`.
- [ ] Create the GitHub repository and push `main`.
- [ ] Confirm the GitHub Pages deployment path is wired correctly.

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
- Remaining non-blocker:
  - production bundle is still large because Phaser ships as a large chunk
