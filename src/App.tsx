import { Routes, Route } from "react-router";
import AppLayout from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import Home from "@/pages/Home";
import Discovery from "@/pages/Discovery";
import Analyzer from "@/pages/Analyzer";
import CRM from "@/pages/CRM";
import Outreach from "@/pages/Outreach";
import PitchGenerator from "@/pages/PitchGenerator";
import Analytics from "@/pages/Analytics";
import Tourism from "@/pages/Tourism";
import MockupGenerator from "@/pages/MockupGenerator";
import AIAgent from "@/pages/AIAgent";
import Billing from "@/pages/Billing";
import SettingsPage from "@/pages/SettingsPage";
import Login from "@/pages/Login";
import TeamPage from "@/pages/TeamPage";
import NotFound from "@/pages/NotFound";

function AppLayoutWrapper({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  return (
    <AuthGuard requireAdmin={requireAdmin}>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AppLayoutWrapper><Home /></AppLayoutWrapper>} />
      <Route path="/discovery" element={<AppLayoutWrapper><Discovery /></AppLayoutWrapper>} />
      <Route path="/analyzer" element={<AppLayoutWrapper><Analyzer /></AppLayoutWrapper>} />
      <Route path="/crm" element={<AppLayoutWrapper><CRM /></AppLayoutWrapper>} />
      <Route path="/outreach" element={<AppLayoutWrapper><Outreach /></AppLayoutWrapper>} />
      <Route path="/pitch" element={<AppLayoutWrapper><PitchGenerator /></AppLayoutWrapper>} />
      <Route path="/analytics" element={<AppLayoutWrapper><Analytics /></AppLayoutWrapper>} />
      <Route path="/tourism" element={<AppLayoutWrapper><Tourism /></AppLayoutWrapper>} />
      <Route path="/mockup" element={<AppLayoutWrapper><MockupGenerator /></AppLayoutWrapper>} />
      <Route path="/agent" element={<AppLayoutWrapper><AIAgent /></AppLayoutWrapper>} />
      <Route path="/billing" element={<AppLayoutWrapper><Billing /></AppLayoutWrapper>} />
      <Route path="/settings" element={<AppLayoutWrapper><SettingsPage /></AppLayoutWrapper>} />
      <Route path="/team" element={<AppLayoutWrapper requireAdmin><TeamPage /></AppLayoutWrapper>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
