# Expense Tracker

![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge)
![Platform](https://img.shields.io/badge/Device-📱%20Mobile%20Optimized-0ea5e9?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Hosted-GitHub%20Pages-8b5cf6?style=for-the-badge)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952b3?style=for-the-badge&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla%20JS-ffb000?style=for-the-badge&logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)

Fast, phone‑friendly trip expense tracking. Create trips, add expenses, attach receipts, and preview them on your phone. Long‑press an expense to edit; tap the receipt icon to add from your camera roll or take a photo — tap again (green) to preview in a gallery.

## For Users

- Trips: Add a trip; tap to select; tap again to open. Drag between Active, Submitted, Reimbursed.
- Expenses: Add from the “Add expense” card. Long‑press an expense to edit on mobile (desktop: double‑click).
- Receipts: Grey icon = add (camera roll / file / camera). Green icon = preview; thumbnails + “Retake / Add”; “Make Current” marks the active image. All images are kept.
- Mobile polish: Compact cards (74px), centered fields (currency/amount/date/time), safe‑area support for iPhone Dynamic Island.

Try it on Pages: `https://<your-username>.github.io/<repo-name>/?v=dev&nosw`

### Quick Actions

| Action | Mobile | Desktop |
| --- | --- | --- |
| Open trip details | Tap the selected trip | Double‑click trip |
| Select trip | Tap trip | Single‑click trip |
| Add expense | Use the “Add expense” card | Same |
| Edit expense | Long‑press expense | Double‑click expense |
| Add receipt | Tap grey receipt icon → choose Photo Library / File / Camera | Click grey icon |
| Preview receipts | Tap green receipt icon | Click green icon |
| Retake / add another receipt | In preview, tap “Retake / Add” | Same |
| Mark current receipt | In preview, tap “Make Current” | Same |

## For Developers

Serve the static files from the repo root (no build step required):

```bash
npm start            # runs npx serve on port 3000
# or
npx serve -l 3000
# or
python3 -m http.server 3000
```

Open: `http://localhost:3000/index.html?v=dev&nosw`

Notes
- Service Worker is disabled during development and Pages deploys (see `register-sw.js`).
- Data persists in the browser via IndexedDB (`ExpenseTracker`).

Design/UX
- Cards: headers, trip, and collapsed expense cards are 74px (2px grey borders, 16px padding). There’s a consistent 1rem gap below headers.
- Trip navigation: selected trip keeps its grey border; on mobile, tap selected to open details (desktop double‑click still works).
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

Data & Receipts
- Trips/Expenses: stored in IndexedDB (`ExpenseTracker`).
- Receipts: stored as Blobs in an IndexedDB `receipts` store, indexed by `expenseId`. Preview modal uses object URLs; “Retake / Add” appends; “Make Current” marks current without deleting older images.

Testing
- Playwright e2e: `npm run test:e2e` (headed: `:headed`, UI: `:ui`). Set `BASE_URL=http://localhost:3000 APP_VERSION=dev`.
