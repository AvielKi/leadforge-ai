import { useState } from "react";
import {
  Image,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Download,
  Globe,
  Layout,
  Type,
  Star,
  MapPin,
  CreditCard,
  MessageCircle,
} from "lucide-react";

const industries = [
  { id: "tourism", label: "Tourism" },
  { id: "restaurant", label: "Restaurant" },
  { id: "salon", label: "Salon" },
  { id: "retail", label: "Retail" },
  { id: "professional", label: "Professional" },
];

const styles = [
  { id: "modern", label: "Modern" },
  { id: "elegant", label: "Elegant" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "luxury", label: "Luxury" },
];

const pageTypes = [
  { id: "homepage", label: "Homepage" },
  { id: "landing", label: "Landing Page" },
  { id: "booking", label: "Booking Page" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const features = [
  { id: "hero", label: "Hero Image", icon: Image },
  { id: "booking", label: "Booking Widget", icon: CreditCard },
  { id: "testimonials", label: "Testimonials", icon: Star },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "contact", label: "Contact Form", icon: Type },
  { id: "whatsapp", label: "WhatsApp Chat", icon: MessageCircle },
  { id: "map", label: "Map", icon: MapPin },
  { id: "social", label: "Social Links", icon: Globe },
];

export default function MockupGenerator() {
  const [businessName, setBusinessName] = useState("Tamarind Lodges");
  const [industry, setIndustry] = useState("tourism");
  const [style, setStyle] = useState("modern");
  const [pageType, setPageType] = useState("homepage");
  const [selectedFeatures, setSelectedFeatures] = useState(["hero", "booking", "testimonials", "contact"]);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const deviceWidths = { desktop: "100%", tablet: "768px", mobile: "375px" };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          AI Website Mockup Generator
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
          Generate stunning website mockups for your clients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Configuration
          </h3>

          {/* Business Name */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
            />
          </div>

          {/* Industry */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Industry
            </label>
            <div className="flex flex-wrap gap-2">
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setIndustry(ind.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: industry === ind.id ? "var(--gradient-hero)" : "var(--bg-tertiary)",
                    color: "white",
                  }}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Style
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: style === s.id ? "var(--gradient-hero)" : "var(--bg-tertiary)",
                    color: "white",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page Type */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Page Type
            </label>
            <div className="flex flex-wrap gap-2">
              {pageTypes.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => setPageType(pt.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: pageType === pt.id ? "var(--gradient-hero)" : "var(--bg-tertiary)",
                    color: "white",
                  }}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Features to Include
            </label>
            <div className="grid grid-cols-2 gap-2">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFeature(f.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                    style={{
                      background: selectedFeatures.includes(f.id) ? "rgba(124, 92, 252, 0.1)" : "var(--bg-tertiary)",
                      color: selectedFeatures.includes(f.id) ? "var(--accent-violet)" : "var(--text-secondary)",
                      border: selectedFeatures.includes(f.id) ? "1px solid var(--accent-violet)" : "1px solid var(--border-subtle)",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "Generate Mockup"}
          </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Preview
            </h3>
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
              {([
                { id: "desktop" as const, icon: Monitor },
                { id: "tablet" as const, icon: Tablet },
                { id: "mobile" as const, icon: Smartphone },
              ]).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id)}
                  className="p-1.5 rounded-md transition-colors"
                  style={{
                    background: device === d.id ? "var(--bg-secondary)" : "transparent",
                    color: device === d.id ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  <d.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {!generated && !generating && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--gradient-card)" }}>
                <Layout className="w-10 h-10" style={{ color: "var(--accent-violet)" }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                No mockup generated yet
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Configure settings and click Generate
              </p>
            </div>
          )}

          {generating && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 rounded-full animate-pulse-glow flex items-center justify-center mb-4" style={{ background: "rgba(124, 92, 252, 0.1)" }}>
                <Sparkles className="w-10 h-10 animate-spin" style={{ color: "var(--accent-violet)" }} />
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>AI is designing your mockup...</p>
            </div>
          )}

          {generated && (
            <div className="flex flex-col items-center">
              <div
                className="rounded-xl overflow-hidden border transition-all"
                style={{
                  width: deviceWidths[device],
                  maxWidth: "100%",
                  borderColor: "var(--border-subtle)",
                }}
              >
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-3 py-2" style={{ background: "var(--bg-tertiary)" }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FBBF24" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#06D6A0" }} />
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="h-5 rounded-md flex items-center px-2 text-[10px]" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                      www.{businessName.toLowerCase().replace(/\s+/g, "")}.com
                    </div>
                  </div>
                </div>

                {/* Mockup Content */}
                <div style={{ background: "var(--bg-secondary)" }}>
                  {/* Hero Section */}
                  {selectedFeatures.includes("hero") && (
                    <div className="relative h-40 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(124, 92, 252, 0.3), rgba(6, 214, 160, 0.2))" }}>
                      <div className="text-center">
                        <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>{businessName}</h2>
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Experience the extraordinary</p>
                      </div>
                    </div>
                  )}

                  {/* Nav */}
                  <div className="flex items-center justify-between px-4 py-2" style={{ background: "var(--bg-tertiary)" }}>
                    <span className="text-[10px] font-bold" style={{ color: "var(--text-primary)" }}>{businessName}</span>
                    <div className="flex gap-2">
                      {["Home", "About", "Contact"].map((n) => (
                        <span key={n} className="text-[8px]" style={{ color: "var(--text-muted)" }}>{n}</span>
                      ))}
                    </div>
                  </div>

                  {/* Booking Widget */}
                  {selectedFeatures.includes("booking") && (
                    <div className="p-3">
                      <div className="p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                        <p className="text-[10px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>Book Your Stay</p>
                        <div className="grid grid-cols-3 gap-2">
                          {["Check In", "Check Out", "Guests"].map((l) => (
                            <div key={l} className="p-1.5 rounded text-center" style={{ background: "var(--bg-secondary)" }}>
                              <p className="text-[7px]" style={{ color: "var(--text-muted)" }}>{l}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 h-6 rounded flex items-center justify-center text-[9px] font-medium" style={{ background: "var(--gradient-hero)", color: "white" }}>
                          Check Availability
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Testimonials */}
                  {selectedFeatures.includes("testimonials") && (
                    <div className="p-3">
                      <p className="text-[10px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>What Our Guests Say</p>
                      <div className="flex gap-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex-1 p-2 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                            <div className="flex gap-0.5 mb-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-2 h-2 fill-current" style={{ color: "var(--status-yellow)" }} />
                              ))}
                            </div>
                            <p className="text-[7px]" style={{ color: "var(--text-secondary)" }}>Amazing experience! Highly recommended.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {selectedFeatures.includes("contact") && (
                    <div className="p-3">
                      <p className="text-[10px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>Contact Us</p>
                      <div className="space-y-1">
                        {["Name", "Email", "Message"].map((f) => (
                          <div key={f} className="h-5 rounded flex items-center px-2 text-[7px]" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="p-3 text-center" style={{ background: "var(--bg-tertiary)" }}>
                    <p className="text-[7px]" style={{ color: "var(--text-muted)" }}>© 2026 {businessName}. All rights reserved.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                >
                  <Download className="w-3.5 h-3.5" /> Download PNG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
