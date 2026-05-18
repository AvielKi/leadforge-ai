import { useState } from "react";
import {
  Send, MessageCircle, Mail, Facebook, Plus, Play, Pause,
  CheckCircle, Loader2, AlertCircle, Sparkles,
  TrendingUp, Zap,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useCampaignsFallback, useTemplatesFallback } from "@/lib/useMockFallback";

const channelIcons: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  email: Mail,
  facebook: Facebook,
  telegram: Send,
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "rgba(124, 92, 252, 0.1)", text: "#7C5CFC", label: "Draft" },
  scheduled: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6", label: "Scheduled" },
  running: { bg: "rgba(6, 214, 160, 0.1)", text: "#06D6A0", label: "Running" },
  paused: { bg: "rgba(251, 191, 36, 0.1)", text: "#FBBF24", label: "Paused" },
  completed: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981", label: "Completed" },
};

export default function Outreach() {
  const [showNewCampaign, setShowNewCampaign] = useState(false);

  const utils = trpc.useUtils();

  const { data: campaignData, isLoading } = trpc.outreach.campaignList.useQuery({ limit: 50 });
  const campaigns = useCampaignsFallback(campaignData?.items);

  const { data: templateData } = trpc.outreach.templateList.useQuery();
  const templates = useTemplatesFallback(templateData ?? []);

  const { data: serviceHealth } = trpc.outreach.serviceHealth.useQuery();

  const updateStatus = trpc.outreach.updateCampaignStatus.useMutation({
    onSuccess: () => utils.outreach.campaignList.invalidate(),
  });

  // Stats from campaigns
  const totalSent = campaigns.reduce((sum, c) => {
    const stats = c.stats ? (typeof c.stats === "string" ? JSON.parse(c.stats) : c.stats) : {};
    return sum + (stats?.sent ?? 0);
  }, 0);
  const totalDelivered = campaigns.reduce((sum, c) => {
    const stats = c.stats ? (typeof c.stats === "string" ? JSON.parse(c.stats) : c.stats) : {};
    return sum + (stats?.delivered ?? 0);
  }, 0);
  const totalReplied = campaigns.reduce((sum, c) => {
    const stats = c.stats ? (typeof c.stats === "string" ? JSON.parse(c.stats) : c.stats) : {};
    return sum + (stats?.replied ?? 0);
  }, 0);

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Outreach Center</h1>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>Manage campaigns, templates, and messaging</p>
          </div>
          <button
            onClick={() => setShowNewCampaign(!showNewCampaign)}
            className="btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm touch-target w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Campaign</span><span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Service Health */}
      {serviceHealth && (
        <div className="flex gap-2 mb-4 flex-wrap mobile-scroll pb-1">
          {[
            { name: "OpenAI", active: serviceHealth.openai, icon: Sparkles },
            { name: "Twilio WhatsApp", active: serviceHealth.twilio, icon: MessageCircle },
            { name: "SendGrid Email", active: serviceHealth.sendgrid, icon: Mail },
          ].map((svc) => (
            <div key={svc.name} className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full whitespace-nowrap shrink-0" style={{
              background: svc.active ? "rgba(6, 214, 160, 0.05)" : "rgba(239, 68, 68, 0.05)",
              border: `1px solid ${svc.active ? "rgba(6, 214, 160, 0.1)" : "rgba(239, 68, 68, 0.1)"}`,
            }}>
              <svc.icon className="w-3 h-3" style={{ color: svc.active ? "var(--accent-teal)" : "var(--status-red)" }} />
              <span style={{ color: svc.active ? "var(--accent-teal)" : "var(--status-red)" }}>
                {svc.name} {svc.active ? "Active" : "Off"}
              </span>
            </div>
          ))}
          {!serviceHealth.allConfigured && (
            <div className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full whitespace-nowrap shrink-0" style={{ background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.1)" }}>
              <AlertCircle className="w-3 h-3" style={{ color: "var(--status-yellow)" }} />
              <span style={{ color: "var(--status-yellow)" }}>
                Add API keys for full functionality
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Messages Sent</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{totalSent}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-violet)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Delivered</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{totalDelivered}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: "var(--accent-cyan)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Response Rate</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {totalDelivered > 0 ? Math.round((totalReplied / totalDelivered) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Campaigns */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Campaigns</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent-teal)" }} />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Send className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No campaigns yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Create your first outreach campaign</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => {
              const ChannelIcon = channelIcons[campaign.channel || "whatsapp"] || Send;
              const status = statusColors[campaign.status || "draft"] || statusColors.draft;
              const stats = campaign.stats ? (typeof campaign.stats === "string" ? JSON.parse(campaign.stats) : campaign.stats) : {};

              return (
                <div key={campaign.id} className="glass-card p-4 hover:shadow-lg transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gradient-card)" }}>
                        <ChannelIcon className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{campaign.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: status.bg, color: status.text }}>{status.label}</span>
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{campaign.channel}</span>
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{campaign.service}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {campaign.status === "running" && (
                        <button
                          onClick={() => updateStatus.mutate({ id: campaign.id, status: "paused" })}
                          className="p-1.5 rounded-lg hover:bg-white/5"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                        </button>
                      )}
                      {campaign.status === "paused" && (
                        <button
                          onClick={() => updateStatus.mutate({ id: campaign.id, status: "running" })}
                          className="p-1.5 rounded-lg hover:bg-white/5"
                          title="Resume"
                        >
                          <Play className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
                        </button>
                      )}
                      {campaign.status === "draft" && (
                        <button
                          onClick={() => updateStatus.mutate({ id: campaign.id, status: "running" })}
                          className="btn-primary flex items-center gap-1 px-3 py-1 text-[11px]"
                        >
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Stats bar */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}><span className="font-medium" style={{ color: "var(--text-primary)" }}>{stats.sent ?? 0}</span> sent</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}><span className="font-medium" style={{ color: "var(--text-primary)" }}>{stats.delivered ?? 0}</span> delivered</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}><span className="font-medium" style={{ color: "var(--text-primary)" }}>{stats.opened ?? 0}</span> opened</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}><span className="font-medium" style={{ color: "var(--accent-teal)" }}>{stats.replied ?? 0}</span> replied</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}><span className="font-medium" style={{ color: "var(--accent-violet)" }}>{stats.converted ?? 0}</span> converted</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Templates</h2>
        {templates.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No templates yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((template) => {
              const ChannelIcon = channelIcons[template.channel || "whatsapp"] || Send;
              return (
                <div key={template.id} className="glass-card p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <ChannelIcon className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{template.name}</p>
                  </div>
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: "var(--text-secondary)" }}>{template.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{template.usageCount ?? 0} uses</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>{template.tone}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
