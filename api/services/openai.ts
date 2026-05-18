import OpenAI from "openai";
import { env } from "../lib/env";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey || "sk-dummy-key" });
  }
  return client;
}

export function hasOpenAI(): boolean {
  return !!env.openaiApiKey && env.openaiApiKey.startsWith("sk-") && env.openaiApiKey.length > 20;
}

// ───────────────────────────────────────────────
// AI-Powered Digital Presence Analysis
// ───────────────────────────────────────────────
export async function analyzeDigitalPresence(params: {
  businessName: string;
  category: string;
  city: string;
  country: string;
  hasWebsite: boolean;
  hasFacebook: boolean;
  hasWhatsapp: boolean;
  websiteUrl?: string;
  facebookUrl?: string;
  rating?: number;
  reviewCount?: number;
}): Promise<{
  overallScore: number;
  scoreCategory: "poor" | "weak" | "average" | "good" | "excellent";
  websiteScore: number;
  mobileScore: number;
  seoScore: number;
  brandingScore: number;
  socialScore: number;
  facebookScore: number;
  adScore: number;
  visibilityScore: number;
  whatsappScore: number;
  mapsScore: number;
  detectedIssues: string[];
  aiSummary: string;
}> {
  if (!hasOpenAI()) {
    // Fallback to deterministic scoring
    return generateFallbackAnalysis(params);
  }

  const prompt = `Analyze the digital presence of this business and return ONLY a JSON object:

Business: ${params.businessName}
Category: ${params.category}
Location: ${params.city}, ${params.country}
Has Website: ${params.hasWebsite}
Has Facebook: ${params.hasFacebook}
Has WhatsApp: ${params.hasWhatsapp}
Website URL: ${params.websiteUrl || "N/A"}
Facebook URL: ${params.facebookUrl || "N/A"}
Google Rating: ${params.rating || "N/A"} (${params.reviewCount || 0} reviews)

Score each 0-100 and return JSON:
{
  "overallScore": number,
  "scoreCategory": "poor"|"weak"|"average"|"good"|"excellent",
  "websiteScore": number,
  "mobileScore": number,
  "seoScore": number,
  "brandingScore": number,
  "socialScore": number,
  "facebookScore": number,
  "adScore": number,
  "visibilityScore": number,
  "whatsappScore": number,
  "mapsScore": number,
  "detectedIssues": string[],
  "aiSummary": string
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(content);

    return {
      overallScore: clamp(result.overallScore ?? 30),
      scoreCategory: result.scoreCategory ?? "poor",
      websiteScore: clamp(result.websiteScore ?? 0),
      mobileScore: clamp(result.mobileScore ?? 0),
      seoScore: clamp(result.seoScore ?? 10),
      brandingScore: clamp(result.brandingScore ?? 20),
      socialScore: clamp(result.socialScore ?? 15),
      facebookScore: clamp(result.facebookScore ?? 15),
      adScore: clamp(result.adScore ?? 5),
      visibilityScore: clamp(result.visibilityScore ?? 20),
      whatsappScore: clamp(result.whatsappScore ?? params.hasWhatsapp ? 40 : 10),
      mapsScore: clamp(result.mapsScore ?? 30),
      detectedIssues: Array.isArray(result.detectedIssues)
        ? result.detectedIssues.slice(0, 8)
        : ["Limited digital presence detected"],
      aiSummary: result.aiSummary ?? `${params.businessName} has a ${result.scoreCategory ?? "poor"} digital presence with room for significant improvement.`,
    };
  } catch {
    return generateFallbackAnalysis(params);
  }
}

// ───────────────────────────────────────────────
// AI-Powered Sales Pitch Generation
// ───────────────────────────────────────────────
export async function generateSalesPitch(params: {
  businessName: string;
  contactName?: string;
  category: string;
  city: string;
  country: string;
  hasWebsite: boolean;
  hasFacebook: boolean;
  hasWhatsapp: boolean;
  rating?: number;
  reviewCount?: number;
  service: string;
  tone: string;
  channel: string;
  detectedIssues?: string[];
}): Promise<{ pitch: string; wordCount: number }> {
  if (!hasOpenAI()) {
    const pitch = generateFallbackPitch(params);
    return { pitch, wordCount: pitch.split(/\s+/).length };
  }

  const serviceDescriptions: Record<string, string> = {
    website: "custom website design and development",
    "facebook-ads": "Facebook and Instagram advertising campaigns",
    "whatsapp-automation": "WhatsApp Business automation and chatbot setup",
    seo: "search engine optimization to rank on Google",
    branding: "brand identity design including logo, colors, and visual assets",
    "booking-system": "online booking and reservation system",
    "social-media": "social media management and content creation",
    default: "digital marketing and web presence services",
  };

  const channelGuidance: Record<string, string> = {
    whatsapp: "Keep it short (2-4 sentences), conversational, no formal salutations. Use line breaks. Add a question at the end.",
    email: "Use proper salutation, 3-4 paragraphs, professional tone, clear call-to-action.",
    facebook: "Friendly and social tone, 2-3 sentences, emoji sparingly, direct question.",
    telegram: "Concise, 2-3 sentences, action-oriented.",
    call_script: "Use bullet points for talking points, include opening hook, value proposition, and closing question.",
  };

  const prompt = `Generate a ${params.tone} sales pitch for a digital agency.

TARGET BUSINESS:
- Name: ${params.businessName}
- Contact: ${params.contactName || "the owner"}
- Type: ${params.category}
- Location: ${params.city}, ${params.country}
- Has Website: ${params.hasWebsite ? "Yes" : "No"}
- Has Facebook: ${params.hasFacebook ? "Yes" : "No"}
- Has WhatsApp Business: ${params.hasWhatsapp ? "Yes" : "No"}
- Google Rating: ${params.rating || "N/A"} (${params.reviewCount || 0} reviews)
${params.detectedIssues?.length ? `- Issues: ${params.detectedIssues.join(", ")}` : ""}

SERVICE TO PITCH: ${serviceDescriptions[params.service] || serviceDescriptions.default}

TONE: ${params.tone} (${getToneDescription(params.tone)})
CHANNEL: ${params.channel} — ${channelGuidance[params.channel] || channelGuidance.email}

Requirements:
- Personalize with the business name
- Reference their specific situation (e.g., "I noticed you don't have a website yet" or "Your reviews are amazing")
- Mention the service benefit with a specific metric if possible
- End with a low-friction call-to-action
- Do NOT use placeholders like [name] or {business_name}
- Replace {business_name} with "${params.businessName}" and {contact_name} with "${params.contactName || "there"}"

Return ONLY the pitch text, no JSON, no markdown, no explanations.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    const pitch = (response.choices[0]?.message?.content ?? "")
      .replace(/\{business_name\}/g, params.businessName)
      .replace(/\{contact_name\}/g, params.contactName || "there")
      .trim();

    return { pitch, wordCount: pitch.split(/\s+/).filter(Boolean).length };
  } catch {
    const pitch = generateFallbackPitch(params);
    return { pitch, wordCount: pitch.split(/\s+/).length };
  }
}

// ───────────────────────────────────────────────
// AI Agent Insights Generation
// ───────────────────────────────────────────────
export async function generateAgentInsights(params: {
  totalBusinesses: number;
  avgScore: number;
  highOpportunityCount: number;
  noWebsiteCount: number;
  crmLeadsCount: number;
  stuckLeadsCount: number;
  recentDiscoveries: number;
}): Promise<Array<{
  type: "recommendation" | "alert" | "trend";
  title: string;
  description: string;
  action: string;
  priority: "high" | "medium" | "low";
}>> {
  if (!hasOpenAI()) {
    return generateFallbackInsights(params);
  }

  const prompt = `Analyze this business intelligence data and return actionable insights as a JSON array.

DATA:
- Total businesses in database: ${params.totalBusinesses}
- Average digital score: ${params.avgScore}/100
- High opportunity businesses: ${params.highOpportunityCount}
- Businesses without websites: ${params.noWebsiteCount}
- CRM leads: ${params.crmLeadsCount}
- Leads stuck in pipeline: ${params.stuckLeadsCount}
- Recent discoveries: ${params.recentDiscoveries}

Return JSON array with objects: { "type": "recommendation|alert|trend", "title": string, "description": string, "action": string, "priority": "high|medium|low" }

Generate 5 insights. Be specific and data-driven.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1200,
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    const insights = Array.isArray(parsed) ? parsed : parsed.insights || [];

    return insights.slice(0, 6).map((i: Record<string, unknown>) => ({
      type: ["recommendation", "alert", "trend"].includes(String(i.type)) ? String(i.type) as "recommendation" | "alert" | "trend" : "recommendation",
      title: String(i.title ?? "Insight"),
      description: String(i.description ?? ""),
      action: String(i.action ?? "Review"),
      priority: ["high", "medium", "low"].includes(String(i.priority)) ? String(i.priority) as "high" | "medium" | "low" : "medium",
    }));
  } catch {
    return generateFallbackInsights(params);
  }
}

// ───────────────────────────────────────────────
// WhatsApp Message Optimization
// ───────────────────────────────────────────────
export async function optimizeWhatsAppMessage(message: string): Promise<string> {
  if (!hasOpenAI()) return message;

  const prompt = `Optimize this WhatsApp business message. Keep it concise, engaging, and professional. Add appropriate line breaks. Max 3-4 sentences. Return ONLY the optimized message:

"${message}"`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.5,
    });
    return response.choices[0]?.message?.content?.trim() || message;
  } catch {
    return message;
  }
}

// ───────────────────────────────────────────────
// Email Subject Line Generator
// ───────────────────────────────────────────────
export async function generateEmailSubject(context: {
  businessName: string;
  service: string;
  tone: string;
}): Promise<string> {
  if (!hasOpenAI()) {
    const subjects: Record<string, string> = {
      website: `Quick question about ${context.businessName}'s website`,
      seo: `Free SEO audit for ${context.businessName}`,
      branding: `Elevating ${context.businessName}'s brand`,
      default: `Digital growth opportunity for ${context.businessName}`,
    };
    return subjects[context.service] || subjects.default;
  }

  const prompt = `Generate a single email subject line for outreach to ${context.businessName} about ${context.service}. Tone: ${context.tone}. Keep under 60 characters. No quotes. Return ONLY the subject line.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
      temperature: 0.6,
    });
    return response.choices[0]?.message?.content?.trim().replace(/["']/g, "") || "Digital growth opportunity";
  } catch {
    return "Digital growth opportunity";
  }
}

// ───────────────────────────────────────────────
// Helper functions
// ───────────────────────────────────────────────

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function getToneDescription(tone: string): string {
  const descriptions: Record<string, string> = {
    friendly: "warm, conversational, approachable",
    professional: "polished, business-focused, formal",
    luxury: "elegant, aspirational, refined",
    corporate: "formal, data-driven, strategic",
    aggressive: "urgency-driven, social proof heavy",
    casual: "relaxed, personal, informal",
  };
  return descriptions[tone] || descriptions.friendly;
}

function generateFallbackAnalysis(params: {
  businessName: string;
  hasWebsite: boolean;
  hasFacebook: boolean;
  hasWhatsapp: boolean;
  rating?: number;
  reviewCount?: number;
}): ReturnType<typeof analyzeDigitalPresence> extends Promise<infer T> ? T : never {
  const websiteScore = params.hasWebsite ? 55 : 0;
  const socialScore = params.hasFacebook ? 45 : 10;
  const whatsappScore = params.hasWhatsapp ? 50 : 15;
  const mapsScore = params.reviewCount && params.reviewCount > 10 ? 55 : 25;
  const seoScore = params.hasWebsite ? 35 : 5;
  const brandingScore = params.hasFacebook ? 40 : 15;

  const overallScore = Math.round(
    (websiteScore * 0.2 + socialScore * 0.15 + seoScore * 0.15 + brandingScore * 0.1 +
     whatsappScore * 0.1 + mapsScore * 0.15 + (params.hasWebsite ? 30 : 5) * 0.15)
  );

  const issues: string[] = [];
  if (!params.hasWebsite) issues.push("No website detected — losing online visibility");
  if (!params.hasFacebook) issues.push("No Facebook page — missing social proof");
  if (!params.hasWhatsapp) issues.push("No WhatsApp Business — losing direct bookings");
  if (params.reviewCount && params.reviewCount < 20) issues.push("Few Google reviews — build review strategy");
  if (!params.hasWebsite) issues.push("No booking system — customers can't book online");
  if (seoScore < 30) issues.push("Poor SEO — not ranking on Google");
  if (socialScore < 30) issues.push("Weak social media presence");

  return {
    overallScore,
    scoreCategory: overallScore >= 80 ? "excellent" : overallScore >= 60 ? "good" : overallScore >= 40 ? "average" : overallScore >= 20 ? "weak" : "poor",
    websiteScore,
    mobileScore: websiteScore > 0 ? Math.round(websiteScore * 0.8) : 0,
    seoScore,
    brandingScore,
    socialScore,
    facebookScore: socialScore,
    adScore: 10,
    visibilityScore: Math.round((mapsScore + seoScore) / 2),
    whatsappScore,
    mapsScore,
    detectedIssues: issues,
    aiSummary: `${params.businessName} has a ${overallScore >= 60 ? "solid" : overallScore >= 40 ? "developing" : "limited"} digital presence. ${!params.hasWebsite ? "The lack of a website is the biggest missed opportunity." : "There's room for improvement across multiple channels."} ${params.hasWhatsapp ? "WhatsApp presence is a strength to build on." : "Adding WhatsApp Business could significantly improve customer engagement."}`,
  };
}

function generateFallbackPitch(params: {
  businessName: string;
  contactName?: string;
  hasWebsite: boolean;
  category: string;
  service: string;
  tone: string;
}): string {
  const name = params.contactName || "there";
  const biz = params.businessName;
  const svc = params.service;

  const pitches: Record<string, Record<string, string>> = {
    friendly: {
      website: `Hi ${name}! I came across ${biz} and was so impressed by what you're building. I help ${params.category.toLowerCase()}s create beautiful websites that turn visitors into customers. Would you be open to seeing a free mockup of what your site could look like? No strings attached!`,
      default: `Hi ${name}! I came across ${biz} and think we could help each other. I specialize in digital growth for businesses like yours. Interested in a quick chat?`,
    },
    professional: {
      website: `Dear ${name}, I am reaching out regarding ${biz}'s digital presence. I specialize in developing high-converting websites for businesses in your industry. I would welcome the opportunity to discuss how a professional website could benefit your operations. Would you be available for a brief consultation?`,
      default: `Dear ${name}, I am reaching out to discuss digital growth opportunities for ${biz}. I specialize in helping businesses expand their online presence and increase revenue.`,
    },
    luxury: {
      website: `Good day ${name}. ${biz} exudes a refined character that deserves an equally elegant digital presence. I curate bespoke websites for discerning establishments, blending aesthetic sophistication with seamless functionality.`,
      default: `Good day ${name}. ${biz} possesses a distinctive elegance that should be reflected across all digital touchpoints. I specialize in elevating premium brands through sophisticated digital strategies.`,
    },
    corporate: {
      website: `Dear ${name}, I'm writing to discuss a strategic digital initiative for ${biz}. Based on market analysis, implementing a modern web platform could increase conversion rates by 25-40%. I'd like to present a data-driven proposal.`,
      default: `Dear ${name}, I'm conducting a digital transformation assessment for businesses in your sector. ${biz} presents significant growth potential through strategic digital investments.`,
    },
    aggressive: {
      website: `Hi ${name}! Your competitors are getting bookings because they have great websites — ${biz} deserves the same advantage. I've built sites for 50+ businesses that increased bookings by 40%+. Let me show you what's possible. Limited spots available this month!`,
      default: `Hi ${name}! I noticed ${biz} and I know I can help you get more customers — FAST. My clients see results within 30 days. Let's jump on a quick call and I'll show you exactly how.`,
    },
    casual: {
      website: `Hey ${name}! So I found ${biz} online and honestly, I think you guys are sitting on a goldmine. A killer website would take you to the next level. I do this stuff all the time — want me to whip up a quick mockup for you? No charge, just for fun.`,
      default: `Hey ${name}! Love what ${biz} is doing. I've got some ideas that could really help you grow. Nothing fancy, just a quick chat. What do you say?`,
    },
  };

  const tonePitches = pitches[params.tone] || pitches.friendly;
  return tonePitches[svc] || tonePitches.default;
}

function generateFallbackInsights(params: {
  totalBusinesses: number;
  avgScore: number;
  highOpportunityCount: number;
  noWebsiteCount: number;
  crmLeadsCount: number;
  stuckLeadsCount: number;
}): Array<{ type: "recommendation" | "alert" | "trend"; title: string; description: string; action: string; priority: "high" | "medium" | "low" }> {
  return [
    {
      type: "recommendation",
      title: `${params.noWebsiteCount} businesses need websites`,
      description: `${params.noWebsiteCount} businesses in your database have no website — a massive opportunity for website services. Average digital score is ${params.avgScore}/100.`,
      action: "Run discovery filter",
      priority: "high",
    },
    {
      type: "alert",
      title: params.stuckLeadsCount > 0 ? `${params.stuckLeadsCount} leads need follow-up` : "Follow up on CRM leads",
      description: params.stuckLeadsCount > 0
        ? `You have ${params.stuckLeadsCount} leads stuck in the pipeline without recent activity. AI recommends automated follow-up.`
        : "Monitor your CRM pipeline and follow up with leads regularly to prevent deals from stalling.",
      action: "Send follow-ups",
      priority: "high",
    },
    {
      type: "recommendation",
      title: "Focus on high-opportunity businesses",
      description: `${params.highOpportunityCount} businesses are flagged as high or very high opportunity. Prioritize these for outreach campaigns.`,
      action: "View high-opportunity leads",
      priority: "high",
    },
    {
      type: "trend",
      title: params.totalBusinesses > 10 ? "Database growing steadily" : "Build your business database",
      description: params.totalBusinesses > 10
        ? `You have ${params.totalBusinesses} businesses in your database. The average digital score of ${params.avgScore}/100 indicates strong market opportunity.`
        : "Run AI discovery to find more businesses in your target regions and categories.",
      action: "Run discovery",
      priority: "medium",
    },
    {
      type: "recommendation",
      title: params.crmLeadsCount > 0 ? `${params.crmLeadsCount} CRM leads to nurture` : "Start building your CRM",
      description: params.crmLeadsCount > 0
        ? `You have ${params.crmLeadsCount} leads in your CRM. Use AI-generated pitches to move them through the pipeline.`
        : "Add businesses to your CRM and start nurturing them with personalized outreach.",
      action: "View CRM pipeline",
      priority: "medium",
    },
  ];
}
