import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

function vitePluginStorageProxy(): Plugin {
  return {
    name: "manus-storage-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        if (!key) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing storage key");
          return;
        }

        // 1. Check if the exact file exists in client/public/manus-storage/
        const storageFile = path.resolve(process.cwd(), "client", "public", "manus-storage", key);
        if (fs.existsSync(storageFile)) {
          const ext = path.extname(storageFile).toLowerCase();
          const mime = ext === ".png" ? "image/png" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
          res.writeHead(200, { "Content-Type": mime, "Cache-Control": "public, max-age=86400" });
          fs.createReadStream(storageFile).pipe(res);
          return;
        }

        // 2. Check if the exact file exists in client/public/images/
        const imageFile = path.resolve(process.cwd(), "client", "public", "images", key);
        if (fs.existsSync(imageFile)) {
          const ext = path.extname(imageFile).toLowerCase();
          const mime = ext === ".png" ? "image/png" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
          res.writeHead(200, { "Content-Type": mime, "Cache-Control": "public, max-age=86400" });
          fs.createReadStream(imageFile).pipe(res);
          return;
        }

        // 3. Fallback based on image key category to high-resolution generated visuals
        let fallbackPath = path.resolve(process.cwd(), "client", "public", "images", "dark_bg.jpg");
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("face") || lowerKey.includes("whatsapp")) {
          fallbackPath = path.resolve(process.cwd(), "client", "public", "images", "sheun_portrait.jpg");
        } else if (lowerKey.includes("dark")) {
          fallbackPath = path.resolve(process.cwd(), "client", "public", "images", "dark_bg.jpg");
        } else if (lowerKey.includes("tech")) {
          fallbackPath = path.resolve(process.cwd(), "client", "public", "images", "tech_workspace.jpg");
        } else if (lowerKey.includes("skills") || lowerKey.includes("timeline")) {
          fallbackPath = path.resolve(process.cwd(), "client", "public", "images", "skills_lab.jpg");
        } else if (lowerKey.includes("about")) {
          fallbackPath = path.resolve(process.cwd(), "client", "public", "images", "about_systems.jpg");
        } else if (lowerKey.includes("logo") || lowerKey.includes("praise") || lowerKey.includes("fellowship") || lowerKey.includes("thanksgiving")) {
          fallbackPath = path.resolve(process.cwd(), "client", "public", "images", "brand_logo.jpg");
        } else if (lowerKey.includes("relaunch") || lowerKey.includes("bgp") || lowerKey.includes("announcement") || lowerKey.includes("flyer")) {
          fallbackPath = path.resolve(process.cwd(), "client", "public", "images", "event_flyer.jpg");
        }

        if (fs.existsSync(fallbackPath)) {
          res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" });
          fs.createReadStream(fallbackPath).pipe(res);
          return;
        }

        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

        if (forgeBaseUrl && forgeKey) {
          try {
            const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
            forgeUrl.searchParams.set("path", key);

            const forgeResp = await fetch(forgeUrl, {
              headers: { Authorization: `Bearer ${forgeKey}` },
            });

            if (forgeResp.ok) {
              const { url } = (await forgeResp.json()) as { url: string };
              if (url) {
                res.writeHead(307, { Location: url, "Cache-Control": "no-store" });
                res.end();
                return;
              }
            }
          } catch {
            // fall back
          }
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Image not found");
      });
    },
  };
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector(), vitePluginStorageProxy()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
