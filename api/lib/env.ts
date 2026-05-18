import "dotenv/config";

function envVar(name: string, required = false): string {
  const value = process.env[name];
  if (required && !value) {
    // Only throw at runtime, not during build
    if (process.env.NODE_ENV === "production" && !process.env.RAILWAY_ENVIRONMENT_NAME) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }
  return value ?? "";
}

export const env = {
  // App
  appId: envVar("APP_ID"),
  appSecret: envVar("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  
  // Database
  databaseUrl: envVar("DATABASE_URL", true),
  
  // OAuth
  kimiAuthUrl: envVar("KIMI_AUTH_URL"),
  kimiOpenUrl: envVar("KIMI_OPEN_URL"),
  ownerUnionId: envVar("OWNER_UNION_ID"),
  
  // AI Services
  openaiApiKey: envVar("OPENAI_API_KEY"),
  googlePlacesApiKey: envVar("GOOGLE_PLACES_API_KEY"),
  twilioAccountSid: envVar("TWILIO_ACCOUNT_SID"),
  twilioAuthToken: envVar("TWILIO_AUTH_TOKEN"),
  twilioWhatsappNumber: envVar("TWILIO_WHATSAPP_NUMBER"),
  sendgridApiKey: envVar("SENDGRID_API_KEY"),
};
