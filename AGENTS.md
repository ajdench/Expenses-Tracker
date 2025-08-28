# Repository Guidelines

## Project Structure & Module Organization
- Root static PWA. Key files: `index.html`, `styles.css`, `app.js` (bootstraps, debug + scan callback), `ui.js` (DOM rendering, drag-and-drop, receipts UI), `db.js` (IndexedDB via `idb`), `register-sw.js` and `service-worker.js` (PWA), `manifest.json`, `favicon.png`.
- UI sections (rendered by `renderShell` in `ui.js`): `#active-trips-container`, `#submitted-trips-container`, `#reimbursed-trips-container` inside `#trip-list-container`.
- Settings page (rendered by `renderSettingsPage`): left column half‑width “Category Colours”; right column two stacked cards “Cache and Offline” and “Delete Content”; rows below for “Receipt Icon” + “Header Icons”, “iOS Shortcuts”, “Receipt Viewer”, “Receipt Sources”, “Trip Swipes”, and “Image Adjust”.
- iOS Shortcuts: Settings adds an “iOS Shortcuts” card (toggle + API base URL) enabling native Scan Documents via Shortcuts. Also supports a Files‑only flow with filename/subfolder templates and iOS Safari gating.
 - Image editing: CropperJS is used for reliable cropping in modal/page; OpenCV.js + Interact.js are lazy‑loaded by the app for auto‑detect/drag when enabled.
 - Feature flags: `config.js` centralizes toggles (e.g., default receipt viewer mode); user selection persists in IndexedDB.
- Trip cards: single‑click selects; double‑click opens details (no button). On Active, swipe right→Submitted and left→Reimbursed.
- Tests: `tests/` with Playwright specs; config in `playwright.config.ts`. Test reports in `playwright-report/` and `test-results/`.

## Build, Test, and Development Commands
- `npm start`: Serve the app locally via `npx serve` (defaults to `http://localhost:3000`).
- `npm run test:e2e`: Run Playwright end-to-end tests (uses `baseURL` and `?nosw`).
- `npm run test:e2e:headed`: E2E tests with a visible browser.
- `npm run test:e2e:ui`: Playwright UI mode for focused runs.
- Tip: To test against a custom server/version: `BASE_URL=http://localhost:3000 APP_VERSION=20250825-06 npm run test:e2e`.

### Mobile UX Conventions
- Edit expense: double‑click on desktop; long‑press (~500ms) on mobile (no extra buttons).
- Receipts: tap grey icon to capture (camera roll / camera); tap green icon to preview. Badge shows count of receipts. “Retake / Add” appends; “Make Current” marks the active preview as current (nothing is deleted). PDF thumbnails/view use PDF.js when available.
- Trip status: on Active, swipe right to mark Submitted (green cue), swipe left to mark Reimbursed (purple cue).

### UI/UX Conventions
- Cards: all header, trip, and collapsed expense cards are 74px tall with 2px grey borders and 16px padding. A consistent 1rem gap exists below headers before content.
- Trip selection: selected trip cards keep the grey border; tap selected on mobile to open details (double‑click on desktop still works).
- Forms: currency, amount, date, and time fields are centered in both shadow (read‑only) and edit modes.
- Archived: expenses support archive/unarchive with an Archived view per trip.
- iOS safe areas: the app uses `viewport-fit=cover`, a neutral `theme-color`, and `env(safe-area-inset-*)` paddings to avoid bright bars.

## Coding Style & Naming Conventions
- JavaScript: 2-space indent, semicolons, single quotes; `const`/`let` appropriately.
- Naming: functions/vars `camelCase`; CSS classes/IDs `kebab-case` (e.g., `#add-trip-card`); constants `UPPER_SNAKE` when needed.
- Keep UI logic in `ui.js`, persistence in `db.js`, and app init/debug in `app.js`. Avoid introducing build steps—files are loaded directly in the browser.

## Testing Guidelines
- Framework: Playwright (`@playwright/test`). Specs named `*.spec.ts` under `tests/` (see `tests/e2e.spec.ts`).
- Keep selectors stable. Prefer IDs and accessible labels used in the app (e.g., `#active-trips-container`, `#save-expense`, `aria-label="Trip name"`, `aria-label="Description"`). Avoid relying on non‑existent buttons for navigation (trip details open on double‑click or by tapping the selected card).
- Before pushing, run `npm start` and `npm run test:e2e`. For debugging, use `--headed` or `--ui`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits style observed (e.g., `feat: ...`, `fix: ...`, `ci: ...`). Keep messages imperative and concise.
- PRs: Include a clear description, linked issue(s), screenshots or short clips for UI changes, and notes on testing. Update affected tests.

## Security & Configuration Tips
- Service Worker: Disabled globally in `register-sw.js` for development/Pages testing (unregisters any SW, clears caches). Re‑enable later before production.
- Caching: Use `?v=dev&nosw` in the URL to force fresh loads while iterating.
- Data: Uses IndexedDB (`ExpenseTracker`).
  - Settings: `settings` store holds `{ key, value }` records for `categoryColors`, `icons`, `scan`, `receiptViewer`, `capture`, `imageAdjust`, and `tripSwipes`.
  - Service Worker: caches OpenCV.js and Interact.js with stale‑while‑revalidate when enabled.
- Shortcuts Dev Server: enable CORS for `http://localhost:3000` in `server/server.js` to allow the browser to fetch scanned files.

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

## iOS “Scan Documents” via Shortcuts
- Approach: Launch Apple Shortcuts with `shortcuts://x-callback-url/run-shortcut` from a user gesture; pass JSON (e.g., `{ session, auth, expenseId }`) in `text=`; set `x-success=/scan/done` to get a short token back.
- Shortcut (Web): “Scan Documents” → (optional) “Make PDF” → “Get Contents of URL (POST multipart/form-data)” to your API → returns `{ id }` → redirect back with `?result=<id>`.
- Backend (dev): Minimal Express + multer + cors. `POST /upload` (fields `file`, `session`, `auth`) → `{ id }`. `GET /files/:id` serves the file.
- App callback: `app.js` handles `?scan=done|files-done|cancel|error`. On `done`, fetch `GET {API_BASE}/files/:id`, save as receipt, mark current, then strip the query.
- Files mode: Separate Shortcut “Scan to Files” saves a PDF locally. On `?scan=files-done`, the app prompts to open Files picker and select the suggested filename/subfolder.

## Decisions & Conventions
- Data model:
  - Receipts: `receipts` store (DB v4) with `by_expenseId` index and `current` flag per expense.
  - Trips: Persist `position` for drag order; lists sort by `position` then `createdAt`.
- UI contracts:
  - Cards: headers, trip, collapsed expense cards are 74px tall, 2px grey borders, 16px padding, 1rem header→content gap.
  - Gestures: long‑press to edit expenses (mobile); double‑click (desktop). Tap selected trip (mobile) opens details; double‑click on desktop. On Active, swipe to change status (toggleable).
  - Forms: currency, amount, date, time centered (shadow + edit).
  - Receipts: grey=add, green=preview, count badge; “Retake/Add” appends; “Make Current” marks active; never delete.
- PDF handling:
  - PDF.js via CDN; thumbnails render first page; main view uses canvas (fallback iframe).
  - Revoke object URLs on modal close to limit memory usage.
- iOS behavior:
  - `viewport-fit=cover`, neutral `theme-color`, safe‑area paddings to avoid bright bars.
- Service Worker:
  - Disabled by default; toggle using `DEFAULT_ENABLE_SW` or `window.ENABLE_SW`; `?nosw` honored. When enabling, bump `v` and validate in DevTools.
- Deployment:
  - GitHub Pages workflow publishes repo root to `gh-pages`; asset paths are relative.
- Settings UI:
  - Reset button is full width inside card padding.
  - “Clear cache” unregisters Service Workers and clears caches.
  - “Delete content” clears `trips`, `expenses`, and `receipts` stores (confirm required).
  - Icon choices persist and update header/receipt icons immediately.
  - Trip Swipes toggle persists under `settings.tripSwipes.enable`.

## QA Checklist
- Trips
  - Drag/reorder persists across reloads (position stored).
  - Selected trip keeps grey border; tap again opens details on mobile; double‑click on desktop.
  - Swipe gestures on Active update status (when enabled).
- Expenses
  - Long‑press to edit on mobile; double‑click on desktop.
  - Collapsed card height is 74px; vendor/date/time positions consistent.
  - Shadow “Add expense” placeholders are centered (currency/amount/date/time).
- Receipts
  - Add via camera/photos; green icon + count badge updates.
  - Preview (modal or page) shows images and PDFs; thumbnails render; “Make Current” works.
  - Object URLs revoked on modal close.
- Layout/headers
  - 1rem gap beneath page headers; modals respect 1rem container padding.
  - iOS: no bright bars at top/bottom; safe‑area respected.
- Settings
  - Category Reset restores defaults (full width).
  - Clear cache unregisters Service Workers and clears caches.
  - Delete content removes Trips, Expenses, Receipts and returns to Trips view.
  - Icon choices persist and update header/receipt icons immediately.
  - Shortcuts toggle persists; API base URL is respected.
  - “Scan with iOS Shortcuts” appears only on iOS Safari when enabled and API base is set.
  - After a scan, receipt is attached to the intended expense and marked current.
- Image Adjust
  - Crop opens on image receipts, not PDFs; Apply saves as new receipt and marks current.

## Development: Shortcuts Integration
1. Add Settings card “iOS Shortcuts” with toggle and `apiBaseUrl` input (`ui.js`, persisted via `db.js` `getScanSettings`/`saveScanSettings`).
2. Add an action sheet for receipts with two options: Camera/Photos (existing file input) and “Scan with iOS Shortcuts.”
3. Implement `launchShortcutsScan(expenseId)` to compose the x‑callback URL with JSON `{ session, auth, expenseId }`; store pending session in `localStorage`.
4. In `app.js`, add `handleScanCallbackIfPresent()` on boot to process `?scan=done|cancel|error`; on `done`, fetch the file from `{API_BASE}/files/:id`, save to receipts, mark current, then strip the query.
5. Provide `server/server.js` (Express + multer + cors) for local uploads during development.

