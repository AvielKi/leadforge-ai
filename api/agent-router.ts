import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { agentRuns, businesses, crmLeads } from "@db/schema";
import { desc, sql, eq, and } from "drizzle-orm";
import { generateAgentInsights, hasOpenAI } from "./services/openai";

export const agentRouter = createRouter({
  // ── Current agent status ──
  status: publicQuery.query(async () => {
    const db = getDb();

    // Get real counts from the database
    const [businessStats, leadStats, runStats] = await Promise.all([
      db.select({
        total: sql<number>`count(*)`,
        highOpp: sql<number>`SUM(CASE WHEN opportunity_level IN ('very_high', 'high') THEN 1 ELSE 0 END)`,
      }).from(businesses),

      db.select({
        total: sql<number>`count(*)`,
        won: sql<number>`SUM(CASE WHEN stage = 'won' THEN 1 ELSE 0 END)`,
        stuck: sql<number>`SUM(CASE WHEN stage IN ('proposal_sent', 'negotiation') AND last_activity_at < DATE_SUB(NOW(), INTERVAL 5 DAY) THEN 1 ELSE 0 END)`,
      }).from(crmLeads),

      db.select({
        discoveriesToday: sql<number>`SUM(CASE WHEN action = 'discovery' AND started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END)`,
        analysesToday: sql<number>`SUM(CASE WHEN action = 'analysis' AND started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END)`,
        pitchesToday: sql<number>`SUM(CASE WHEN action = 'pitch' AND started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END)`,
        campaignsToday: sql<number>`SUM(CASE WHEN action = 'campaign' AND started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END)`,
        followUpsToday: sql<number>`SUM(CASE WHEN action = 'follow_up' AND started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END)`,
      }).from(agentRuns),
    ]);

    return {
      isActive: true,
      currentTask: "discovering leads",
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      discoveriesToday: runStats[0]?.discoveriesToday ?? 0,
      analysesToday: runStats[0]?.analysesToday ?? 0,
      pitchesGenerated: runStats[0]?.pitchesToday ?? 0,
      campaignsScheduled: runStats[0]?.campaignsToday ?? 0,
      followUpsSent: runStats[0]?.followUpsToday ?? 0,
      totalBusinesses: businessStats[0]?.total ?? 0,
      highOpportunity: businessStats[0]?.highOpp ?? 0,
      totalLeads: leadStats[0]?.total ?? 0,
      wonLeads: leadStats[0]?.won ?? 0,
      stuckLeads: leadStats[0]?.stuck ?? 0,
      aiPowered: hasOpenAI(),
    };
  }),

  // ── Configure agent settings ──
  configure: publicQuery
    .input(
      z.object({
        autoDiscover: z.boolean(),
        autoAnalyze: z.boolean(),
        autoPitch: z.boolean(),
        autoSchedule: z.boolean(),
        autoCRM: z.boolean(),
        targetRegions: z.array(z.string()),
        targetCategories: z.array(z.string()),
        minOpportunity: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return { success: true, config: input };
    }),

  // ── Trigger agent action ──
  trigger: publicQuery
    .input(z.object({ action: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(agentRuns).values({
        userId: 1,
        action: input.action,
        status: "running",
        startedAt: new Date(),
      });
      return { success: true, message: `Agent started: ${input.action}` };
    }),

  // ── Agent run logs ──
  logs: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(agentRuns)
      .orderBy(desc(agentRuns.startedAt))
      .limit(20);
  }),

  // ── AI-powered insights ──
  insights: publicQuery.query(async () => {
    const db = getDb();

    // Get real stats for insight generation
    const [businessStats, leadStats] = await Promise.all([
      db.select({
        total: sql<number>`count(*)`,
        avgScore: sql<number>`COALESCE(AVG(digital_score), 0)`,
        highOpp: sql<number>`SUM(CASE WHEN opportunity_level IN ('very_high', 'high') THEN 1 ELSE 0 END)`,
        noWebsite: sql<number>`SUM(CASE WHEN has_website = false THEN 1 ELSE 0 END)`,
      }).from(businesses),

      db.select({
        total: sql<number>`count(*)`,
        stuck: sql<number>`SUM(CASE WHEN stage IN ('proposal_sent', 'negotiation') AND last_activity_at < DATE_SUB(NOW(), INTERVAL 5 DAY) THEN 1 ELSE 0 END)`,
        recent: sql<number>`SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END)`,
      }).from(crmLeads),
    ]);

    // Generate AI insights based on real data
    const insights = await generateAgentInsights({
      totalBusinesses: businessStats[0]?.total ?? 0,
      avgScore: Math.round((businessStats[0]?.avgScore ?? 0) * 10) / 10,
      highOpportunityCount: businessStats[0]?.highOpp ?? 0,
      noWebsiteCount: businessStats[0]?.noWebsite ?? 0,
      crmLeadsCount: leadStats[0]?.total ?? 0,
      stuckLeadsCount: leadStats[0]?.stuck ?? 0,
      recentDiscoveries: leadStats[0]?.recent ?? 0,
    });

    return insights.map((insight, index) => ({
      id: index + 1,
      ...insight,
    }));
  }),

  // ── AI discovery run ──
  runDiscovery: publicQuery
    .input(
      z.object({
        query: z.string(),
        location: z.string().optional(),
        category: z.string().optional(),
        maxResults: z.number().default(10),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Log the agent run
      await db.insert(agentRuns).values({
        userId: 1,
        action: "discovery",
        status: "running",
        startedAt: new Date(),
      });

      // Import the business discovery logic
      const { searchBusinesses, categorizePlace, detectWhatsapp } = await import("./services/google-places");
      const { analyzeDigitalPresence, generateSalesPitch } = await import("./services/openai");

      const placeResults = await searchBusinesses({
        query: input.query,
        location: input.location,
        maxResults: input.maxResults,
      });

      if (placeResults.length === 0) {
        await db.insert(agentRuns).values({
          userId: 1,
          action: "discovery",
          status: "completed",
          results: JSON.stringify({ found: 0, saved: 0, analyzed: 0 }),
          completedAt: new Date(),
        });

        return {
          success: true,
          discovered: 0,
          analyzed: 0,
          businesses: [],
          message: placeResults.length === 0 && !input.query.includes("in")
            ? "No API key configured or no results found. Add GOOGLE_PLACES_API_KEY to discover real businesses."
            : "Discovery complete but no results found. Try a different query.",
        };
      }

      const saved = [];
      let analyzed = 0;

      for (const place of placeResults) {
        const [existing] = await db
          .select()
          .from(businesses)
          .where(
            and(
              sql`name = ${place.name}`,
              sql`city = ${place.city || ""}`
            )
          );

        if (existing) continue;

        const cat = categorizePlace(place.types);
        const hasWebsite = !!place.website;
        const hasWhatsapp = detectWhatsapp(place.phone);

        const [inserted] = await db.insert(businesses).values({
          name: place.name,
          category: cat.category,
          subCategory: cat.subCategory,
          country: place.country,
          city: place.city,
          address: place.address,
          phone: place.phone,
          whatsapp: hasWhatsapp ? place.phone : null,
          website: place.website || null,
          googleMapsUrl: place.googleMapsUrl,
          rating: place.rating ? String(place.rating) : null,
          reviewCount: place.reviewCount,
          hasWebsite,
          hasFacebook: false,
          hasWhatsapp,
          source: "google_places",
          discoveryData: JSON.stringify({ placeId: place.placeId, types: place.types }),
        }).$returningId();

        // Auto-analyze
        const analysis = await analyzeDigitalPresence({
          businessName: place.name,
          category: cat.category,
          city: place.city,
          country: place.country,
          hasWebsite,
          hasFacebook: false,
          hasWhatsapp,
          websiteUrl: place.website,
          rating: place.rating,
          reviewCount: place.reviewCount,
        });

        const pitchResult = await generateSalesPitch({
          businessName: place.name,
          category: cat.category,
          city: place.city,
          country: place.country,
          hasWebsite,
          hasFacebook: false,
          hasWhatsapp,
          rating: place.rating,
          reviewCount: place.reviewCount,
          service: "website",
          tone: "friendly",
          channel: "whatsapp",
          detectedIssues: analysis.detectedIssues,
        });

        const opportunityLevel = analysis.overallScore < 20 ? "very_high" : analysis.overallScore < 40 ? "high" : analysis.overallScore < 60 ? "medium" : "low";

        await db.insert(require("@db/schema").businessAnalyses).values({
          businessId: inserted.id,
          overallScore: analysis.overallScore,
          scoreCategory: analysis.scoreCategory,
          websiteScore: analysis.websiteScore,
          mobileScore: analysis.mobileScore,
          seoScore: analysis.seoScore,
          brandingScore: analysis.brandingScore,
          socialScore: analysis.socialScore,
          facebookScore: analysis.facebookScore,
          adScore: analysis.adScore,
          visibilityScore: analysis.visibilityScore,
          whatsappScore: analysis.whatsappScore,
          mapsScore: analysis.mapsScore,
          detectedIssues: JSON.stringify(analysis.detectedIssues),
          aiSummary: analysis.aiSummary,
          generatedPitch: pitchResult.pitch,
          toneUsed: "friendly",
        });

        await db
          .update(businesses)
          .set({
            opportunityLevel,
            digitalScore: analysis.overallScore,
          })
          .where(eq(businesses.id, inserted.id));

        saved.push(place);
        analyzed++;

        await new Promise((r) => setTimeout(r, 200));
      }

      // Log completion
      await db.insert(agentRuns).values({
        userId: 1,
        action: "discovery",
        status: "completed",
        results: JSON.stringify({ found: placeResults.length, saved: saved.length, analyzed }),
        completedAt: new Date(),
      });

      return {
        success: true,
        discovered: saved.length,
        analyzed,
        aiPowered: hasOpenAI(),
        businesses: saved,
      };
    }),
});
