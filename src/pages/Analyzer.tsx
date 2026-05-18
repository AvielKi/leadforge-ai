import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Globe, Smartphone, Search as SearchIcon, Palette,
  Share2, Facebook, Megaphone, Eye, MessageCircle, MapPin,
  AlertTriangle, Sparkles, Copy, Send, Loader2, AlertCircle,
  BarChart3,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

function OverallScoreRing({ score }: { score: number }) {
  const size = 180;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "var(--score-excellent)" : score >= 60 ? "var(--score-good)" : score >= 40 ? "var(--score-average)" : score >= 20 ? "var(--score-weak)" : "var(--score-poor)";
  const category = score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : score >= 40 ? "AVERAGE" : score >= 20 ? "WEAK" : "POOR";

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOffset(offset), 100);
    return () => clearTimeout(timer);
  }, [offset]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C5CFC" />
              <stop offset="100%" stopColor="#06D6A0" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1E2030" strokeWidth="8" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={animatedOffset}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold" style={{ color }}>{score}</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>/100</span>
        </div>
      </div>
      <span className="text-lg font-bold px-4 py-1 rounded-full" style={{ background: `${color}15`, color }}>
        {category}
      </span>
    </div>
  );
}

function ScoreBar({ label, score, icon: Icon, description }: { label: string; score: number; icon: React.ElementType; description: string }) {
  const color = score >= 80 ? "var(--score-excellent)" : score >= 60 ? "var(--score-good)" : score >= 40 ? "var(--score-average)" : score >= 20 ? "var(--score-weak)" : "var(--score-poor)";

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
        <span className="ml-auto text-lg font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "var(--bg-tertiary)" }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: color }} />
      </div>
      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{description}</p>
    </div>
  );
}

export default function Analyzer() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("business");
  const [analyzing, setAnalyzing] = useState(false);

  const utils = trpc.useUtils();

  // Fetch business with analysis
  const { data: business, isLoading } = trpc.business.getById.useQuery(
    { id: Number(businessId) || 0 },
    { enabled: !!businessId }
  );

  // Run analysis mutation
  const runAnalysis = trpc.business.runAnalysis.useMutation({
    onSuccess: () => {
      utils.business.getById.invalidate({ id: Number(businessId) });
    },
  });

  const analysis = business?.analysis;

  const handleAnalyze = async () => {
    if (!businessId) return;
    setAnalyzing(true);
    try {
      await runAnalysis.mutateAsync({ businessId: Number(businessId) });
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto-run analysis if business has no analysis yet
  useEffect(() => {
    if (business && !analysis && !analyzing && !runAnalysis.isPending && businessId) {
      handleAnalyze();
    }
  }, [business, analysis]);

  // Parse detected issues
  const detectedIssues: string[] = analysis?.detectedIssues
    ? (() => {
        try {
          const parsed = JSON.parse(analysis.detectedIssues as string);
          return Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
          return typeof analysis.detectedIssues === "string"
            ? analysis.detectedIssues.split(",").map((s: string) => s.trim())
            : [];
        }
      })()
    : [];

  const tones = [
    { id: "friendly", label: "Friendly", desc: "Warm & conversational" },
    { id: "professional", label: "Professional", desc: "Polished & business-focused" },
    { id: "luxury", label: "Luxury Tourism", desc: "Elegant & aspirational" },
    { id: "corporate", label: "Corporate", desc: "Formal & data-driven" },
    { id: "aggressive", label: "Aggressive", desc: "Urgency & social proof" },
    { id: "casual", label: "Casual", desc: "Relaxed & personal" },
  ];
  const [selectedTone, setSelectedTone] = useState("friendly");

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          AI Digital Presence Analyzer
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
          AI-powered analysis via GPT-4o + Google Lighthouse
        </p>
      </div>

      {!businessId && (
        <div className="glass-card p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>Select a business to analyze</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Go to Discovery and click "Analyze" on any business</p>
        </div>
      )}

      {isLoading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: "var(--accent-teal)" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading business data...</p>
        </div>
      )}

      {(analyzing || runAnalysis.isPending) && (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-pulse-glow flex items-center justify-center mb-4" style={{ background: "rgba(6, 214, 160, 0.1)" }}>
            <Sparkles className="w-8 h-8 animate-spin" style={{ color: "var(--accent-teal)" }} />
          </div>
          <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>AI is analyzing digital presence...</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {runAnalysis.data?.aiPowered
              ? "GPT-4o is analyzing website, social media, SEO, and branding"
              : "Analyzing digital signals (Add OPENAI_API_KEY for GPT-4o analysis)"}
          </p>
        </div>
      )}

      {/* AI Status Banner */}
      {analysis && runAnalysis.data && !runAnalysis.data.aiPowered && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-xs" style={{ background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.1)" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--status-yellow)" }} />
          <span style={{ color: "var(--status-yellow)" }}>
            Running in fallback mode. Add OPENAI_API_KEY to your .env file for GPT-4o powered analysis.
          </span>
        </div>
      )}

      {/* Analysis Results */}
      {business && analysis && !analyzing && !runAnalysis.isPending && (
        <div>
          {/* Business Header */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{business.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                    {business.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <MapPin className="w-3 h-3" /> {business.city}, {business.country}
                  </span>
                  {runAnalysis.data?.aiPowered && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(6, 214, 160, 0.1)", color: "var(--accent-teal)" }}>
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      GPT-4o
                    </span>
                  )}
                </div>
              </div>
              <OverallScoreRing score={analysis.overallScore ?? 0} />
            </div>
            <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {analysis.aiSummary}
            </p>
          </div>

          {/* Score Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <ScoreBar label="Website Quality" score={analysis.websiteScore ?? 0} icon={Globe} description={analysis.websiteScore === 0 ? "No website detected" : "Basic website present"} />
            <ScoreBar label="Mobile Responsiveness" score={analysis.mobileScore ?? 0} icon={Smartphone} description={analysis.mobileScore === 0 ? "No website to test" : "Needs improvement"} />
            <ScoreBar label="SEO Score" score={analysis.seoScore ?? 0} icon={SearchIcon} description="No meta tags, no structured data" />
            <ScoreBar label="Branding Score" score={analysis.brandingScore ?? 0} icon={Palette} description="Basic Facebook cover, no brand consistency" />
            <ScoreBar label="Social Media Activity" score={analysis.socialScore ?? 0} icon={Share2} description="Last post 3 months ago" />
            <ScoreBar label="Facebook Quality" score={analysis.facebookScore ?? 0} icon={Facebook} description="Weak engagement, no reviews response" />
            <ScoreBar label="Ad Quality Estimate" score={analysis.adScore ?? 0} icon={Megaphone} description="No active ads detected" />
            <ScoreBar label="Online Visibility" score={analysis.visibilityScore ?? 0} icon={Eye} description="Not listed on TripAdvisor, weak Google presence" />
            <ScoreBar label="WhatsApp Automation" score={analysis.whatsappScore ?? 0} icon={MessageCircle} description="No WhatsApp business API detected" />
          </div>

          {/* Detected Issues */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <AlertTriangle className="w-4 h-4" style={{ color: "var(--status-red)" }} />
              AI Detected Issues
            </h3>
            <div className="space-y-3">
              {detectedIssues.map((issue: string, i: number) => (
                <div key={i} className="flex items-start gap-3 py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                    <AlertTriangle className="w-3 h-3" style={{ color: "var(--status-red)" }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{issue}</p>
                    <span className="text-[11px] cursor-pointer hover:underline" style={{ color: "var(--accent-teal)" }}>
                      How to fix
                    </span>
                  </div>
                </div>
              ))}
              {detectedIssues.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No specific issues detected.</p>
              )}
            </div>
          </div>

          {/* AI Generated Pitch */}
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
              AI-Generated Pitch Preview
            </h3>

            {/* Tone Selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {tones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selectedTone === tone.id ? "var(--gradient-hero)" : "var(--bg-tertiary)",
                    color: "white",
                  }}
                >
                  {tone.label}
                </button>
              ))}
            </div>

            <div
              className="p-4 rounded-xl mb-4"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
                {analysis.generatedPitch || "No pitch generated yet. Generate a pitch from the Pitch Generator page."}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                <Copy className="w-4 h-4" /> Copy Pitch
              </button>
              <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                <Send className="w-4 h-4" /> Send Outreach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
