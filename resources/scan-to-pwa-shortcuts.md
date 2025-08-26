# Scan-to-PWA via Shortcuts – Workflow & Implementation Guide (`scan-to-pwa-shortcuts.md`)

**Goal:** From your PWA, open a named Shortcut that launches the system **Scan Documents** interface, auto‑names the resulting PDF as  
`<vendor>-<date>-<time>-<currency>-<value>.pdf`, saves it to a dedicated **On My iPhone** folder, returns to the PWA, and then lets the user pick & import the new PDF.

This document is written for Codex/CLI agents to implement both sides (PWA + Shortcut) end‑to‑end.

---

## 1) High‑level architecture

**Flow:** PWA ➜ Shortcuts (Scan Documents) ➜ Files (save) ➜ `x-success` callback ➜ PWA `/import` route (user picks PDF).

- **Invocation:** `shortcuts://x-callback-url/run-shortcut?name=<NAME>&input=text&text=<JSON>&x-success=<URL>&x-error=<URL>`  
- **Payload JSON contract:** `{ vendor, date, time, currency, value }`  
- **Filename contract:**  
  - `vendor` → slug, lowercase, spaces→`-`, only `[a-z0-9-]`  
  - `date` → `YYYYMMDD` (e.g., `20250826`)  
  - `time` → `HHmm` 24‑hour (e.g., `2130`)  
  - `currency` → ISO 4217 uppercase (e.g., `GBP`)  
  - `value` → two decimals, dot decimal separator (e.g., `129.99`)  
  - **Final:** `vendor-date-time-currency-value.pdf` (example: `cotswold-company-20250826-2130-GBP-129.99.pdf`)

> iOS Safari/PWA cannot call VisionKit directly. The Shortcuts **Scan Documents** action opens the system scanner UI and returns a PDF to Shortcuts, which then saves to Files.

---

## 2) PWA implementation

### 2.1 Minimal HTML form (example)
Provide five inputs your users complete **before** scanning.

```html
<form id="scanForm">
  <label>Vendor <input id="vendor" required placeholder="Cotswold Company" /></label><br>
  <label>Date <input id="date" type="date" required /></label><br>
  <label>Time <input id="time" type="time" required /></label><br>
  <label>Currency <input id="currency" required placeholder="GBP" /></label><br>
  <label>Value <input id="value" required placeholder="129.99" inputmode="decimal" /></label><br>
  <button id="scanBtn" type="button">Scan</button>
</form>
```

### 2.2 Launcher script (opens the Shortcut)
**Must** be triggered by a user gesture (click/tap). Encodes a JSON payload and sets `x-success`/`x-error` callbacks.

```html
<script>
  function slugifyVendor(v) {
    return String(v || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')        // spaces/underscores → hyphens
      .replace(/[^a-z0-9\-]/g, '');   // strip non-safe chars
  }
  function normDate(d) {
    // Input type="date" yields "YYYY-MM-DD" (local). Convert to YYYYMMDD.
    const t = new Date(d);
    if (!isNaN(+t)) {
      const y = t.getFullYear();
      const m = String(t.getMonth()+1).padStart(2,'0');
      const day = String(t.getDate()).padStart(2,'0');
      return `${y}${m}${day}`;
    }
    return String(d).replaceAll('-', '');
  }
  function normTime(t) {
    // Input type="time" yields "HH:MM" 24h. Convert to HHmm.
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(t));
    if (!m) return String(t).replace(/:/g,'');
    const hh = String(m[1]).padStart(2,'0');
    const mm = m[2];
    return `${hh}${mm}`;
  }
  function normCurrency(c) {
    return String(c || '').trim().toUpperCase(); // Prefer ISO codes
  }
  function normValue(v) {
    // Keep dot decimal, 2dp. Strip commas, coerce to Number when possible.
    const n = Number(String(v).replace(/,/g,''));
    if (Number.isFinite(n)) return n.toFixed(2);
    const safe = String(v).replace(/[^0-9.]/g,'');
    return (Number(safe) || 0).toFixed(2);
  }

  document.getElementById('scanBtn').addEventListener('click', () => {
    const vendor   = slugifyVendor(document.querySelector('#vendor').value);
    const date     = normDate(document.querySelector('#date').value);
    const time     = normTime(document.querySelector('#time').value);
    const currency = normCurrency(document.querySelector('#currency').value);
    const value    = normValue(document.querySelector('#value').value);

    const payload = { vendor, date, time, currency, value };
    const text      = encodeURIComponent(JSON.stringify(payload));
    const xSuccess  = encodeURIComponent('https://yourapp.example/import?ok=1');
    const xError    = encodeURIComponent('https://yourapp.example/import?err=1');
    const shortcut  = encodeURIComponent('Scan to MyApp'); // must equal the Shortcut’s name

    const url = `shortcuts://x-callback-url/run-shortcut?name=${shortcut}&input=text&text=${text}&x-success=${xSuccess}&x-error=${xError}`;
    window.location.href = url; // Opens Shortcuts
  });
</script>
```

### 2.3 `/import` route (pick & store the PDF)
On return, prompt the user to choose the newly saved PDF from **On My iPhone › MyApp › Scans**, then store it in IndexedDB.

```html
<!-- /import -->
<h1>Import Scan</h1>
<p id="status"></p>
<button id="pickBtn">Select Scan</button>
<input id="fileInput" type="file" accept="application/pdf" hidden />

<script>
  const status = document.getElementById('status');
  const params = new URLSearchParams(location.search);
  if (params.has('ok')) status.textContent = 'Scan complete. Select the new PDF from On My iPhone › MyApp › Scans.';
  if (params.has('err')) status.textContent = 'Scan failed. You can still pick a file manually.';

  document.getElementById('pickBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });

  // Minimal IndexedDB helpers
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('myapp-db', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('scans', { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function putScan(record) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('scans', 'readwrite');
      tx.objectStore('scans').put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = file.name; // use the Shortcut-generated filename as the key
    const arrayBuf = await file.arrayBuffer();
    await putScan({ id, name: file.name, mime: file.type, data: arrayBuf, ts: Date.now() });
    status.textContent = `Imported: ${file.name}`;
  });
</script>
```

---

## 3) Shortcut implementation (“Scan to MyApp”)

Create a Shortcut named **Scan to MyApp** with these steps:

**Settings**
- **Accepts:** *Any*  
- (Optional) Show in Share Sheet: Off

**Actions (in order)**
1. **Get Text from Input**  
2. **Get Dictionary from Input**  
3. **Get Dictionary Value** (Key: `vendor`) → set variable **Vendor**  
4. **Get Dictionary Value** (Key: `date`) → **Date**  
5. **Get Dictionary Value** (Key: `time`) → **Time**  
6. **Get Dictionary Value** (Key: `currency`) → **Currency**  
7. **Get Dictionary Value** (Key: `value`) → **Value**  

8. **Text** (or a series of “Replace Text” / “Change Case” / “Match Text” steps) to build normalized fields:  
   - **VendorSlug** = Vendor → lowercase → spaces/underscores → `-` → remove non `[a-z0-9-]`.  
   - **DateNorm** = Date → remove `-` (or reformat to `YYYYMMDD`).  
   - **TimeNorm** = Time → remove `:` (e.g., `21:30` → `2130`).  
   - **CurrUp** = Currency → uppercase.  
   - **ValNorm** = Value → remove commas → **Format Number** (2 decimals, `.` decimal separator).

9. **Text** → variable **Filename**:  
   ```
   {{VendorSlug}}-{{DateNorm}}-{{TimeNorm}}-{{CurrUp}}-{{ValNorm}}.pdf
   ```

10. **Scan Documents** (opens the system scanner; outputs a PDF file).  
11. **Rename File** → Name = **Filename**.  
12. **Save File** → Location: **On My iPhone › MyApp › Scans**; **Ask Where to Save** = Off.  
    - On first run you may be prompted to grant folder access.

> When the Shortcut completes, Shortcuts returns control to the PWA via `x-success`. No “Open URL” step is required unless you prefer to force a specific return page.

---

## 4) Folder setup (one‑time)

1. Open **Files** → *On My iPhone* → create folders `MyApp/Scans`.  
2. Optionally **Favorite** `MyApp/Scans` for quick access.  
3. In the Shortcut’s **Save File** action, set default location to this folder and turn **Ask Where to Save** off.

---

## 5) Validation & test plan

- **Invocation:** Tapping **Scan** opens Shortcuts and runs **Scan to MyApp**.  
- **Filename:** Temporarily add a **Quick Look** action after **Rename File** to verify the exact name.  
- **Scan:** Scanner UI appears; create a multi‑page PDF; tap Save.  
- **Save:** PDF appears in **On My iPhone › MyApp › Scans** with the normalized filename.  
- **Return:** PWA receives `x-success` and loads `/import?ok=1`.  
- **Import:** User picks the new PDF; the PWA stores it in IndexedDB (verify presence by listing keys or logging).

---

## 6) Acceptance criteria

- [ ] PWA sends JSON `{vendor,date,time,currency,value}` to the Shortcut via `shortcuts://x-callback-url/run-shortcut`.  
- [ ] Shortcut constructs `vendor-date-time-currency-value.pdf` per normalization rules.  
- [ ] PDF saved to **On My iPhone › MyApp › Scans** without additional prompts after first run.  
- [ ] PWA receives `x-success` and shows `/import` guidance.  
- [ ] User imports the file; it is persisted in IndexedDB.

---

## 7) Caveats & notes

- **User gesture:** The scheme must be launched from a user interaction (tap/click).  
- **No silent pickup:** Browsers cannot automatically read Files storage; the user chooses the file via the picker.  
- **Locales:** If users enter values with commas or different decimal separators, normalization ensures `ValNorm` uses a dot and two decimals.  
- **Timezones:** HTML `type="date"` is local; ensure you treat `date/time` consistently server‑side if later uploaded.  
- **Filename length:** Keep under typical iOS path length limits; your structure is short enough.  
- **Privacy:** Everything stays on‑device unless you later add an upload step.

---

## 8) Optional enhancements

- **Auto‑upload in Shortcut:** Replace return to PWA with a **Get Contents of URL** (POST multipart) to your backend; send the PDF and metadata.  
- **PWA listing:** Add a page that lists all Imported scans from IndexedDB with a “View”/“Delete” action.  
- **Preset vendors:** Provide a vendor dropdown with recent selections and a free‑text fallback.  
- **Currency picker:** Use an ISO‑4217 list with search and country flags for quicker entry.

---

## 9) Files to create (suggested structure)

```
/pwa
  index.html          # form with 5 fields + Scan button (section 2.1/2.2)
  import.html         # /import route (section 2.3)
  /static
    app.css
    app.js            # optionally separate JS from HTML
/shortcuts
  Scan to MyApp.description.md  # action-by-action recipe (section 3)
```

**Shortcut name must equal:** `Scan to MyApp` (or update the launcher URL accordingly).

---

## 10) Quick start checklist

1. Create **On My iPhone › MyApp › Scans** in Files.  
2. Build the **Scan to MyApp** Shortcut exactly as in §3.  
3. Wire the PWA **Scan** button to open the Shortcut with JSON payload + `x-success`.  
4. Implement `/import` to prompt for file selection and persist to IndexedDB.  
5. Run end‑to‑end test; verify filename normalization and persistence.
