import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { businesses, businessAnalyses } from "@db/schema";
import { eq, like, and, or, desc, sql } from "drizzle-orm";
import { searchBusinesses, findNearbyBusinesses, categorizePlace, detectWhatsapp } from "./services/google-places";
import { analyzeDigitalPresence, generateSalesPitch, hasOpenAI } from "./services/openai";

export const businessRouter = createRouter({
  // ── Search businesses in DB ──
  search: publicQuery
    .input(
      z.object({
        query: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        category: z.string().optional(),
        opportunityLevel: z.string().optional(),
        hasWebsite: z.boolean().optional(),
        limit: z.number().default(25),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input.query) {
        conditions.push(
          or(
            like(businesses.name, `%${input.query}%`),
            like(businesses.category, `%${input.query}%`),
            like(businesses.city, `%${input.query}%`)
          )
        );
      }
      if (input.country) {
        conditions.push(eq(businesses.country, input.country));
      }
      if (input.city) {
        conditions.push(eq(businesses.city, input.city));
      }
      if (input.category) {
        conditions.push(eq(businesses.category, input.category));
      }
      if (input.opportunityLevel) {
        conditions.push(eq(businesses.opportunityLevel, input.opportunityLevel as "very_high" | "high" | "medium" | "low"));
      }
      if (input.hasWebsite !== undefined) {
        conditions.push(eq(businesses.hasWebsite, input.hasWebsite));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(businesses)
          .where(where)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(desc(businesses.digitalScore)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(businesses)
          .where(where),
      ]);

      return {
        items,
        total: countResult[0]?.count ?? 0,
      };
    }),

  // ── Get single business with analysis ──
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.id));

      if (!business) return null;

      const [analysis] = await db
        .select()
        .from(businessAnalyses)
        .where(eq(businessAnalyses.businessId, input.id));

      return { ...business, analysis: analysis ?? null };
    }),

  // ── Get analysis for a business ──
  getAnalysis: publicQuery
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [analysis] = await db
        .select()
        .from(businessAnalyses)
        .where(eq(businessAnalyses.businessId, input.businessId));
      return analysis ?? null;
    }),

  // ── Run AI analysis on a business ──
  runAnalysis: publicQuery
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get business details
      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.businessId));

      if (!business) {
        return { success: false, error: "Business not found" };
      }

      // Check if analysis already exists
      const [existing] = await db
        .select()
        .from(businessAnalyses)
        .where(eq(businessAnalyses.businessId, input.businessId));

      if (existing) {
        return { success: true, analysis: existing, message: "Analysis already exists" };
      }

      // Run AI analysis
      const analysis = await analyzeDigitalPresence({
        businessName: business.name,
        category: business.category || "Business",
        city: business.city || "",
        country: business.country || "",
        hasWebsite: business.hasWebsite || false,
        hasFacebook: business.hasFacebook || false,
        hasWhatsapp: business.hasWhatsapp || false,
        websiteUrl: business.website || undefined,
        facebookUrl: business.facebookUrl || undefined,
        rating: business.rating ? parseFloat(business.rating) : undefined,
        reviewCount: business.reviewCount || undefined,
      });

      // Generate AI pitch as well
      const pitchResult = await generateSalesPitch({
        businessName: business.name,
        contactName: undefined,
        category: business.category || "Business",
        city: business.city || "",
        country: business.country || "",
        hasWebsite: business.hasWebsite || false,
        hasFacebook: business.hasFacebook || false,
        hasWhatsapp: business.hasWhatsapp || false,
        rating: business.rating ? parseFloat(business.rating) : undefined,
        reviewCount: business.reviewCount || undefined,
        service: "website",
        tone: "friendly",
        channel: "whatsapp",
        detectedIssues: analysis.detectedIssues,
      });

      // Determine opportunity level based on score
      const opportunityLevel = analysis.overallScore < 20
        ? "very_high"
        : analysis.overallScore < 40
        ? "high"
        : analysis.overallScore < 60
        ? "medium"
        : "low";

      // Save analysis
      const [saved] = await db.insert(businessAnalyses).values({
        businessId: input.businessId,
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
      }).$returningId();

      // Update business opportunity level and digital score
      await db
        .update(businesses)
        .set({
          opportunityLevel,
          digitalScore: analysis.overallScore,
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, input.businessId));

      // Fetch the saved analysis
      const [fullAnalysis] = await db
        .select()
        .from(businessAnalyses)
        .where(eq(businessAnalyses.id, saved.id));

      return {
        success: true,
        analysis: fullAnalysis,
        aiPowered: hasOpenAI(),
      };
    }),

  // ── Discover businesses via Google Places API ──
  discover: publicQuery
    .input(
      z.object({
        query: z.string(),
        location: z.string().optional(),
        category: z.string().optional(),
        maxResults: z.number().default(10),
        autoAnalyze: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      // Search via Google Places
      const placeResults = await searchBusinesses({
        query: input.query,
        location: input.location,
        maxResults: input.maxResults,
      });

      if (placeResults.length === 0) {
        return { success: true, discovered: 0, businesses: [], message: "No businesses found via Google Places. Add your GOOGLE_PLACES_API_KEY to discover real businesses." };
      }

      const db = getDb();
      const results = [];

      for (const place of placeResults) {
        // Check if already exists by name + city
        const [existing] = await db
          .select()
          .from(businesses)
          .where(
            and(
              like(businesses.name, place.name),
              like(businesses.city, place.city || "%")
            )
          );

        if (existing) {
          results.push({ ...existing, _status: "existing" });
          continue;
        }

        const cat = categorizePlace(place.types);
        const hasWebsite = !!place.website;
        const hasFacebook = false; // Would need Facebook API to verify
        const hasWhatsapp = detectWhatsapp(place.phone);

        // Insert business
        const [saved] = await db.insert(businesses).values({
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
          hasFacebook,
          hasWhatsapp,
          source: "google_places",
          discoveryData: JSON.stringify({
            placeId: place.placeId,
            types: place.types,
            latitude: place.latitude,
            longitude: place.longitude,
          }),
        }).$returningId();

        const [fullBusiness] = await db
          .select()
          .from(businesses)
          .where(eq(businesses.id, saved.id));

        // Auto-run AI analysis if requested
        if (input.autoAnalyze) {
          const analysis = await analyzeDigitalPresence({
            businessName: place.name,
            category: cat.category,
            city: place.city,
            country: place.country,
            hasWebsite,
            hasFacebook,
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
            hasFacebook,
            hasWhatsapp,
            rating: place.rating,
            reviewCount: place.reviewCount,
            service: "website",
            tone: "friendly",
            channel: "whatsapp",
            detectedIssues: analysis.detectedIssues,
          });

          const opportunityLevel = analysis.overallScore < 20 ? "very_high" : analysis.overallScore < 40 ? "high" : analysis.overallScore < 60 ? "medium" : "low";

          await db.insert(businessAnalyses).values({
            businessId: saved.id,
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
            .where(eq(businesses.id, saved.id));

          results.push({ ...fullBusiness, _status: "analyzed", digitalScore: analysis.overallScore, opportunityLevel });
        } else {
          results.push({ ...fullBusiness, _status: "new" });
        }

        // Small delay between businesses
        await sleep(200);
      }

      return {
        success: true,
        discovered: results.filter((r) => r._status !== "existing").length,
        analyzed: results.filter((r) => r._status === "analyzed").length,
        businesses: results,
        aiPowered: hasOpenAI(),
      };
    }),

  // ── Nearby discovery ──
  discoverNearby: publicQuery
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        radiusKm: z.number().default(10),
        keyword: z.string().optional(),
        maxResults: z.number().default(10),
      })
    )
    .mutation(async ({ input }) => {
      const placeResults = await findNearbyBusinesses({
        lat: input.lat,
        lng: input.lng,
        radiusKm: input.radiusKm,
        keyword: input.keyword,
        maxResults: input.maxResults,
      });

      return {
        success: true,
        count: placeResults.length,
        businesses: placeResults,
      };
    }),

  // ── Stats ──
  getStats: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        avgScore: sql<number>`COALESCE(AVG(digital_score), 0)`,
        noWebsite: sql<number>`SUM(CASE WHEN has_website = false THEN 1 ELSE 0 END)`,
        highOpportunity: sql<number>`SUM(CASE WHEN opportunity_level IN ('very_high', 'high') THEN 1 ELSE 0 END)`,
      })
      .from(businesses);

    return result[0] ?? { total: 0, avgScore: 0, noWebsite: 0, highOpportunity: 0 };
  }),

  // ── Category distribution ──
  getByCategories: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        category: businesses.category,
        count: sql<number>`count(*)`,
      })
      .from(businesses)
      .groupBy(businesses.category);
  }),
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
