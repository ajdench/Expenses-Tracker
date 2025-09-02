# scan-to-web-shortcut.md

**Purpose:** Let a web app invoke Apple’s native *Scan Documents* flow via **Shortcuts**, upload the result to your backend, and return the user to your site with a short token you can use to fetch the file.

> Works by deep‑linking to:  
> `shortcuts://x-callback-url/run-shortcut?...&x-success=https://your.app/scan/done&x-error=...`  
> Shortcuts performs the scan ➜ uploads file to your API ➜ redirects Safari back to `x-success?result=<id>`.

---

## 0) TL;DR (copy/paste checklist)

- Add a “**Scan to Web**” Shortcut (steps below).
- Add a **button** on your page that opens the URL scheme (example below).
- Spin up a tiny **Node/Express** endpoint that accepts a file upload and returns `{ id }`.
- On `/scan/done`, **read `result`** from the query string and `GET /files/:id` from your backend to display/download the scan.

---

## 1) Web deeplink (x‑callback‑url)

Use a *user‑gesture* (tap/click) to open Shortcuts:

```html
<!-- Replace your.app with your domain; encode your JSON "text" param -->
<a
  id="scanLink"
  href="shortcuts://x-callback-url/run-shortcut
?name=Scan%20to%20Web
&input=text
&text=%7B%22session%22%3A%22abc123%22%2C%22auth%22%3A%22YOUR_ONE_TIME_TOKEN%22%7D
&x-success=https%3A%2F%2Fyour.app%2Fscan%2Fdone
&x-cancel=https%3A%2F%2Fyour.app%2Fscan%2Fcancel
&x-error=https%3A%2F%2Fyour.app%2Fscan%2Ferror">
  Scan a document
</a>
```

On **`/scan/done`**, parse `?result=<id>` and fetch the file from your API (see §4).

> **Notes**
> - `input=text&text=...` passes JSON to the Shortcut as *Shortcut Input*. We’ll parse it there.
> - Shortcuts appends the Shortcut’s final *textual output* as `result` to `x-success`.
> - Always launch from a user action so Safari allows the app switch.

---

## 2) Build the Shortcut (“Scan to Web”)

Create a new Shortcut with these actions **in order**:

1. **Get Dictionary from** `Shortcut Input`  
   - Parses the JSON passed via the `text=` query param.
   - Optional: **Get Dictionary Value** “session” and “auth” → store in variables.

2. **Scan Documents** (built‑in)  
   - Produces one or more **images** or a document item. Leave auto‑capture on if desired.

3. *(Optional but recommended)* **Make PDF** from the scanned pages  
   - Output: a single PDF file. Name it if you like (e.g., include timestamp/session).

4. **Get Contents of URL**  
   - **URL:** `https://api.your.app/upload`  
   - **Method:** `POST`  
   - **Request Body:** *Form*  
     - Add field **`file`** → *Provided Input* (choose the PDF from step 3, or the images from 2).  
     - Add field **`session`** → (value from step 1).  
     - Add field **`auth`** → (value from step 1).  
   - **Headers (optional):** e.g., `X-Client: shortcuts-ios`

   The server should return JSON: `{ "id": "abc123" }`.

5. **Get Dictionary from** (Result of step 4)

6. **Get Dictionary Value** → Key: `id` → set variable `scan_id`

7. **Text** → `scan_id`  
   - This *text* becomes the Shortcut’s final output.

That’s it. When it finishes, Shortcuts opens your `x-success` URL as:  
`https://your.app/scan/done?result=<scan_id>`

> **Tip:** If you skip PDF creation (step 3), upload the images directly and assemble the PDF on the server.

---

## 3) Minimal backend (Node.js / Express)

Install deps:
```bash
npm i express multer nanoid
```

`server.js`:
```js
import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads") });

// Simple in-memory index (replace with DB in production)
const index = new Map();

// Auth helper (VERY basic — replace with HMAC/OAuth/etc.)
function checkAuth(req) {
  const { auth } = req.body || req.query || {};
  return typeof auth === "string" && auth.length > 0;
}

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!checkAuth(req)) return res.status(401).json({ error: "unauthorized" });
    if (!req.file) return res.status(400).json({ error: "no file" });

    const id = nanoid(10);
    const ext = path.extname(req.file.originalname || "") || ".pdf";
    const finalPath = path.join(__dirname, "uploads", `${id}${ext}`);
    fs.renameSync(req.file.path, finalPath);

    // Keep metadata
    index.set(id, { path: finalPath, mime: req.file.mimetype || "application/pdf" });

    res.json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

app.get("/files/:id", (req, res) => {
  const meta = index.get(req.params.id);
  if (!meta) return res.status(404).json({ error: "not_found" });
  res.type(meta.mime).send(fs.readFileSync(meta.path));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
```

Run:
```bash
node server.js
```

---

## 4) Your `/scan/done` page

Example page that reads the token and fetches the file:

```html
<!doctype html>
<html>
  <body>
    <h1>Scan complete</h1>
    <div id="out"></div>
    <script>
      const params = new URLSearchParams(location.search);
      const id = params.get("result");
      const out = document.getElementById("out");

      if (!id) {
        out.textContent = "No result token was returned.";
      } else {
        out.innerHTML = `Result id: <code>${id}</code><br>Fetching...`;
        // Render as link; you can also display via <iframe> if it's a PDF.
        const url = `https://api.your.app/files/${encodeURIComponent(id)}`;
        const a = document.createElement("a");
        a.href = url;
        a.textContent = "Download scanned file";
        a.download = `scan-${id}.pdf`;
        out.appendChild(document.createElement("br"));
        out.appendChild(a);
      }
    </script>
  </body>
</html>
```

---

## 5) Security & resilience

- **One‑time token:** Put a short‑lived, single‑use token in the `text=` JSON (e.g., `{ session, auth }`). Reject uploads without a valid token.
- **File limits:** Set max file size and validate MIME/extension server‑side.
- **Privacy:** Use HTTPS end‑to‑end. Don’t leak the actual file in the `x-success` URL; only return a short random ID.
- **User experience:** Provide a “Did nothing happen?” help link explaining they must allow the app switch and have Shortcuts installed.
- **Older iOS:** If the built‑in **Scan Documents** action isn’t available, you can substitute a third‑party Shortcuts action (e.g., Toolbox Pro / Actions app) or open Notes/Files via URL scheme and rely on share‑sheet—but the flow is less clean.

---

## 6) Developer notes

- Shortcuts’ URL scheme supports `run-shortcut` with `input=` and `text=` parameters, plus `x-success`, `x-error`, and `x-cancel` **x‑callback‑url** parameters. The final textual output is appended to `x-success` as `result=`.  
- Use *Form* body in **Get Contents of URL** to send files (multipart/form-data). For multiple pages as images, you can either upload an array of files or first **Make PDF**.

---

## 7) Test plan

1. Start the Express server locally (or deploy a test endpoint).
2. Add the Shortcut exactly as in §2 and set the upload URL to your server.
3. Open your web page on iPhone and tap **Scan a document**.
4. Scan two pages; ensure the PDF contains both.
5. Verify Safari lands on `/scan/done?result=<id>` and that the download link works.
6. Disable network to simulate failures: confirm **x-error** route shows a useful message.
7. Expire/validate the one‑time token and confirm the server rejects the upload.

---

## 8) Variations

- **Return to an in‑app WebView** (Capacitor/Cordova) using a custom URL scheme like `myapp://scan/done?result=...` and intercept it in the native layer.
- **Skip the server:** If you *must* keep it serverless, have Shortcuts **Save File** to iCloud Drive and return the iCloud share link, but be aware of revocation/privacy trade‑offs.
- **Multi‑tenant:** Include `tenant`/`user` fields in the JSON and verify them server‑side.

---

## 9) Troubleshooting

- Tapping the link does nothing → Ensure it’s a user gesture and that the URL is valid/encoded.
- Shortcut runs but returns without a `result` → Make sure the last action is **Text** (or **Get Dictionary Value** → id) so the output is textual.
- Upload fails → Inspect server logs; in Shortcuts, enable **Show More** on **Get Contents of URL** and set **Request Body** to *Form*, adding `file` explicitly.

---

## 10) References (high-level)

- Shortcuts: **Run a shortcut using a URL scheme** and **Use x-callback-url** (Apple User Guide).  
- x‑callback‑url: official spec.  
- Shortcuts: **Get Contents of URL** action (Apple User Guide).  
- Notes/Files: **Scan Documents** feature on iOS (for context).

