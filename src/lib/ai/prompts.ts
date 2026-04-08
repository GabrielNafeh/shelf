import type { Marketplace, ProductInput } from "@/lib/types";

export function buildSystemPrompt(marketplace: Marketplace, brandVoice?: { tone: string; guidelines: string; vocabulary: string[] }) {
  const marketplaceRules = MARKETPLACE_RULES[marketplace];

  let prompt = `You are an expert e-commerce listing copywriter and SEO specialist. You write product listings that convert browsers into buyers.

Your output must be valid JSON matching the schema provided. Do not include any text outside the JSON.

MARKETPLACE: ${marketplaceRules.name}
${marketplaceRules.rules}

GENERAL PRINCIPLES:
- Lead with the primary benefit, not features
- Use sensory and emotional language that helps shoppers visualize using the product
- Include relevant search keywords naturally — never keyword-stuff
- Every bullet should address a unique benefit or objection
- Write for the scanner: most shoppers skim, not read
- Include social proof cues where natural ("trusted by...", "rated...", "chosen by...")
- Address the top 3 customer objections proactively
- Use power words: premium, guaranteed, effortless, proven, exclusive

SEO OPTIMIZATION:
- Place the most important keywords in the title (front-loaded)
- Use long-tail keyword variations in bullets and description
- Include semantic keyword variations (synonyms, related terms)
- For agentic commerce: include structured attributes that AI shopping assistants can parse

SCHEMA.ORG OPTIMIZATION (for AI agent discoverability):
- Generate JSON-LD Schema.org Product markup
- Include: name, description, brand, category, material, color, size if applicable
- This helps AI shopping agents (ChatGPT Shopping, Perplexity, Google AI) recommend the product`;

  if (brandVoice) {
    prompt += `

BRAND VOICE:
- Tone: ${brandVoice.tone}
- Guidelines: ${brandVoice.guidelines}
${brandVoice.vocabulary.length > 0 ? `- Preferred vocabulary: ${brandVoice.vocabulary.join(", ")}` : ""}`;
  }

  return prompt;
}

export function buildUserPrompt(product: ProductInput, marketplaces: Marketplace[]) {
  const marketplaceList = marketplaces.map((m) => MARKETPLACE_RULES[m].name).join(", ");

  let prompt = `Generate optimized product listings for the following product across these marketplaces: ${marketplaceList}

PRODUCT INFORMATION:
- Name: ${product.name}`;

  if (product.brand) prompt += `\n- Brand: ${product.brand}`;
  if (product.category) prompt += `\n- Category: ${product.category}`;
  if (product.description) prompt += `\n- Raw Description: ${product.description}`;
  if (product.price) prompt += `\n- Price: $${product.price}`;
  if (product.features && product.features.length > 0) {
    prompt += `\n- Features: ${product.features.join("; ")}`;
  }
  if (product.specs && Object.keys(product.specs).length > 0) {
    prompt += `\n- Specs: ${Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join("; ")}`;
  }
  if (product.targetKeywords && product.targetKeywords.length > 0) {
    prompt += `\n- Target Keywords: ${product.targetKeywords.join(", ")}`;
  }
  if (product.url) prompt += `\n- Product URL: ${product.url}`;

  prompt += `

Respond with a JSON object with this exact structure:
{
  "listings": [
    {
      "marketplace": "<marketplace_id>",
      "title": "<optimized title>",
      "bullets": ["<bullet 1>", "<bullet 2>", ...],
      "description": "<full HTML-free description>",
      "backendKeywords": "<comma-separated backend/search terms>",
      "metaTitle": "<SEO meta title, 60 chars max>",
      "metaDescription": "<SEO meta description, 160 chars max>",
      "tags": ["<tag1>", "<tag2>", ...],
      "schemaMarkup": "<JSON-LD Schema.org Product markup as a string>",
      "seoScore": <estimated SEO score 0-100>
    }
  ]
}

Generate one listing object per marketplace. Ensure each listing follows that marketplace's specific formatting rules and character limits.`;

  return prompt;
}

const MARKETPLACE_RULES: Record<Marketplace, { name: string; rules: string }> = {
  amazon: {
    name: "Amazon",
    rules: `AMAZON LISTING RULES:
- Title: Max 200 characters. Format: Brand + Product Name + Key Feature + Size/Variant
- Title: Capitalize first letter of each word (except prepositions)
- Bullets: Exactly 5 bullet points. Start each with ALL CAPS benefit header followed by colon
- Bullets: Max 500 characters each. Focus on benefits, not just features
- Description: Max 2000 characters. Use natural paragraph flow
- Backend Keywords: Max 250 bytes. Comma-separated. No brand names, no ASINs, no subjective claims
- Do NOT include pricing, shipping info, or promotional language in bullets/description
- Do NOT use HTML in Amazon listings`,
  },
  shopify: {
    name: "Shopify",
    rules: `SHOPIFY LISTING RULES:
- Title: Max 70 characters for optimal SEO. Clean, readable, keyword-rich
- Description: Rich text (but output as clean text, no HTML). Can be longer and more narrative
- Max 5000 characters for description. Tell a story about the product
- Meta Title: Max 60 characters for Google SERP
- Meta Description: Max 160 characters. Include call-to-action
- Tags: 5-10 relevant tags for internal search and collections
- Focus on brand storytelling and lifestyle positioning`,
  },
  walmart: {
    name: "Walmart",
    rules: `WALMART LISTING RULES:
- Title: Max 75 characters. Format: Brand + Product Name + Key Attributes (Size, Color, Count)
- Title: Do NOT include special characters or all caps
- Bullets: 3-5 key feature bullets. Clear, concise, benefit-focused
- Description: Max 4000 characters. Detailed but scannable
- Shelf Description (short): Max 500 characters
- Keywords: Include in title and bullets naturally
- Walmart penalizes keyword stuffing more aggressively than Amazon`,
  },
  etsy: {
    name: "Etsy",
    rules: `ETSY LISTING RULES:
- Title: Max 140 characters. Front-load with primary search keywords
- Title: Use natural language, not keyword spam. Etsy search is semantic
- Description: Max 3000 characters. Personal, storytelling tone works best
- Start description with the most important info (mobile truncation)
- Tags: Exactly 13 tags. Use multi-word phrases, not single words
- Include materials, dimensions, care instructions in description
- Emphasize handmade, unique, gift-worthy aspects if applicable`,
  },
};
