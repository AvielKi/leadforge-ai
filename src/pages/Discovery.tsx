import { useState } from "react";
import { Link } from "react-router";
import {
  Search, MapPin, Phone, Mail, MessageCircle, Globe, Star,
  BarChart3, Sparkles, Users, List, Grid3X3, Loader2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useBusinessFallback } from "@/lib/useMockFallback";
import { discoverBusinessesClientSide } from "@/lib/googlePlacesClient";

const categories = ["All", "Lodges", "Hotels", "Restaurants", "Salons", "Safari", "Houseboats", "Tours"];
const countries = ["All", "Zimbabwe", "South Africa", "Botswana", "Namibia"];
const opportunityLevels = ["All", "very_high", "high", "medium", "low"];

function OpportunityBadge({ level }: { level: string | null }) {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    very_high: { bg: "rgba(6, 214, 160, 0.1)", text: "#06D6A0", label: "Very High" },
    high: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6", label: "High" },
    medium: { bg: "rgba(251, 191, 36, 0.1)", text: "#FBBF24", label: "Medium" },
    low: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316", label: "Low" },
  };
  const c = colors[level || "medium"] ?? colors.medium;
  return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: c.bg, color: c.text }}>{c.label}</span>;
}

function ScoreRing({ score }: { score: number | null }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((score ?? 0) / 100) * circumference;
  const color = score && score >= 60 ? "var(--score-good)" : score && score >= 40 ? "var(--score-average)" : score && score >= 20 ? "var(--score-weak)" : "var(--score-poor)";
  return (
    <div className="relative w-9 h-9 flex items-center justify-center">
      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#1E2030" strokeWidth="3" />
        <circle cx="18" cy="18" r={radius} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="score-ring" />
      </svg>
      <span className="absolute text-[9px] font-bold" style={{ color }}>{score ?? 0}</span>
    </div>
  );
}

export default function Discovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedOpportunity, setSelectedOpportunity] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [discovering, setDiscovering] = useState(false);
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [clientBusinesses, setClientBusinesses] = useState<any[]>([]);
  const [discoverMsg, setDiscoverMsg] = useState("");

  const utils = trpc.useUtils();

  const { data: businessData, isLoading } = trpc.business.search.useQuery({
    query: searchQuery || undefined,
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    country: selectedCountry !== "All" ? selectedCountry : undefined,
    opportunityLevel: selectedOpportunity !== "All" ? selectedOpportunity : undefined,
    limit: 50,
  });

  const discoverMutation = trpc.business.discover.useMutation({
    onSuccess: () => {
      utils.business.search.invalidate();
      utils.business.getStats.invalidate();
      utils.analytics.dashboard.invalidate();
    },
  });

  // Merge: tRPC DB results + client-discovered businesses
  const dbBusinesses = useBusinessFallback(businessData?.items);
  const allBusinesses = clientBusinesses.length > 0
    ? [...clientBusinesses, ...dbBusinesses.filter((db: any) => !clientBusinesses.some((c: any) => c.placeId && c.placeId === db.discoveryData?.placeId))]
    : dbBusinesses;

  // Apply client-side filters
  const filteredBusinesses = allBusinesses.filter((biz: any) => {
    if (selectedCategory !== "All" && biz.category !== selectedCategory) return false;
    if (selectedCountry !== "All" && biz.country !== selectedCountry) return false;
    if (selectedOpportunity !== "All" && biz.opportunityLevel !== selectedOpportunity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        biz.name?.toLowerCase().includes(q) ||
        biz.category?.toLowerCase().includes(q) ||
        biz.city?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDiscover = async () => {
    if (!discoverQuery.trim()) return;
    setDiscovering(true);
    setDiscoverMsg("");
    try {
      // Try backend first (if running)
      const backendResult = await discoverMutation.mutateAsync({
        query: discoverQuery,
        maxResults: 10,
        autoAnalyze: true,
      });

      // If backend found nothing, try client-side Google Places
      if (!backendResult || backendResult.discovered === 0) {
        const clientResult = await discoverBusinessesClientSide({
          query: discoverQuery,
          maxResults: 10,
          autoAnalyze: true,
        });

        if (clientResult.discovered > 0) {
          // Assign IDs to client businesses so they work with links
          const withIds = clientResult.businesses.map((b: any, i: number) => ({
            ...b,
            id: -(i + 1), // negative IDs = client-side only
          }));
          setClientBusinesses((prev) => [...withIds, ...prev]);
          setDiscoverMsg(`Discovered ${clientResult.discovered} businesses via Google Places (client-side). AI analysis coming with backend deployment.`);
        } else {
          setDiscoverMsg(clientResult.message || "No businesses found. Try a different search.");
        }
      }
    } catch {
      // Backend not available — try client-side directly
      const clientResult = await discoverBusinessesClientSide({
        query: discoverQuery,
        maxResults: 10,
        autoAnalyze: true,
      });

      if (clientResult.discovered > 0) {
        const withIds = clientResult.businesses.map((b: any, i: number) => ({
          ...b,
          id: -(i + 1),
        }));
        setClientBusinesses((prev) => [...withIds, ...prev]);
        setDiscoverMsg(`Discovered ${clientResult.discovered} real businesses via Google Places! Backend deployment needed for AI analysis & persistence.`);
      } else {
        setDiscoverMsg(clientResult.message || "No businesses found. Try a different search query.");
      }
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>AI Business Discovery</h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>Discover local businesses with AI-powered intelligence via Google Places</p>
      </div>

      {/* AI Discovery Input */}
      <div className="glass-card p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={discoverQuery}
              onChange={(e) => setDiscoverQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
              placeholder="Search Google Places — e.g., 'lodges in Victoria Falls'"
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
            />
          </div>
          <button
            onClick={handleDiscover}
            disabled={discovering || !discoverQuery.trim()}
            className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 sm:py-0 disabled:opacity-50 shrink-0 touch-target"
          >
            {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden sm:inline">{discovering ? "Discovering..." : "AI Discover"}</span>
            <span className="sm:hidden">{discovering ? "..." : "Discover"}</span>
          </button>
        </div>
        <div className="flex gap-2 mt-2 flex-nowrap overflow-x-auto pb-1 mobile-scroll">
          <span className="text-[11px] shrink-0" style={{ color: "var(--text-muted)" }}>Try:</span>
          {["Safari operators in Victoria Falls", "Houseboats in Kariba", "Salons in Bulawayo", "Hotels in Cape Town"].map((s) => (
            <button key={s} onClick={() => { setDiscoverQuery(s); }} className="text-[11px] px-2 py-0.5 rounded-full transition-colors hover:bg-white/10 whitespace-nowrap shrink-0" style={{ background: "var(--bg-tertiary)", color: "var(--accent-cyan)" }}>{s}</button>
          ))}
        </div>
        {(discoverMutation.data || discoverMsg) && (
          <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: discoverMsg && discoverMsg.includes("Discovered") ? "rgba(6, 214, 160, 0.05)" : "rgba(251, 191, 36, 0.05)", border: `1px solid ${discoverMsg && discoverMsg.includes("Discovered") ? "rgba(6, 214, 160, 0.1)" : "rgba(251, 191, 36, 0.1)"}` }}>
            {discoverMutation.data && discoverMutation.data.discovered > 0 ? (
              <span style={{ color: "var(--accent-teal)" }}>
                <Sparkles className="w-3 h-3 inline mr-1" />
                Discovered {discoverMutation.data.discovered} new businesses
                {discoverMutation.data.analyzed ? `, AI-analyzed ${discoverMutation.data.analyzed}` : ""}
              </span>
            ) : discoverMsg ? (
              <span style={{ color: discoverMsg.includes("Discovered") ? "var(--accent-teal)" : "var(--text-muted)" }}>
                {discoverMsg.includes("Discovered") && <Sparkles className="w-3 h-3 inline mr-1" />}
                {discoverMsg}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>
                {discoverMutation.data?.message || "No new businesses found. Try a different search."}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, category, or city..."
            className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-xl text-sm outline-none transition-all focus:ring-2"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedOpportunity} onChange={(e) => setSelectedOpportunity(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
          {opportunityLevels.map(o => <option key={o} value={o}>{o === "All" ? "All Opportunities" : o.replace("_", " ").replace(/^\w/, c => c.toUpperCase())}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setViewMode("list")} className="p-2 rounded-lg transition-colors" style={{ background: viewMode === "list" ? "var(--bg-secondary)" : "transparent", color: viewMode === "list" ? "var(--text-primary)" : "var(--text-muted)" }}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("grid")} className="p-2 rounded-lg transition-colors" style={{ background: viewMode === "grid" ? "var(--bg-secondary)" : "transparent", color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-muted)" }}><Grid3X3 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            style={{ background: selectedCategory === cat ? "var(--gradient-hero)" : "var(--bg-secondary)", color: "white" }}>{cat}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent-teal)" }} />
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {["Business", "Category", "Location", "Score", "Opportunity", "Contact", "Actions"].map(h => (
                      <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wider py-3 px-3" style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBusinesses.map((biz, idx) => (
                    <tr key={biz.id ?? `biz-${idx}`} className="group transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td className="py-3 px-3">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{biz.name}</p>
                        {biz.rating && <div className="flex items-center gap-1 mt-0.5"><Star className="w-3 h-3 fill-current" style={{ color: "var(--status-yellow)" }} /><span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{biz.rating} ({biz.reviewCount})</span></div>}
                      </td>
                      <td className="py-3 px-3"><span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>{biz.category}</span></td>
                      <td className="py-3 px-3"><div className="flex items-center gap-1"><MapPin className="w-3 h-3" style={{ color: "var(--text-muted)" }} /><span className="text-xs" style={{ color: "var(--text-secondary)" }}>{biz.city}, {biz.country}</span></div></td>
                      <td className="py-3 px-3"><ScoreRing score={biz.digitalScore} /></td>
                      <td className="py-3 px-3"><OpportunityBadge level={biz.opportunityLevel} /></td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {biz.phone && <Phone className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />}
                          {biz.whatsapp && <MessageCircle className="w-3.5 h-3.5" style={{ color: "var(--accent-teal)" }} />}
                          {biz.email && <Mail className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />}
                          {biz.website && <Globe className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/analyzer?business=${biz.id}`} className="p-1.5 rounded-lg transition-colors hover:bg-white/10" title="Analyze"><BarChart3 className="w-3.5 h-3.5" style={{ color: "var(--accent-violet)" }} /></Link>
                          <Link to={`/pitch?business=${biz.id}`} className="p-1.5 rounded-lg transition-colors hover:bg-white/10" title="Generate Pitch"><Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent-teal)" }} /></Link>
                          <button className="p-1.5 rounded-lg transition-colors hover:bg-white/10" title="Add to CRM"><Users className="w-3.5 h-3.5" style={{ color: "var(--accent-cyan)" }} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBusinesses.map((biz, idx) => (
                <div key={biz.id ?? `grid-${idx}`} className="glass-card p-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{biz.name}</p>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{biz.category} &middot; {biz.city}</span>
                    </div>
                    <ScoreRing score={biz.digitalScore} />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <OpportunityBadge level={biz.opportunityLevel} />
                    <div className="flex items-center gap-1">
                      {biz.phone && <Phone className="w-3 h-3" style={{ color: "var(--text-muted)" }} />}
                      {biz.whatsapp && <MessageCircle className="w-3 h-3" style={{ color: "var(--accent-teal)" }} />}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/analyzer?business=${biz.id}`} className="flex-1 text-center text-[11px] py-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ background: "var(--bg-tertiary)", color: "var(--accent-violet)" }}>Analyze</Link>
                    <Link to={`/pitch?business=${biz.id}`} className="flex-1 text-center text-[11px] py-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ background: "var(--bg-tertiary)", color: "var(--accent-teal)" }}>Pitch</Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-center">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Showing {filteredBusinesses.length} businesses
              {clientBusinesses.length > 0 && ` (${clientBusinesses.length} from live Google Places search)`}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
