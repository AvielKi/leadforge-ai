import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { campaigns, outreachTemplates, aiPitches, businesses, crmLeads } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { generateSalesPitch, optimizeWhatsAppMessage, generateEmailSubject, hasOpenAI } from "./services/openai";
import { sendWhatsApp, hasTwilio } from "./services/twilio";
import { sendEmail, hasSendGrid } from "./services/sendgrid";

export const outreachRouter = createRouter({
  // ── Campaign list ──
  campaignList: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().default(25),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const where = input.status
        ? eq(campaigns.status, input.status as "draft" | "scheduled" | "running" | "paused" | "completed")
        : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(campaigns)
          .where(where)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(desc(campaigns.createdAt)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(campaigns)
          .where(where),
      ]);

      return { items, total: countResult[0]?.count ?? 0 };
    }),

  // ── Campaign by ID ──
  campaignById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, input.id));
      return campaign ?? null;
    }),

  // ── Update campaign status ──
  updateCampaignStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "scheduled", "running", "paused", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(campaigns)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(campaigns.id, input.id));
      return { success: true };
    }),

  // ── Template list ──
  templateList: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(outreachTemplates)
      .orderBy(desc(outreachTemplates.usageCount));
  }),

  // ── Create template ──
  createTemplate: publicQuery
    .input(
      z.object({
        name: z.string(),
        channel: z.enum(["whatsapp", "email", "facebook", "telegram"]),
        tone: z.string(),
        service: z.string(),
        content: z.string(),
        variables: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(outreachTemplates).values({
        name: input.name,
        channel: input.channel,
        tone: input.tone,
        service: input.service,
        content: input.content,
        variables: input.variables ? JSON.stringify(input.variables) : null,
      });
      return { success: true };
    }),

  // ── AI Pitch list ──
  pitchList: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(aiPitches)
      .orderBy(desc(aiPitches.createdAt))
      .limit(50);
  }),

  // ── AI Pitch Generation (GPT-4o) ──
  generatePitch: publicQuery
    .input(
      z.object({
        businessId: z.number(),
        channel: z.enum(["whatsapp", "email", "facebook", "telegram", "call_script"]),
        tone: z.enum(["friendly", "professional", "luxury", "corporate", "aggressive", "casual"]),
        service: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Fetch business details
      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.businessId));

      if (!business) {
        return { success: false, error: "Business not found" };
      }

      // Fetch existing analysis for detected issues
      const [analysis] = await db
        .select()
        .from(require("@db/schema").businessAnalyses)
        .where(eq(require("@db/schema").businessAnalyses.businessId, input.businessId));

      // Generate AI pitch
      const result = await generateSalesPitch({
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
        service: input.service,
        tone: input.tone,
        channel: input.channel,
        detectedIssues: analysis?.detectedIssues
          ? JSON.parse(analysis.detectedIssues as string)
          : undefined,
      });

      // Save to database
      const [saved] = await db.insert(aiPitches).values({
        businessId: input.businessId,
        channel: input.channel,
        tone: input.tone,
        service: input.service,
        pitchContent: result.pitch,
        wordCount: result.wordCount,
      }).$returningId();

      return {
        success: true,
        pitch: result.pitch,
        wordCount: result.wordCount,
        pitchId: saved.id,
        aiPowered: hasOpenAI(),
      };
    }),

  // ── Optimize WhatsApp message ──
  optimizeMessage: publicQuery
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      const optimized = await optimizeWhatsAppMessage(input.message);
      return { success: true, optimized, aiPowered: hasOpenAI() };
    }),

  // ── Generate email subject ──
  generateSubject: publicQuery
    .input(
      z.object({
        businessName: z.string(),
        service: z.string(),
        tone: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const subject = await generateEmailSubject({
        businessName: input.businessName,
        service: input.service,
        tone: input.tone,
      });
      return { success: true, subject, aiPowered: hasOpenAI() };
    }),

  // ── Send WhatsApp message (via Twilio) ──
  sendWhatsApp: publicQuery
    .input(
      z.object({
        to: z.string(),
        body: z.string(),
        mediaUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await sendWhatsApp({
        to: input.to,
        body: input.body,
        mediaUrl: input.mediaUrl,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          simulated: !hasTwilio(),
          message: hasTwilio()
            ? `Failed to send: ${result.error}`
            : "WhatsApp sending is simulated. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to send real messages.",
        };
      }

      return {
        success: true,
        messageSid: result.sid,
        message: "WhatsApp message sent successfully",
      };
    }),

  // ── Send email (via SendGrid) ──
  sendEmail: publicQuery
    .input(
      z.object({
        to: z.string(),
        toName: z.string().optional(),
        from: z.string(),
        fromName: z.string().optional(),
        subject: z.string(),
        text: z.string(),
        html: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await sendEmail({
        to: input.to,
        toName: input.toName,
        from: input.from,
        fromName: input.fromName,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          simulated: !hasSendGrid(),
          message: hasSendGrid()
            ? `Failed to send: ${result.error}`
            : "Email sending is simulated. Add SENDGRID_API_KEY to send real emails.",
        };
      }

      return {
        success: true,
        messageId: result.messageId,
        message: "Email sent successfully",
      };
    }),

  // ── Send outreach to CRM lead ──
  sendToLead: publicQuery
    .input(
      z.object({
        leadId: z.number(),
        channel: z.enum(["whatsapp", "email", "facebook", "telegram"]),
        message: z.string(),
        aiOptimize: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get lead details
      const [lead] = await db
        .select()
        .from(crmLeads)
        .where(eq(crmLeads.id, input.leadId));

      if (!lead) {
        return { success: false, error: "Lead not found" };
      }

      let finalMessage = input.message;

      // AI optimize if requested
      if (input.aiOptimize && input.channel === "whatsapp") {
        finalMessage = await optimizeWhatsAppMessage(input.message);
      }

      let sendResult;

      if (input.channel === "whatsapp" && lead.whatsapp) {
        sendResult = await sendWhatsApp({
          to: lead.whatsapp,
          body: finalMessage,
        });
      } else if (input.channel === "email" && lead.email) {
        const subject = await generateEmailSubject({
          businessName: lead.name,
          service: "website",
          tone: "friendly",
        });
        sendResult = await sendEmail({
          to: lead.email,
          toName: lead.contactName || lead.name,
          from: "outreach@leadforge.ai",
          fromName: "LeadForge AI",
          subject,
          text: finalMessage,
        });
      } else if (input.channel === "whatsapp" && lead.phone) {
        sendResult = await sendWhatsApp({
          to: lead.phone,
          body: finalMessage,
        });
      } else {
        return {
          success: false,
          error: `No ${input.channel} contact available for this lead`,
          simulated: true,
        };
      }

      if (!sendResult.success && !sendResult.simulated) {
        return {
          success: false,
          error: sendResult.error,
          simulated: !hasTwilio() && !hasSendGrid(),
        };
      }

      return {
        success: true,
        message: sendResult.success
          ? `${input.channel} message sent successfully`
          : `Message simulated (no ${input.channel} provider configured)`,
        simulated: !sendResult.success,
        provider: input.channel === "whatsapp" ? "twilio" : input.channel === "email" ? "sendgrid" : "none",
      };
    }),

  // ── Get service health ──
  serviceHealth: publicQuery.query(() => {
    return {
      openai: hasOpenAI(),
      twilio: hasTwilio(),
      sendgrid: hasSendGrid(),
      googlePlaces: false, // Would need to check API key validity
      allConfigured: hasOpenAI() && hasTwilio() && hasSendGrid(),
    };
  }),
});
