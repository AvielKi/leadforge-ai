import { useState } from "react";
import {
  Plus, MoreHorizontal, Phone, Mail, MessageCircle,
  TrendingUp, Filter, Loader2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useCrmLeadsFallback } from "@/lib/useMockFallback";

const stages = [
  { id: "new", label: "New", color: "#7C5CFC" },
  { id: "contacted", label: "Contacted", color: "#3B82F6" },
  { id: "interested", label: "Interested", color: "#06D6A0" },
  { id: "proposal_sent", label: "Proposal Sent", color: "#F59E0B" },
  { id: "negotiation", label: "Negotiation", color: "#F97316" },
  { id: "won", label: "Won", color: "#10B981" },
  { id: "lost", label: "Lost", color: "#EF4444" },
];

function StageCard({ stage, leads, onMove }: {
  stage: typeof stages[0];
  leads: Array<{
    id: number;
    name: string;
    contactName?: string | null;
    estimatedValue?: string | null;
    tags?: unknown;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    buyingIntent?: "low" | "medium" | "high" | null;
  }>;
  onMove: (leadId: number, newStage: string) => void;
}) {
  return (
    <div className="min-w-[280px] sm:min-w-[260px] flex-1">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{stage.label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>{leads.length}</span>
        </div>
        <button className="p-1 rounded hover:bg-white/5"><MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
      </div>
      <div className="space-y-2">
        {leads.map((lead) => (
          <div key={lead.id} className="p-3 rounded-xl transition-all hover:translate-y-[-1px]" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{lead.name}</p>
                {lead.contactName && <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{lead.contactName}</p>}
              </div>
              <div className="flex items-center gap-1">
                {lead.whatsapp && <MessageCircle className="w-3 h-3" style={{ color: "var(--accent-teal)" }} />}
                {lead.email && <Mail className="w-3 h-3" style={{ color: "var(--text-muted)" }} />}
                {lead.phone && <Phone className="w-3 h-3" style={{ color: "var(--text-muted)" }} />}
              </div>
            </div>
            {lead.estimatedValue && (
              <div className="flex items-center gap-1 mb-2">
                <TrendingUp className="w-3 h-3" style={{ color: "var(--accent-teal)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--accent-teal)" }}>${lead.estimatedValue}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1 mb-2">
              {(() => {
                try {
                  const tags = Array.isArray(lead.tags) ? lead.tags : typeof lead.tags === "string" ? JSON.parse(lead.tags) : [];
                  return tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>{tag}</span>
                  ));
                } catch {
                  return null;
                }
              })()}
            </div>
            <select
              value={stage.id}
              onChange={(e) => onMove(lead.id, e.target.value)}
              className="w-full text-[10px] px-2 py-1 rounded-lg outline-none cursor-pointer mt-1"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            {lead.buyingIntent && (
              <div className="mt-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  lead.buyingIntent === "high" ? "bg-emerald-500/10 text-emerald-400" :
                  lead.buyingIntent === "medium" ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {lead.buyingIntent} intent
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CRM() {
  const [selectedStage, setSelectedStage] = useState("");

  const utils = trpc.useUtils();

  const { data: leadData, isLoading } = trpc.crm.leadList.useQuery({ limit: 200 });
  const { data: pipelineStats } = trpc.crm.pipelineStats.useQuery();

  const moveStage = trpc.crm.moveStage.useMutation({
    onSuccess: () => {
      utils.crm.leadList.invalidate();
      utils.crm.pipelineStats.invalidate();
    },
  });

  const leads = useCrmLeadsFallback(leadData?.items);

  const handleMoveStage = (leadId: number, newStage: string) => {
    moveStage.mutate({ id: leadId, stage: newStage as "new" | "contacted" | "interested" | "proposal_sent" | "negotiation" | "won" | "lost" });
  };

  const stageColumns = stages.map((stage) => ({
    ...stage,
    leads: leads.filter((l) => l.stage === stage.id),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent-teal)" }} />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>CRM Pipeline</h1>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>Manage leads through your sales funnel</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
              <Filter className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm touch-target">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Lead</span><span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {stages.map((stage) => {
          const count = pipelineStats?.find((s) => s.stage === stage.id)?.count ?? stageColumns.find(s => s.id === stage.id)?.leads.length ?? 0;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(selectedStage === stage.id ? "" : stage.id)}
              className="p-3 rounded-xl text-center transition-all hover:brightness-110"
              style={{
                background: selectedStage === stage.id ? stage.color : "var(--bg-secondary)",
                color: selectedStage === stage.id ? "white" : stage.color,
                border: `1px solid ${selectedStage === stage.id ? stage.color : "var(--border-subtle)"}`,
              }}
            >
              <p className="text-lg font-bold">{count}</p>
              <p className="text-[10px] uppercase tracking-wider">{stage.label}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stageColumns.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            leads={stage.leads}
            onMove={handleMoveStage}
          />
        ))}
      </div>
    </div>
  );
}
