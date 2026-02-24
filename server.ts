import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("microscope.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS specimens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    image_data TEXT,
    analysis TEXT,
    magnification TEXT,
    microscope_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/specimens", (req, res) => {
    const rows = db.prepare("SELECT * FROM specimens ORDER BY created_at DESC").all();
    res.json(rows);
  });

  app.post("/api/specimens", (req, res) => {
    const { name, image_data, analysis, magnification, microscope_type } = req.body;
    const info = db.prepare(
      "INSERT INTO specimens (name, image_data, analysis, magnification, microscope_type) VALUES (?, ?, ?, ?, ?)"
    ).run(name, image_data, analysis, magnification, microscope_type);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/specimens/:id", (req, res) => {
    const row = db.prepare("SELECT * FROM specimens WHERE id = ?").get(req.params.id);
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.delete("/api/specimens/:id", (req, res) => {
    db.prepare("SELECT * FROM specimens WHERE id = ?").get(req.params.id);
    db.prepare("DELETE FROM specimens WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
