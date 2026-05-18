import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { crmLeads, conversations, tasks } from "@db/schema";
import { eq, desc, and, sql, like } from "drizzle-orm";

export const crmRouter = createRouter({
  leadList: publicQuery
    .input(
      z.object({
        stage: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input.stage) {
        conditions.push(eq(crmLeads.stage, input.stage as "new" | "contacted" | "interested" | "proposal_sent" | "negotiation" | "won" | "lost"));
      }
      if (input.search) {
        conditions.push(
          like(crmLeads.name, `%${input.search}%`)
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(crmLeads)
          .where(where)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(desc(crmLeads.lastActivityAt)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(crmLeads)
          .where(where),
      ]);

      return {
        items,
        total: countResult[0]?.count ?? 0,
      };
    }),

  leadById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [lead] = await db
        .select()
        .from(crmLeads)
        .where(eq(crmLeads.id, input.id));
      return lead ?? null;
    }),

  moveStage: publicQuery
    .input(
      z.object({
        id: z.number(),
        stage: z.enum(["new", "contacted", "interested", "proposal_sent", "negotiation", "won", "lost"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(crmLeads)
        .set({
          stage: input.stage,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(crmLeads.id, input.id));
      return { success: true };
    }),

  updateLead: publicQuery
    .input(
      z.object({
        id: z.number(),
        notes: z.string().optional(),
        tags: z.string().optional(),
        estimatedValue: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.notes !== undefined) updates.notes = input.notes;
      if (input.tags !== undefined) updates.tags = input.tags;
      if (input.estimatedValue !== undefined) updates.estimatedValue = input.estimatedValue;

      await db.update(crmLeads).set(updates).where(eq(crmLeads.id, input.id));
      return { success: true };
    }),

  conversationList: publicQuery
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(conversations)
        .where(eq(conversations.leadId, input.leadId))
        .orderBy(conversations.sentAt);
    }),

  addConversation: publicQuery
    .input(
      z.object({
        leadId: z.number(),
        channel: z.enum(["whatsapp", "email", "facebook", "telegram"]),
        direction: z.enum(["outbound", "inbound"]),
        message: z.string(),
        aiGenerated: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(conversations).values({
        leadId: input.leadId,
        channel: input.channel,
        direction: input.direction,
        message: input.message,
        aiGenerated: input.aiGenerated,
        sentAt: new Date(),
      });

      await db
        .update(crmLeads)
        .set({ lastActivityAt: new Date() })
        .where(eq(crmLeads.id, input.leadId));

      return { success: true };
    }),

  taskList: publicQuery
    .input(z.object({ leadId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      if (input.leadId) {
        return db
          .select()
          .from(tasks)
          .where(eq(tasks.leadId, input.leadId))
          .orderBy(tasks.dueDate);
      }
      return db.select().from(tasks).orderBy(tasks.dueDate);
    }),

  updateTask: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: Record<string, unknown> = { status: input.status, updatedAt: new Date() };
      if (input.status === "completed") updates.completedAt = new Date();
      await db.update(tasks).set(updates).where(eq(tasks.id, input.id));
      return { success: true };
    }),

  pipelineStats: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        stage: crmLeads.stage,
        count: sql<number>`count(*)`,
      })
      .from(crmLeads)
      .groupBy(crmLeads.stage);
  }),
});
