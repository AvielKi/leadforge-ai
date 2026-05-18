import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { businesses, crmLeads, campaigns, activities } from "@db/schema";
import { sql, desc } from "drizzle-orm";

export const analyticsRouter = createRouter({
  dashboard: publicQuery.query(async () => {
    const db = getDb();

    const [businessStats, leadStats, campaignStats, recentActivities] = await Promise.all([
      db
        .select({
          total: sql<number>`count(*)`,
          avgScore: sql<number>`COALESCE(AVG(digital_score), 0)`,
          noWebsite: sql<number>`SUM(CASE WHEN has_website = false THEN 1 ELSE 0 END)`,
          highOpp: sql<number>`SUM(CASE WHEN opportunity_level IN ('very_high', 'high') THEN 1 ELSE 0 END)`,
        })
        .from(businesses),

      db
        .select({
          total: sql<number>`count(*)`,
          won: sql<number>`SUM(CASE WHEN stage = 'won' THEN 1 ELSE 0 END)`,
          avgValue: sql<number>`COALESCE(AVG(estimated_value), 0)`,
        })
        .from(crmLeads),

      db
        .select({
          total: sql<number>`count(*)`,
          running: sql<number>`SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END)`,
        })
        .from(campaigns),

      db
        .select()
        .from(activities)
        .orderBy(desc(activities.createdAt))
        .limit(8),
    ]);

    return {
      businesses: businessStats[0],
      leads: leadStats[0],
      campaigns: campaignStats[0],
      recentActivities,
    };
  }),

  opportunityDistribution: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        level: businesses.opportunityLevel,
        count: sql<number>`count(*)`,
      })
      .from(businesses)
      .groupBy(businesses.opportunityLevel);
  }),

  presenceDistribution: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        scoreRange: sql<string>`CASE
          WHEN digital_score BETWEEN 0 AND 19 THEN '0-19'
          WHEN digital_score BETWEEN 20 AND 39 THEN '20-39'
          WHEN digital_score BETWEEN 40 AND 59 THEN '40-59'
          WHEN digital_score BETWEEN 60 AND 79 THEN '60-79'
          ELSE '80-100'
        END`,
        count: sql<number>`count(*)`,
      })
      .from(businesses)
      .groupBy(sql`scoreRange`)
      .orderBy(sql`scoreRange`);
  }),

  pipelineDistribution: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        stage: crmLeads.stage,
        count: sql<number>`count(*)`,
      })
      .from(crmLeads)
      .groupBy(crmLeads.stage);
  }),

  categoryDistribution: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        category: businesses.category,
        count: sql<number>`count(*)`,
      })
      .from(businesses)
      .groupBy(businesses.category)
      .orderBy(sql`count DESC`);
  }),

  geographicDistribution: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        city: businesses.city,
        country: businesses.country,
        count: sql<number>`count(*)`,
        avgScore: sql<number>`COALESCE(AVG(digital_score), 0)`,
      })
      .from(businesses)
      .groupBy(businesses.city, businesses.country)
      .orderBy(sql`count DESC`);
  }),
});
