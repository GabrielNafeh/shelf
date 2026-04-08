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

    const { productName, productDescription, marketplace = "amazon", dailyBudget = 25, targetAcos = 25 } = await request.json();

    if (!productName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: `You are an expert Amazon PPC advertising strategist. Generate a complete PPC campaign with keyword suggestions, bid amounts, and strategy.

Return valid JSON only, no other text. The JSON must match this schema:
{
  "campaignName": "<descriptive campaign name>",
  "campaignType": "sponsored_products",
  "bidStrategy": "dynamic_up_down",
  "keywords": [
    {
      "keyword": "<search term>",
      "matchType": "exact|phrase|broad",
      "suggestedBid": <number>,
      "estimatedSearchVolume": <number>,
      "competitionLevel": "low|medium|high"
    }
  ],
  "negativeKeywords": ["<keyword to exclude>"],
  "estimatedAcos": <number>,
  "estimatedDailyImpressions": <number>,
  "strategy": "<1-2 sentence strategy recommendation>"
}

Generate 8-12 keywords with a mix of exact, phrase, and broad match types. Be specific and actionable.`,
      messages: [
        {
          role: "user",
          content: `Generate a PPC campaign for this product on ${marketplace.toUpperCase()}:

Product: ${productName}
${productDescription ? `Description: ${productDescription}` : ""}
Daily Budget: $${dailyBudget}
Target ACOS: ${targetAcos}%

Generate keyword suggestions with bid amounts optimized for the given budget and target ACOS.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const campaign = JSON.parse(jsonText);

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Ad generate error:", error);
    return NextResponse.json({ error: "Failed to generate campaign" }, { status: 500 });
  }
}
