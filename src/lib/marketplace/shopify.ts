import type { Marketplace } from "@/lib/types";
import { getMockListings, getMockConnection, type MockListing } from "./mock-data";

function isConfigured(): boolean {
  return !!(
    process.env.SHOPIFY_API_KEY &&
    process.env.SHOPIFY_API_SECRET
  );
}

export function isDemoMode(): boolean {
  return !isConfigured();
}

export function getOAuthUrl(shop: string, redirectUri: string, state: string): string {
  if (isDemoMode()) {
    return `${redirectUri}?state=${state}&demo=true&shop=${shop}`;
  }
  const scopes = "read_products,read_inventory,read_analytics";
  const params = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY!,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

export async function exchangeToken(shop: string, code: string): Promise<{
  accessToken: string;
}> {
  if (isDemoMode()) {
    return { accessToken: "demo-shopify-token" };
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY!,
      client_secret: process.env.SHOPIFY_API_SECRET!,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token };
}

export async function fetchListings(shop: string, accessToken: string): Promise<MockListing[]> {
  if (isDemoMode() || accessToken === "demo-shopify-token") {
    await new Promise((r) => setTimeout(r, 500));
    return getMockListings("shopify");
  }

  const response = await fetch(
    `https://${shop}/admin/api/2024-01/products.json?limit=50`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify listing fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  return (data.products || []).map((p: Record<string, unknown>) => ({
    externalId: String(p.id),
    sku: (p.variants as Array<Record<string, string>>)?.[0]?.sku || "",
    title: p.title as string,
    description: p.body_html as string || "",
    bullets: [],
    price: parseFloat((p.variants as Array<Record<string, string>>)?.[0]?.price || "0"),
    currency: "USD",
    imageUrls: ((p.images as Array<Record<string, string>>) || []).map((img) => img.src),
    status: (p.status === "active" ? "active" : "draft") as "active" | "draft",
    category: p.product_type as string || "",
    backendKeywords: (p.tags as string) || "",
  }));
}

export function getConnectionInfo() {
  return getMockConnection("shopify");
}

export const marketplace: Marketplace = "shopify";
