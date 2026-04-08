import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      sources,
    } = await request.json() as {
      name: string;
      sources: {
        type: "catalog" | "url" | "text";
        content: string;
      }[];
    };

    if (!name || !sources || sources.length === 0) {
      return NextResponse.json(
        { error: "Name and at least one source are required" },
        { status: 400 }
      );
    }

    // Create profile record with training status
    const { data: profile, error: insertError } = await supabase
      .from("brand_dna_profiles")
      .insert({
        user_id: user.id,
        name,
        training_status: "training",
        trained_from: { sources: sources.map((s) => ({ type: s.type, length: s.content.length })) },
      })
      .select("id")
      .single();

    if (insertError || !profile) {
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    try {
      // Build training content from sources
      let trainingContent = "";
      for (const source of sources) {
        switch (source.type) {
          case "catalog":
            trainingContent += `\n\n--- EXISTING PRODUCT LISTINGS ---\n${source.content}`;
            break;
          case "url":
            trainingContent += `\n\n--- BRAND WEBSITE/URL CONTENT ---\n${source.content}`;
            break;
          case "text":
            trainingContent += `\n\n--- BRAND DESCRIPTION ---\n${source.content}`;
            break;
        }
      }

      // If source is catalog, also pull synced listings
      const catalogSource = sources.find((s) => s.type === "catalog");
      if (catalogSource) {
        const { data: syncedListings } = await supabase
          .from("synced_listings")
          .select("title, description, bullets")
          .eq("user_id", user.id)
          .limit(20);

        if (syncedListings && syncedListings.length > 0) {
          trainingContent += "\n\n--- SYNCED CATALOG LISTINGS ---\n";
          trainingContent += syncedListings.map((l) =>
            `Title: ${l.title}\nDescription: ${l.description}\nBullets: ${(l.bullets || []).join(" | ")}`
          ).join("\n\n");
        }
      }

      // Use Claude to analyze and generate Brand DNA
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: `You are a brand strategist and copywriting expert. Analyze the provided brand content and extract a comprehensive Brand DNA profile.

Return valid JSON only, no other text. The JSON must match this schema:
{
  "tone": "<primary tone descriptor, e.g. 'Premium & Authoritative', 'Warm & Approachable'>",
  "vocabulary": ["<brand-specific words and phrases they frequently use>"],
  "messagingThemes": ["<recurring themes in their messaging>"],
  "valuePropositions": ["<key value props they emphasize>"],
  "styleGuidelines": "<paragraph describing the brand's writing style, sentence structure preferences, and formatting patterns>",
  "voiceProfile": {
    "formality": "<formal/semi-formal/casual/very-casual>",
    "emotion": "<rational/balanced/emotional>",
    "perspective": "<first-person/second-person/third-person>",
    "pacing": "<short-punchy/medium/long-flowing>",
    "technicalLevel": "<expert/intermediate/beginner-friendly>",
    "personality": "<description of brand personality traits>"
  }
}

Be specific and actionable. Extract real patterns from the content, don't generate generic advice.`,
        messages: [
          {
            role: "user",
            content: `Analyze this brand's content and extract their Brand DNA profile:\n${trainingContent.slice(0, 8000)}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Unexpected response type");

      let jsonText = content.text.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      const brandDna = JSON.parse(jsonText);

      // Update profile with training results
      const { error: updateError } = await supabase
        .from("brand_dna_profiles")
        .update({
          voice_profile: brandDna.voiceProfile || {},
          tone: brandDna.tone || "",
          vocabulary: brandDna.vocabulary || [],
          messaging_themes: brandDna.messagingThemes || [],
          value_propositions: brandDna.valuePropositions || [],
          style_guidelines: brandDna.styleGuidelines || "",
          training_status: "complete",
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        profileId: profile.id,
        brandDna,
      });
    } catch (trainError) {
      const errorMessage = trainError instanceof Error ? trainError.message : "Training failed";

      await supabase
        .from("brand_dna_profiles")
        .update({
          training_status: "error",
          error_message: errorMessage,
        })
        .eq("id", profile.id);

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error("Brand DNA train error:", error);
    return NextResponse.json({ error: "Failed to train Brand DNA" }, { status: 500 });
  }
}

// GET: list user's Brand DNA profiles
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profiles, error } = await supabase
      .from("brand_dna_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles: profiles || [] });
  } catch (error) {
    console.error("Brand DNA GET error:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}
