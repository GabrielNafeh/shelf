import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: get user's team(s)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teams the user owns
    const { data: ownedTeams } = await supabase
      .from("teams")
      .select("*")
      .eq("owner_id", user.id);

    // Get teams the user is a member of
    const { data: memberships } = await supabase
      .from("team_members")
      .select("team_id, role")
      .eq("user_id", user.id);

    const memberTeamIds = (memberships || []).map((m) => m.team_id);
    let memberTeams: typeof ownedTeams = [];

    if (memberTeamIds.length > 0) {
      const { data } = await supabase
        .from("teams")
        .select("*")
        .in("id", memberTeamIds);
      memberTeams = data;
    }

    // Merge and deduplicate
    const allTeams = [...(ownedTeams || []), ...(memberTeams || [])];
    const uniqueTeams = allTeams.filter(
      (team, index, self) => self.findIndex((t) => t.id === team.id) === index
    );

    // Get members for each team
    const teamsWithMembers = await Promise.all(
      uniqueTeams.map(async (team) => {
        const { data: members } = await supabase
          .from("team_members")
          .select("id, user_id, role, joined_at")
          .eq("team_id", team.id);

        // Get profile info for each member
        const membersWithProfiles = await Promise.all(
          (members || []).map(async (member) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("id", member.user_id)
              .single();

            return {
              ...member,
              email: profile?.email || "",
              fullName: profile?.full_name || "",
            };
          })
        );

        // Get pending invitations
        const { data: invitations } = await supabase
          .from("team_invitations")
          .select("*")
          .eq("team_id", team.id)
          .eq("status", "pending");

        const userRole = team.owner_id === user.id
          ? "owner"
          : (memberships || []).find((m) => m.team_id === team.id)?.role || "viewer";

        return {
          ...team,
          members: membersWithProfiles,
          invitations: invitations || [],
          userRole,
        };
      })
    );

    return NextResponse.json({ teams: teamsWithMembers });
  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

// POST: create a new team
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        name: name.trim(),
        owner_id: user.id,
        slug,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add owner as admin member
    await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "admin",
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Team POST error:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
