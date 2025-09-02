# Install & Distribute the “Scan to MyApp” Shortcut (`scan-to-pwa-shortcut-install.md`)

**Short answer:** Yes — you (or your users) still need to **install a Shortcut on each iPhone/iPad**. The PWA can *launch* a Shortcut via URL, but it can’t create or auto‑install one. The guide below gives a paste‑ready recipe, first‑run prompts, and distribution options (iCloud link or a `.shortcut` file you can host on GitHub).

> Apple documents running shortcuts from URLs (`shortcuts://…run-shortcut`) and x‑callback return URLs; they also explain sharing a Shortcut via **Copy iCloud Link**. citeturn0search1turn0search0turn0search2

---

## What you’ll deliver

- A Shortcut named **“Scan to MyApp”** that:
  1) receives JSON `{vendor,date,time,currency,value}` from your PWA,  
  2) launches **Scan Documents** (system Files scanner → PDF),  
  3) **names** the file `vendor-date-time-currency-value.pdf`,  
  4) **ensures the folder exists** under **On My iPhone › MyApp › Scans**,  
  5) **saves** the PDF there (first run asks for folder permission), then  
  6) returns to your PWA via the `x-success` URL.

> “Scan Documents” and “Save File” are built‑in Shortcuts actions; saving to **On My iPhone** is supported. citeturn2search3turn1search8

---

## Build the Shortcut (≈90 seconds)

**Create** a new Shortcut named **Scan to MyApp**. In **Shortcut Settings** set **Accepts** → **Any** input. citeturn0search9

### Actions (in order)

1. **Get Text from Input**  
2. **Get Dictionary from Input**  
3. **Get Dictionary Value** → Key `vendor` → set variable **Vendor**  
4. **Get Dictionary Value** → Key `date` → **Date**  
5. **Get Dictionary Value** → Key `time` → **Time**  
6. **Get Dictionary Value** → Key `currency` → **Currency**  
7. **Get Dictionary Value** → Key `value` → **Value**  
   > These parse your PWA’s JSON payload (the PWA formats values already).

8. **Text** → variable **Filename** with:  
   ```
   {{Vendor}}-{{Date}}-{{Time}}-{{Currency}}-{{Value}}.pdf
   ```
   *(Keep PWA-side normalization: vendor slug, `YYYYMMDD`, `HHmm`, `GBP`, `12.34`.)*

9. **Scan Documents** → output: **PDF**  
   > Triggers the system scanner UI; produces a single PDF. (Files/Shortcuts scanner.) citeturn2search3

10. **Set Name** → Name = **Filename**  
    > Prefer **Set Name** over **Rename File** to minimize folder‑permission nags. citeturn1search6

11. **If** → Condition: **Folder** “On My iPhone › MyApp › Scans” **does not exist**  
    - Then: **Create Folder** → Location: **On My iPhone** → Path: `MyApp/Scans`  
    - Otherwise: **Nothing**

12. **Save File**  
    - **Destination**: **On My iPhone**  
    - **Subpath**: `MyApp/Scans`  
    - **Ask Where to Save**: **Off**  
    > On first run you’ll be asked to allow folder access; then it’s remembered. citeturn1search3

**Done.** When invoked by your PWA’s `shortcuts://x-callback-url/run-shortcut?...&x-success=...`, control returns to your `/import` page when saving completes. citeturn0search0

---

## PWA launcher (recap)

```js
const payload = { vendor, date, time, currency, value }; // normalised on PWA
const url = "shortcuts://x-callback-url/run-shortcut"
  + "?name=" + encodeURIComponent("Scan to MyApp")
  + "&input=text&text=" + encodeURIComponent(JSON.stringify(payload))
  + "&x-success=" + encodeURIComponent("https://yourapp.example/import?ok=1")
  + "&x-error="   + encodeURIComponent("https://yourapp.example/import?err=1");
window.location.href = url; // must be inside a user click handler
```

Apple’s docs cover both **run-shortcut** and **x‑callback** forms. citeturn0search1turn0search0

---

## Distribution options

### A) **iCloud link (recommended)**
1. Open the Shortcut ▸ **Share** ▸ **Copy iCloud Link**.  
2. Paste the link into your docs/PWA (e.g., “Install Shortcut”).  
3. Users tap → **Get Shortcut** → it’s added to their library. citeturn0search2

### B) **`.shortcut` file (works with GitHub)**
1. **Share** the Shortcut ▸ **Save to Files** to export `Scan to MyApp.shortcut`.  
2. Upload that file to **GitHub** (repo or Releases).  
3. On iPhone, open the file from GitHub (or download to Files) and **Open in Shortcuts** to import.  
   - Note: GitHub just **hosts** the file; it doesn’t auto‑install. iCloud links give the smoothest “Get Shortcut” flow.

---

## First‑run UX & prompts

- **Folder permission:** iOS may prompt the first time **Save File** writes to `On My iPhone › MyApp › Scans`. Approve to avoid future prompts. citeturn1search3  
- **Missing folder:** The Shortcut **creates** `MyApp/Scans` automatically (step 11).  
- **Return to PWA:** The `x-success` URL is called automatically after the **Save File** step. citeturn0search0

---

## Troubleshooting notes

- If you see repeated permission prompts, switch **Rename File** → **Set Name**, or set the filename directly in **Save File**’s **Subpath**. citeturn1search6  
- If **Scan Documents** opens the last‑used Files location, adding “Create/Ensure Folder” before saving helps maintain consistency. citeturn2search0  
- Ensure **Accepts: Any** so `input=text` is received from your PWA link. citeturn0search9

---

## Why you can’t fully automate installation

Shortcuts must be **installed per device**. A PWA can’t silently add a Shortcut. The supported flows are: user taps an **iCloud link** (best) or imports a **`.shortcut`** file. Running a Shortcut from a URL requires that the Shortcut already exists in the user’s library. citeturn0search1

---

## Appendix: Minimal variant (all logic in PWA)

If you strictly normalise `vendor/date/time/currency/value` in the PWA, the Shortcut can be even simpler:

1) **Get Text from Input** → **Get Dictionary from Input** → **Get Dictionary Value** ×5  
2) **Text → Filename**: `{{Vendor}}-{{Date}}-{{Time}}-{{Currency}}-{{Value}}.pdf`  
3) **Scan Documents** → PDF  
4) **Set Name** = **Filename**  
5) **Create Folder** (if missing) `On My iPhone › MyApp › Scans`  
6) **Save File** → `On My iPhone › MyApp › Scans` (Ask Where Off)

That’s it.
