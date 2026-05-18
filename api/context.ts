import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyLocalToken } from "./local-auth-router";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

async function findUserByIdLocal(id: number): Promise<User | undefined> {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try OAuth (Kimi) authentication first
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // OAuth auth failed, try local auth
  }

  // If OAuth didn't work, try local auth via Bearer token
  if (!ctx.user) {
    try {
      const authHeader = opts.req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const claim = await verifyLocalToken(token);
        if (claim) {
          const user = await findUserByIdLocal(claim.userId);
          if (user && user.status === "active") {
            ctx.user = user;
          }
        }
      }
    } catch {
      // Local auth also failed - user is unauthenticated
    }
  }

  return ctx;
}
