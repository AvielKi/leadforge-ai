import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

// Startup validation - log env status (don't crash, let health check report issues)
const missingEnvVars = [];
if (!env.databaseUrl) missingEnvVars.push("DATABASE_URL");
if (!env.openaiApiKey) missingEnvVars.push("OPENAI_API_KEY");
if (!env.googlePlacesApiKey) missingEnvVars.push("GOOGLE_PLACES_API_KEY");

if (missingEnvVars.length > 0) {
  console.warn("⚠️  Missing environment variables:", missingEnvVars.join(", "));
  console.warn("   AI features will be disabled until these are configured.");
}

// CORS: Allow requests from Kimi static frontend + Railway + local dev
// In production on Railway, frontend is served from same origin (no CORS needed)
// These are safety nets for cross-origin requests
const ALLOWED_ORIGINS = [
  "https://cgbbibvzi43d6.kimi.page",
  "http://localhost:3000",
  "http://localhost:5173",
  // Railway domains
  "https://leadforge-production-d686.up-railway.app",
  "https://leadforge-production-824d.up-railway.app",
  "https://leadforge-production-24e3.up-railway.app",
  "https://leadforge-production-169d.up-railway.app",
  "https://leadforge-production-38de.up-railway.app",
  "https://leadforge-production-f62f.up-railway.app",
  "https://leadforge-production-1a16.up-railway.app",
  "https://leadforge-production-3506.up-railway.app",
];

// Dynamic origin check - allows Railway preview domains
app.use(
  cors({
    origin: (origin) => {
      // Allow same-origin (no origin header)
      if (!origin) return "";
      // Check against allowed origins
      if (ALLOWED_ORIGINS.includes(origin)) return origin;
      // Allow any Railway app domain (*.up-railway.app)
      if (origin.endsWith(".up-railway.app")) return origin;
      // Allow any localhost
      if (origin.includes("localhost")) return origin;
      return "";
    },
    allowHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    exposeHeaders: ["Set-Cookie"],
  })
);

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health check for Railway/load balancers
app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: env.isProduction ? "production" : "development",
  })
);

// OAuth callback
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// tRPC API
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// 404 for unknown API routes
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

// Production: start Node.js server and serve static files
if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`🚀 LeadForge AI server running on port ${port}`);
    console.log(`📡 API: http://localhost:${port}/api/trpc`);
    console.log(`🏥 Health: http://localhost:${port}/api/health`);
    console.log(`🔑 Auth callback: http://localhost:${port}${Paths.oauthCallback}`);
    console.log(`\n💡 To check AI services:`);
    console.log(`   curl http://localhost:${port}/api/trpc/health.check`);
  });
}
