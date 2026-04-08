import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Marketplace } from "@/lib/types";

// Mock keyword rank data
function generateMockRank() {
  const rank = Math.floor(1 + Math.random() * 100);
  const previousRank = rank + Math.floor(Math.random() * 20) - 10;
  const searchVolume = Math.floor(500 + Math.random() * 50000);
  const trend = rank < previousRank ? "up" : rank > previousRank ? "down" : "stable";

  return { rank, previousRank: Math.max(1, previousRank), searchVolume, trend };
}

// GET: list tracked keywords
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: keywords, error } = await supabase
      .from("keyword_ranks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ keywords: keywords || [] });
  } catch (error) {
    console.error("Keywords GET error:", error);
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 });
  }
}

// POST: add a keyword to track
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyword, asin, marketplace = "amazon" } = await request.json() as {
      keyword: string;
      asin?: string;
      marketplace?: Marketplace;
    };

    if (!keyword?.trim()) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }

    const mock = generateMockRank();

    const { data: keywordRank, error } = await supabase
      .from("keyword_ranks")
      .insert({
        user_id: user.id,
        marketplace,
        keyword: keyword.trim().toLowerCase(),
        asin: asin || null,
        current_rank: mock.rank,
        previous_rank: mock.previousRank,
        best_rank: Math.min(mock.rank, mock.previousRank),
        search_volume: mock.searchVolume,
        trend: mock.trend,
        last_checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add initial history entry
    await supabase.from("keyword_rank_history").insert({
      keyword_rank_id: keywordRank.id,
      rank: mock.rank,
      page: Math.ceil(mock.rank / 16),
    });

    return NextResponse.json({ keyword: keywordRank });
  } catch (error) {
    console.error("Keywords POST error:", error);
    return NextResponse.json({ error: "Failed to add keyword" }, { status: 500 });
  }
}

// DELETE: remove a tracked keyword
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    const { error } = await supabase
      .from("keyword_ranks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Keywords DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete keyword" }, { status: 500 });
  }
}
