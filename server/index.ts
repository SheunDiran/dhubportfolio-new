import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // Route for /manus-storage requests
  app.get("/manus-storage/*", (req, res) => {
    const rawKey = req.url.replace(/^\/manus-storage\/?/, "");
    if (!rawKey) {
      res.status(400).send("Missing storage key");
      return;
    }

    const publicDir = path.resolve(process.cwd(), "client", "public");
    const exactFile = path.join(publicDir, "manus-storage", rawKey);
    if (fs.existsSync(exactFile)) {
      res.sendFile(exactFile);
      return;
    }

    const imgFile = path.join(publicDir, "images", rawKey);
    if (fs.existsSync(imgFile)) {
      res.sendFile(imgFile);
      return;
    }

    // Categorized fallback
    const lower = rawKey.toLowerCase();
    let fallback = path.join(publicDir, "images", "dark_bg.jpg");
    if (lower.includes("face") || lower.includes("whatsapp")) {
      fallback = path.join(publicDir, "images", "sheun_portrait.jpg");
    } else if (lower.includes("tech")) {
      fallback = path.join(publicDir, "images", "tech_workspace.jpg");
    } else if (lower.includes("skills") || lower.includes("timeline")) {
      fallback = path.join(publicDir, "images", "skills_lab.jpg");
    } else if (lower.includes("about")) {
      fallback = path.join(publicDir, "images", "about_systems.jpg");
    } else if (lower.includes("logo") || lower.includes("praise") || lower.includes("fellowship") || lower.includes("thanksgiving")) {
      fallback = path.join(publicDir, "images", "brand_logo.jpg");
    } else if (lower.includes("relaunch") || lower.includes("bgp") || lower.includes("announcement") || lower.includes("flyer")) {
      fallback = path.join(publicDir, "images", "event_flyer.jpg");
    }

    if (fs.existsSync(fallback)) {
      res.sendFile(fallback);
      return;
    }

    res.status(404).send("Not found");
  });

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(Number(port), "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
