# Repository Guidelines

## Project Structure & Module Organization
- Root static PWA. Key files: `index.html`, `styles.css`, `app.js` (bootstraps, debug), `ui.js` (DOM rendering, drag-and-drop), `db.js` (IndexedDB via `idb`), `register-sw.js` and `service-worker.js` (PWA), `manifest.json`, `favicon.png`.
- UI sections (rendered by `renderShell` in `ui.js`): `#active-trips-container`, `#submitted-trips-container`, `#reimbursed-trips-container` inside `#trip-list-container`.
- Trip card affordance: single-click selects; double-click opens details (no button).
- Tests: `tests/` with Playwright specs; config in `playwright.config.ts`. Test reports in `playwright-report/` and `test-results/`.

## Build, Test, and Development Commands
- `npm start`: Serve the app locally via `npx serve` (defaults to `http://localhost:3000`).
- `npm run test:e2e`: Run Playwright end-to-end tests (uses `baseURL` and `?nosw`).
- `npm run test:e2e:headed`: E2E tests with a visible browser.
- `npm run test:e2e:ui`: Playwright UI mode for focused runs.
- Tip: To test against a custom server/version: `BASE_URL=http://localhost:3000 APP_VERSION=20250825-06 npm run test:e2e`.

## Coding Style & Naming Conventions
- JavaScript: 2-space indent, semicolons, single quotes; `const`/`let` appropriately.
- Naming: functions/vars `camelCase`; CSS classes/IDs `kebab-case` (e.g., `#add-trip-card`); constants `UPPER_SNAKE` when needed.
- Keep UI logic in `ui.js`, persistence in `db.js`, and app init/debug in `app.js`. Avoid introducing build steps—files are loaded directly in the browser.

## Testing Guidelines
- Framework: Playwright (`@playwright/test`). Specs named `*.spec.ts` under `tests/` (see `tests/e2e.spec.ts`).
- Keep selectors stable. Prefer IDs and accessible labels already used in tests (e.g., `#active-trips-container`, `#save-expense`, `aria-label="Description"`).
- Before pushing, run `npm start` and `npm run test:e2e`. For debugging, use `--headed` or `--ui`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits style observed (e.g., `feat: ...`, `fix: ...`, `ci: ...`). Keep messages imperative and concise.
- PRs: Include a clear description, linked issue(s), screenshots or short clips for UI changes, and notes on testing. Update affected tests.

## Security & Configuration Tips
- Service Worker: Disabled globally in `register-sw.js` for development/Pages testing (unregisters any SW, clears caches). Re-enable later before production.
- Caching: Use `?v=dev&nosw` in the URL to force fresh loads while iterating.
- Data: Uses IndexedDB (`ExpenseTracker`). If needed, we can gate an in-memory store behind a flag.

## GitHub Pages Deploy
- Changes made: SW disabled globally; favicon path made relative; `.gitignore` updated (ignores `node_modules/`); deploy workflow uses `peaceiris/actions-gh-pages@v4` to publish repo root to `gh-pages`.
- One-time settings: GitHub → Settings → Pages → Source: Deploy from a branch; Branch: `gh-pages` / root (`/`).
- Local check: `npm start` then open `http://localhost:3000/index.html?v=dev&nosw`.
- Commit + push to deploy:
  - `git add -A`
  - `git commit -m "chore: prepare GitHub Pages deploy (disable SW, fix paths)"`
  - `git push origin master`
- Access URL: `https://<username>.github.io/<repo>/` (append `?v=dev&nosw` while iterating).

### Re-enabling the Service Worker (production)
- Toggle: In `register-sw.js`, set `DEFAULT_ENABLE_SW = true` (or define `window.ENABLE_SW = true` before loading `register-sw.js`).
- Remove `?nosw` from URLs and bump the `v` query on assets/`index.html` to bust caches.
- Validate: Open DevTools → Application → Service Workers to confirm registration; test offline.
