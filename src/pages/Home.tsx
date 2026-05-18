import { useMemo } from "react";
import { Link } from "react-router";
import {
  Bot, Users, Search, Send, TrendingUp, Sparkles, ArrowRight,
  Activity, BarChart3, Loader2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useStatsFallback, useActivitiesFallback, useInsightsFallback } from "@/lib/useMockFallback";

function KpiCard({ label, value, change, changeLabel, icon: Icon, gradient }: {
  label: string; value: string; change: string; changeLabel: string;
  icon: React.ElementType; gradient: string;
}) {
  const isPositive = change.startsWith("+");
  return (
    <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: gradient }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
          background: isPositive ? "rgba(6, 214, 160, 0.1)" : "rgba(239, 68, 68, 0.1)",
          color: isPositive ? "var(--accent-teal)" : "var(--status-red)",
        }}>{change}</span>
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{changeLabel}</p>
    </div>
  );
}

function AiInsightCard({ title, description, action }: { title: string; description: string; action: string }) {
  return (
    <div className="p-4 rounded-xl border-l-2 transition-all duration-200 hover:translate-x-1"
      style={{ background: "var(--gradient-card)", borderLeftColor: "var(--accent-teal)", borderColor: "var(--border-subtle)" }}>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>{title}</p>
      <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>{description}</p>
      <span className="text-[11px] font-medium cursor-pointer hover:underline" style={{ color: "var(--accent-teal)" }}>{action}</span>
    </div>
  );
}

export default function Home() {
  const { data: stats, isLoading: statsLoading } = trpc.business.getStats.useQuery();
  const { data: analytics } = trpc.analytics.dashboard.useQuery();
  const { data: rawInsights, isLoading: insightsLoading } = trpc.agent.insights.useQuery();
  const aiInsights = useInsightsFallback(rawInsights as typeof import("@/lib/mockData").mockAgentInsights | undefined);

  const realStats = useStatsFallback(stats);
  const highOpp = realStats.highOpportunity;
  const total = realStats.total;
  const avgScore = Math.round((realStats.avgScore ?? 37.8) * 10) / 10;
  const kpis = useMemo(() => [
    { label: "TOTAL LEADS", value: String(total), change: "+12%", changeLabel: "vs last month", icon: Users, gradient: "linear-gradient(135deg, #06D6A0, #2DD4BF)" },
    { label: "AVG. PRESENCE SCORE", value: `${avgScore}/100`, change: "-2.1", changeLabel: "this week", icon: BarChart3, gradient: "linear-gradient(135deg, #7C5CFC, #A78BFA)" },
    { label: "OUTREACH SENT", value: String(analytics?.campaigns?.total ?? 342), change: "+28", changeLabel: "this week", icon: Send, gradient: "linear-gradient(135deg, #2DD4BF, #06D6A0)" },
    { label: "CONVERSION RATE", value: "18.4%", change: "+3.2%", changeLabel: "vs last month", icon: TrendingUp, gradient: "linear-gradient(135deg, #F472B6, #FB923C)" },
  ], [total, avgScore, analytics]);

  const recentActivities = useActivitiesFallback(analytics?.recentActivities as typeof import("@/lib/mockData").mockActivities | undefined);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent-teal)" }} />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Good morning, Agent</h1>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
              Your AI growth engine has discovered <span className="font-semibold" style={{ color: "var(--accent-teal)" }}>{highOpp} new opportunities</span> this week
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "rgba(124, 92, 252, 0.1)", color: "var(--accent-violet)" }}>Professional Plan</span>
            <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full" style={{ background: "rgba(6, 214, 160, 0.1)", color: "var(--accent-teal)" }}>
              <Bot className="w-3.5 h-3.5" />
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--accent-teal)" }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--accent-teal)" }} />
              </span>
              <span>AI Agent Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent Activity</h3>
            <Link to="/analytics" className="text-xs flex items-center gap-1 hover:underline" style={{ color: "var(--accent-cyan)" }}>View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No recent activity. Run AI discovery to get started.</p>
              </div>
            ) : (
              recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b last:border-b-0" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "var(--gradient-card)" }}>
                    <Activity className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{a.description}</p>
                    {a.type === "discovery" && (
                      <div className="flex gap-2 mt-2">
                        {["Analyze", "Generate Pitch", "Add to CRM"].map(tag => (
                          <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full cursor-pointer hover:bg-white/10 transition-colors" style={{ background: "var(--bg-tertiary)", color: "var(--accent-cyan)" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] mt-1.5" style={{ color: "var(--text-muted)" }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Recently"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>AI Insights</h3>
            {insightsLoading && <Loader2 className="w-3 h-3 animate-spin" style={{ color: "var(--text-muted)" }} />}
          </div>
          <div className="space-y-3 mb-4">
            {aiInsights && aiInsights.length > 0 ? (
              aiInsights.map((insight) => (
                <AiInsightCard
                  key={insight.id}
                  title={insight.title}
                  description={insight.description}
                  action={insight.action}
                />
              ))
            ) : (
              <>
                <AiInsightCard title="Tourism Opportunity Alert" description="12 tourism businesses in Victoria Falls have no booking system — High opportunity for outreach" action="Run Discovery" />
                <AiInsightCard title="Pipeline Bottleneck" description="Your CRM pipeline has leads that need follow-up. AI recommends automated outreach." action="View Pipeline" />
                <AiInsightCard title="Database Building" description={`You have ${total} businesses. Run discovery to find more high-opportunity leads.`} action="View Leads" />
              </>
            )}
          </div>
          <Link to="/discovery" className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" /> Run AI Discovery
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
        {[
          { label: "New Discovery", icon: Search, to: "/discovery", bg: "var(--gradient-hero)" },
          { label: "Generate AI Pitch", icon: Sparkles, to: "/pitch", bg: "linear-gradient(135deg, #7C5CFC, #A78BFA)" },
          { label: "Launch Outreach", icon: Send, to: "/outreach", bg: "linear-gradient(135deg, #06D6A0, #2DD4BF)" },
          { label: "View CRM", icon: Users, to: "/crm", bg: "linear-gradient(135deg, #2DD4BF, #06D6A0)" },
        ].map((action) => (
          <Link key={action.label} to={action.to} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg touch-target" style={{ background: action.bg }}>
            <action.icon className="w-4 h-4" /> <span className="hidden sm:inline">{action.label}</span><span className="sm:hidden">{action.label.split(" ").slice(0, 2).join(" ")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
