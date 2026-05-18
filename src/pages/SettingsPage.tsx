import { useState } from "react";
import {
  User,
  Users,
  Plug,
  Sliders,
  Bell,
  Moon,
  Sun,
  Globe,
  Check,
  MessageCircle,
  Mail,
  Facebook,
  Bot,
  CreditCard,
  Wallet,
  Smartphone,
} from "lucide-react";

const integrations = [
  { name: "WhatsApp Business API", icon: MessageCircle, status: "connected", color: "#06D6A0" },
  { name: "Meta/Facebook API", icon: Facebook, status: "disconnected", color: "#3B82F6" },
  { name: "Gmail API", icon: Mail, status: "connected", color: "#EF4444" },
  { name: "Telegram Bot", icon: Bot, status: "connected", color: "#3B82F6" },
  { name: "Stripe", icon: CreditCard, status: "connected", color: "#7C5CFC" },
  { name: "PayPal", icon: Wallet, status: "disconnected", color: "#3B82F6" },
  { name: "PayNow", icon: Smartphone, status: "disconnected", color: "#06D6A0" },
  { name: "Google Maps API", icon: Globe, status: "connected", color: "#F97316" },
];

const teamMembers = [
  { name: "Alex Morgan", email: "alex@leadforge.ai", role: "Owner", status: "active" },
  { name: "Sarah Chen", email: "sarah@leadforge.ai", role: "Admin", status: "active" },
  { name: "James Wilson", email: "james@leadforge.ai", role: "Member", status: "active" },
];

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "team", label: "Team", icon: Users },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState("dark");

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Settings
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your account, team, and integrations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: "var(--bg-secondary)" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? "var(--bg-tertiary)" : "transparent",
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="glass-card p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ background: "var(--gradient-hero)", color: "white" }}
            >
              A
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Alex Morgan</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>alex@leadforge.ai</p>
            </div>
            <button className="ml-auto text-xs px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
              Change Avatar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "First Name", value: "Alex" },
              { label: "Last Name", value: "Morgan" },
              { label: "Email", value: "alex@leadforge.ai" },
              { label: "Phone", value: "+263772123456" },
              { label: "Company", value: "LeadForge Agency" },
              { label: "Timezone", value: "Africa/Harare" },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-[11px] font-medium uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                  {field.label}
                </label>
                <input
                  type="text"
                  defaultValue={field.value}
                  className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
                />
              </div>
            ))}
          </div>

          <button className="btn-primary mt-6 px-6 py-2 text-sm">Save Changes</button>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Team Members</h3>
            <button className="btn-primary text-xs px-4 py-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Invite Member
            </button>
          </div>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ background: "var(--gradient-hero)", color: "white" }}
                >
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{member.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{member.email}</p>
                </div>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{
                    background: member.role === "Owner" ? "rgba(124, 92, 252, 0.1)" : "rgba(6, 214, 160, 0.1)",
                    color: member.role === "Owner" ? "var(--accent-violet)" : "var(--accent-teal)",
                  }}
                >
                  {member.role}
                </span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(6, 214, 160, 0.1)", color: "var(--accent-teal)" }}
                >
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.name}
                className="glass-card p-4 flex items-center gap-4 hover:shadow-lg transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${integration.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: integration.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{integration.name}</p>
                  <p className="text-[11px] capitalize flex items-center gap-1" style={{ color: integration.status === "connected" ? "var(--accent-teal)" : "var(--text-muted)" }}>
                    {integration.status === "connected" && <Check className="w-3 h-3" />}
                    {integration.status}
                  </p>
                </div>
                <button
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:bg-white/10"
                  style={{
                    background: integration.status === "connected" ? "var(--bg-tertiary)" : "var(--gradient-hero)",
                    color: integration.status === "connected" ? "var(--text-secondary)" : "white",
                  }}
                >
                  {integration.status === "connected" ? "Configure" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="glass-card p-6 max-w-2xl">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Preferences</h3>

          {/* Theme */}
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Theme</label>
            <div className="flex gap-2">
              {[
                { id: "dark", label: "Dark", icon: Moon },
                { id: "light", label: "Light", icon: Sun },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: theme === t.id ? "var(--gradient-hero)" : "var(--bg-tertiary)",
                    color: "white",
                  }}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Region */}
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Default Discovery Region</label>
            <select
              className="w-full h-10 px-3 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
            >
              <option>Zimbabwe</option>
              <option>South Africa</option>
              <option>Botswana</option>
              <option>Namibia</option>
            </select>
          </div>

          {/* Default Tone */}
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Default Outreach Tone</label>
            <select
              className="w-full h-10 px-3 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
            >
              <option>Friendly</option>
              <option>Professional</option>
              <option>Luxury Tourism</option>
              <option>Corporate</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Default Export Format</label>
            <select
              className="w-full h-10 px-3 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
            >
              <option>Excel</option>
              <option>CSV</option>
              <option>PDF</option>
            </select>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="glass-card p-6 max-w-2xl">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: "New lead discovered", enabled: true },
              { label: "Lead reply received", enabled: true },
              { label: "AI analysis complete", enabled: true },
              { label: "Campaign completed", enabled: false },
              { label: "Daily summary", enabled: false },
              { label: "Billing alerts", enabled: true },
            ].map((notif) => (
              <div
                key={notif.label}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{notif.label}</span>
                <button
                  className="relative w-10 h-5 rounded-full transition-colors"
                  style={{ background: notif.enabled ? "var(--accent-teal)" : "var(--bg-tertiary)" }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: notif.enabled ? "translateX(20px)" : "translateX(2px)" }}
                  />
                </button>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold mt-6 mb-4" style={{ color: "var(--text-primary)" }}>Notification Channels</h3>
          <div className="flex gap-3">
            {["In-app", "Email", "WhatsApp"].map((ch) => (
              <button
                key={ch}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              >
                <Check className="w-3 h-3" style={{ color: "var(--accent-teal)" }} />
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
