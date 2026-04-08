import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as amazon from "@/lib/marketplace/amazon";
import * as shopify from "@/lib/marketplace/shopify";
import type { Marketplace } from "@/lib/types";
import crypto from "crypto";

// GET: list all marketplace connections for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: connections, error } = await supabase
      .from("marketplace_connections")
      .select("id, marketplace, store_name, status, sync_status, last_sync_at, error_message, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ connections: connections || [] });
  } catch (error) {
    console.error("Connections GET error:", error);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}

// POST: initiate a new marketplace connection (returns OAuth URL or connects in demo mode)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { marketplace, shopDomain } = await request.json() as {
      marketplace: Marketplace;
      shopDomain?: string;
    };

    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace is required" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const state = crypto.randomUUID();
    let oauthUrl: string;
    let isDemo = false;

    switch (marketplace) {
      case "amazon":
        isDemo = amazon.isDemoMode();
        oauthUrl = amazon.getOAuthUrl(
          `${appUrl}/api/connections/callback`,
          `${state}:${marketplace}:${user.id}`
        );
        break;
      case "shopify":
        if (!shopDomain && !shopify.isDemoMode()) {
          return NextResponse.json({ error: "Shop domain is required for Shopify" }, { status: 400 });
        }
        isDemo = shopify.isDemoMode();
        oauthUrl = shopify.getOAuthUrl(
          shopDomain || "demo-store.myshopify.com",
          `${appUrl}/api/connections/callback`,
          `${state}:${marketplace}:${user.id}`
        );
        break;
      default:
        // For walmart/etsy, use demo mode
        isDemo = true;
        oauthUrl = `${appUrl}/api/connections/callback?state=${state}:${marketplace}:${user.id}&demo=true`;
    }

    // In demo mode, create the connection directly
    if (isDemo) {
      const connInfo = marketplace === "amazon"
        ? amazon.getConnectionInfo()
        : shopify.getConnectionInfo();

      const { data: connection, error } = await supabase
        .from("marketplace_connections")
        .upsert({
          user_id: user.id,
          marketplace,
          store_name: connInfo.storeName,
          seller_id: connInfo.sellerId,
          shop_domain: connInfo.shopDomain,
          access_token: "demo-token",
          refresh_token: "demo-token",
          status: "connected",
          sync_status: "idle",
          metadata: { demo: true },
        }, {
          onConflict: "user_id,marketplace",
        })
        .select("id, marketplace, store_name, status, sync_status")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        connection,
        demo: true,
        message: `Connected to ${marketplace} in demo mode`,
      });
    }

    return NextResponse.json({ oauthUrl, state });
  } catch (error) {
    console.error("Connection POST error:", error);
    return NextResponse.json({ error: "Failed to initiate connection" }, { status: 500 });
  }
}
