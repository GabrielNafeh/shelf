import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as amazon from "@/lib/marketplace/amazon";
import * as shopify from "@/lib/marketplace/shopify";
import type { Marketplace } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state") || "";
    const isDemo = searchParams.get("demo") === "true";

    // Parse state: "uuid:marketplace:userId"
    const [, marketplace, userId] = stateParam.split(":") as [string, Marketplace, string];

    if (!marketplace || !userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connections?error=invalid_state`
      );
    }

    const supabase = await createClient();

    if (isDemo) {
      // Demo mode — connection was already created in POST
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connections?connected=${marketplace}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connections?error=no_code`
      );
    }

    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresAt: Date | undefined;
    let storeName = "";
    let shopDomain: string | undefined;

    switch (marketplace) {
      case "amazon": {
        const tokens = await amazon.exchangeToken(code);
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
        storeName = "Amazon Seller";
        break;
      }
      case "shopify": {
        const shop = searchParams.get("shop") || "";
        const tokens = await shopify.exchangeToken(shop, code);
        accessToken = tokens.accessToken;
        shopDomain = shop;
        storeName = shop.replace(".myshopify.com", "");
        break;
      }
      default:
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connections?error=unsupported_marketplace`
        );
    }

    // Upsert connection
    const { error } = await supabase
      .from("marketplace_connections")
      .upsert({
        user_id: userId,
        marketplace,
        store_name: storeName,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt?.toISOString(),
        shop_domain: shopDomain,
        status: "connected",
        sync_status: "idle",
        metadata: {},
      }, {
        onConflict: "user_id,marketplace",
      });

    if (error) {
      console.error("Connection upsert error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connections?error=db_error`
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connections?connected=${marketplace}`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connections?error=callback_failed`
    );
  }
}
