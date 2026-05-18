import { useState } from "react";
import { Users, Plus, Mail, Shield, UserCheck, Clock, X, AlertCircle, Loader2, Crown, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function TeamPage() {
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"user" | "admin">("user");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const { data: users, isLoading: usersLoading } = trpc.localAuth.listUsers.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: invitations, isLoading: invitesLoading } = trpc.localAuth.listInvitations.useQuery(undefined, {
    enabled: isAdmin,
  });

  const inviteMutation = trpc.localAuth.invite.useMutation({
    onSuccess: () => {
      setInviteEmail("");
      setInviteSuccess("Invitation sent successfully.");
      setInviteError("");
      utils.localAuth.listInvitations.invalidate();
    },
    onError: (err) => {
      setInviteError(err.message);
      setInviteSuccess("");
    },
  });

  const cancelInviteMutation = trpc.localAuth.cancelInvitation.useMutation({
    onSuccess: () => {
      utils.localAuth.listInvitations.invalidate();
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    if (!inviteEmail.trim()) {
      setInviteError("Please enter an email address.");
      return;
    }
    inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Team Management</h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
          Invite collaborators, manage roles, and assign team members
        </p>
      </div>

      {/* Invite Form */}
      <div className="glass-card p-4 sm:p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Plus className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
          Invite Team Member
        </h2>
        {inviteError && (
          <div className="mb-3 p-3 rounded-lg flex items-center gap-2 text-xs" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--status-red)" }}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {inviteError}
          </div>
        )}
        {inviteSuccess && (
          <div className="mb-3 p-3 rounded-lg flex items-center gap-2 text-xs" style={{ background: "rgba(6, 214, 160, 0.1)", border: "1px solid rgba(6, 214, 160, 0.2)", color: "var(--accent-teal)" }}>
            <UserCheck className="w-3.5 h-3.5 shrink-0" /> {inviteSuccess}
          </div>
        )}
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "user" | "admin")}
            className="h-11 px-3 rounded-lg text-sm outline-none cursor-pointer"
            style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            <option value="user">Team Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className="btn-primary flex items-center justify-center gap-2 px-5 h-11 text-sm font-medium shrink-0"
          >
            {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Send Invite
          </button>
        </form>
      </div>

      {/* Team Members */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Users className="w-4 h-4" style={{ color: "var(--accent-teal)" }} />
          Team Members ({users?.length ?? 0})
        </h2>
        {usersLoading ? (
          <div className="flex items-center gap-2 py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-muted)" }} />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading team...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {users?.map((u) => (
              <div key={u.id} className="glass-card p-4 flex items-center gap-4 hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "var(--gradient-hero)", color: "white" }}>
                  {u.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {u.name || "Unnamed"}
                    {u.role === "admin" && (
                      <Crown className="inline w-3.5 h-3.5 ml-1.5" style={{ color: "var(--accent-violet)" }} />
                    )}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: u.role === "admin" ? "rgba(124, 92, 252, 0.1)" : "rgba(6, 214, 160, 0.1)",
                      color: u.role === "admin" ? "var(--accent-violet)" : "var(--accent-teal)",
                    }}>
                    {u.role === "admin" ? "Admin" : "Member"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: u.status === "active" ? "rgba(6, 214, 160, 0.05)" : "rgba(251, 191, 36, 0.05)",
                      color: u.status === "active" ? "var(--accent-teal)" : "var(--status-yellow)",
                      border: `1px solid ${u.status === "active" ? "rgba(6, 214, 160, 0.15)" : "rgba(251, 191, 36, 0.15)"}`,
                    }}>
                    {u.status}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {u.authType}
                  </span>
                </div>
              </div>
            ))}
            {(!users || users.length === 0) && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No team members yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Clock className="w-4 h-4" style={{ color: "var(--status-yellow)" }} />
          Pending Invitations ({invitations?.filter((i) => i.status === "pending").length ?? 0})
        </h2>
        {invitesLoading ? (
          <div className="flex items-center gap-2 py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-muted)" }} />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading invitations...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {invitations?.filter((i) => i.status === "pending").map((inv) => (
              <div key={inv.id} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(251, 191, 36, 0.1)" }}>
                  <Mail className="w-4 h-4" style={{ color: "var(--status-yellow)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{inv.email}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {inv.role} &middot; Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => cancelInviteMutation.mutate({ id: inv.id })}
                  disabled={cancelInviteMutation.isPending}
                  className="p-2 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                  title="Cancel invitation"
                >
                  <X className="w-4 h-4" style={{ color: "var(--status-red)" }} />
                </button>
              </div>
            ))}
            {(!invitations || invitations.filter((i) => i.status === "pending").length === 0) && (
              <div className="text-center py-6">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No pending invitations.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
