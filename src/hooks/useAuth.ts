import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  // Single unified me query — backend checks both OAuth + local auth
  const {
    data: user,
    isLoading,
    error,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    // Always run — if no token, backend returns null quickly
  });

  const logoutMutation = trpc.auth.logout.useMutation();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  const logout = useCallback(() => {
    localStorage.removeItem("leadforge_token");
    try {
      logoutMutation.mutate();
    } catch {
      // ignore
    }
    utils.invalidate();
    window.location.href = "/login";
  }, [logoutMutation, utils]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated,
      isAdmin,
      isLoading,
      isMockUser: false,
      error,
      logout,
    }),
    [user, isAuthenticated, isAdmin, isLoading, error, logout],
  );
}
