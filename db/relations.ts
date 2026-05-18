import { relations } from "drizzle-orm";
import {
  users,
  businesses,
  businessAnalyses,
  crmLeads,
  conversations,
  campaigns,
  campaignRecipients,
  outreachTemplates,
  subscriptions,
  aiPitches,
  tasks,
  activities,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  leads: many(crmLeads),
  campaigns: many(campaigns),
  templates: many(outreachTemplates),
  subscriptions: many(subscriptions),
  activities: many(activities),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  analysis: one(businessAnalyses),
  crmLead: one(crmLeads),
  pitches: many(aiPitches),
}));

export const businessAnalysesRelations = relations(businessAnalyses, ({ one }) => ({
  business: one(businesses, {
    fields: [businessAnalyses.businessId],
    references: [businesses.id],
  }),
}));

export const crmLeadsRelations = relations(crmLeads, ({ one, many }) => ({
  business: one(businesses, {
    fields: [crmLeads.businessId],
    references: [businesses.id],
  }),
  conversations: many(conversations),
  tasks: many(tasks),
  pitches: many(aiPitches),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  lead: one(crmLeads, {
    fields: [conversations.leadId],
    references: [crmLeads.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  recipients: many(campaignRecipients),
}));

export const campaignRecipientsRelations = relations(campaignRecipients, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignRecipients.campaignId],
    references: [campaigns.id],
  }),
  lead: one(crmLeads, {
    fields: [campaignRecipients.leadId],
    references: [crmLeads.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const aiPitchesRelations = relations(aiPitches, ({ one }) => ({
  business: one(businesses, {
    fields: [aiPitches.businessId],
    references: [businesses.id],
  }),
  lead: one(crmLeads, {
    fields: [aiPitches.leadId],
    references: [crmLeads.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  lead: one(crmLeads, {
    fields: [tasks.leadId],
    references: [crmLeads.id],
  }),
}));
