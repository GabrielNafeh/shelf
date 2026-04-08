import { NextRequest, NextResponse } from "next/server";
import { scoreExistingListing } from "@/lib/ai/generate";
import type { Marketplace } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingText, marketplace = "amazon", email } = body as {
      listingText: string;
      marketplace?: Marketplace;
      email?: string;
    };

    if (!listingText?.trim()) {
      return NextResponse.json(
        { error: "Listing text is required" },
        { status: 400 }
      );
    }

    if (listingText.length > 10000) {
      return NextResponse.json(
        { error: "Listing text is too long (max 10,000 characters)" },
        { status: 400 }
      );
    }

    const score = await scoreExistingListing(listingText, marketplace);

    // Optionally save for lead gen (no auth required)
    // In production, save to Supabase score_checks table using service role key

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Score error:", error);
    return NextResponse.json(
      { error: "Failed to score listing. Please try again." },
      { status: 500 }
    );
  }
}
