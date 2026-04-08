import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateListings } from "@/lib/ai/generate";
import type { Marketplace, ProductInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check usage limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, listings_used_this_month, listings_limit")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.listings_used_this_month >= profile.listings_limit) {
      return NextResponse.json(
        { error: "Monthly listing limit reached. Upgrade your plan for more." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      product,
      marketplaces,
      brandVoiceId,
    }: {
      product: ProductInput;
      marketplaces: Marketplace[];
      brandVoiceId?: string;
    } = body;

    if (!product?.name || !marketplaces?.length) {
      return NextResponse.json(
        { error: "Product name and at least one marketplace are required" },
        { status: 400 }
      );
    }

    // Fetch brand voice if specified
    let brandVoice;
    if (brandVoiceId) {
      const { data: bv } = await supabase
        .from("brand_voices")
        .select("tone, guidelines, vocabulary")
        .eq("id", brandVoiceId)
        .eq("user_id", user.id)
        .single();
      if (bv) brandVoice = bv;
    }

    // If no brand voice specified, check for active Brand DNA profile
    if (!brandVoice) {
      const { data: dnaProfile } = await supabase
        .from("brand_dna_profiles")
        .select("tone, style_guidelines, vocabulary, messaging_themes, value_propositions")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .eq("training_status", "complete")
        .single();

      if (dnaProfile) {
        brandVoice = {
          tone: dnaProfile.tone,
          guidelines: [
            dnaProfile.style_guidelines,
            dnaProfile.messaging_themes?.length > 0
              ? `Key themes: ${dnaProfile.messaging_themes.join(", ")}`
              : "",
            dnaProfile.value_propositions?.length > 0
              ? `Value propositions: ${dnaProfile.value_propositions.join(", ")}`
              : "",
          ].filter(Boolean).join("\n"),
          vocabulary: dnaProfile.vocabulary || [],
        };
      }
    }

    // Create listing record
    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        user_id: user.id,
        product_name: product.name,
        product_input: product,
        brand_voice_id: brandVoiceId || null,
        status: "generating",
      })
      .select("id")
      .single();

    if (insertError || !listing) {
      return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
    }

    // Generate with AI
    const outputs = await generateListings({ product, marketplaces, brandVoice });

    // Save outputs
    const outputRecords = outputs.map((o) => ({
      listing_id: listing.id,
      marketplace: o.marketplace,
      title: o.title,
      bullets: o.bullets,
      description: o.description,
      backend_keywords: o.backendKeywords,
      meta_title: o.metaTitle,
      meta_description: o.metaDescription,
      tags: o.tags,
      schema_markup: o.schemaMarkup,
      seo_score: o.seoScore,
    }));

    await supabase.from("listing_outputs").insert(outputRecords);

    // Update listing status
    await supabase
      .from("listings")
      .update({ status: "complete" })
      .eq("id", listing.id);

    // Increment usage
    await supabase
      .from("profiles")
      .update({
        listings_used_this_month: profile.listings_used_this_month + 1,
      })
      .eq("id", user.id);

    return NextResponse.json({
      listingId: listing.id,
      outputs,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate listings. Please try again." },
      { status: 500 }
    );
  }
}
