import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;
let connectionError: Error | null = null;

export function getDb() {
  if (connectionError) {
    throw connectionError;
  }
  if (!instance) {
    const dbUrl = env.databaseUrl;
    if (!dbUrl) {
      connectionError = new Error(
        "DATABASE_URL not configured. Please set the DATABASE_URL environment variable in Railway dashboard."
      );
      throw connectionError;
    }
    try {
      instance = drizzle(dbUrl, {
        mode: "planetscale",
        schema: fullSchema,
      });
    } catch (err: any) {
      connectionError = new Error(
        `Database connection failed: ${err?.message || "Unknown error"}. Check DATABASE_URL in Railway dashboard.`
      );
      throw connectionError;
    }
  }
  return instance;
}

export function isDbConnected(): boolean {
  return instance !== null && connectionError === null;
}

export function getDbError(): string | null {
  return connectionError?.message ?? null;
}
