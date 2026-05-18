import { Bell, Search, Command, Bot, LogOut, AlertCircle, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMobileSidebar } from "@/hooks/useMobileSidebar";

export default function TopBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { open } = useMobileSidebar();

  return (
    <header
      className="fixed top-0 right-0 h-16 flex items-center justify-between px-4 z-30 border-b transition-all duration-300"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border-subtle)",
        left: 0,
      }}
    >
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Hamburger - mobile only */}
        <button
          onClick={open}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors hover:border-white/20 max-w-[280px] w-full"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline truncate">Search leads, campaigns...</span>
          <span className="sm:hidden truncate">Search...</span>
          <kbd
            className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ml-auto"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
          >
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0 ml-2">
        {/* AI Agent Status - tablet+ */}
        <div
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(6, 214, 160, 0.1)", color: "var(--accent-teal)" }}
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "var(--accent-teal)" }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ background: "var(--accent-teal)" }}
            />
          </span>
          <span>AI Active</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "var(--text-secondary)" }}
        >
          <Bell className="w-[18px] h-[18px]" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--accent-teal)" }}
          />
        </button>

        {/* User section */}
        <div
          className="flex items-center gap-2 pl-2 sm:pl-3 border-l"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="text-right hidden sm:block">
            <p
              className="text-sm font-medium leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {user?.name || "Agent"}
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {isAuthenticated ? (user?.role || "Professional") : "Guest"}
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
            style={{ background: "var(--gradient-hero)", color: "white" }}
          >
            {user?.name?.[0] || "A"}
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5 hidden sm:block"
            title={isAuthenticated ? "Sign Out" : "Login"}
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
