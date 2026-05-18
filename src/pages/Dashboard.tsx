import { trpc } from "@/providers/trpc";
import {
  Users,
  Search,
  Send,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Activity,
  Target,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router";

function KpiCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string;
  change: string;
  changeLabel: string;
  icon: React.ElementType;
  gradient: string;
}) {
  const isPositive = change.startsWith("+");
  return (
    <div
      className="glass-card p-5 hover:shadow-lg transition-all duration-300 group"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: gradient }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: isPositive ? "rgba(6, 214, 160, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: isPositive ? "var(--accent-teal)" : "var(--status-red)",
          }}
        >
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
        {changeLabel}
      </p>
    </div>
  );
}

function ActivityItem({
  icon: Icon,
  description,
  timestamp,
  actions,
}: {
  icon: React.ElementType;
  description: string | null;
  timestamp: string;
  actions?: string[];
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0" style={{ borderColor: "var(--border-subtle)" }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "var(--gradient-card)" }}
      >
        <Icon className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        {actions && (
          <div className="flex gap-2 mt-2">
            {actions.map((a) => (
              <span
                key={a}
                className="text-[11px] px-2 py-0.5 rounded-full cursor-pointer hover:bg-white/10 transition-colors"
                style={{ background: "var(--bg-tertiary)", color: "var(--accent-cyan)" }}
              >
                {a}
              </span>
            ))}
          </div>
        )}
        <p className="text-[11px] mt-1.5" style={{ color: "var(--text-muted)" }}>
          {timestamp}
        </p>
      </div>
    </div>
  );
}

function AiInsightCard({ title, description, action }: { title: string; description: string; action: string }) {
  return (
    <div
      className="p-4 rounded-xl border-l-2 transition-all duration-200 hover:translate-x-1"
      style={{
        background: "var(--gradient-card)",
        borderLeftColor: "var(--accent-teal)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
        {title}
      </p>
      <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>
      <span
        className="text-[11px] font-medium cursor-pointer hover:underline"
        style={{ color: "var(--accent-teal)" }}
      >
        {action}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { data: dashboardData } = trpc.analytics.dashboard.useQuery();

  const stats = dashboardData?.businesses;
  const activities = dashboardData?.recentActivities ?? [];

  const kpis = [
    {
      label: "TOTAL LEADS",
      value: String(stats?.total ?? 0),
      change: "+12%",
      changeLabel: "vs last month",
      icon: Users,
      gradient: "linear-gradient(135deg, #06D6A0, #2DD4BF)",
    },
    {
      label: "AVG. PRESENCE SCORE",
      value: `${Number(stats?.avgScore ?? 0).toFixed(1)}/100`,
      change: "-2.1",
      changeLabel: "this week",
      icon: BarChart3,
      gradient: "linear-gradient(135deg, #7C5CFC, #A78BFA)",
    },
    {
      label: "OUTREACH SENT",
      value: "342",
      change: "+28",
      changeLabel: "this week",
      icon: Send,
      gradient: "linear-gradient(135deg, #2DD4BF, #06D6A0)",
    },
    {
      label: "CONVERSION RATE",
      value: "18.4%",
      change: "+3.2%",
      changeLabel: "vs last month",
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #F472B6, #FB923C)",
    },
  ];

  const activityItems = activities.slice(0, 6).map((a) => ({
    icon: a.type === "discovery" ? Search : a.type === "analysis" ? BarChart3 : a.type === "outreach" ? Send : a.type === "campaign" ? Target : Activity,
    description: a.description,
    timestamp: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit" }) : "",
    actions: a.type === "discovery" ? ["Analyze", "Generate Pitch", "Add to CRM"] : undefined,
  }));

  return (
    <div className="animate-slide-up">
      {/* Hero Greeting */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Good morning, Agent
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Your AI growth engine has discovered{" "}
              <span className="font-semibold" style={{ color: "var(--accent-teal)" }}>
                {stats?.highOpp ?? 0} new opportunities
              </span>{" "}
              this week
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "rgba(124, 92, 252, 0.1)", color: "var(--accent-violet)" }}
            >
              Professional Plan
            </span>
            <div
              className="flex items-center gap-2 text-xs px-3 py-1 rounded-full"
              style={{ background: "rgba(6, 214, 160, 0.1)", color: "var(--accent-teal)" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--accent-teal)" }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--accent-teal)" }} />
              </span>
              AI Agent Active
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-3 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Recent Activity
            </h3>
            <Link
              to="/analytics"
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: "var(--accent-cyan)" }}
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
            {activityItems.map((item, i) => (
              <ActivityItem key={i} {...item} />
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              AI Insights
            </h3>
          </div>
          <div className="space-y-3 mb-4">
            <AiInsightCard
              title="Tourism Opportunity Alert"
              description="12 tourism businesses in Victoria Falls have no booking system — High opportunity for outreach"
              action="Run Discovery"
            />
            <AiInsightCard
              title="Pipeline Bottleneck"
              description="Your CRM pipeline has 8 leads stuck in 'Proposal Sent' for 5+ days — Consider AI follow-up"
              action="View Pipeline"
            />
            <AiInsightCard
              title="New Salon Leads"
              description="AI Agent discovered 3 new salons in Harare with weak Facebook presence"
              action="View Leads"
            />
          </div>
          <Link
            to="/discovery"
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Run AI Discovery
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "New Discovery", icon: Search, to: "/discovery", bg: "var(--gradient-hero)" },
          { label: "Generate AI Pitch", icon: Sparkles, to: "/pitch", bg: "linear-gradient(135deg, #7C5CFC, #A78BFA)" },
          { label: "Launch Outreach", icon: Send, to: "/outreach", bg: "linear-gradient(135deg, #06D6A0, #2DD4BF)" },
          { label: "View CRM", icon: Users, to: "/crm", bg: "linear-gradient(135deg, #2DD4BF, #06D6A0)" },
        ].map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg"
            style={{ background: action.bg }}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
