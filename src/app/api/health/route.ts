import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateSEOScore } from "@/lib/health/seo-scorer";
import type { Marketplace } from "@/lib/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch synced listings
    const { data: listings, error } = await supabase
      .from("synced_listings")
      .select("id, marketplace, external_id, asin, sku, title, description, bullets, price, image_urls, backend_keywords, status, category, last_synced_at")
      .eq("user_id", user.id)
      .order("last_synced_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate SEO scores for each listing
    const scoredListings = (listings || []).map((listing) => {
      const score = calculateSEOScore({
        title: listing.title,
        bullets: listing.bullets || [],
        description: listing.description || "",
        backendKeywords: listing.backend_keywords || "",
        imageUrls: listing.image_urls || [],
        price: listing.price,
        marketplace: listing.marketplace as Marketplace,
      });

      return {
        id: listing.id,
        marketplace: listing.marketplace,
        externalId: listing.external_id,
        asin: listing.asin,
        sku: listing.sku,
        title: listing.title,
        price: listing.price,
        status: listing.status,
        category: listing.category,
        lastSyncedAt: listing.last_synced_at,
        seoScore: score,
      };
    });

    // Update scores in DB
    for (const listing of scoredListings) {
      await supabase
        .from("synced_listings")
        .update({ seo_score: listing.seoScore.overall })
        .eq("id", listing.id);
    }

    // Summary stats
    const totalListings = scoredListings.length;
    const avgScore = totalListings > 0
      ? Math.round(scoredListings.reduce((sum, l) => sum + l.seoScore.overall, 0) / totalListings)
      : 0;
    const needsAttention = scoredListings.filter((l) => l.seoScore.overall < 50).length;
    const topPerformers = scoredListings.filter((l) => l.seoScore.overall >= 80).length;

    return NextResponse.json({
      listings: scoredListings,
      summary: {
        totalListings,
        avgScore,
        needsAttention,
        topPerformers,
      },
    });
  } catch (error) {
    console.error("Health GET error:", error);
    return NextResponse.json({ error: "Failed to fetch health data" }, { status: 500 });
  }
}
