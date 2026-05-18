import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // Resolve the absolute path to the dist/public directory
  // In bundled output, import.meta.dirname is where boot.js is located
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  // Use absolute path for the root - critical for Railway/production
  app.use("*", serveStatic({ root: distPath }));

  // SPA fallback: serve index.html for any non-API, non-file route
  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    // Only serve index.html for browser requests (HTML accept header)
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    try {
      const indexPath = path.join(distPath, "index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    } catch {
      return c.json({ error: "index.html not found" }, 500);
    }
  });
}
