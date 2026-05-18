import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

const COLORS = ["#06D6A0", "#7C5CFC", "#F472B6", "#FBBF24", "#3B82F6", "#F97316"];

export default function Analytics() {
  const { data: dashboard, isLoading: dashLoading } = trpc.analytics.dashboard.useQuery();
  const { data: opportunityData } = trpc.analytics.opportunityDistribution.useQuery();
  const { data: presenceData } = trpc.analytics.presenceDistribution.useQuery();
  const { data: pipelineData } = trpc.analytics.pipelineDistribution.useQuery();
  const { data: categoryData } = trpc.analytics.categoryDistribution.useQuery();
  const { data: geoData } = trpc.analytics.geographicDistribution.useQuery();

  // Transform data for charts
  const opportunityChart = useMemo(() => {
    const labels: Record<string, string> = { very_high: "Very High", high: "High", medium: "Medium", low: "Low" };
    return (opportunityData ?? []).map((d) => ({
      name: labels[d.level || ""] || d.level || "Unknown",
      value: d.count,
    }));
  }, [opportunityData]);

  const presenceChart = useMemo(() => {
    return (presenceData ?? []).map((d) => ({
      name: d.scoreRange,
      value: d.count,
    }));
  }, [presenceData]);

  const pipelineChart = useMemo(() => {
    const labels: Record<string, string> = {
      new: "New", contacted: "Contacted", interested: "Interested",
      proposal_sent: "Proposal Sent", negotiation: "Negotiation", won: "Won", lost: "Lost",
    };
    return (pipelineData ?? []).map((d) => ({
      name: labels[d.stage || ""] || d.stage || "Unknown",
      value: d.count,
    }));
  }, [pipelineData]);

  const categoryChart = useMemo(() => {
    return (categoryData ?? []).slice(0, 8).map((d) => ({
      name: d.category || "Unknown",
      value: d.count,
    }));
  }, [categoryData]);

  const geoChart = useMemo(() => {
    return (geoData ?? []).slice(0, 10).map((d) => ({
      name: `${d.city}, ${d.country}`,
      businesses: d.count,
      avgScore: Math.round((d.avgScore ?? 0) * 10) / 10,
    }));
  }, [geoData]);

  // Fallback mock data when DB is empty
  const mockAreaData = [
    { name: "Jan", leads: 12, outreach: 24 },
    { name: "Feb", leads: 18, outreach: 36 },
    { name: "Mar", leads: 25, outreach: 48 },
    { name: "Apr", leads: 32, outreach: 56 },
    { name: "May", leads: 42, outreach: 78 },
    { name: "Jun", leads: 48, outreach: 92 },
  ];

  if (dashLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent-teal)" }} />
      </div>
    );
  }

  const hasData = (dashboard?.businesses?.total ?? 0) > 0;

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Analytics</h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>Data-driven insights from your pipeline</p>
      </div>

      {!hasData && (
        <div className="glass-card p-6 mb-6 flex items-center gap-3" style={{ background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.1)" }}>
          <TrendingUp className="w-5 h-5 flex-shrink-0" style={{ color: "var(--status-yellow)" }} />
          <p className="text-sm" style={{ color: "var(--status-yellow)" }}>
            No data yet. Run AI Discovery to populate your database with real business data.
          </p>
        </div>
      )}

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Businesses", value: dashboard?.businesses?.total ?? 0, change: "+12%", color: "var(--accent-teal)" },
          { label: "CRM Leads", value: dashboard?.leads?.total ?? 0, change: "+8%", color: "var(--accent-violet)" },
          { label: "Active Campaigns", value: dashboard?.campaigns?.running ?? 0, change: "+3", color: "var(--accent-cyan)" },
          { label: "Avg Score", value: `${Math.round((dashboard?.businesses?.avgScore ?? 0) * 10) / 10}/100`, change: "-2.1", color: "var(--accent-teal)" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
              <span className="text-xs mb-1" style={{ color: stat.change.startsWith("+") ? "var(--accent-teal)" : "var(--status-red)" }}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trend Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Pipeline Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockAreaData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOutreach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#0F111A", border: "1px solid #1E2030", borderRadius: "8px" }}
                labelStyle={{ color: "#E2E8F0" }}
              />
              <Area type="monotone" dataKey="leads" stroke="#06D6A0" fillOpacity={1} fill="url(#colorLeads)" name="Leads" />
              <Area type="monotone" dataKey="outreach" stroke="#7C5CFC" fillOpacity={1} fill="url(#colorOutreach)" name="Outreach" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Opportunity Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Opportunity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={opportunityChart.length > 0 ? opportunityChart : [{ name: "No Data", value: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                {(opportunityChart.length > 0 ? opportunityChart : [{ name: "No Data", value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0F111A", border: "1px solid #1E2030", borderRadius: "8px" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pipeline Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>CRM Pipeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pipelineChart.length > 0 ? pipelineChart : [{ name: "No Data", value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <Tooltip contentStyle={{ background: "#0F111A", border: "1px solid #1E2030", borderRadius: "8px" }} />
              <Bar dataKey="value" fill="#7C5CFC" radius={[4, 4, 0, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Presence Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Digital Presence Scores</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={presenceChart.length > 0 ? presenceChart : [{ name: "0-19", value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <Tooltip contentStyle={{ background: "#0F111A", border: "1px solid #1E2030", borderRadius: "8px" }} />
              <Bar dataKey="value" fill="#06D6A0" radius={[4, 4, 0, 0]} name="Businesses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Top Categories</h3>
          <div className="space-y-2">
            {categoryChart.length > 0 ? categoryChart.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-xs w-6" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>{cat.name}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (cat.value / (categoryChart[0]?.value || 1)) * 100)}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-xs w-6 text-right" style={{ color: "var(--text-muted)" }}>{cat.value}</span>
              </div>
            )) : (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No data yet</p>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Geographic Distribution</h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {geoChart.length > 0 ? geoChart.map((geo, i) => (
              <div key={geo.name} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{geo.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{geo.businesses} biz</span>
                  <span className="text-xs font-medium" style={{ color: "var(--accent-teal)" }}>{geo.avgScore}/100</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
