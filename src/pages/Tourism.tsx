import { useState } from "react";
import { mockBusinesses } from "@/lib/mockData";
import {
  Palmtree,
  Hotel,
  Compass,
  Ship,
  Camera,
  TrendingUp,
  MessageCircle,
  Megaphone,
  ArrowRight,
  Star,
  MapPin,
  Globe,
  Search,
} from "lucide-react";

const tourismTypes = [
  { id: "lodges", label: "Lodges", icon: Hotel },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "resorts", label: "Resorts", icon: Palmtree },
  { id: "houseboats", label: "Houseboats", icon: Ship },
  { id: "safari", label: "Safari Operators", icon: Compass },
  { id: "restaurants", label: "Restaurants", icon: Star },
];

const regions = ["All Regions", "Zimbabwe", "South Africa", "Botswana", "Namibia", "Zambia"];

const recommendations = [
  {
    icon: Globe,
    title: "Direct Booking System",
    stat: "67%",
    description: "of lodges rely only on Booking.com — High opportunity for direct booking websites",
    cta: "Find Lodges Without Direct Booking",
    color: "#7C5CFC",
  },
  {
    icon: TrendingUp,
    title: "Tourism SEO",
    stat: "3x",
    description: "Safari operators with blogs get 3x more organic traffic",
    cta: "Analyze Safari Operators",
    color: "#06D6A0",
  },
  {
    icon: Camera,
    title: "Drone Marketing",
    stat: "45%",
    description: "Properties with aerial video see 45% more engagement",
    cta: "Generate Drone Marketing Plan",
    color: "#FBBF24",
  },
  {
    icon: Megaphone,
    title: "Facebook Tourism Ads",
    stat: "SA Tourists",
    description: "Target South African tourists visiting Victoria Falls",
    cta: "Create Tourism Ad Campaign",
    color: "#F97316",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Booking",
    stat: "89%",
    description: "of tourists prefer WhatsApp for booking communication",
    cta: "Set Up Booking Automation",
    color: "#06D6A0",
  },
];

export default function Tourism() {
  const [selectedType, setSelectedType] = useState("lodges");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");

  const filteredBusinesses = mockBusinesses.filter(b => {
    if (selectedType === 'safari' && b.category === 'Safari') return true;
    if (selectedType !== 'safari' && b.category?.toLowerCase() === selectedType) return true;
    if (selectedType === 'lodges' && b.category === 'Lodges') return true;
    if (selectedType === 'hotels' && b.category === 'Hotels') return true;
    return selectedType === 'lodges';
  }).filter(b => {
    if (selectedRegion === "All Regions") return true;
    return b.country === selectedRegion;
  });

  const businesses = filteredBusinesses;

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
            <Palmtree className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Tourism Business Mode
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
              AI-powered intelligence for lodges, resorts, safaris, and tourism operators
            </p>
          </div>
        </div>
      </div>

      {/* Region Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: selectedRegion === region ? "var(--gradient-hero)" : "var(--bg-secondary)",
              color: "white",
            }}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Tourism Type Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {tourismTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className="p-4 rounded-xl text-center transition-all hover:shadow-lg"
              style={{
                background: selectedType === type.id ? "var(--gradient-card)" : "var(--bg-secondary)",
                border: selectedType === type.id ? "1px solid var(--accent-violet)" : "1px solid var(--border-subtle)",
              }}
            >
              <Icon
                className="w-6 h-6 mx-auto mb-2"
                style={{ color: selectedType === type.id ? "var(--accent-teal)" : "var(--text-muted)" }}
              />
              <p
                className="text-xs font-medium"
                style={{ color: selectedType === type.id ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                {type.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* AI Recommendations */}
      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        AI Tourism Recommendations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <div key={rec.title} className="glass-card p-5 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${rec.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: rec.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{rec.title}</h3>
                  <span className="text-lg font-bold" style={{ color: rec.color }}>{rec.stat}</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                {rec.description}
              </p>
              <button
                className="text-xs font-medium flex items-center gap-1 hover:underline"
                style={{ color: rec.color }}
              >
                {rec.cta} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Tourism Business Table */}
      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Tourism Businesses
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Business", "Type", "Location", "Rating", "Score", "Opportunity", "Actions"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wider py-3 px-3" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz) => (
              <tr
                key={biz.id}
                className="transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <td className="py-3 px-3">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{biz.name}</p>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                    {biz.category}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="w-3 h-3" /> {biz.city}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" style={{ color: "var(--status-yellow)" }} />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{biz.rating}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: (biz.digitalScore ?? 0) >= 60 ? "var(--score-good)" : (biz.digitalScore ?? 0) >= 40 ? "var(--score-average)" : "var(--score-poor)",
                    }}
                  >
                    {biz.digitalScore ?? 0}/100
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase"
                    style={{
                      background: biz.opportunityLevel === "very_high" ? "rgba(6, 214, 160, 0.1)" : biz.opportunityLevel === "high" ? "rgba(59, 130, 246, 0.1)" : "rgba(249, 115, 22, 0.1)",
                      color: biz.opportunityLevel === "very_high" ? "var(--accent-teal)" : biz.opportunityLevel === "high" ? "var(--status-blue)" : "var(--status-orange)",
                    }}
                  >
                    {(biz.opportunityLevel ?? "").replace("_", " ")}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <button className="flex items-center gap-1 text-[11px] font-medium hover:underline" style={{ color: "var(--accent-teal)" }}>
                    <Search className="w-3 h-3" /> Analyze
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
