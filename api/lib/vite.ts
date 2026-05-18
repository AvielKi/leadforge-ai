import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // Try multiple strategies to find the public directory
  const possibleRoots = [
    // Strategy 1: Relative to boot.js location (bundled)
    path.resolve(import.meta.dirname || __dirname, "public"),
    // Strategy 2: Relative to cwd (Railway runs from project root)
    path.resolve(process.cwd(), "dist", "public"),
    // Strategy 3: One level up from boot.js + dist/public
    path.resolve(process.cwd(), "..", "dist", "public"),
    // Strategy 4: Just cwd/public
    path.resolve(process.cwd(), "public"),
  ];

  // Find the first path that exists and has index.html
  let publicRoot = "";
  for (const root of possibleRoots) {
    const indexPath = path.join(root, "index.html");
    if (fs.existsSync(indexPath)) {
      publicRoot = root;
      break;
    }
  }

  if (!publicRoot) {
    // None of the paths worked - log all attempts
    console.error("❌ Could not find public directory. Tried:");
    for (const root of possibleRoots) {
      const exists = fs.existsSync(root);
      const hasIndex = fs.existsSync(path.join(root, "index.html"));
      console.error(`   ${root} (dir: ${exists}, index: ${hasIndex})`);
    }
    console.error("   cwd:", process.cwd());
    console.error("   dirname:", import.meta.dirname || __dirname);
    console.error("   files in cwd:", fs.readdirSync(process.cwd()).slice(0, 20));
    return;
  }

  console.log("✅ Serving static files from:", publicRoot);

  // Helper: serve a file with correct MIME type
  const serveFile = (filePath: string, c: any) => {
    if (!fs.existsSync(filePath)) return null;
    // Must be a file, not a directory
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return null;
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".mjs": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".woff2": "font/woff2",
      ".woff": "font/woff",
      ".ttf": "font/ttf",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    const body = fs.readFileSync(filePath);
    return c.newResponse(body, 200, {
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    });
  };

  // Serve static assets (JS, CSS, images, fonts)
  app.get("/assets/*", (c) => {
    const filePath = path.join(publicRoot, c.req.path);
    const response = serveFile(filePath, c);
    if (response) return response;
    return c.json({ error: "Asset not found: " + c.req.path }, 404);
  });

  // Serve root-level files (favicon, manifest, etc.)
  app.get("/*", (c) => {
    const urlPath = c.req.path;
    // Skip API routes
    if (urlPath.startsWith("/api")) return c.notFound();

    const filePath = path.join(publicRoot, urlPath);
    const response = serveFile(filePath, c);
    if (response) return response;

    // SPA fallback: serve index.html for any non-file route
    const accept = c.req.header("accept") ?? "";
    if (accept.includes("text/html")) {
      const indexPath = path.join(publicRoot, "index.html");
      const indexResponse = serveFile(indexPath, c);
      if (indexResponse) return indexResponse;
    }

    return c.json({ error: "Not found: " + urlPath }, 404);
  });
}
