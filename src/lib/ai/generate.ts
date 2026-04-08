import Anthropic from "@anthropic-ai/sdk";
import type { Marketplace, ProductInput, ListingOutput } from "@/lib/types";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface GenerateOptions {
  product: ProductInput;
  marketplaces: Marketplace[];
  brandVoice?: {
    tone: string;
    guidelines: string;
    vocabulary: string[];
  };
}

export async function generateListings(options: GenerateOptions): Promise<ListingOutput[]> {
  const { product, marketplaces, brandVoice } = options;

  // Use Haiku for cost efficiency, Sonnet for premium quality
  const model = "claude-haiku-4-5-20251001";

  const systemPrompt = buildSystemPrompt(marketplaces[0], brandVoice);
  const userPrompt = buildUserPrompt(product, marketplaces);

  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  // Parse JSON from response, handling potential markdown code fences
  let jsonText = content.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(jsonText);
  const listings: ListingOutput[] = parsed.listings.map((l: Record<string, unknown>) => ({
    marketplace: l.marketplace as Marketplace,
    title: l.title as string,
    bullets: (l.bullets as string[]) || [],
    description: l.description as string,
    backendKeywords: (l.backendKeywords as string) || "",
    metaTitle: (l.metaTitle as string) || "",
    metaDescription: (l.metaDescription as string) || "",
    tags: (l.tags as string[]) || [],
    schemaMarkup: (l.schemaMarkup as string) || "",
    seoScore: (l.seoScore as number) || 0,
  }));

  return listings;
}

export async function scoreExistingListing(
  listingText: string,
  marketplace: Marketplace = "amazon"
): Promise<{
  overall: number;
  titleScore: number;
  descriptionScore: number;
  keywordScore: number;
  readabilityScore: number;
  seoScore: number;
  suggestions: string[];
}> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: `You are an expert e-commerce listing analyst. Score product listings on a 0-100 scale across multiple dimensions. Be critical but fair. Provide actionable suggestions.

Return valid JSON only, no other text.`,
    messages: [
      {
        role: "user",
        content: `Score this ${marketplace.toUpperCase()} product listing:

${listingText}

Return JSON:
{
  "overall": <0-100>,
  "titleScore": <0-100>,
  "descriptionScore": <0-100>,
  "keywordScore": <0-100>,
  "readabilityScore": <0-100>,
  "seoScore": <0-100>,
  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
}

Score strictly. Average listings should score 40-60. Only excellent listings score 80+. Provide 3-7 specific, actionable suggestions.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  let jsonText = content.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(jsonText);
}
