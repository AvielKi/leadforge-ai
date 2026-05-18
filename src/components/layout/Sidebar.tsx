import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Users,
  Send,
  Sparkles,
  LineChart,
  Palmtree,
  Image,
  Bot,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertCircle,
  LogOut,
  X,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMobileSidebar } from "@/hooks/useMobileSidebar";

function getNavGroups(isAdmin: boolean) {
  const settingsItems: Array<{ icon: typeof LayoutDashboard; label: string; path: string }> = [
    { icon: CreditCard, label: "Billing", path: "/billing" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];
  if (isAdmin) {
    settingsItems.push({ icon: UserCog, label: "Team", path: "/team" });
  }
  return [
    {
      label: "Core",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: Search, label: "Discovery", path: "/discovery" },
        { icon: BarChart3, label: "Analyzer", path: "/analyzer" },
        { icon: Users, label: "CRM Pipeline", path: "/crm" },
        { icon: Send, label: "Outreach", path: "/outreach" },
        { icon: Sparkles, label: "Pitch Generator", path: "/pitch" },
        { icon: LineChart, label: "Analytics", path: "/analytics" },
      ],
    },
    {
      label: "AI Features",
      items: [
        { icon: Palmtree, label: "Tourism Mode", path: "/tourism" },
        { icon: Image, label: "Mockup Generator", path: "/mockup" },
        { icon: Bot, label: "AI Agent", path: "/agent" },
      ],
    },
    {
      label: "Settings",
      items: settingsItems,
    },
  ];
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout, isAdmin, isAuthenticated } = useAuth();
  const { isOpen, close } = useMobileSidebar();
  const navGroups = getNavGroups(isAdmin);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
        <Link to="/" className="flex items-center gap-2.5 min-w-0" onClick={close}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--gradient-hero)" }}>
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base whitespace-nowrap overflow-hidden lg:block" style={{ color: "var(--text-primary)" }}>
            LeadForge AI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin min-h-0">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-5">
            <div className="px-4 mb-2 hidden lg:block">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                {group.label}
              </span>
            </div>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={close}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    isActive
                      ? "text-white"
                      : "hover:text-white"
                  )}
                  style={{
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    background: isActive ? "var(--bg-secondary)" : "transparent",
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                      style={{ background: "var(--gradient-hero)" }}
                    />
                  )}
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
            {gi < navGroups.length - 1 && (
              <div className="mx-4 my-3 h-px hidden lg:block" style={{ background: "var(--border-subtle)" }} />
            )}
          </div>
        ))}
      </nav>

      {/* Auth section */}
      <div className="border-t px-3 py-3 shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
        {isAuthenticated ? (
          <button
            onClick={() => { logout(); close(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full"
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile, visible on lg+ */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen flex-col border-r z-40 transition-all duration-300 hidden lg:flex",
          collapsed ? "w-16" : "w-60"
        )}
        style={{
          background: "var(--bg-tertiary)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--gradient-hero)" }}>
              <Flame className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-base whitespace-nowrap overflow-hidden" style={{ color: "var(--text-primary)" }}>
                LeadForge AI
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {navGroups.map((group, gi) => (
            <div key={gi} className="mb-5">
              {!collapsed && (
                <div className="px-4 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {group.label}
                  </span>
                </div>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      isActive
                        ? "text-white"
                        : "hover:text-white",
                      collapsed && "justify-center px-2"
                    )}
                    style={{
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      background: isActive ? "var(--bg-secondary)" : "transparent",
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                        style={{ background: "var(--gradient-hero)" }}
                      />
                    )}
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
              {gi < navGroups.length - 1 && !collapsed && (
                <div className="mx-4 my-3 h-px" style={{ background: "var(--border-subtle)" }} />
              )}
            </div>
          ))}
        </nav>

        {/* Auth section */}
        <div className="border-t px-3 py-3" style={{ borderColor: "var(--border-subtle)" }}>
          {isAuthenticated ? (
            <button
              onClick={logout}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full",
                collapsed && "justify-center px-2"
              )}
              style={{ color: "var(--text-muted)" }}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">Sign Out</span>}
            </button>
          ) : null}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 flex items-center justify-center border-t transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          ) : (
            <ChevronLeft className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={close}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[280px] flex-col border-r z-[60] transition-transform duration-300 ease-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "var(--bg-tertiary)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Mobile close button */}
        <div className="absolute top-4 right-3 lg:hidden">
          <button
            onClick={close}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
