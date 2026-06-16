import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Setup server and storage path
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "data-store.json");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Ensure data directory exists if needed, and file exists
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    try {
      // Create empty persistent file - clients will hydrate it on boot if empty
      fs.writeFileSync(DATA_FILE, JSON.stringify({ empty: true }, null, 2), "utf8");
      console.log("Initialized empty data-store.json");
    } catch (err) {
      console.error("Failed to initialize database file:", err);
    }
  }
}
ensureDataFile();

// ==================== BACKEND API ROUTES ====================

// 1. Get entire application data state
app.get("/api/data", (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json({ empty: true });
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(raw);
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Gagal membaca database server" });
  }
});

// 2. Save entire or partial application state
app.post("/api/save", (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Payload tidak valid" });
    }

    // Read existing file to merge or overwrite correctly
    let currentData = {};
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        currentData = JSON.parse(raw);
      } catch (e) {
        currentData = {};
      }
    }

    // Combine current and new states
    const updatedData = {
      ...currentData,
      ...payload,
      empty: false, // Mark as populated
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2), "utf8");
    console.log("Database updated successfully via API");
    res.json({ success: true, lastUpdated: updatedData.lastUpdated });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Gagal menyimpan ke database server" });
  }
});

// 3. Healthcheck endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", host: "0.0.0.0", port: PORT });
});

// ==================== VITE & STATIC FILES SERVING ====================

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode: Leverage Vite HMR through express middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    // Production mode: Serve precompiled assets from dist folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build delivery mounted successfully.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server JATC running beautifully on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Critical server bootstrap error:", err);
});
