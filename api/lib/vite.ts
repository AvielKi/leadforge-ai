import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // Railway runs: node dist/boot.js from project root
  // So import.meta.dirname = <root>/dist
  // And public files are at <root>/dist/public
  const __dirname = import.meta.dirname || "";
  const cwd = process.cwd();

  const possiblePaths = [
    // Railway: boot.js is at dist/boot.js, public is at dist/public
    path.join(__dirname, "public"),
    // Fallback: cwd/dist/public (if boot.js is somewhere else)
    path.join(cwd, "dist", "public"),
    // Fallback: cwd/public
    path.join(cwd, "public"),
    // Fallback: parent of dirname + dist/public
    path.join(path.dirname(__dirname), "dist", "public"),
    // Fallback: just in case
    "/app/dist/public",
    "/app/public",
  ];

  let publicRoot = "";
  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      const indexPath = path.join(p, "index.html");
      if (fs.existsSync(indexPath)) {
        publicRoot = p;
        break;
      }
    }
  }

  console.log("🔧 CWD:", cwd);
  console.log("🔧 DIRNAME:", __dirname);

  if (!publicRoot) {
    console.error("❌ Could not find public directory. Tried:");
    possiblePaths.forEach((p) => {
      const exists = p ? fs.existsSync(p) : false;
      const hasIndex = exists ? fs.existsSync(path.join(p, "index.html")) : false;
      console.error(`   ${p} (exists: ${exists}, has index.html: ${hasIndex})`);
    });
    return;
  }

  console.log("✅ Serving static files from:", publicRoot);

  // Use serveStatic with absolute path
  app.use("*", serveStatic({ root: publicRoot }));

  // SPA fallback
  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    try {
      const indexPath = path.join(publicRoot, "index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    } catch {
      return c.json({ error: "index.html not found" }, 500);
    }
  });
}
