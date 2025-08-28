# Scan to MyApp – PWA + Shortcuts Bridge

This bundle contains a minimal PWA and an iOS Shortcut skeleton that work together to scan a receipt, auto‑name it, save it to **On My iPhone › MyApp › Scans**, then import it back into the PWA.

## Quick start
1) **Files app:** create `On My iPhone › MyApp › Scans`.
2) **Shortcuts app:** build the Shortcut using `scan-to-myapp.steps.md` (12 actions).
3) **Open /pwa/index.html:** fill in the 5 fields and tap **Scan**. After return, open **/pwa/import.html** and pick the PDF.

Optional: sign the skeleton (`/shortcuts/scan-to-myapp.skeleton.wflow`) on a Mac to produce a distributable `.shortcut`.
