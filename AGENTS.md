# Repository Guidelines

## Project Structure & Module Organization
- Root static PWA. Key files: `index.html`, `styles.css`, `app.js` (bootstraps, debug), `ui.js` (DOM rendering, drag-and-drop), `db.js` (IndexedDB via `idb`), `register-sw.js` and `service-worker.js` (PWA), `manifest.json`, `favicon.png`.
- UI sections (rendered by `renderShell` in `ui.js`): `#active-trips-container`, `#submitted-trips-container`, `#reimbursed-trips-container` inside `#trip-list-container`.
- Trip card affordance: each trip includes a `.view-details-btn` used by tests to open detail.
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
- Service Worker: Disabled on `localhost` and when `?nosw` is present. For caching checks, remove `?nosw` and bump the `v` query in `index.html`/assets.
- Caching: Use the in-app `clearAppCache()` helper from the console to purge caches and unregister SW during development.
- Data: Uses IndexedDB (`ExpenseTracker` DB). Consider migration impacts when changing object stores/indexes.
