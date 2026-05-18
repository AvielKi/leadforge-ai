import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { MobileSidebarProvider } from "@/hooks/useMobileSidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <MobileSidebarProvider>
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <Sidebar />
        {/* Main content - no left margin on mobile, no margin on desktop (sidebar is fixed overlay on mobile) */}
        <div className="lg:ml-0 transition-all duration-300">
          <TopBar />
          <main className="pt-16 min-h-screen">
            <div className="p-4 sm:p-5 lg:p-6 max-w-[1440px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
