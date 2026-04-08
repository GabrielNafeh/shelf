"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Mail,
  Trash2,
  Shield,
  Pen,
  Eye,
  Crown,
  Loader2,
  UserPlus,
  Clock,
  X,
} from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  email: string;
  fullName: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  owner_id: string;
  slug: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
  userRole: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  owner: { label: "Owner", icon: Crown, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  admin: { label: "Admin", icon: Shield, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  editor: { label: "Editor", icon: Pen, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  viewer: { label: "Viewer", icon: Eye, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor");

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setTeams(data.teams || []);
    } catch {
      console.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName }),
      });
      if (res.ok) {
        setTeamName("");
        setShowCreateForm(false);
        await fetchTeams();
      }
    } catch {
      console.error("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async (teamId: string) => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setInviteEmail("");
        setShowInviteForm(false);
        await fetchTeams();
      }
    } catch {
      console.error("Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await fetch("/api/team/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      await fetchTeams();
    } catch {
      console.error("Failed to remove member");
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await fetch("/api/team/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      await fetchTeams();
    } catch {
      console.error("Failed to change role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their access levels
          </p>
        </div>
        {teams.length === 0 && (
          <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {showCreateForm ? "Cancel" : "Create Team"}
          </Button>
        )}
      </div>

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold">Create a New Team</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Team name (e.g., My Agency)"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
            />
            <Button onClick={handleCreateTeam} disabled={creating || !teamName.trim()}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </div>
      )}

      {/* No Teams */}
      {teams.length === 0 && !showCreateForm && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No team yet</h3>
          <p className="text-muted-foreground mt-1">
            Create a team to invite members and collaborate on listings
          </p>
          <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Create Your Team
          </Button>
        </div>
      )}

      {/* Teams */}
      {teams.map((team) => {
        const isAdmin = team.userRole === "owner" || team.userRole === "admin";

        return (
          <div key={team.id} className="rounded-lg border bg-card">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{team.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                </p>
              </div>
              {isAdmin && (
                <Button size="sm" onClick={() => setShowInviteForm(!showInviteForm)}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Invite Member
                </Button>
              )}
            </div>

            {/* Invite Form */}
            {showInviteForm && isAdmin && (
              <div className="p-4 border-b bg-muted/30 space-y-3">
                <h4 className="text-sm font-semibold">Invite a Team Member</h4>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "editor" | "viewer")}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Button
                    onClick={() => handleInvite(team.id)}
                    disabled={inviting || !inviteEmail.trim()}
                  >
                    {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 mr-1" />}
                    {inviting ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="divide-y">
              {team.members.map((member) => {
                const roleConfig = ROLE_CONFIG[
                  member.user_id === team.owner_id ? "owner" : member.role
                ];
                const RoleIcon = roleConfig.icon;
                const isOwner = member.user_id === team.owner_id;

                return (
                  <div key={member.id} className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {(member.fullName || member.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.fullName || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <Badge className={`${roleConfig.color} text-xs`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {roleConfig.label}
                    </Badge>
                    {isAdmin && !isOwner && (
                      <div className="flex gap-1">
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value)}
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pending Invitations */}
            {team.invitations.length > 0 && (
              <div className="border-t">
                <div className="p-3 bg-muted/30">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pending Invitations
                  </h4>
                </div>
                <div className="divide-y">
                  {team.invitations.map((inv) => (
                    <div key={inv.id} className="px-4 py-3 flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm">{inv.email}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {inv.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
