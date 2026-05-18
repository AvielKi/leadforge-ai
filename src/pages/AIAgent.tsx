import { useState } from "react";
import {
  Bot, Sparkles, Loader2, Search, Send,
  BarChart3, MessageCircle, Check,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useInsightsFallback } from "@/lib/useMockFallback";

export default function AIAgent() {
  const [agentConfig, setAgentConfig] = useState({
    autoDiscover: true,
    autoAnalyze: true,
    autoPitch: false,
    autoSchedule: false,
    autoCRM: true,
    targetRegions: ["Zimbabwe", "South Africa", "Botswana"],
    targetCategories: ["Lodges", "Hotels", "Restaurants", "Safari"],
    minOpportunity: "high",
  });

  const utils = trpc.useUtils();

  const { data: status, isLoading: statusLoading } = trpc.agent.status.useQuery();
  const { data: rawInsights, isLoading: insightsLoading } = trpc.agent.insights.useQuery();
  const insights = useInsightsFallback(rawInsights as typeof import("@/lib/mockData").mockAgentInsights | undefined);
  const { data: logs } = trpc.agent.logs.useQuery();

  const triggerMutation = trpc.agent.trigger.useMutation({
    onSuccess: () => {
      utils.agent.logs.invalidate();
      utils.agent.status.invalidate();
    },
  });

  const discoveryMutation = trpc.agent.runDiscovery.useMutation({
    onSuccess: () => {
      utils.agent.logs.invalidate();
      utils.agent.status.invalidate();
      utils.business.search.invalidate();
      utils.analytics.dashboard.invalidate();
    },
  });

  const configureMutation = trpc.agent.configure.useMutation();

  const handleTrigger = (action: string) => {
    triggerMutation.mutate({ action });
  };

  const handleDiscovery = () => {
    discoveryMutation.mutate({
      query: "lodges in Victoria Falls Zimbabwe",
      maxResults: 10,
    });
  };

  const statusWithFallback = status && (status.totalBusinesses ?? 0) > 0 ? status : {
    isActive: true, currentTask: "discovering leads", lastRun: new Date(Date.now() - 3600000).toISOString(),
    discoveriesToday: 5, analysesToday: 3, pitchesGenerated: 2, campaignsScheduled: 1, followUpsSent: 4,
    totalBusinesses: 12, highOpportunity: 8, totalLeads: 8, wonLeads: 1, stuckLeads: 2, aiPowered: false,
  };

  const isRunning = triggerMutation.isPending || discoveryMutation.isPending;

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>AI Agent</h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>Autonomous lead discovery, analysis, and outreach</p>
      </div>

      {/* Status Card */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>LeadForge AI Agent</h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--accent-teal)" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--accent-teal)" }} />
                </span>
                <span className="text-xs" style={{ color: "var(--accent-teal)" }}>Active</span>
                {statusWithFallback?.aiPowered && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(6, 214, 160, 0.1)", color: "var(--accent-teal)" }}>
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    GPT-4o Powered
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDiscovery}
              disabled={isRunning}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
            >
              {discoveryMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {discoveryMutation.isPending ? "Discovering..." : "Run Discovery"}
            </button>
          </div>
        </div>

        {discoveryMutation.data && (
          <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: "rgba(6, 214, 160, 0.05)", border: "1px solid rgba(6, 214, 160, 0.1)" }}>
            {discoveryMutation.data.discovered > 0 ? (
              <span style={{ color: "var(--accent-teal)" }}>
                <Check className="w-3 h-3 inline mr-1" />
                Discovered {discoveryMutation.data.discovered} businesses, AI-analyzed {discoveryMutation.data.analyzed}
                {discoveryMutation.data.aiPowered ? " (GPT-4o)" : " (fallback mode — add OPENAI_API_KEY for AI)"}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>
                {discoveryMutation.data.message || "Discovery complete. No new businesses found."}
                {!discoveryMutation.data.aiPowered && " Add GOOGLE_PLACES_API_KEY + OPENAI_API_KEY to discover real businesses with AI analysis."}
              </span>
            )}
          </div>
        )}

        {statusLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--accent-teal)" }} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Discoveries Today", value: statusWithFallback?.discoveriesToday ?? 0, icon: Search },
              { label: "Analyses Today", value: statusWithFallback?.analysesToday ?? 0, icon: BarChart3 },
              { label: "Pitches Generated", value: statusWithFallback?.pitchesGenerated ?? 0, icon: Sparkles },
              { label: "Campaigns", value: statusWithFallback?.campaignsScheduled ?? 0, icon: Send },
              { label: "Follow-ups", value: statusWithFallback?.followUpsSent ?? 0, icon: MessageCircle },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl text-center" style={{ background: "var(--bg-secondary)" }}>
                <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--accent-teal)" }} />
                <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Agent Configuration</h3>
          <div className="space-y-4">
            {[
              { key: "autoDiscover", label: "Auto-Discover", desc: "Automatically find new businesses via Google Places" },
              { key: "autoAnalyze", label: "Auto-Analyze", desc: "Run AI analysis on discovered businesses" },
              { key: "autoPitch", label: "Auto-Generate Pitches", desc: "Create AI pitches for high-opportunity businesses" },
              { key: "autoSchedule", label: "Auto-Schedule Outreach", desc: "Queue outreach campaigns automatically" },
              { key: "autoCRM", label: "Auto-CRM Updates", desc: "Move leads through pipeline based on responses" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => {
                    const newConfig = { ...agentConfig, [item.key]: !agentConfig[item.key as keyof typeof agentConfig] };
                    setAgentConfig(newConfig);
                    configureMutation.mutate(newConfig);
                  }}
                  className="w-11 h-6 rounded-full transition-all relative"
                  style={{
                    background: agentConfig[item.key as keyof typeof agentConfig] ? "var(--gradient-hero)" : "var(--bg-tertiary)",
                  }}
                >
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{
                    left: agentConfig[item.key as keyof typeof agentConfig] ? "22px" : "2px",
                  }} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h4>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Discovery", action: "discovery", icon: Search },
                { label: "Analysis", action: "analysis", icon: BarChart3 },
                { label: "Pitch Gen", action: "pitch", icon: Sparkles },
                { label: "Campaign", action: "campaign", icon: Send },
                { label: "Follow-up", action: "follow_up", icon: MessageCircle },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleTrigger(btn.action)}
                  disabled={triggerMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                >
                  <btn.icon className="w-3.5 h-3.5" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>AI Insights</h3>
          {insightsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--accent-teal)" }} />
            </div>
          ) : (
            <div className="space-y-3">
              {insights && insights.length > 0 ? insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 rounded-xl border-l-2 transition-all hover:translate-x-1"
                  style={{
                    background: "var(--gradient-card)",
                    borderLeftColor: insight.priority === "high" ? "var(--accent-teal)" : insight.priority === "medium" ? "var(--accent-violet)" : "var(--text-muted)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                      background: insight.type === "alert" ? "rgba(239, 68, 68, 0.1)" : insight.type === "recommendation" ? "rgba(6, 214, 160, 0.1)" : "rgba(124, 92, 252, 0.1)",
                      color: insight.type === "alert" ? "var(--status-red)" : insight.type === "recommendation" ? "var(--accent-teal)" : "var(--accent-violet)",
                    }}>
                      {insight.type}
                    </span>
                    {insight.priority === "high" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--status-red)" }}>HIGH</span>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>{insight.title}</p>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>{insight.description}</p>
                  <button className="text-[11px] font-medium hover:underline" style={{ color: "var(--accent-teal)" }}>{insight.action}</button>
                </div>
              )) : (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No insights yet. Run discovery to generate AI insights.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activity Logs */}
      {logs && logs.length > 0 && (
        <div className="glass-card p-6 mt-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Agent Logs</h3>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                  background: log.status === "completed" ? "var(--accent-teal)" : log.status === "failed" ? "var(--status-red)" : "var(--accent-violet)",
                }} />
                <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>{log.action}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                  background: log.status === "completed" ? "rgba(6, 214, 160, 0.1)" : log.status === "failed" ? "rgba(239, 68, 68, 0.1)" : "rgba(124, 92, 252, 0.1)",
                  color: log.status === "completed" ? "var(--accent-teal)" : log.status === "failed" ? "var(--status-red)" : "var(--accent-violet)",
                }}>{log.status}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {log.startedAt ? new Date(log.startedAt).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
