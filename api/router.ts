import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { businessRouter } from "./business-router";
import { crmRouter } from "./crm-router";
import { outreachRouter } from "./outreach-router";
import { analyticsRouter } from "./analytics-router";
import { agentRouter } from "./agent-router";
import { createRouter, publicQuery } from "./middleware";
import { healthRouter } from "./health-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  health: healthRouter,
  auth: authRouter,
  localAuth: localAuthRouter,
  business: businessRouter,
  crm: crmRouter,
  outreach: outreachRouter,
  analytics: analyticsRouter,
  agent: agentRouter,
});

export type AppRouter = typeof appRouter;
