import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  Sparkles, Copy, Send, RefreshCw, Check,
  Loader2, MessageCircle, Mail, Facebook, Phone,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const services = [
  { id: "website", label: "Website Creation" },
  { id: "facebook-ads", label: "Facebook Ads" },
  { id: "whatsapp-automation", label: "WhatsApp Automation" },
  { id: "seo", label: "SEO" },
  { id: "branding", label: "Branding" },
  { id: "booking-system", label: "Booking System" },
  { id: "social-media", label: "Social Media" },
  { id: "tourism-marketing", label: "Tourism Marketing" },
];

const tones = [
  { id: "friendly", label: "Friendly", desc: "Warm, conversational" },
  { id: "professional", label: "Professional", desc: "Polished, business-focused" },
  { id: "luxury", label: "Luxury Tourism", desc: "Elegant, aspirational" },
  { id: "corporate", label: "Corporate", desc: "Formal, data-driven" },
  { id: "aggressive", label: "Aggressive", desc: "Urgency, social proof" },
  { id: "casual", label: "Casual", desc: "Relaxed, personal" },
];

export default function PitchGenerator() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("business");
  const [selectedBusiness, setSelectedBusiness] = useState<string>(businessId || "");
  const [selectedService, setSelectedService] = useState("website");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [channel, setChannel] = useState<"whatsapp" | "email" | "facebook" | "telegram">("whatsapp");
  const [copied, setCopied] = useState(false);

  const utils = trpc.useUtils();

  // Fetch businesses for dropdown
  const { data: businessData } = trpc.business.search.useQuery({ limit: 100 });
  const businesses = businessData?.items ?? [];

  // AI Pitch Generation mutation
  const generateMutation = trpc.outreach.generatePitch.useMutation({
    onSuccess: () => {
      utils.outreach.pitchList.invalidate();
    },
  });

  const generatedPitch = generateMutation.data?.pitch ?? "";
  const isGenerating = generateMutation.isPending;
  const aiPowered = generateMutation.data?.aiPowered ?? false;

  const handleGenerate = () => {
    if (!selectedBusiness) return;
    generateMutation.mutate({
      businessId: Number(selectedBusiness),
      channel: channel === "telegram" ? "call_script" : channel,
      tone: selectedTone as "friendly" | "professional" | "luxury" | "corporate" | "aggressive" | "casual",
      service: selectedService,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const channels = [
    { id: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
    { id: "email" as const, label: "Email", icon: Mail },
    { id: "facebook" as const, label: "Facebook", icon: Facebook },
    { id: "telegram" as const, label: "Call Script", icon: Phone },
  ];

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          AI Sales Pitch Generator
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
          Generate personalized AI pitches powered by GPT-4o
        </p>
      </div>

      {/* AI Status Banner */}
      {!aiPowered && generatedPitch && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-xs" style={{ background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.1)" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--status-yellow)" }} />
          <span style={{ color: "var(--status-yellow)" }}>
            Running in fallback mode. Add OPENAI_API_KEY to your .env file for GPT-4o powered pitches.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Configuration
          </h3>

          {/* Business Selection */}
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              Target Business
            </label>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="w-full h-11 px-3 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
            >
              <option value="">Select a business...</option>
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>{biz.name} — {biz.city}</option>
              ))}
            </select>
          </div>

          {/* Service Selection */}
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              Service to Pitch
            </label>
            <div className="flex flex-wrap gap-2">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selectedService === svc.id ? "var(--gradient-hero)" : "var(--bg-tertiary)",
                    color: "white",
                    border: selectedService === svc.id ? "none" : "1px solid var(--border-subtle)",
                  }}
                >
                  {svc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: selectedTone === tone.id ? "var(--gradient-card)" : "var(--bg-tertiary)",
                    border: selectedTone === tone.id ? "1px solid var(--accent-violet)" : "1px solid var(--border-subtle)",
                  }}
                >
                  <p className="text-sm font-medium mb-0.5" style={{ color: "var(--text-primary)" }}>{tone.label}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selection */}
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              Channel
            </label>
            <div className="flex gap-2">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: channel === ch.id ? "var(--gradient-hero)" : "var(--bg-tertiary)",
                    color: "white",
                  }}
                >
                  <ch.icon className="w-3.5 h-3.5" />
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedBusiness || isGenerating}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? "Generating AI Pitch..." : "Generate AI Pitch"}
          </button>

          {generateMutation.error && (
            <p className="text-xs mt-2 text-center" style={{ color: "var(--status-red)" }}>
              Error: {generateMutation.error.message}
            </p>
          )}
        </div>

        {/* Preview Panel */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Generated Pitch
            </h3>
            {aiPowered && generatedPitch && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(6, 214, 160, 0.1)", color: "var(--accent-teal)" }}>
                <Sparkles className="w-3 h-3 inline mr-1" />
                GPT-4o
              </span>
            )}
          </div>

          {generatedPitch ? (
            <>
              {/* Channel Tabs */}
              <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setChannel(ch.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all"
                    style={{
                      background: channel === ch.id ? "var(--bg-secondary)" : "transparent",
                      color: channel === ch.id ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    <ch.icon className="w-3 h-3" />
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* Pitch Content */}
              <div
                className="p-4 rounded-xl mb-4 min-h-[200px]"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
                  {generatedPitch}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span>{generateMutation.data?.wordCount ?? generatedPitch.split(/\s+/).length} words</span>
                <span>~{Math.ceil((generateMutation.data?.wordCount ?? generatedPitch.split(/\s+/).length) / 150)} min read</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                >
                  {copied ? <Check className="w-4 h-4" style={{ color: "var(--accent-teal)" }} /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm flex-1 justify-center">
                  <Send className="w-4 h-4" /> Send Outreach
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--gradient-card)" }}
              >
                <Sparkles className="w-8 h-8" style={{ color: "var(--accent-violet)" }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                No pitch generated yet
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Configure your settings and click Generate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
