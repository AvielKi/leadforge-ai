import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // In bundled output, boot.js is at <project>/dist/boot.js
  // Public files are at <project>/dist/public/
  // So from boot.js's directory, public is at "./public"
  const __dirname = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(__dirname, "public");

  // Verify the path exists (for Railway debugging)
  const exists = fs.existsSync(distPath);
  const indexExists = fs.existsSync(path.join(distPath, "index.html"));
  const assetsDir = path.join(distPath, "assets");
  const assetsExist = fs.existsSync(assetsDir);
  const assetFiles = assetsExist ? fs.readdirSync(assetsDir).filter((f) => f.endsWith(".js")) : [];

  console.log("📁 Static files root:", distPath);
  console.log("   Exists:", exists);
  console.log("   index.html:", indexExists);
  console.log("   assets/:", assetsExist, `(${assetFiles.length} JS files)`);

  // Serve static files - use absolute path
  app.use("*", serveStatic({ root: distPath }));

  // SPA fallback: serve index.html for non-file routes (React Router)
  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    try {
      const indexPath = path.join(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        return c.json({ error: "index.html not found at " + distPath }, 500);
      }
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    } catch (err: any) {
      return c.json({ error: "Failed to serve index.html: " + String(err?.message || err) }, 500);
    }
  });
}
