import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH: update member role
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId, role } = await request.json() as {
      memberId: string;
      role: "admin" | "editor" | "viewer";
    };

    // Get the member's team to verify permissions
    const { data: member } = await supabase
      .from("team_members")
      .select("team_id, user_id")
      .eq("id", memberId)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Verify caller is team owner or admin
    const { data: team } = await supabase
      .from("teams")
      .select("owner_id")
      .eq("id", member.team_id)
      .single();

    if (!team || team.owner_id !== user.id) {
      const { data: callerMembership } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", member.team_id)
        .eq("user_id", user.id)
        .single();

      if (!callerMembership || callerMembership.role !== "admin") {
        return NextResponse.json({ error: "Only admins can change roles" }, { status: 403 });
      }
    }

    const { error } = await supabase
      .from("team_members")
      .update({ role })
      .eq("id", memberId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Team member PATCH error:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

// DELETE: remove a member from the team
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId } = await request.json();

    const { data: member } = await supabase
      .from("team_members")
      .select("team_id, user_id")
      .eq("id", memberId)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Users can remove themselves; admins/owners can remove others
    if (member.user_id !== user.id) {
      const { data: team } = await supabase
        .from("teams")
        .select("owner_id")
        .eq("id", member.team_id)
        .single();

      if (!team || team.owner_id !== user.id) {
        const { data: callerMembership } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", member.team_id)
          .eq("user_id", user.id)
          .single();

        if (!callerMembership || callerMembership.role !== "admin") {
          return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
        }
      }
    }

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Team member DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
