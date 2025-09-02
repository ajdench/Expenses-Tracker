# Repository Guidelines (Updated)

## Project Structure & Module Organization
- Root static PWA. Key files: `index.html`, `styles.css`, `app.js` (boot/debug + scan callback), `ui.js` (DOM + gestures + drag-and-drop + receipts), `db.js` (IndexedDB via `idb`), `register-sw.js` and `service-worker.js` (PWA), `manifest.json`, `favicon.png`.
- Trips shell (rendered by `renderShell` in `ui.js`): sections `#active-trips-container`, `#submitted-trips-container`, `#reimbursed-trips-container`, plus a persistent Archived section with a dashed box labeled `Archive  <em>Trip</em>` that opens the Archived screen.
- Settings (rendered by `renderSettingsPage`): left “Category Colours”; right stacked “Cache and Offline”, “Delete Content”, “Reset App Settings”; rows for “Receipt Icon”, “Header Icons”, “iOS Shortcuts”, “Receipt Viewer”, “Receipt Sources”, “Trip Swipes”, “Image Adjust”.
- iOS Shortcuts: Settings adds an “iOS Shortcuts” card (toggle + API base URL) enabling native Scan Documents via Shortcuts; also a Files‑only flow (filename/subfolder templates; iOS Safari gating).
- Image editing: CropperJS provides reliable in‑modal/page cropping; OpenCV.js + Interact.js are lazy‑loaded for auto‑detect/drag when enabled.
- Feature flags: `config.js` centralizes toggles (e.g., default receipt viewer mode). User selections persist in IndexedDB.
- Tests: `tests/` holds Playwright specs; config in `playwright.config.ts`; reports in `playwright-report/` and `test-results/`.

## Build, Test, and Development Commands
- `npm start`: Serve locally via `npx serve` (defaults to `http://localhost:3000`).
- `npm run test:e2e`: Run Playwright end‑to‑end tests (uses `baseURL` and `?nosw`).
- `npm run test:e2e:headed`: E2E with visible browser; `npm run test:e2e:ui`: Playwright UI mode.
- Tip: test against a custom server/version: `BASE_URL=http://localhost:3000 APP_VERSION=<ver> npm run test:e2e`.

### Mobile UX Conventions
- Edit expense: double‑click (desktop) or long‑press (~500ms, mobile).
- Receipts: tap grey icon to capture; tap green to preview. Count badge shows receipts. “Retake / Add” appends; “Make Current” marks current; PDFs preview via PDF.js.
- Trip status & gestures:
  - Selection: single‑click selects (dull blue border). Only selected cards permit swipe and drag.
  - Active: right→Submitted (green, check), left→Inline rename (blue, pencil).
  - Submitted: right→Reimbursed (purple, coin), left→Active (blue, receipt icon cue).
  - Reimbursed: right→Archived (grey, archive), left→Submitted (green, check).
  - Archived screen: select then right→Reimbursed (purple).
  - Swipe travel/threshold: ~11% of card width; overlay opacity scales with distance.
  - Drag sort: allowed only for selected trips; cross‑column sorting persists status + position.

### UI/UX Conventions
- Card heights: headers, trip, and collapsed expense cards are 78px tall; 2px grey borders; 16px padding; consistent 1rem gap below headers.
- Trip cards: left title (1rem); right stacked currency totals. Totals stack in order `£`, `$`, `€`, `zł`, then others A–Z; unselected totals are light grey, selected are black. With 3 currencies, text compacts (0.9rem, tighter gap) to avoid pushing the title off‑center. Row uses CSS Grid to keep both title and totals vertically centered.
- Inline rename (Active left‑swipe): inline input matches shadow width (reserves ~110px for a button + 0.5rem gap), uses 40px control height.
- Forms: currency/amount/date/time are centered in shadow and edit modes.
- Expenses: support archive/unarchive with an Archived per‑trip view.
- iOS safe areas: `viewport-fit=cover`, neutral `theme-color`, `env(safe-area-inset-*)` paddings to avoid bright bars.

## Coding Style & Naming
- JavaScript: 2‑space indent, semicolons, single quotes; `const`/`let` appropriately.
- Naming: functions/vars `camelCase`; CSS classes/IDs `kebab-case`; constants `UPPER_SNAKE` when needed.
- Keep UI in `ui.js`, persistence in `db.js`, app boot/debug in `app.js`. No build step — files load directly in the browser.

## Testing Guidelines
- Framework: Playwright (`@playwright/test`). Specs `*.spec.ts` under `tests/` (see `tests/e2e.spec.ts`).
- Keep selectors stable: prefer IDs and accessible labels (e.g., `#active-trips-container`, `#save-expense`, `aria-label="Trip name"`, `aria-label="Description"`).
- Before pushing, run `npm start` and `npm run test:e2e` (`--headed` or `--ui` for debugging).

## Commit & PR Guidelines
- Conventional Commits (e.g., `feat: ...`, `fix: ...`, `ci: ...`). Keep messages imperative and concise.
- PRs: clear description, linked issues, screenshots/clips for UI changes, testing notes. Update tests when needed.

## Security & Configuration
- Service Worker: disabled globally in `register-sw.js` for development/Pages (unregisters SW, clears caches). Re‑enable for production.
- Cache busting while iterating: append `?v=<stamp>&nosw` to the app URL AND update asset query strings in `index.html` (e.g., `ui.js?v=<stamp>`). Hard‑reload with cache disabled if needed.
- Data: IndexedDB `ExpenseTracker`.
  - Settings store: `categoryColors`, `icons`, `scan`, `receiptViewer`, `capture`, `imageAdjust`, `tripSwipes`.
  - SW (when enabled): caches OpenCV.js and Interact.js with stale‑while‑revalidate.
- Shortcuts Dev Server: enable CORS for `http://localhost:3000` in `server/server.js`.

## GitHub Pages Deploy
- Workflow publishes repo root to `gh-pages` (`peaceiris/actions-gh-pages@v4`). SW disabled to avoid caching surprises.
- One‑time repo settings: GitHub → Settings → Pages → Source: Deploy from a branch; Branch: `gh-pages` / root (`/`).
- Local check: `npm start` then open `http://localhost:3000/index.html?v=dev&nosw`.
- Deploy:
  - `git add -A`
  - `git commit -m "chore: deploy to GitHub Pages"`
  - `git push origin master`
- Live: `https://<username>.github.io/<repo>/` (append `?v=dev&nosw` while iterating).

### Re‑enabling Service Worker (production)
- In `register-sw.js`, set `DEFAULT_ENABLE_SW = true` (or set `window.ENABLE_SW = true` before loading the script).
- Remove `?nosw` and bump the `v` query on assets/`index.html`.
- Validate in DevTools → Application → Service Workers; test offline.

## iOS “Scan Documents” via Shortcuts
- Launch Shortcuts via `shortcuts://x-callback-url/run-shortcut` from a user gesture; pass JSON (e.g., `{ session, auth, expenseId }`) in `text=`; set `x-success=/scan/done`.
- Shortcut (Web): Scan Documents → (optional) Make PDF → POST multipart/form-data to `/upload` → response `{ id }` → return with `?result=<id>`.
- Backend (dev): Express + multer + cors. `POST /upload` (`file`, `session`, `auth`) → `{ id }`; `GET /files/:id` returns the file.
- App callback: `app.js` handles `?scan=done|files-done|cancel|error`. On `done`, fetch `GET {API_BASE}/files/:id`, save as receipt, mark current, strip the query.
- Files mode: Separate “Scan to Files” Shortcut saves a PDF locally; on `?scan=files-done`, the app prompts to open Files picker and choose the suggested name/subfolder.

## Decisions & Conventions
- Data model:
  - Receipts: `receipts` store (DB v4) with `by_expenseId` index and `current` flag.
  - Trips: Persist `position` for drag order; lists sort by `position` then `createdAt`.
- Trips UI contracts:
  - 78px card height; 2px borders; 16px padding; 1rem header→content gap.
  - Selection: single‑click selects; only selected allows swipe and drag; tap selected on mobile opens details; double‑click opens details (desktop).
  - Gestures & thresholds: per‑column swipes as listed above; ~11% travel; overlay shows status‑colored gradient with icons; reveal ignores pointer events; click resets reveal.
  - Inline rename (Active left‑swipe): pencil icon (blue) cue; input width matches shadow editor (reserves ~110px + 0.5rem gap).
  - Archived section: persistent at bottom of Trips; clicking header or dashed box opens Archived screen; drop‑zone accepts selected trip cards (drag ghost scales to ~95%).
- Receipts:
  - Grey=add, green=preview, count badge; “Retake/Add” appends; “Make Current” marks current; never delete when marking.
  - PDF handling: PDF.js via CDN; thumbnails render first page; main view prefers canvas (iframe fallback). Revoke object URLs on close.
- iOS:
  - `viewport-fit=cover`, neutral `theme-color`, safe‑area paddings.
- Settings UI:
  - Full‑width Reset in Category Colours; Clear cache unregisters SW + clears caches; Delete content clears trips/expenses/receipts (confirm); Reset App Settings clears `settings` store and reloads.

## QA Checklist
- Trips
  - Drag/reorder persists across reloads (position stored; only selected trips are draggable). Cross‑column moves persist status.
  - Selection visuals: title darker grey when selected; currency totals black on selected, light grey unselected.
  - Swipes per column with 11% threshold and correct colors/icons; Active left‑swipe opens inline rename.
  - Archived section present; Archive drop accepts selected trips; clicking opens Archived screen.
- Expenses
  - Long‑press to edit (mobile); double‑click (desktop).
  - Collapsed height 78px; vendor/date/time positions consistent.
  - Shadow “Add expense” placeholders centered (currency/amount/date/time).
- Receipts
  - Add via camera/photos; green icon + count badge updates.
  - Preview shows images/PDFs; thumbnails render; “Make Current” works; object URLs revoked on close.
- Layout/headers
  - 1rem gap beneath page headers; modals respect 1rem container padding; title and currency stack vertically centered on trip cards (n=1..3 lines).
- Settings
  - Category reset; Clear cache; Delete content; Reset app settings; Icon choices persist; Shortcuts toggle + API; “Scan with iOS Shortcuts” gated to iOS Safari; post‑scan attaches and marks current; Image Adjust crop saves new receipt and marks current.

## Claude Code Implementation Notes (2025-08-29)

### Desktop/Mobile UX Patterns
- **Desktop Swipes**: Implement via mousedown/mousemove/mouseup events mirroring touch patterns
- **Selection-Based Actions**: Only selected cards (blue border) can swipe or drag
- **Interaction Flow**: Click to select → swipe for status change → long-click for drag reorder
- **Archive Zones**: Ghost disappears, background changes to light grey on dragover

### Critical Implementation Requirements
- **Single Selection**: Multi-select disabled, clicking deselects others
- **Gesture Conflicts**: Swipe disabled during drag operations  
- **Edit Mode**: Expense cards collapse to 78px on blur/cancel (currently working correctly)
- **Drag Visual**: Archive drop zones show light grey background, hide ghost
- **Touch/Mouse Parity**: Same UX patterns for both input methods

### Progress Update (Session End 2025-08-31)
> **ALL MAJOR UX ISSUES RESOLVED**: Complete success with polished implementation
> - **Colors Fixed**: Trip/expense backgrounds, selection colors, text colors all correct  
> - **Sizing Fixed**: Section titles smaller (1rem), HTML consistency (all h6)
> - **Selection Fixed**: Expense edit persistence, Active section text colors
> - **Double-click Fixed**: Proper two-stage behavior (unselected→select, selected→open)
> - **Swipe Borders**: Fixed CSS !important conflicts, all cards show border color changes during swipes
> - **Visual Polish**: Purple tone adjusted, global cursor standardization, archive spacing improved
> - **Debug Controls**: Hidden behind global toggle (`UI_CONSTANTS.SHOW_DEBUG_BUTTON`)
> **STATUS**: All original UX issues fully resolved, app ready for production use

### Major Recovery & Enhancement (Session 2025-09-02)
> **COMPLETE RECOVERY FROM CORRUPTION**: All functionality restored and enhanced beyond baseline
> - **4 Core User Issues**: Placeholder cards, ghost snapping, drop zones, ghost swipe prevention - ALL IMPLEMENTED
> - **Border System Perfected**: 2px width (not 3px), proper color reset on incomplete swipes, consistent across all card types/locations
> - **Archive Ghost Functionality**: Ghost elements snap to placeholders, always-available drop zones, comprehensive swipe prevention  
> - **Drag & Drop Enhancement**: Placeholder cards replace empty text, ghost positioning works in all archive sections
> - **Quality Assurance**: Verified behavior consistency across Trip/Expense cards in main/archive views
> - **Recovery Documentation**: Complete analysis in `2-sept-25-cont.md`, `recovery-analysis.md`
> **STATUS**: FULLY RECOVERED & ENHANCED - All functionality working beyond GitHub baseline

### Technical Implementation Notes
> **Architecture**: Global constants system (`COLORS`, `UI_CONSTANTS`) for consistent UX
> **Border System**: 2px borders with `setProperty('border-color', color, 'important')` + proper reset in onTouchEnd/finally blocks
> **Ghost Prevention**: Comprehensive ghost class detection in all swipe handlers (`ghost-card`, `sortable-ghost`)
> **Placeholder Cards**: `.placeholder-card` CSS class with dashed borders, replaces all empty state text
> **Drop Zone Logic**: Always-create strategy (`if (true)` vs `if (archived.length > 0)`) prevents disappearing zones
> **Debug System**: Enhanced with color-coded logging (🔵, 🔴, 🔄) and layer-by-layer state tracking
> **Memory System**: Complete recovery documentation in `CLAUDE.md` and memory files
> **See**: `CLAUDE.md` for memory system and complete project documentation

## Development: Shortcuts Integration (Summary)
1. Settings card "iOS Shortcuts" with toggle and `apiBaseUrl` (persisted via `getScanSettings`/`saveScanSettings`).
2. Receipts action sheet: Camera/Photos, "Scan with iOS Shortcuts", "Scan (Shortcuts → Files)".
3. `launchShortcutsScan(expenseId)`: compose x‑callback with `{ session, auth, expenseId }`; store pending session in `localStorage`.
4. `app.js` `handleScanCallbackIfPresent()`: process `?scan=done|files-done|cancel|error`; on `done`, fetch file from `{API_BASE}/files/:id`, save, mark current, strip query.
5. `server/server.js` (Express + multer + cors) supports local uploads during development.
