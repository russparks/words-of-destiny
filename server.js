const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const express = require("express");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;

const rootDir = __dirname;
const soundsDir = path.join(rootDir, "sounds");
const allowedExtensions = new Set([".mp3", ".m4a"]);
const allowedMimeTypes = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
]);

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedExt = allowedExtensions.has(ext);
    const isAllowedMime = allowedMimeTypes.has(file.mimetype);

    if (!isAllowedExt || !isAllowedMime) {
      cb(new Error("Only MP3 and M4A files are allowed."));
      return;
    }

    cb(null, true);
  },
});

function slugifyTitle(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function ensureUniqueFilename(baseName, ext) {
  let candidate = `${baseName}${ext}`;
  let counter = 2;

  while (fs.existsSync(path.join(soundsDir, candidate))) {
    candidate = `${baseName}-${counter}${ext}`;
    counter += 1;
  }

  return candidate;
}

app.use(express.static(rootDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(rootDir, "admin.html"));
});

app.get("/api/sounds", async (req, res) => {
  try {
    const files = await fsp.readdir(soundsDir);
    const soundFiles = files
      .filter((file) => allowedExtensions.has(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => ({
        name: file,
        url: `/sounds/${encodeURIComponent(file)}`,
      }));

    res.json({ sounds: soundFiles });
  } catch (error) {
    res.status(500).json({ error: "Could not load sound list." });
  }
});

app.post("/api/upload", upload.single("audio"), async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title : "";
    const normalized = slugifyTitle(title);

    if (!normalized) {
      res.status(400).json({ error: "Title is required." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Audio file is required." });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.has(ext)) {
      res.status(400).json({ error: "Only MP3 and M4A files are allowed." });
      return;
    }

    const filename = await ensureUniqueFilename(normalized, ext);
    const fullPath = path.join(soundsDir, filename);
    await fsp.writeFile(fullPath, req.file.buffer);

    res.json({
      ok: true,
      filename,
      message: "...thanks for the input...",
    });
  } catch (error) {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File must be smaller than 5MB." });
      return;
    }

    res.status(500).json({ error: error.message || "Upload failed." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
