import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  const { data: oauthUser, isLoading: oauthLoading } = trpc.auth.me.useQuery(
    undefined,
    {
      staleTime: 1000 * 60 * 5,
      retry: false,
      enabled: !localStorage.getItem("leadforge_token"),
    }
  );

  const { data: localUser, isLoading: localLoading } = trpc.localAuth.me.useQuery(
    undefined,
    {
      staleTime: 1000 * 60 * 5,
      retry: false,
      enabled: !!localStorage.getItem("leadforge_token"),
    }
  );

  const logoutMutation = trpc.auth.logout.useMutation();

  // Prefer OAuth user, then local user
  const user = oauthUser ?? localUser ?? null;
  const isLoading = oauthLoading || localLoading;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isMockUser = false;

  const logout = useCallback(() => {
    // Always clear local token
    localStorage.removeItem("leadforge_token");
    // Also clear OAuth cookie (best effort)
    try {
      logoutMutation.mutate();
    } catch {
      // ignore
    }
    // Reset all queries and reload
    utils.invalidate();
    window.location.href = "/login";
  }, [logoutMutation, utils]);

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      isAdmin,
      isLoading,
      isMockUser,
      error: null,
      logout,
    }),
    [user, isAuthenticated, isAdmin, isLoading, isMockUser, logout],
  );
}
