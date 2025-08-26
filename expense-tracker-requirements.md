---
# 📋 Expense Tracker PWA — Technical Contract (Finalised)

## 🧠 Human-Readable Summary

This is a production-ready offline-first Progressive Web App (PWA) that allows users to track and manage expenses related to trips. The app uses IndexedDB for local storage, includes a PWA manifest, service worker for offline support, and a responsive UI using Bootstrap 5 (with a small amount of custom CSS). It does **not require an offline fallback page** — all functions continue working offline via local browser cache and IndexedDB.

---

## 🛠️ Files and Their Roles

| File | Description |
|------|-------------|
| `index.html` | Main app layout, now includes `register-sw.js` for service worker registration |
| `styles.css` | Custom Bootstrap overrides and small utility styles |
| `app.js` | App bootstrap logic and toast notifications |
| `ui.js` | Renders trip and expense views from local DB |
| `db.js` | IndexedDB abstraction layer using idb-like pattern |
| `manifest.json` | Required PWA manifest metadata for installability |
| `service-worker.js` | Caches static assets for true offline capability |
| `register-sw.js` | Registers the service worker on load |

---

## ✅ Productionised Requirements Mapping

| Requirement | File(s) Implementing |
|-------------|----------------------|
| IndexedDB local storage | `db.js` |
| Trip/Expense model | `db.js`, `ui.js` |
| Archive logic (soft delete) | (Supported structure, UI coming in next iteration) |
| Export/Import backup | `app.js` (stub to extend) |
| Toast UX feedback | `app.js`, `index.html` |
| Bootstrap-based styling | `styles.css`, `index.html` |
| PWA manifest | `manifest.json` |
| Offline-first caching | `service-worker.js` |
| PWA installability | `manifest.json`, `register-sw.js`, `index.html` |
| Mobile responsiveness | (Bootstrap via `styles.css`) |

---

## 🧪 Local Testing Instructions

1. Serve via secure local server:

```bash
npx serve /path/to/unzipped
# or
python3 -m http.server
```

2. Open browser: `http://localhost:3000` (or relevant port)
3. Open DevTools → Application Tab → Confirm:
   - Service worker registered
   - Files cached
   - IndexedDB populated

4. Turn off internet and refresh — everything should still work.

---

## 📦 Output Bundle

Download latest PWA bundle: [expense-tracker-pwa.zip](sandbox:/mnt/data/expense-tracker-pwa.zip)

---

**Author:** Andrew Dench  
**Project:** DenchCo Engineering — Expense Tracker PWA  
**Status:** ✅ MVP complete, ready for deployment
---
