import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Marketplace } from "@/lib/types";

// Mock competitor data for demo mode
function generateMockCompetitorData(asin: string) {
  const price = Math.round((15 + Math.random() * 85) * 100) / 100;
  const bsr = Math.floor(1000 + Math.random() * 50000);
  const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
  const reviewCount = Math.floor(50 + Math.random() * 2000);

  const titles = [
    "Premium Quality Product - Best Seller in Category",
    "Professional Grade Item with Enhanced Features",
    "Top Rated Product - Customer Favorite Choice",
    "Ultra Durable Design with Lifetime Warranty",
    "All-in-One Solution for Home and Office Use",
  ];

  const brands = ["BrandX", "ProLine", "EliteGoods", "ValueMax", "PrimeCraft"];

  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    brand: brands[Math.floor(Math.random() * brands.length)],
    currentPrice: price,
    currentBsr: bsr,
    currentRating: rating,
    currentReviewCount: reviewCount,
    imageUrl: `https://placehold.co/200x200/e2e8f0/475569?text=${asin}`,
    category: "General",
  };
}

// POST: add a competitor to track
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { asin, url, marketplace = "amazon" } = await request.json() as {
      asin?: string;
      url?: string;
      marketplace?: Marketplace;
    };

    if (!asin && !url) {
      return NextResponse.json({ error: "ASIN or URL is required" }, { status: 400 });
    }

    const externalId = asin || url || "";
    const mockData = generateMockCompetitorData(externalId);

    const { data: competitor, error } = await supabase
      .from("competitors")
      .insert({
        user_id: user.id,
        marketplace,
        external_id: externalId,
        asin: asin || null,
        url: url || null,
        title: mockData.title,
        brand: mockData.brand,
        current_price: mockData.currentPrice,
        current_bsr: mockData.currentBsr,
        current_rating: mockData.currentRating,
        current_review_count: mockData.currentReviewCount,
        image_url: mockData.imageUrl,
        category: mockData.category,
        status: "active",
        last_checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create initial snapshot
    await supabase.from("competitor_snapshots").insert({
      competitor_id: competitor.id,
      price: mockData.currentPrice,
      bsr: mockData.currentBsr,
      rating: mockData.currentRating,
      review_count: mockData.currentReviewCount,
      in_stock: true,
    });

    return NextResponse.json({ competitor });
  } catch (error) {
    console.error("Competitor analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze competitor" }, { status: 500 });
  }
}

// GET: list tracked competitors
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: competitors, error } = await supabase
      .from("competitors")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch recent snapshots for each competitor
    const competitorsWithHistory = await Promise.all(
      (competitors || []).map(async (comp) => {
        const { data: snapshots } = await supabase
          .from("competitor_snapshots")
          .select("*")
          .eq("competitor_id", comp.id)
          .order("captured_at", { ascending: false })
          .limit(30);

        return { ...comp, snapshots: snapshots || [] };
      })
    );

    return NextResponse.json({ competitors: competitorsWithHistory });
  } catch (error) {
    console.error("Competitors GET error:", error);
    return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
  }
}

// DELETE: remove a competitor
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    const { error } = await supabase
      .from("competitors")
      .update({ status: "removed" })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Competitor DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove competitor" }, { status: 500 });
  }
}
