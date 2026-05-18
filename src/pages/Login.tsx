import { useState } from "react";
import { Flame, LogIn, Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, AlertCircle, Users } from "lucide-react";
import { trpc } from "@/providers/trpc";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);
  return url.toString();
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("leadforge_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => setError(err.message),
    onSettled: () => setLoading(false),
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("leadforge_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => setError(err.message),
    onSettled: () => setLoading(false),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    loginMutation.mutate({ email: loginForm.email, password: loginForm.password });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!regForm.name || !regForm.email || !regForm.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (regForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    registerMutation.mutate({
      name: regForm.name,
      email: regForm.email,
      password: regForm.password,
    });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Left panel - branding (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0A0B14 0%, #0C0A20 50%, #0F0D1A 100%)" }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 30% 20%, rgba(6, 214, 160, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(124, 92, 252, 0.08) 0%, transparent 50%)",
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>LeadForge AI</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight" style={{ color: "var(--text-primary)" }}>
            AI-powered business discovery, outreach & growth
          </h2>
          <p className="text-base mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Find high-value leads, analyze their digital presence, generate AI pitches, and manage outreach campaigns — all from one platform.
          </p>
          <div className="space-y-4">
            {[
              { icon: Shield, text: "AI-powered business discovery via Google Places" },
              { icon: Users, text: "Team collaboration with role-based access" },
              { icon: LogIn, text: "Automated outreach via WhatsApp & Email" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(6, 214, 160, 0.1)" }}>
                  <item.icon className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
                </div>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs" style={{ color: "var(--text-muted)" }}>
          &copy; 2026 LeadForge AI. All rights reserved.
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--gradient-hero)" }}>
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>LeadForge AI</h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Sign in to your account</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--status-red)" }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex mb-6 rounded-lg overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="flex-1 py-2.5 text-sm font-medium transition-colors"
              style={{ background: mode === "login" ? "var(--bg-tertiary)" : "transparent", color: mode === "login" ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className="flex-1 py-2.5 text-sm font-medium transition-colors"
              style={{ background: mode === "register" ? "var(--bg-tertiary)" : "transparent", color: mode === "register" ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@company.com"
                    className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-10 pr-10 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> : <Eye className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm font-medium">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                Sign In
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    value={regForm.name}
                    onChange={(e) => setRegForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="John Smith"
                    className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@company.com"
                    className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regForm.password}
                    onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    className="w-full h-11 pl-10 pr-10 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> : <Eye className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat your password"
                    className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm font-medium">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Create Account
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
          </div>

          {/* OAuth */}
          <a
            href={getOAuthUrl()}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-white/5"
            style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
          >
            <LogIn className="w-4 h-4" />
            Sign in with Kimi
          </a>
        </div>
      </div>
    </div>
  );
}
