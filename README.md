# Expense Tracker PWA

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-enabled-brightgreen?style=for-the-badge)
![Made with](https://img.shields.io/badge/Made%20with-Bootstrap-blueviolet?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

This is a production-ready offline-first Progressive Web App (PWA) for tracking and managing expenses related to trips. It is designed to work seamlessly offline by utilizing IndexedDB for local storage and a service worker for caching static assets. The user interface is built with HTML, CSS (Bootstrap), and vanilla JavaScript.

## Features

*   **Offline-First:** Works seamlessly offline with IndexedDB for data and a service worker for caching assets.
*   **Trip Management:** Create, view, and categorize trips (Active, Submitted, Reimbursed) with drag-and-drop functionality.
*   **Dynamic UI:** "No trips" messages dynamically appear/disappear based on category content.
*   **Expense Tracking:** Add, view, and **edit** expenses for each trip, including description, amount, date, category, and notes.
*   **Responsive Design:** Built with Bootstrap for a mobile-first, responsive user experience.
*   **Custom Styling:** Enhanced visual consistency with custom blue theme (`#1663bb`), unified title card sizing, and refined home icon styling.
*   **Global Padding:** Consistent 16px horizontal padding across the main container for improved aesthetics.

## Local Development

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
 
### Mobile UX
- Edit expense: double-click on desktop; long-press (~500ms) on mobile.
- Receipts: tap grey receipt icon to capture/upload; tap green icon to preview receipts. The icon badge shows count. Use “Retake / Add” to append a new image; “Make Current” sets the active preview as current (older images are kept).

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
git commit -m "chore: prepare GitHub Pages deploy (disable SW, fix paths)"
git push origin master
```

Visit: `https://<your-username>.github.io/<repo-name>/`

Tips
- While iterating, add `?v=dev&nosw` to the URL to avoid stale loads.
 - To enable the Service Worker for production later, set `DEFAULT_ENABLE_SW = true` in `register-sw.js` (or set `window.ENABLE_SW = true` before loading it), remove `?nosw`, and bump the `v` query to bust caches.
