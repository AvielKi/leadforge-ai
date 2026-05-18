// Hook utility: returns real data from tRPC if available, mock data otherwise
// This ensures the UI works on static deployments (no backend) AND full-stack deployments
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockBusinesses, mockAnalyses, mockCrmLeads, mockCampaigns, mockTemplates, mockActivities, mockAgentInsights } from "./mockData";

export function useBusinessFallback(items: any[] | undefined): any[] {
  return items && items.length > 0 ? items : mockBusinesses as any[];
}

export function useAnalysisFallback(analysis: any | null | undefined): any {
  return analysis ?? (mockAnalyses[0] as any) ?? null;
}

export function useCrmLeadsFallback(items: any[] | undefined): any[] {
  return items && items.length > 0 ? items : mockCrmLeads as any[];
}

export function useCampaignsFallback(items: any[] | undefined): any[] {
  return items && items.length > 0 ? items : mockCampaigns as any[];
}

export function useTemplatesFallback(items: any[] | undefined): any[] {
  return items && items.length > 0 ? items : mockTemplates as any[];
}

export function useActivitiesFallback(items: any[] | undefined): any[] {
  return items && items.length > 0 ? items : mockActivities as any[];
}

export function useInsightsFallback(items: any[] | undefined): any[] {
  return items && items.length > 0 ? items : mockAgentInsights as any[];
}

export function useStatsFallback(stats: { total?: number; avgScore?: number; noWebsite?: number; highOpportunity?: number } | undefined) {
  return stats && (stats.total ?? 0) > 0 ? stats : {
    total: 12,
    avgScore: 37.8,
    noWebsite: 7,
    highOpportunity: 8,
  };
}
