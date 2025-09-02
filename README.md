# 💰 Trip Expense Tracker

![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge)
![Platform](https://img.shields.io/badge/Device-📱%20Mobile%20Optimized-0ea5e9?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Hosted-GitHub%20Pages-8b5cf6?style=for-the-badge)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952b3?style=for-the-badge&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla%20JS-ffb000?style=for-the-badge&logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)

**Fast, intuitive trip expense tracking with professional UX polish.** Create trips, add expenses, attach receipts, and manage everything seamlessly across desktop and mobile. Features swipe gestures, drag-and-drop reordering, receipt management with image editing, and iOS Shortcuts integration.

**🚀 Live Demo:** https://ajdench.github.io/Expenses-Tracker/

## ✨ Key Features

- **🎯 Intuitive Gestures**: Swipe cards to change trip status with visual feedback (2px colored borders)
- **📱 Mobile-First Design**: Optimized for iOS/Android with safe area support  
- **📸 Smart Receipt Management**: Camera capture, gallery preview, PDF support, edge detection
- **🔄 Drag & Drop**: Reorder trips and expenses with SortableJS integration, ghost element positioning
- **🎨 Visual Polish**: Consistent colors, smooth animations, proper selection states, placeholder cards
- **📲 iOS Shortcuts**: Native document scanning integration
- **💾 Offline Ready**: IndexedDB storage, optional service worker caching
- **🔧 Developer Friendly**: No build step, vanilla JavaScript, comprehensive testing
- **🛠️ Archive Management**: Ghost snapping, always-available drop zones, comprehensive swipe prevention

## For Users

- Trips: Add a trip; tap to select; tap again to open. Drag between Active, Submitted, Reimbursed (drag only when selected). Use the bottom “Archived” header and “Archive  Trip” dashed box to open Archived or drop a selected card to archive.
- Expenses: Add from the “Add expense” card. Long‑press an expense to edit on mobile (desktop: double‑click).
- Receipts: Grey icon = add (camera roll / camera). Green icon = preview; thumbnails + “Retake / Add”; “Make Current” marks the active image. All images are kept.
- Mobile polish: Compact cards (74px), centered fields (currency/amount/date/time), safe‑area support for iPhone Dynamic Island.

### Receipts: Adjust Edges (scan-like)
- In the receipts preview, select an image and tap “Adjust edges”.
- Drag the 4 corner handles to fit the document; pinch to zoom and drag background to pan (desktop: wheel‑zoom + drag).
- Controls: Reset (re‑detect), Rotate 90°, Apply (saves a rectified copy and marks it current), Cancel.
- PDFs are unchanged (editor is for images only).

### Settings
- Category colours: Tap a category pill to pick a colour. Reset restores defaults (full‑width button).
- Cache and Offline: “Clear cache” unregisters Service Workers and clears cached assets (dashed gold button). “Reset App Settings” clears settings and reloads (icons/colours/viewer/Shortcuts/capture/image adjust/swipes).
- Delete Content: “Delete content” removes all Trips, Expenses and Receipts (dashed orange button, confirm required).
- Icons: Choose Receipt, Home, and Settings icons. Choices apply across headers and expense cards and persist in the browser.

Try it on Pages: `https://<your-username>.github.io/<repo-name>/?v=dev&nosw`

### Quick Actions

| Action | Mobile | Desktop |
| --- | --- | --- |
| Open trip details | Tap the selected trip | Double‑click trip |
| Select trip | Tap trip | Single‑click trip |
| Add expense | Use the “Add expense” card | Same |
| Edit expense | Long‑press expense | Double‑click expense |
| Add receipt | Tap grey receipt icon → choose Photo Library / Camera | Click grey icon |
| Preview receipts | Tap green receipt icon | Click green icon |
| Retake / add another receipt | In preview, tap “Retake / Add” | Same |
| Mark current receipt | In preview, tap “Make Current” | Same |

## For Developers

Serve the static files from the repo root (no build step required):

```bash
npm start            # runs npx serve
# or
npx serve -l 3000    # force specific port
# or
python3 -m http.server 3000
```

Open in your browser at the displayed localhost URL.

### Naming Conventions

To ensure consistency and clarity across the codebase, this project follows these naming conventions:

*   **JavaScript (`.js`):** Use `camelCase` for all variables and function names (e.g., `myVariable`, `calculateTotal`).
*   **CSS (`.css`) & HTML (`id`, `class`):** Use `kebab-case` for all CSS classes, IDs, and custom attributes (e.g., `.main-container`, `id="user-profile"`).

Notes
- Service Worker is disabled during development and Pages deploys (see `register-sw.js`).
- Data persists in the browser via IndexedDB (`ExpenseTracker`).
- Icon selections and category colours are saved under the `settings` store.
 - Image editor libraries (OpenCV.js, Interact.js) are lazy‑loaded at runtime; enable the Service Worker to cache them for offline use.

Design/UX
- Cards: headers, trip, and collapsed expense cards are 78px (2px grey borders, 16px padding). There’s a consistent 1rem gap below headers.
- Trip navigation: single‑tap selects (dull blue border). Only selected cards can swipe or drag. Tap selected to open details (desktop double‑click still works).
- Trip cards: title at 1rem on left; right shows stacked currency totals for non‑archived expenses, ordered £, $, €, zł, then others A–Z. With 3 currencies, totals compact slightly; the row uses CSS Grid to keep both title and totals vertically centered.
- Forms: currency, amount, date, and time fields are centered in both shadow and edit modes.
- iOS: `viewport-fit=cover`, neutral `theme-color`, safe‑area padding to avoid bright bars.

## Deploying to GitHub Pages

This repo auto-publishes to GitHub Pages on pushes to `master` via `.github/workflows/deploy.yml`.

What’s set up
- Workflow publishes the repository root to the `gh-pages` branch (orphaned) using `peaceiris/actions-gh-pages@v4`.
- SW is fully disabled to avoid caching surprises on devices.
- Favicon and assets use relative paths (work under Pages subpaths).

One-time repo settings (GitHub → Settings → Pages)
- Source: Deploy from a branch
- Branch: `gh-pages` / root (`/`)

Deploy steps
```bash
git add -A
git commit -m "chore: deploy to GitHub Pages"
git push origin master
```

Visit: `https://<your-username>.github.io/<repo-name>/`

Tips
- While iterating, add `?v=dev&nosw` to the URL to avoid stale loads.
- To enable the Service Worker for production later, set `DEFAULT_ENABLE_SW = true` in `register-sw.js` (or set `window.ENABLE_SW = true` before loading it), remove `?nosw`, and bump the `v` query to bust caches.

## Technical

Structure
- `index.html`, `styles.css`, `app.js` (boot/debug), `ui.js` (DOM + drag), `db.js` (IndexedDB via idb), `register-sw.js`, `service-worker.js` (currently disabled), `manifest.json`.
- Sections: `#active-trips-container`, `#submitted-trips-container`, `#reimbursed-trips-container` inside `#trip-list-container`.
- Image editing: `image-editor.js` (edge detection, corner refine, warp), loaded on demand.

Data & Receipts
- Trips/Expenses: stored in IndexedDB (`ExpenseTracker`).
- Receipts: stored as Blobs in an IndexedDB `receipts` store, indexed by `expenseId`. Preview modal uses object URLs; “Retake / Add” appends; “Make Current” marks current without deleting older images.
- Settings: `settings` store keeps `categoryColors` and `icons` (receipt/home/cog class names).
 - Image Adjust settings: `settings.imageAdjust` stores `{ autoDetect, dragEngine, warpEngine, maxLongSide }`.

Image Editor (OpenCV/Canvas)
- Module: `image-editor.js` provides `openReceiptEdgeEditor(blob, options)`.
- Auto‑detect: OpenCV Canny → contours → approxPolyDP (largest quad) for initial corners.
- Manual refine: draggable corners with magnifier loupe; pinch‑to‑zoom + pan; rotate 90°.
- Warp:
  - OpenCV: perspective transform (recommended)
  - Canvas: axis‑aligned crop (fallback/testing)
- Output: JPEG Blob (quality 0.9) appended as a new receipt and marked current (non‑destructive).

Libraries
- OpenCV.js (WASM) lazy‑loaded from `https://docs.opencv.org/4.9.0/opencv.js`.
- Interact.js lazy‑loaded from jsDelivr (optional; default drag uses Pointer Events).
- Service Worker caches both with stale‑while‑revalidate for offline usage.

Testing
- Playwright e2e: `npm run test:e2e` (headed: `:headed`, UI: `:ui`). Set `BASE_URL=http://localhost:3000 APP_VERSION=dev`.

## Enabling Offline Caching for Editor Libraries
- In `register-sw.js`, set `DEFAULT_ENABLE_SW = true` and remove `?nosw` from the URL.
- Hard reload once online to cache libraries (OpenCV.js, Interact.js) via the Service Worker.
- Validate in DevTools → Application → Service Workers, then test offline.

## iOS Shortcuts: Scan Documents Integration

This app can launch Apple Shortcuts to scan documents natively and attach the result as a receipt.

What it does
- Launches the Shortcuts app via `shortcuts://x-callback-url/run-shortcut` from a user tap
- Runs a “Scan to Web” Shortcut that scans pages and uploads to your API (`/upload`)
- Returns to the app: `?scan=done&result=<id>`, which the app uses to fetch the file and attach to the selected expense

Prereqs
- iPhone/iPad with Shortcuts app installed
- A minimal API (see below) reachable from the device

Enable in Settings
- Open Settings → iOS Shortcuts
  - Enable “Scan Documents” integration
  - Set API base URL (e.g., `http://localhost:4000` during dev)

Minimal backend for development
```bash
cd server
npm i express multer nanoid cors
node server.js            # runs on http://localhost:4000
```

The server exposes:
- `POST /upload` (multipart form): fields `file`, `session`, `auth`; responds `{ id }`
- `GET /files/:id`: returns the uploaded file

Add the Shortcut on iOS
1) Create a new Shortcut named “Scan to Web” with these steps:
- Get Dictionary from Shortcut Input → parse JSON `{ session, auth, expenseId }`
- Scan Documents
- Make PDF (optional, recommended)
- Get Contents of URL → POST `https://your.api/upload` with form fields: `file`, `session`, `auth`
- Get Dictionary from (response) → Get Dictionary Value `id` → Text (the id)

2) Test: on an expense, tap the receipt icon → Add → Scan with iOS Shortcuts

How it returns
- The Shortcut opens back to the app with `?scan=done&result=<id>`
- The app fetches `GET {API_BASE}/files/:id`, stores the file in IndexedDB receipts, and marks it current

Security notes
- Use short‑lived, one‑time `auth` tokens tied to `session` server‑side (HMAC/JWT)
- Validate MIME and size; use HTTPS in production
- Do not leak the file URL in `x-success` — only return an opaque `id`

Troubleshooting
- Tapping does nothing → Launch must be from a user gesture, ensure Shortcuts installed
- Returns without a result → Ensure the last Shortcut step outputs `id` as text
- Upload fails → In Shortcut “Get Contents of URL”, set Request Body = Form and add `file`

### Offline Files Mode (no server)

Prefer staying fully offline? Use Shortcuts to save the PDF locally, then pick it from Files.

Flow
- In Settings → iOS Shortcuts, enable “Files mode (save PDF locally)”
- On the expense → Add receipt → “Scan (Shortcuts → Files)”
- The Shortcut scans and saves a PDF to Files (e.g., Files → Shortcuts → ExpenseTracker) and returns to the app with `?scan=files-done`
- The app prompts you to select the scanned PDF; tap “Select scanned PDF” to open the Files picker and choose it

Filename
- The app passes a filename to the Shortcut as `vendor-date-time-currency-value.pdf` using the expense fields that initiated the scan (customizable in Settings)
- Example: `Starbucks-20250826-0945-£-3-50.pdf`

Shortcut (“Scan to Files”) outline
- Get Dictionary from Shortcut Input (JSON has `expenseId`, `filename`)
- Scan Documents → Make PDF (optional, recommended)
- Save File → Destination: iCloud Drive (or On My iPhone) → `Shortcuts/ExpenseTracker[/<subfolder>]` → Filename from input
- Text → `ok` (so the app gets `?scan=files-done`)

Notes
- The Files picker requires a user tap; the app shows a button to open it after return
- Files usually remembers the last opened folder, so subsequent selections are quick

Templates (Settings → iOS Shortcuts)
- Filename template: defaults to `{vendor}-{date}-{time}-{currency}-{amount}.pdf`
- Subfolder template (optional): e.g., `Trip-{trip}` to group by trip
- Supported variables: `{vendor}`, `{date}` (YYYYMMDD), `{time}` (HHmm), `{currency}`, `{amount}`, `{trip}`


## Recent Major Update (September 2025) 🎉

**COMPLETE RECOVERY & ENHANCEMENT**: All functionality has been fully restored and enhanced beyond the original GitHub baseline after comprehensive recovery from corruption.

### ✅ **What's New & Fixed**
- **4 Core UX Issues Resolved**: Placeholder cards, ghost snapping, drop zones, ghost swipe prevention
- **Border System Perfected**: 2px width borders with proper color reset, consistent across all card types
- **Archive Functionality Enhanced**: Ghost elements snap to placeholders, always-available drop zones  
- **Drag & Drop Polished**: Placeholder cards replace empty text, proper positioning in all sections
- **Quality Assurance**: Verified behavior consistency across Trip/Expense cards in main/archive views
- **Recovery Documentation**: Complete analysis available in recovery documentation files

### 🔧 **Technical Improvements**
- Enhanced debug infrastructure with color-coded logging
- Global constants system for consistent UX
- Comprehensive ghost class detection in all swipe handlers  
- Always-create drop zone strategy prevents disappearing zones
- Performance optimizations with calibrated swipe distances

**Status**: FULLY RECOVERED & ENHANCED - All functionality working beyond baseline

---

## To-Do

- [x] ~~**CRITICAL:** Fix the main application rendering failure~~ ✅ **RESOLVED** (September 2025)
- [x] Implement Archive Logic (soft delete) for trips and expenses.
- [ ] Implement Export/Import backup functionality.
- [x] ~~Refine the drag-and-drop animation to be smoother~~ ✅ **ENHANCED** (Ghost snapping implemented)
- [ ] Test the iOS "Scan Documents" feature using Shortcuts, as outlined in `resources/scan-to-pwa-shortcuts.md`.
- [ ] Test the image editor feature, including cropping, edge detection and warping.
- [x] ~~Test trip swipe gestures for changing trip status~~ ✅ **FULLY WORKING** (Border colors, proper reset)
- [x] Fix the home button icon color in the trip detail view.
- [x] Implement Expense Editing.
- [x] Remove unnecessary padding from text within cards.
- [x] ~~Implement dynamic "No trips" messages~~ ✅ **ENHANCED** (Placeholder cards implemented)
- [x] Implement dynamic service worker paths for local and GitHub Pages environments.
- [x] Resolve `favicon.png` 404 on GitHub Pages.
- [x] Resolve `ReferenceError: Can't find variable: window` in service worker.
- [x] Fix Bootstrap modal not hiding on GitHub Pages (re-implemented with a new modal).