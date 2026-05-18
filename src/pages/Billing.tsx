import {
  Check,
  Download,
} from "lucide-react";
import { useState } from "react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "Perfect for individual freelancers",
    features: [
      "100 lead discoveries/month",
      "50 AI analyses",
      "100 outreach messages",
      "Basic CRM",
      "1 team member",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    description: "For growing agencies and teams",
    features: [
      "500 lead discoveries/month",
      "250 AI analyses",
      "500 outreach messages",
      "Full CRM + Pipeline",
      "AI pitch generator",
      "5 team members",
    ],
    cta: "Current Plan",
    featured: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: 199,
    description: "For large agencies and enterprises",
    features: [
      "Unlimited lead discoveries",
      "Unlimited AI analyses",
      "Unlimited outreach",
      "Full CRM + Automation",
      "AI Agent Mode",
      "White-label support",
      "20 team members",
      "Priority support",
    ],
    cta: "Upgrade",
    featured: false,
  },
];

const usage = [
  { label: "Lead Discoveries", used: 347, limit: 500, color: "#7C5CFC" },
  { label: "AI Analyses", used: 128, limit: 250, color: "#06D6A0" },
  { label: "Outreach Messages", used: 412, limit: 500, color: "#2DD4BF" },
  { label: "Team Members", used: 3, limit: 5, color: "#FBBF24" },
];

const billingHistory = [
  { date: "May 1, 2026", description: "Professional Plan — Monthly", amount: "$79.00", status: "Paid" },
  { date: "Apr 1, 2026", description: "Professional Plan — Monthly", amount: "$79.00", status: "Paid" },
  { date: "Mar 1, 2026", description: "Starter Plan — Monthly", amount: "$29.00", status: "Paid" },
  { date: "Feb 1, 2026", description: "Starter Plan — Monthly", amount: "$29.00", status: "Paid" },
];

export default function Billing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Subscriptions & Billing
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your plan, usage, and payment methods
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
          <button
            onClick={() => setBillingCycle("monthly")}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: billingCycle === "monthly" ? "var(--bg-tertiary)" : "transparent",
              color: billingCycle === "monthly" ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: billingCycle === "annual" ? "var(--bg-tertiary)" : "transparent",
              color: billingCycle === "annual" ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            Annual
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(6, 214, 160, 0.1)", color: "var(--accent-teal)" }}
            >
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-2xl transition-all duration-300 hover:shadow-xl ${
              plan.featured ? "ring-2" : ""
            }`}
            style={{
              background: "var(--bg-secondary)",
              border: plan.featured ? "none" : "1px solid var(--border-subtle)",
              
            }}
          >
            {plan.featured && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "var(--gradient-hero)", color: "white" }}
              >
                Most Popular
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                {plan.name}
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{plan.description}</p>
            </div>

            <div className="mb-5">
              <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                ${billingCycle === "annual" ? Math.round(plan.price * 0.8) : plan.price}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>/month</span>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent-teal)" }} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all ${
                plan.featured
                  ? "btn-primary"
                  : ""
              }`}
              style={
                plan.featured
                  ? {}
                  : {
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-subtle)",
                    }
              }
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Usage Dashboard */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Current Usage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {usage.map((u) => {
            const pct = (u.used / u.limit) * 100;
            return (
              <div key={u.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{u.label}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {u.used}/{u.limit}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: u.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Billing History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Date", "Description", "Amount", "Status", "Invoice"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wider py-3 px-3" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((row, i) => (
                <tr key={i} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="py-3 px-3 text-sm" style={{ color: "var(--text-secondary)" }}>{row.date}</td>
                  <td className="py-3 px-3 text-sm" style={{ color: "var(--text-primary)" }}>{row.description}</td>
                  <td className="py-3 px-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{row.amount}</td>
                  <td className="py-3 px-3">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(6, 214, 160, 0.1)", color: "var(--accent-teal)" }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      <Download className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
