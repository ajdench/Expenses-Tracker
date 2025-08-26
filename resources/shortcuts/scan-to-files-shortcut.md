# Shortcut: Scan to Files (for Expense Tracker)

Purpose: Scan documents using the native iOS “Scan Documents” action, save a PDF to Files at `Shortcuts/ExpenseTracker[/<subfolder>]` with a filename passed from the web app, then return to Safari.

Inputs (from the app via `text=` JSON)
- `expenseId` (string) – for reference only
- `filename` (string) – e.g., `Vendor-20250826-0945-£-12-34.pdf`
- `subfolder` (string, optional) – e.g., `Trip-Paris`

Actions (in order)
1. Get Dictionary from Shortcut Input
2. Get Dictionary Value – Key: `filename` → Variable `FN`
3. Get Dictionary Value – Key: `subfolder` → Variable `SUB`
4. Scan Documents
5. (Optional) Make PDF from scanned pages
6. Save File
   - Service: iCloud Drive (or On My iPhone)
   - Destination: Shortcuts → ExpenseTracker → if `SUB` is set, append that subfolder (create if needed)
   - Ask Where to Save: OFF
   - Overwrite If File Exists: ON (optional)
   - File Name: `FN`
7. Text → `ok` (ensures `x-success` returns `?result=ok`)

Return URLs (set by the app)
- x-success: `<site>/?scan=files-done`
- x-cancel: `<site>/?scan=cancel`
- x-error: `<site>/?scan=error`

Notes
- The web app computes and passes `filename` and `subfolder` using Settings templates. You can adjust defaults in Settings → iOS Shortcuts.
- After return, the app prompts you to pick the PDF from Files; choose the one just saved.

