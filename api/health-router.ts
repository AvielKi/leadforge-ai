import { createRouter, publicQuery } from "./middleware";
import { hasOpenAI } from "./services/openai";
import { hasGooglePlaces } from "./services/google-places";
import { hasTwilio } from "./services/twilio";
import { hasSendGrid } from "./services/sendgrid";
import { getDb } from "./queries/connection";
import { sql } from "drizzle-orm";

export const healthRouter = createRouter({
  check: publicQuery.query(async () => {
    let database = false;
    try {
      const db = getDb();
      await db.execute(sql`SELECT 1`);
      database = true;
    } catch {
      database = false;
    }

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        openai: hasOpenAI(),
        googlePlaces: hasGooglePlaces(),
        twilio: hasTwilio(),
        sendgrid: hasSendGrid(),
        database,
      },
      allConfigured: hasOpenAI() && hasGooglePlaces() && hasTwilio() && hasSendGrid() && database,
      missing: [
        !hasOpenAI() ? "OPENAI_API_KEY" : null,
        !hasGooglePlaces() ? "GOOGLE_PLACES_API_KEY" : null,
        !hasTwilio() ? "TWILIO credentials" : null,
        !hasSendGrid() ? "SENDGRID_API_KEY" : null,
        !database ? "DATABASE connection" : null,
      ].filter(Boolean),
    };
  }),
});
