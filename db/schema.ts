import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  boolean,
  json,
  decimal,
  bigint,
  date,
} from "drizzle-orm/mysql-core";

// ============================================================
// Users (supports both OAuth and local password auth)
// ============================================================
export const users = mysqlTable("users", {
  id: serial("id"),
  unionId: varchar("unionId", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  password: varchar("password", { length: 255 }),
  authType: mysqlEnum("auth_type", ["oauth", "local"]).default("local").notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "invited", "disabled"]).default("active").notNull(),
  invitedBy: bigint("invited_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// Teams
// ============================================================
export const teams = mysqlTable("teams", {
  id: serial("id"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: bigint("owner_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export type Team = typeof teams.$inferSelect;

// ============================================================
// Team Members
// ============================================================
export const teamMembers = mysqlTable("team_members", {
  id: serial("id"),
  teamId: bigint("team_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("member_role", ["member", "manager"]).default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TeamMember = typeof teamMembers.$inferSelect;

// ============================================================
// Invitations (admin invites users by email)
// ============================================================
export const invitations = mysqlTable("invitations", {
  id: serial("id"),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  invitedBy: bigint("invited_by", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "expired"]).default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Invitation = typeof invitations.$inferSelect;

// ============================================================
// Business Profiles (discovered businesses)
// ============================================================
export const businesses = mysqlTable("businesses", {
  id: serial("id"),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  subCategory: varchar("sub_category", { length: 100 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 500 }),
  facebookUrl: varchar("facebook_url", { length: 500 }),
  instagramUrl: varchar("instagram_url", { length: 500 }),
  tiktokUrl: varchar("tiktok_url", { length: 500 }),
  googleMapsUrl: varchar("google_maps_url", { length: 500 }),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  reviewCount: int("review_count"),
  hasWebsite: boolean("has_website").default(false),
  hasFacebook: boolean("has_facebook").default(false),
  hasWhatsapp: boolean("has_whatsapp").default(false),
  digitalScore: int("digital_score"),
  opportunityLevel: mysqlEnum("opportunity_level", ["very_high", "high", "medium", "low"]),
  source: varchar("source", { length: 100 }),
  discoveryData: json("discovery_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export type Business = typeof businesses.$inferSelect;

// ============================================================
// AI Digital Presence Analyses
// ============================================================
export const businessAnalyses = mysqlTable("business_analyses", {
  id: serial("id"),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  overallScore: int("overall_score"),
  scoreCategory: mysqlEnum("score_category", ["poor", "weak", "average", "good", "excellent"]),
  websiteScore: int("website_score"),
  mobileScore: int("mobile_score"),
  seoScore: int("seo_score"),
  brandingScore: int("branding_score"),
  socialScore: int("social_score"),
  facebookScore: int("facebook_score"),
  adScore: int("ad_score"),
  visibilityScore: int("visibility_score"),
  whatsappScore: int("whatsapp_score"),
  mapsScore: int("maps_score"),
  detectedIssues: json("detected_issues"),
  aiSummary: text("ai_summary"),
  generatedPitch: text("generated_pitch"),
  toneUsed: varchar("tone_used", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BusinessAnalysis = typeof businessAnalyses.$inferSelect;

// ============================================================
// CRM Leads
// ============================================================
export const crmLeads = mysqlTable("crm_leads", {
  id: serial("id"),
  businessId: bigint("business_id", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  stage: mysqlEnum("stage", ["new", "contacted", "interested", "proposal_sent", "negotiation", "won", "lost"]).default("new"),
  source: varchar("source", { length: 100 }),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  tags: json("tags"),
  notes: text("notes"),
  aiSummary: text("ai_summary"),
  buyingIntent: mysqlEnum("buying_intent", ["low", "medium", "high"]),
  lastActivityAt: timestamp("last_activity_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export type CrmLead = typeof crmLeads.$inferSelect;

// ============================================================
// Conversations
// ============================================================
export const conversations = mysqlTable("conversations", {
  id: serial("id"),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }).notNull(),
  channel: mysqlEnum("channel", ["whatsapp", "email", "facebook", "telegram"]),
  direction: mysqlEnum("direction", ["outbound", "inbound"]),
  message: text("message"),
  aiGenerated: boolean("ai_generated").default(false),
  aiSummary: text("ai_summary"),
  replyDetected: boolean("reply_detected").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Conversation = typeof conversations.$inferSelect;

// ============================================================
// Outreach Campaigns
// ============================================================
export const campaigns = mysqlTable("campaigns", {
  id: serial("id"),
  name: varchar("name", { length: 255 }).notNull(),
  channel: mysqlEnum("channel", ["whatsapp", "email", "facebook", "telegram"]),
  status: mysqlEnum("status", ["draft", "scheduled", "running", "paused", "completed"]).default("draft"),
  messageTemplate: text("message_template"),
  tone: varchar("tone", { length: 50 }),
  service: varchar("service", { length: 100 }),
  scheduleAt: timestamp("schedule_at"),
  recurrence: mysqlEnum("recurrence", ["none", "daily", "weekly", "monthly"]).default("none"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  stats: json("stats"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export type Campaign = typeof campaigns.$inferSelect;

// ============================================================
// Campaign Recipients
// ============================================================
export const campaignRecipients = mysqlTable("campaign_recipients", {
  id: serial("id"),
  campaignId: bigint("campaign_id", { mode: "number", unsigned: true }).notNull(),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "delivered", "opened", "replied", "bounced", "failed"]).default("pending"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  repliedAt: timestamp("replied_at"),
});

export type CampaignRecipient = typeof campaignRecipients.$inferSelect;

// ============================================================
// Outreach Templates
// ============================================================
export const outreachTemplates = mysqlTable("outreach_templates", {
  id: serial("id"),
  name: varchar("name", { length: 255 }),
  channel: mysqlEnum("channel", ["whatsapp", "email", "facebook", "telegram"]),
  tone: varchar("tone", { length: 50 }),
  service: varchar("service", { length: 100 }),
  content: text("content"),
  variables: json("variables"),
  usageCount: int("usage_count").default(0),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type OutreachTemplate = typeof outreachTemplates.$inferSelect;

// ============================================================
// Subscriptions
// ============================================================
export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id"),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  plan: mysqlEnum("plan", ["starter", "professional", "agency"]).default("starter"),
  billingCycle: mysqlEnum("billing_cycle", ["monthly", "annual"]).default("monthly"),
  status: mysqlEnum("status", ["active", "cancelled", "past_due", "trial"]).default("trial"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;

// ============================================================
// Usage Logs
// ============================================================
export const usageLogs = mysqlTable("usage_logs", {
  id: serial("id"),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 100 }),
  count: int("count").default(1),
  date: date("date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// Agent Runs
// ============================================================
export const agentRuns = mysqlTable("agent_runs", {
  id: serial("id"),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 100 }),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running"),
  results: json("results"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// ============================================================
// Activities
// ============================================================
export const activities = mysqlTable("activities", {
  id: serial("id"),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  type: varchar("type", { length: 100 }),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// AI Generated Pitches
// ============================================================
export const aiPitches = mysqlTable("ai_pitches", {
  id: serial("id"),
  businessId: bigint("business_id", { mode: "number", unsigned: true }),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }),
  channel: mysqlEnum("channel", ["whatsapp", "email", "facebook", "telegram", "call_script"]),
  tone: varchar("tone", { length: 50 }),
  service: varchar("service", { length: 100 }),
  pitchContent: text("pitch_content"),
  wordCount: int("word_count"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// Tasks (assigned to team members)
// ============================================================
export const tasks = mysqlTable("tasks", {
  id: serial("id"),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  assignedBy: bigint("assigned_by", { mode: "number", unsigned: true }),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;
