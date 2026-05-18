import { getDb } from "../api/queries/connection";
import {
  businesses,
  businessAnalyses,
  crmLeads,
  conversations,
  campaigns,
  campaignRecipients,
  outreachTemplates,
  activities,
  aiPitches,
  tasks,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding LeadForge AI database...");

  // Seed businesses
  const businessData = [
    { name: "Tamarind Lodges", category: "Lodges", subCategory: "Safari Lodge", country: "Zimbabwe", city: "Kariba", address: "Lake Kariba Shoreline", phone: "+263772123456", whatsapp: "+263772123456", email: "info@tamarindlodges.co.zw", facebookUrl: "https://facebook.com/tamarindlodges", rating: "4.2", reviewCount: 34, hasWebsite: false, hasFacebook: true, hasWhatsapp: true, digitalScore: 22, opportunityLevel: "very_high", source: "google_maps" },
    { name: "Victoria Falls Hotel", category: "Hotels", subCategory: "Luxury Hotel", country: "Zimbabwe", city: "Victoria Falls", address: "1 Mallet Drive", phone: "+263213284574", whatsapp: "+263213284575", email: "reservations@vfallshotel.com", website: "https://vfallshotel.com", facebookUrl: "https://facebook.com/vfallshotel", instagramUrl: "https://instagram.com/vfallshotel", rating: "4.6", reviewCount: 892, hasWebsite: true, hasFacebook: true, hasWhatsapp: true, digitalScore: 68, opportunityLevel: "medium", source: "google_maps" },
    { name: "Kariba Houseboats Adventures", category: "Houseboats", subCategory: "Houseboat Rental", country: "Zimbabwe", city: "Kariba", address: "Kariba Marina", phone: "+263772987654", whatsapp: "+263772987654", email: "bookings@karibahouseboats.com", facebookUrl: "https://facebook.com/karibahouseboats", rating: "4.0", reviewCount: 18, hasWebsite: false, hasFacebook: true, hasWhatsapp: true, digitalScore: 15, opportunityLevel: "very_high", source: "google_maps" },
    { name: "The Boma Restaurant", category: "Restaurants", subCategory: "African Cuisine", country: "Zimbabwe", city: "Victoria Falls", address: "Stanley Livingstone Estate", phone: "+263213284500", whatsapp: "+263772345678", email: "dining@theboma.co.zw", website: "https://theboma.co.zw", facebookUrl: "https://facebook.com/thebomavictoriafalls", instagramUrl: "https://instagram.com/thebomavf", rating: "4.7", reviewCount: 567, hasWebsite: true, hasFacebook: true, hasWhatsapp: true, digitalScore: 72, opportunityLevel: "low", source: "google_maps" },
    { name: "Gorges Lodge", category: "Lodges", subCategory: "Boutique Lodge", country: "Zimbabwe", city: "Victoria Falls", address: "Gorges Road, Chinotimba", phone: "+263772456789", whatsapp: "+263772456789", email: "stay@gorgeslodge.co.zw", facebookUrl: "https://facebook.com/gorgeslodge", rating: "4.4", reviewCount: 42, hasWebsite: false, hasFacebook: true, hasWhatsapp: false, digitalScore: 28, opportunityLevel: "high", source: "google_maps" },
    { name: "Sundowner Cruise Co", category: "Tours", subCategory: "Boat Cruise", country: "Zimbabwe", city: "Kariba", address: "Kariba Harbour", phone: "+263772567890", whatsapp: "+263772567890", email: "cruise@sundownerkariba.com", rating: "3.8", reviewCount: 12, hasWebsite: false, hasFacebook: false, hasWhatsapp: true, digitalScore: 8, opportunityLevel: "very_high", source: "google_maps" },
    { name: "Amanzi Spa & Salon", category: "Salons", subCategory: "Beauty Salon", country: "Zimbabwe", city: "Harare", address: "Samora Machel Avenue", phone: "+263242123456", whatsapp: "+263772678901", email: "bookings@amanzispa.co.zw", facebookUrl: "https://facebook.com/amanzispa", instagramUrl: "https://instagram.com/amanzispa", rating: "4.1", reviewCount: 23, hasWebsite: false, hasFacebook: true, hasWhatsapp: true, digitalScore: 18, opportunityLevel: "high", source: "google_maps" },
    { name: "Mukuvisi Woodlands", category: "Tours", subCategory: "Nature Reserve", country: "Zimbabwe", city: "Harare", address: "Mukuvisi Road", phone: "+263242789012", whatsapp: "+263772789012", email: "info@mukuvisi.org", website: "https://mukuvisi.org", facebookUrl: "https://facebook.com/mukuvisi", rating: "4.3", reviewCount: 156, hasWebsite: true, hasFacebook: true, hasWhatsapp: false, digitalScore: 45, opportunityLevel: "medium", source: "google_maps" },
    { name: "Cape Grace Hotel", category: "Hotels", subCategory: "Boutique Hotel", country: "South Africa", city: "Cape Town", address: "West Quay Road, V&A Waterfront", phone: "+27214101800", whatsapp: "+27821234567", email: "reservations@capegrace.com", website: "https://capegrace.com", facebookUrl: "https://facebook.com/capegrace", instagramUrl: "https://instagram.com/capegrace", rating: "4.8", reviewCount: 1234, hasWebsite: true, hasFacebook: true, hasWhatsapp: true, digitalScore: 82, opportunityLevel: "low", source: "google_maps" },
    { name: "Table Mountain Safari", category: "Safari", subCategory: "Wildlife Safari", country: "South Africa", city: "Cape Town", address: "Long Street", phone: "+27215551234", whatsapp: "+27829876543", email: "tours@tablemountainsafari.co.za", facebookUrl: "https://facebook.com/tmsafari", rating: "3.9", reviewCount: 67, hasWebsite: false, hasFacebook: true, hasWhatsapp: true, digitalScore: 25, opportunityLevel: "high", source: "google_maps" },
    { name: "Sossusvlei Desert Lodge", category: "Lodges", subCategory: "Desert Lodge", country: "Namibia", city: "Sesriem", address: "Sossusvlei Road", phone: "+26463293000", whatsapp: "+264811234567", email: "reservations@sossusvleilodge.com", website: "https://sossusvleilodge.com", facebookUrl: "https://facebook.com/sossusvleilodge", instagramUrl: "https://instagram.com/sossusvleilodge", rating: "4.9", reviewCount: 445, hasWebsite: true, hasFacebook: true, hasWhatsapp: true, digitalScore: 76, opportunityLevel: "medium", source: "google_maps" },
    { name: "Chobe River Lodge", category: "Lodges", subCategory: "River Lodge", country: "Botswana", city: "Kasane", address: "Chobe River Front", phone: "+2676250336", whatsapp: "+26774123456", email: "bookings@chobelodge.co.bw", facebookUrl: "https://facebook.com/chobelodge", rating: "4.3", reviewCount: 89, hasWebsite: false, hasFacebook: true, hasWhatsapp: true, digitalScore: 31, opportunityLevel: "high", source: "google_maps" },
  ];

  const insertedBusinesses = await db.insert(businesses).values(businessData as any);
  console.log(`Inserted ${businessData.length} businesses`);

  // Seed business analyses
  const analysisData = [
    { businessId: 1, overallScore: 22, scoreCategory: "poor" as const, websiteScore: 0, mobileScore: 0, seoScore: 10, brandingScore: 30, socialScore: 25, facebookScore: 28, adScore: 15, visibilityScore: 20, whatsappScore: 45, mapsScore: 38, detectedIssues: JSON.stringify(["Missing website", "Weak Facebook presence", "No booking system", "Poor Google Maps optimization"]), aiSummary: "Tamarind Lodges has significant digital gaps. No website, minimal social activity, and no booking automation. High opportunity for digital services.", generatedPitch: "Hi Tamarind Lodges team! I noticed your beautiful lakeside property has amazing potential but lacks a modern website and direct booking system. I help lodges increase direct bookings by 40% using custom websites, Facebook ads, and WhatsApp automation. Would you be open to a quick chat?", toneUsed: "friendly" },
    { businessId: 2, overallScore: 68, scoreCategory: "good" as const, websiteScore: 72, mobileScore: 65, seoScore: 58, brandingScore: 75, socialScore: 70, facebookScore: 68, adScore: 55, visibilityScore: 80, whatsappScore: 60, mapsScore: 85, detectedIssues: JSON.stringify(["SEO could be improved", "Ad campaigns not optimized"]), aiSummary: "Victoria Falls Hotel has a solid digital presence with room for improvement in SEO and paid advertising.", toneUsed: "professional" },
    { businessId: 3, overallScore: 15, scoreCategory: "poor" as const, websiteScore: 0, mobileScore: 0, seoScore: 5, brandingScore: 20, socialScore: 18, facebookScore: 22, adScore: 10, visibilityScore: 12, whatsappScore: 50, mapsScore: 25, detectedIssues: JSON.stringify(["No website", "Inactive social media", "No booking system", "Poor online visibility"]), aiSummary: "Kariba Houseboats has minimal digital presence. Only WhatsApp is active. Massive opportunity for a complete digital overhaul.", generatedPitch: "Hi there! Your houseboat adventures look incredible on Facebook. Imagine having a stunning website where tourists can browse your fleet, check availability, and book directly. I specialize in building tourism booking systems. Interested in learning more?", toneUsed: "friendly" },
    { businessId: 4, overallScore: 72, scoreCategory: "good" as const, websiteScore: 78, mobileScore: 70, seoScore: 65, brandingScore: 80, socialScore: 75, facebookScore: 72, adScore: 68, visibilityScore: 85, whatsappScore: 70, mapsScore: 82, detectedIssues: JSON.stringify(["Could add WhatsApp automation", "Instagram content could be more frequent"]), aiSummary: "The Boma Restaurant has a strong digital presence. Minor improvements in automation and content frequency could boost results.", toneUsed: "professional" },
    { businessId: 5, overallScore: 28, scoreCategory: "weak" as const, websiteScore: 0, mobileScore: 0, seoScore: 15, brandingScore: 35, socialScore: 30, facebookScore: 38, adScore: 12, visibilityScore: 25, whatsappScore: 20, mapsScore: 42, detectedIssues: JSON.stringify(["No website", "Weak branding", "No WhatsApp business", "Limited social media"]), aiSummary: "Gorges Lodge has beautiful views but a weak digital footprint. No website and minimal social engagement.", generatedPitch: "Hi Gorges Lodge team! Your location overlooking the Batoka Gorge is breathtaking. I help boutique lodges like yours create stunning websites that capture the magic and convert lookers into bookers. Shall we discuss how to boost your direct bookings?", toneUsed: "luxury" },
    { businessId: 6, overallScore: 8, scoreCategory: "poor" as const, websiteScore: 0, mobileScore: 0, seoScore: 2, brandingScore: 10, socialScore: 5, facebookScore: 0, adScore: 0, visibilityScore: 5, whatsappScore: 40, mapsScore: 15, detectedIssues: JSON.stringify(["No website", "No social media presence", "No branding", "Minimal online presence"]), aiSummary: "Sundowner Cruise has almost no digital presence. Only WhatsApp is used. Enormous opportunity for a complete digital transformation.", toneUsed: "friendly" },
    { businessId: 7, overallScore: 18, scoreCategory: "poor" as const, websiteScore: 0, mobileScore: 0, seoScore: 8, brandingScore: 25, socialScore: 22, facebookScore: 30, adScore: 5, visibilityScore: 15, whatsappScore: 55, mapsScore: 20, detectedIssues: JSON.stringify(["No website", "Weak social media", "No booking system"]), aiSummary: "Amanzi Spa has potential but lacks a website and strong social strategy. Good candidate for branding + website package.", toneUsed: "professional" },
    { businessId: 8, overallScore: 45, scoreCategory: "average" as const, websiteScore: 52, mobileScore: 48, seoScore: 40, brandingScore: 50, socialScore: 42, facebookScore: 45, adScore: 35, visibilityScore: 55, whatsappScore: 30, mapsScore: 58, detectedIssues: JSON.stringify(["SEO needs work", "WhatsApp not integrated", "Social media inconsistent"]), aiSummary: "Mukuvisi Woodlands has an average digital presence. Website exists but needs optimization.", toneUsed: "professional" },
    { businessId: 9, overallScore: 82, scoreCategory: "excellent" as const, websiteScore: 88, mobileScore: 85, seoScore: 78, brandingScore: 90, socialScore: 85, facebookScore: 80, adScore: 75, visibilityScore: 92, whatsappScore: 70, mapsScore: 88, detectedIssues: JSON.stringify(["Minor SEO improvements possible"]), aiSummary: "Cape Grace Hotel has an excellent digital presence. One of the best in the region.", toneUsed: "professional" },
    { businessId: 10, overallScore: 25, scoreCategory: "weak" as const, websiteScore: 0, mobileScore: 0, seoScore: 12, brandingScore: 30, socialScore: 28, facebookScore: 35, adScore: 8, visibilityScore: 22, whatsappScore: 45, mapsScore: 32, detectedIssues: JSON.stringify(["No website", "Inconsistent branding", "Low social engagement"]), aiSummary: "Table Mountain Safari needs a website and branding overhaul. Good tourism potential.", toneUsed: "friendly" },
    { businessId: 11, overallScore: 76, scoreCategory: "good" as const, websiteScore: 82, mobileScore: 78, seoScore: 70, brandingScore: 85, socialScore: 80, facebookScore: 75, adScore: 65, visibilityScore: 88, whatsappScore: 60, mapsScore: 82, detectedIssues: JSON.stringify(["Could improve ad campaigns"]), aiSummary: "Sossusvlei Desert Lodge has a strong digital presence with minor room for improvement.", toneUsed: "professional" },
    { businessId: 12, overallScore: 31, scoreCategory: "weak" as const, websiteScore: 0, mobileScore: 0, seoScore: 18, brandingScore: 40, socialScore: 35, facebookScore: 42, adScore: 15, visibilityScore: 28, whatsappScore: 55, mapsScore: 48, detectedIssues: JSON.stringify(["No website", "Weak SEO", "Limited social strategy"]), aiSummary: "Chobe River Lodge has basic social presence but needs a proper website and SEO strategy.", toneUsed: "professional" },
  ];

  await db.insert(businessAnalyses).values(analysisData as any);
  console.log(`Inserted ${analysisData.length} business analyses`);

  // Seed CRM leads
  const leadData = [
    { businessId: 1, name: "Tamarind Lodges", contactName: "John Moyo", email: "john@tamarindlodges.co.zw", phone: "+263772123456", whatsapp: "+263772123456", stage: "interested" as const, source: "discovery", estimatedValue: "3500.00", tags: JSON.stringify(["tourism", "high-value", "website"]), notes: "Interested in website + WhatsApp automation. Wants to see mockup first.", aiSummary: "High buying intent. Interested in direct booking system.", buyingIntent: "high" as const, lastActivityAt: new Date("2026-05-15T10:30:00Z") },
    { businessId: 3, name: "Kariba Houseboats Adventures", contactName: "Sarah Ndlovu", email: "sarah@karibahouseboats.com", phone: "+263772987654", whatsapp: "+263772987654", stage: "proposal_sent" as const, source: "discovery", estimatedValue: "2800.00", tags: JSON.stringify(["tourism", "houseboat", "booking-system"]), notes: "Proposal sent for website + booking system. Waiting for response.", aiSummary: "Proposal sent 5 days ago. AI recommends follow-up.", buyingIntent: "medium" as const, lastActivityAt: new Date("2026-05-10T14:00:00Z") },
    { businessId: 5, name: "Gorges Lodge", contactName: "Peter Mapfumo", email: "peter@gorgeslodge.co.zw", phone: "+263772456789", whatsapp: "+263772456789", stage: "new" as const, source: "discovery", estimatedValue: "4500.00", tags: JSON.stringify(["tourism", "boutique", "luxury"]), notes: "Premium lodge. High potential for luxury website + branding.", aiSummary: "New lead. Very high opportunity for luxury services.", buyingIntent: "high" as const, lastActivityAt: new Date("2026-05-16T08:00:00Z") },
    { businessId: 7, name: "Amanzi Spa & Salon", contactName: "Lisa Chiweshe", email: "lisa@amanzispa.co.zw", phone: "+263242123456", whatsapp: "+263772678901", stage: "contacted" as const, source: "discovery", estimatedValue: "1800.00", tags: JSON.stringify(["salon", "branding", "social-media"]), notes: "Contacted via WhatsApp. Interested in branding package.", aiSummary: "Responded positively to initial outreach. Follow up with branding samples.", buyingIntent: "medium" as const, lastActivityAt: new Date("2026-05-14T16:30:00Z") },
    { businessId: 12, name: "Chobe River Lodge", contactName: "David Kgosi", email: "david@chobelodge.co.bw", phone: "+2676250336", whatsapp: "+26774123456", stage: "negotiation" as const, source: "discovery", estimatedValue: "5200.00", tags: JSON.stringify(["tourism", "botswana", "website", "seo"]), notes: "Negotiating on price. Wants website + SEO + social media management.", aiSummary: "In negotiation. Flexible on pricing. Bundle offer recommended.", buyingIntent: "high" as const, lastActivityAt: new Date("2026-05-13T11:00:00Z") },
    { businessId: 10, name: "Table Mountain Safari", contactName: "James Peterson", email: "james@tablemountainsafari.co.za", phone: "+27215551234", whatsapp: "+27829876543", stage: "proposal_sent" as const, source: "discovery", estimatedValue: "3200.00", tags: JSON.stringify(["tourism", "safari", "south-africa"]), notes: "Proposal sent for complete digital package.", aiSummary: "Stuck in proposal stage for 7 days. AI recommends follow-up email.", buyingIntent: "medium" as const, lastActivityAt: new Date("2026-05-08T09:00:00Z") },
    { name: "Urban Fitness Gym", contactName: "Mike Chena", email: "mike@urbanfitness.co.zw", phone: "+263772111222", whatsapp: "+263772111222", stage: "won" as const, source: "manual", estimatedValue: "2200.00", tags: JSON.stringify(["fitness", "website", "branding"]), notes: "Closed deal for website + branding. Starting next week.", aiSummary: "Won deal. Ready to start project.", buyingIntent: "high" as const, lastActivityAt: new Date("2026-05-12T15:00:00Z") },
    { name: "Harare Book Cafe", contactName: "Anna Mupfumi", email: "anna@hararebookcafe.co.zw", phone: "+263772333444", whatsapp: "+263772333444", stage: "lost" as const, source: "discovery", estimatedValue: "1200.00", tags: JSON.stringify(["cafe", "social-media"]), notes: "Decided to go with another agency. Price was too high.", aiSummary: "Lost to competitor. Consider re-engaging in 3 months.", buyingIntent: "low" as const, lastActivityAt: new Date("2026-05-05T10:00:00Z") },
  ];

  await db.insert(crmLeads).values(leadData as any);
  console.log(`Inserted ${leadData.length} CRM leads`);

  // Seed conversations
  const conversationData = [
    { leadId: 1, channel: "whatsapp" as const, direction: "outbound" as const, message: "Hi John! I came across Tamarind Lodges and was impressed by your location. I help tourism businesses like yours increase direct bookings with modern websites and WhatsApp automation. Would you be open to a quick chat?", aiGenerated: true, sentAt: new Date("2026-05-10T09:00:00Z") },
    { leadId: 1, channel: "whatsapp" as const, direction: "inbound" as const, message: "Hi! Yes, we're definitely interested. We've been relying on word of mouth and it's not enough. Can you show us some examples?", aiGenerated: false, replyDetected: true, sentAt: new Date("2026-05-10T14:30:00Z") },
    { leadId: 1, channel: "whatsapp" as const, direction: "outbound" as const, message: "Absolutely! I've worked with 3 other lodges in Kariba who saw a 40% increase in direct bookings. I can share a mockup of what your website could look like. When would be a good time for a 15-minute call?", aiGenerated: true, sentAt: new Date("2026-05-11T08:00:00Z") },
    { leadId: 1, channel: "whatsapp" as const, direction: "inbound" as const, message: "Tuesday at 2pm works for us. Looking forward to seeing the mockup!", aiGenerated: false, replyDetected: true, sentAt: new Date("2026-05-11T16:00:00Z") },
    { leadId: 3, channel: "email" as const, direction: "outbound" as const, message: "Dear Sarah, I discovered Kariba Houseboats Adventures and noticed you don't have a website yet. In today's digital world, tourists expect to browse, compare, and book online. I specialize in building booking systems for houseboat operators. I've attached a proposal for a complete digital solution. Best regards.", aiGenerated: true, sentAt: new Date("2026-05-05T10:00:00Z") },
    { leadId: 3, channel: "email" as const, direction: "inbound" as const, message: "Thank you for the proposal. It looks comprehensive. We're reviewing it internally and will get back to you by end of week.", aiGenerated: false, replyDetected: true, sentAt: new Date("2026-05-06T11:00:00Z") },
  ];

  await db.insert(conversations).values(conversationData as any);
  console.log(`Inserted ${conversationData.length} conversations`);

  // Seed campaigns
  const campaignData = [
    { name: "Kariba Lodges Outreach", channel: "whatsapp" as const, status: "completed" as const, messageTemplate: "Hi {contact_name}! I noticed {business_name} has amazing tourism potential. I help lodges increase direct bookings by 40% with custom websites and WhatsApp automation. Interested in a free consultation?", tone: "friendly", service: "website", stats: JSON.stringify({ sent: 24, delivered: 22, opened: 18, replied: 8, converted: 3 }) },
    { name: "Harare Salons Campaign", channel: "facebook" as const, status: "running" as const, messageTemplate: "Hi! I help salons like yours attract more clients through professional branding and social media management. Can I send you some examples of our work?", tone: "professional", service: "branding", stats: JSON.stringify({ sent: 15, delivered: 14, opened: 10, replied: 4, converted: 1 }) },
    { name: "Victoria Falls Hotels", channel: "email" as const, status: "scheduled" as const, messageTemplate: "Dear {contact_name}, I'm reaching out to tourism businesses in Victoria Falls about improving their direct booking rates. Our clients see an average 35% increase in direct bookings. Would you be interested in a complimentary digital audit?", tone: "professional", service: "seo", scheduleAt: new Date("2026-05-20T08:00:00Z") },
    { name: "Safari Operators Follow-up", channel: "whatsapp" as const, status: "draft" as const, messageTemplate: "Hi! Following up on my previous message about helping safari operators boost their online bookings. I have some special packages for the upcoming peak season.", tone: "friendly", service: "facebook-ads" },
  ];

  await db.insert(campaigns).values(campaignData as any);
  console.log(`Inserted ${campaignData.length} campaigns`);

  // Seed outreach templates
  const templateData = [
    { name: "Tourism Website Intro", channel: "whatsapp" as const, tone: "friendly", service: "website", content: "Hi {contact_name}! I came across {business_name} and was impressed by your reviews. I help tourism businesses increase direct bookings by 40% with stunning websites. Can I share a quick mockup of what yours could look like?", variables: JSON.stringify(["contact_name", "business_name"]) },
    { name: "Professional SEO Audit", channel: "email" as const, tone: "professional", service: "seo", content: "Dear {contact_name}, I specialize in helping businesses like {business_name} improve their Google rankings and online visibility. I'd like to offer you a complimentary SEO audit. Would you be interested?", variables: JSON.stringify(["contact_name", "business_name"]) },
    { name: "Luxury Branding Pitch", channel: "facebook" as const, tone: "luxury", service: "branding", content: "Good day {contact_name}. {business_name} deserves a brand identity that matches its exceptional quality. Our luxury branding packages have helped boutique properties command premium rates. Shall we discuss?", variables: JSON.stringify(["contact_name", "business_name"]) },
    { name: "WhatsApp Automation Offer", channel: "whatsapp" as const, tone: "friendly", service: "whatsapp-automation", content: "Hi! Did you know 89% of tourists prefer booking via WhatsApp? I can set up an automated booking system for {business_name} that works 24/7. Interested in learning more?", variables: JSON.stringify(["business_name"]) },
  ];

  await db.insert(outreachTemplates).values(templateData as any);
  console.log(`Inserted ${templateData.length} outreach templates`);

  // Seed activities
  const activityData = [
    { type: "discovery", description: "AI discovered Tamarind Lodges in Kariba — Very High opportunity detected", metadata: JSON.stringify({ businessId: 1, opportunityLevel: "very_high" }) },
    { type: "analysis", description: "AI analysis complete for Kariba Houseboats — Overall score: 15/100 (Poor)", metadata: JSON.stringify({ businessId: 3, score: 15 }) },
    { type: "outreach", description: "WhatsApp campaign 'Kariba Lodges Outreach' completed — 3 conversions", metadata: JSON.stringify({ campaignId: 1, conversions: 3 }) },
    { type: "crm_update", description: "Tamarind Lodges moved from 'Contacted' to 'Interested'", metadata: JSON.stringify({ leadId: 1, fromStage: "contacted", toStage: "interested" }) },
    { type: "discovery", description: "AI discovered 5 new salons in Harare with weak digital presence", metadata: JSON.stringify({ count: 5, category: "salons", city: "Harare" }) },
    { type: "campaign", description: "Harare Salons Campaign launched — 15 recipients", metadata: JSON.stringify({ campaignId: 2, recipients: 15 }) },
    { type: "analysis", description: "AI analysis complete for Victoria Falls Hotel — Overall score: 68/100 (Good)", metadata: JSON.stringify({ businessId: 2, score: 68 }) },
    { type: "agent", description: "AI Agent auto-discovered 3 high-opportunity leads in Victoria Falls", metadata: JSON.stringify({ count: 3, region: "Victoria Falls" }) },
  ];

  await db.insert(activities).values(activityData as any);
  console.log(`Inserted ${activityData.length} activities`);

  // Seed tasks
  const taskData = [
    { leadId: 1, title: "Send website mockup to Tamarind Lodges", description: "Create and send a mockup of the lodge website before Tuesday's call", status: "pending" as const, priority: "high" as const, dueDate: new Date("2026-05-19T14:00:00Z") },
    { leadId: 3, title: "Follow up on Kariba Houseboats proposal", description: "Send a gentle follow-up email. It's been 5 days since the proposal was sent.", status: "pending" as const, priority: "high" as const, dueDate: new Date("2026-05-18T10:00:00Z") },
    { leadId: 5, title: "Research Gorges Lodge competitors", description: "Analyze competitor websites for similar boutique lodges in Victoria Falls area", status: "pending" as const, priority: "medium" as const, dueDate: new Date("2026-05-20T17:00:00Z") },
    { leadId: 12, title: "Prepare bundle pricing for Chobe River Lodge", description: "Create a discounted bundle for website + SEO + social media", status: "in_progress" as const, priority: "high" as const, dueDate: new Date("2026-05-17T12:00:00Z") },
    { title: "Review AI Agent weekly report", description: "Check the AI Agent's performance and recommendations for this week", status: "pending" as const, priority: "medium" as const, dueDate: new Date("2026-05-18T09:00:00Z") },
  ];

  await db.insert(tasks).values(taskData as any);
  console.log(`Inserted ${taskData.length} tasks`);

  console.log("Seed complete!");
}

seed().catch(console.error);
