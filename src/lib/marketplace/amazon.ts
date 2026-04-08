import type { Marketplace } from "@/lib/types";
import { getMockListings, getMockConnection, type MockListing } from "./mock-data";

const AMAZON_SP_API_BASE = "https://sellingpartnerapi-na.amazon.com";

function isConfigured(): boolean {
  return !!(
    process.env.AMAZON_SP_API_CLIENT_ID &&
    process.env.AMAZON_SP_API_CLIENT_SECRET &&
    process.env.AMAZON_SP_API_REFRESH_TOKEN
  );
}

export function isDemoMode(): boolean {
  return !isConfigured();
}

export function getOAuthUrl(redirectUri: string, state: string): string {
  if (isDemoMode()) {
    return `${redirectUri}?state=${state}&demo=true`;
  }
  const params = new URLSearchParams({
    application_id: process.env.AMAZON_SP_API_APP_ID || "",
    redirect_uri: redirectUri,
    state,
  });
  return `https://sellercentral.amazon.com/apps/authorize/consent?${params.toString()}`;
}

export async function exchangeToken(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  if (isDemoMode()) {
    return {
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      expiresIn: 3600,
    };
  }

  const response = await fetch("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.AMAZON_SP_API_CLIENT_ID!,
      client_secret: process.env.AMAZON_SP_API_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Amazon token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function fetchListings(accessToken: string): Promise<MockListing[]> {
  if (isDemoMode() || accessToken === "demo-access-token") {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));
    return getMockListings("amazon");
  }

  // Real SP-API call
  const response = await fetch(
    `${AMAZON_SP_API_BASE}/listings/2021-08-01/items`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-amz-access-token": accessToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Amazon listing fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  return (data.items || []).map((item: Record<string, unknown>) => ({
    externalId: item.asin as string,
    sku: item.sku as string,
    asin: item.asin as string,
    title: (item.summaries as Array<Record<string, string>>)?.[0]?.itemName || "",
    description: "",
    bullets: [],
    price: 0,
    currency: "USD",
    imageUrls: [],
    status: "active" as const,
    category: "",
    backendKeywords: "",
  }));
}

export function getConnectionInfo() {
  return getMockConnection("amazon");
}

export const marketplace: Marketplace = "amazon";
