import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // Find the correct public directory path
  // On Railway, the app runs from project root, so dist/public is at <root>/dist/public
  const possiblePaths = [
    path.join(process.cwd(), "dist", "public"),
    path.join(process.cwd(), "public"),
    path.resolve(import.meta.dirname || __dirname, "public"),
    path.resolve(import.meta.dirname || __dirname, "..", "public"),
  ];

  let publicRoot = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(p, "index.html"))) {
      publicRoot = p;
      break;
    }
  }

  if (!publicRoot) {
    console.error("❌ Could not find dist/public directory. Tried:");
    possiblePaths.forEach((p) => console.error(`   ${p}`));
    console.error("   CWD:", process.cwd());
    console.error("   DIRNAME:", import.meta.dirname || __dirname);
    // List files in cwd as debug
    try {
      console.error("   Files in CWD:", fs.readdirSync(process.cwd()).join(", "));
    } catch {}
    return;
  }

  console.log("✅ Serving static files from:", publicRoot);

  // Serve static files using @hono/node-server/serve-static with absolute path
  app.use("*", serveStatic({ root: publicRoot }));

  // SPA fallback for React Router
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
