import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: invite a member to the team
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, email, role = "viewer" } = await request.json() as {
      teamId: string;
      email: string;
      role?: "admin" | "editor" | "viewer";
    };

    if (!teamId || !email) {
      return NextResponse.json({ error: "Team ID and email are required" }, { status: 400 });
    }

    // Verify user is team owner or admin
    const { data: team } = await supabase
      .from("teams")
      .select("owner_id")
      .eq("id", teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isOwner = team.owner_id === user.id;

    if (!isOwner) {
      const { data: membership } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single();

      if (!membership || membership.role !== "admin") {
        return NextResponse.json({ error: "Only team admins can invite members" }, { status: 403 });
      }
    }

    // Check if already invited
    const { data: existingInvite } = await supabase
      .from("team_invitations")
      .select("id")
      .eq("team_id", teamId)
      .eq("email", email)
      .eq("status", "pending")
      .single();

    if (existingInvite) {
      return NextResponse.json({ error: "This email already has a pending invitation" }, { status: 409 });
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from("team_invitations")
      .insert({
        team_id: teamId,
        email: email.trim().toLowerCase(),
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error("Team invite error:", error);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
