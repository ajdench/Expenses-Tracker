import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: /http:\/\/localhost:3000$/ }));
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

// Simple in-memory index (replace with DB in production)
const index = new Map();

// Auth helper (placeholder — replace with HMAC/OAuth/etc.)
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
    const finalPath = path.join(uploadsDir, `${id}${ext}`);
    fs.renameSync(req.file.path, finalPath);

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Scan API on http://localhost:${PORT}`));
