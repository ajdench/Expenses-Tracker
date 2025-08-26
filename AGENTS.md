# Repository Guidelines

## Project Structure & Module Organization
- Root static PWA. Key files: `index.html`, `styles.css`, `app.js` (bootstraps, debug), `ui.js` (DOM rendering, drag-and-drop), `db.js` (IndexedDB via `idb`), `register-sw.js` and `service-worker.js` (PWA), `manifest.json`, `favicon.png`.
- UI sections (rendered by `renderShell` in `ui.js`): `#active-trips-container`, `#submitted-trips-container`, `#reimbursed-trips-container` inside `#trip-list-container`.
- Settings page (rendered by `renderSettingsPage`): left column half‑width “Category Colours”; right column two stacked cards “Cache and Offline” and “Delete Content”; an additional row below with two icon‑selection cards.
 - iOS Shortcuts: Settings adds an “iOS Shortcuts” card (toggle + API base URL) enabling native Scan Documents via Shortcuts.
- Trip card affordance: single-click selects; double-click opens details (no button).
- Tests: `tests/` with Playwright specs; config in `playwright.config.ts`. Test reports in `playwright-report/` and `test-results/`.

## Build, Test, and Development Commands
- `npm start`: Serve the app locally via `npx serve` (defaults to `http://localhost:3000`).
- `npm run test:e2e`: Run Playwright end-to-end tests (uses `baseURL` and `?nosw`).
- `npm run test:e2e:headed`: E2E tests with a visible browser.
- `npm run test:e2e:ui`: Playwright UI mode for focused runs.
- Tip: To test against a custom server/version: `BASE_URL=http://localhost:3000 APP_VERSION=20250825-06 npm run test:e2e`.

### Mobile UX Conventions
- Edit expense: double-click on desktop; long-press (~500ms) on mobile (no extra buttons).
- Receipts: tap grey icon to capture (camera roll / camera); tap green icon to preview. Badge shows count of receipts. “Retake / Add” appends; “Make Current” marks the active preview as current (nothing is deleted). PDF thumbnails/view use PDF.js when available.

### UI/UX Conventions
- Cards: all header, trip, and collapsed expense cards are 74px tall with 2px grey borders and 16px padding. A consistent 1rem gap exists below headers before content.
- Trip selection: selected trip cards keep the grey border; tap selected on mobile to open details (double-click on desktop still works).
- Forms: currency, amount, date, and time fields are centered in both shadow (read-only) and edit modes.
- iOS safe areas: the app uses `viewport-fit=cover`, a neutral `theme-color`, and `env(safe-area-inset-*)` paddings to avoid bright bars around the Dynamic Island/home indicator.

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
  - Settings: `settings` store holds `{ key, value }` records for `categoryColors` and `icons`.
  - Shortcuts: `settings.scan = { enable: boolean, apiBaseUrl: string }`.

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

## Future: iOS “Scan Documents” via Shortcuts
- Approach: Launch a preconfigured Apple Shortcuts flow with `shortcuts://x-callback-url/run-shortcut` from a user gesture; pass JSON (e.g., `{ session, auth, expenseId }`) in `text=`; set `x-success=/scan/done` to get a short token back.
- Shortcut: Uses “Scan Documents” → (optional) “Make PDF” → “Get Contents of URL (POST multipart/form-data)” to your API → returns `{ id }` → redirects back with `?result=<id>`.
- Backend: Minimal `/upload` (accept file + session/auth), returns `{ id }`; `/files/:id` serves the file securely. Use short‑lived one‑time tokens.
- App callback: `/scan/done` reads `result` and can fetch/attach the file to the current expense (we already support image/PDF preview via PDF.js).
- Constraints: Web cannot directly open the native scanner; Shortcuts is the only reliable web path without a native wrapper. Keep this as an optional, iOS‑only enhancement.

## Decisions & Conventions
- Data model:
  - Receipts: `receipts` store (DB v4) with `by_expenseId` index and `current` flag per expense.
  - Trips: Persist `position` for drag order; lists sort by `position` then `createdAt`.
- UI contracts:
  - Cards: headers, trip, collapsed expense cards are 74px tall, 2px grey borders, 16px padding, 1rem header→content gap.
  - Gestures: long‑press to edit expenses (mobile); double‑click (desktop). Tap selected trip (mobile) opens details; double‑click on desktop.
  - Forms: currency, amount, date, time centered (shadow + edit).
  - Receipts: grey=add, green=preview, count badge; “Retake/Add” appends; “Make Current” marks active; never delete.
- PDF handling:
  - PDF.js via CDN; thumbnails render first page; main view uses canvas (fallback iframe).
  - Revoke object URLs on modal close to limit memory usage.
- iOS behavior:
  - `viewport-fit=cover`, neutral `theme-color`, safe‑area paddings to avoid bright bars around Dynamic Island/home indicator.
- Service Worker:
  - Disabled by default; toggle using `DEFAULT_ENABLE_SW` or `window.ENABLE_SW`; `?nosw` honored. When enabling, bump `v` and validate in DevTools.
- Deployment:
  - GitHub Pages workflow publishes repo root to `gh-pages`; asset paths are relative.
- Settings UI:
  - Reset button is full width inside card padding.
  - “Clear cache” unregisters Service Workers and clears caches.
  - “Delete content” clears `trips`, `expenses`, and `receipts` stores (confirm required).
  - Icon options persist class names for Receipt/Home/Cog; applied in headers and expense cards.
- Shortcuts integration:
  - Launch via `shortcuts://x-callback-url/run-shortcut` with `x-success=?scan=done`.
  - Before launch, store `{ session, expenseId }` under `localStorage['scan:pending']`.
  - On return, `app.js` parses `?scan=`; on `done`, fetch `GET {API_BASE}/files/:id`, save as receipt, mark current, and strip query.
  - The “Scan with iOS Shortcuts” action is available in the Add/Retake sheet when enabled, configured, and on iOS Safari.
  - Files mode: A separate option “Scan (Shortcuts → Files)” launches a Shortcut that saves the PDF locally (no server). On `?scan=files-done`, the app shows a button to open the Files picker and you choose the just‑saved PDF. The app passes a filename like `vendor-date-time-currency-value.pdf` based on the expense.
  - Templates: Filename and (optional) subfolder are configurable in Settings using variables `{vendor}`, `{date}` (YYYYMMDD), `{time}` (HHmm), `{currency}`, `{amount}`, `{trip}`. Subfolder can reflect parent Trip (e.g., `Trip-{trip}`).

## QA Checklist
- Trips
  - Drag/reorder persists across reloads (position stored).
  - Selected trip keeps grey border; tap again opens details on mobile; double‑click on desktop.
- Expenses
  - Long‑press to edit on mobile; double‑click on desktop.
  - Collapsed card height is 74px; vendor/date/time positions consistent.
  - Shadow “Add expense” placeholders are centered (currency/amount/date/time).
- Receipts
  - Add via camera/photos; green icon + count badge updates.
  - Preview modal shows images and PDFs; thumbnails render; “Make Current” works.
  - Object URLs revoked on modal close.
- Layout/headers
  - 1rem gap beneath page headers; modals respect 1rem container padding.
  - iOS: no bright bars at top/bottom; safe‑area respected.
- Settings
  - Category Reset restores defaults and is full width.
  - Clear cache unregisters Service Workers and clears caches.
  - Delete content removes Trips, Expenses, Receipts and returns to Trips view.
  - Icon choices persist and update header/receipt icons immediately.
  - Shortcuts toggle persists; API base URL is respected.
  - “Scan with iOS Shortcuts” appears only on iOS Safari when enabled and API base is set.
  - After a scan, receipt is attached to the intended expense and marked current.

## Development: Shortcuts Integration
1. Add Settings card “iOS Shortcuts” with toggle and `apiBaseUrl` input (`ui.js`, persisted via `db.js` `getScanSettings`/`saveScanSettings`).
2. Add an action sheet for receipts with two options: Camera/Photos (existing file input) and “Scan with iOS Shortcuts.”
3. Implement `launchShortcutsScan(expenseId)` to compose the x‑callback URL with JSON `{ session, auth, expenseId }`; store pending session in `localStorage`.
4. In `app.js`, add `handleScanCallbackIfPresent()` on boot to process `?scan=done|cancel|error`; on `done`, fetch the file from `{API_BASE}/files/:id`, save to receipts, mark current, then strip the query.
5. Provide `server/server.js` (Express + multer) for local uploads during development.
