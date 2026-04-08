import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as amazon from "@/lib/marketplace/amazon";
import * as shopify from "@/lib/marketplace/shopify";
import { getMockListings } from "@/lib/marketplace/mock-data";
import type { Marketplace } from "@/lib/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  try {
    const { connectionId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the connection
    const { data: connection, error: connError } = await supabase
      .from("marketplace_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("user_id", user.id)
      .single();

    if (connError || !connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (connection.status !== "connected") {
      return NextResponse.json({ error: "Connection is not active" }, { status: 400 });
    }

    // Set sync status
    await supabase
      .from("marketplace_connections")
      .update({ sync_status: "syncing" })
      .eq("id", connectionId);

    try {
      const marketplace = connection.marketplace as Marketplace;
      let rawListings;

      switch (marketplace) {
        case "amazon":
          rawListings = await amazon.fetchListings(connection.access_token || "");
          break;
        case "shopify":
          rawListings = await shopify.fetchListings(
            connection.shop_domain || "",
            connection.access_token || ""
          );
          break;
        default:
          // Walmart/Etsy use mock data
          rawListings = getMockListings(marketplace);
      }

      // Upsert synced listings
      const listingRecords = rawListings.map((l) => ({
        connection_id: connectionId,
        user_id: user.id,
        marketplace,
        external_id: l.externalId,
        sku: l.sku,
        asin: l.asin || null,
        title: l.title,
        description: l.description,
        bullets: l.bullets,
        price: l.price,
        currency: l.currency,
        image_urls: l.imageUrls,
        status: l.status,
        category: l.category,
        backend_keywords: l.backendKeywords,
        raw_data: l,
        last_synced_at: new Date().toISOString(),
      }));

      for (const record of listingRecords) {
        await supabase
          .from("synced_listings")
          .upsert(record, { onConflict: "connection_id,external_id" });
      }

      // Update connection sync status
      await supabase
        .from("marketplace_connections")
        .update({
          sync_status: "idle",
          last_sync_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", connectionId);

      return NextResponse.json({
        success: true,
        synced: listingRecords.length,
        marketplace,
      });
    } catch (syncError) {
      const errorMessage = syncError instanceof Error ? syncError.message : "Sync failed";

      await supabase
        .from("marketplace_connections")
        .update({
          sync_status: "error",
          error_message: errorMessage,
        })
        .eq("id", connectionId);

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
