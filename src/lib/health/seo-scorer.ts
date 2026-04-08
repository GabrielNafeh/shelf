import type { Marketplace, SEOHealthScore } from "@/lib/types";
import { MARKETPLACE_CONFIG } from "@/lib/types";

interface ListingData {
  title: string;
  bullets: string[];
  description: string;
  backendKeywords: string;
  imageUrls: string[];
  price?: number;
  marketplace: Marketplace;
}

function scoreTitleLength(title: string, marketplace: Marketplace): { score: number; recommendation?: string } {
  const config = MARKETPLACE_CONFIG[marketplace];
  const len = title.length;
  const max = config.titleMaxLength;

  if (len === 0) return { score: 0, recommendation: "Title is missing — add a descriptive product title" };
  if (len < 30) return { score: 20, recommendation: "Title is too short — aim for at least 80 characters with relevant keywords" };
  if (len < 80) return { score: 50, recommendation: `Title could be longer — use more of the ${max} character limit` };
  if (len > max) return { score: 40, recommendation: `Title exceeds ${max} character limit for ${config.name} — shorten it` };
  if (len >= max * 0.6 && len <= max) return { score: 90 };
  return { score: 70 };
}

function scoreTitleKeywords(title: string): { score: number; recommendation?: string } {
  const words = title.split(/\s+/).length;
  const hasNumbers = /\d/.test(title);
  const hasBrand = title.length > 0; // Simplified check

  let score = 50;
  if (words >= 8) score += 15;
  if (words >= 12) score += 10;
  if (hasNumbers) score += 10;
  if (hasBrand) score += 5;
  if (/[|–—,]/.test(title)) score += 10; // Has separators for readability

  const recommendation = score < 70 ? "Add more relevant keywords, size/quantity details, and brand name to your title" : undefined;
  return { score: Math.min(score, 100), recommendation };
}

function scoreBullets(bullets: string[], marketplace: Marketplace): { score: number; recommendation?: string } {
  const config = MARKETPLACE_CONFIG[marketplace];
  const expected = config.bulletsCount;

  if (expected === 0) {
    // Shopify/Etsy don't use bullet points
    return { score: 100 };
  }

  if (bullets.length === 0) {
    return { score: 0, recommendation: `Add ${expected} bullet points highlighting key features and benefits` };
  }

  let score = 0;

  // Count score
  const countRatio = Math.min(bullets.length / expected, 1);
  score += countRatio * 40;

  // Length score — each bullet should be 100-250 chars
  const goodLengthBullets = bullets.filter((b) => b.length >= 80 && b.length <= 300).length;
  score += (goodLengthBullets / Math.max(bullets.length, 1)) * 30;

  // Caps usage — Amazon bullets often start with a CAPS phrase
  const hasCapsStart = bullets.filter((b) => /^[A-Z][A-Z\s&]+[:\-–]/.test(b)).length;
  score += (hasCapsStart / Math.max(bullets.length, 1)) * 15;

  // Keyword density — check for common patterns
  const avgLength = bullets.reduce((sum, b) => sum + b.length, 0) / Math.max(bullets.length, 1);
  if (avgLength >= 100) score += 15;

  const recommendations: string[] = [];
  if (bullets.length < expected) recommendations.push(`Add ${expected - bullets.length} more bullet points`);
  if (avgLength < 80) recommendations.push("Make bullet points more detailed (aim for 100-250 characters each)");
  if (hasCapsStart < bullets.length * 0.5) recommendations.push("Start each bullet with a CAPITALIZED benefit phrase");

  return {
    score: Math.min(Math.round(score), 100),
    recommendation: recommendations[0],
  };
}

function scoreDescription(description: string, marketplace: Marketplace): { score: number; recommendation?: string } {
  const config = MARKETPLACE_CONFIG[marketplace];
  const len = description.length;
  const max = config.descriptionMaxLength;

  if (len === 0) return { score: 0, recommendation: "Add a product description with keywords and benefits" };
  if (len < 100) return { score: 25, recommendation: "Description is too short — expand with features, benefits, and use cases" };
  if (len < 300) return { score: 50, recommendation: "Description could be more detailed — aim for 500+ characters" };
  if (len > max) return { score: 60, recommendation: `Description exceeds ${max} character limit — trim it down` };

  let score = 70;
  if (len >= 500) score += 10;
  if (len >= 1000) score += 10;
  if (/\n/.test(description)) score += 5; // Has formatting
  if (/[A-Z][a-z]+/.test(description)) score += 5; // Proper capitalization

  return { score: Math.min(score, 100) };
}

function scoreKeywords(backendKeywords: string, marketplace: Marketplace): { score: number; recommendation?: string } {
  if (marketplace !== "amazon" && marketplace !== "walmart") {
    // Backend keywords are mainly an Amazon/Walmart concept
    return { score: 80 };
  }

  if (!backendKeywords || backendKeywords.trim().length === 0) {
    return { score: 0, recommendation: "Add backend search terms/keywords to improve discoverability" };
  }

  const words = backendKeywords.split(/[\s,;]+/).filter(Boolean);
  let score = 40;

  if (words.length >= 5) score += 15;
  if (words.length >= 10) score += 15;
  if (backendKeywords.length <= 250) score += 15; // Within Amazon's limit
  if (!/,/.test(backendKeywords)) score += 5; // No commas (Amazon best practice)
  if (!/[A-Z]/.test(backendKeywords)) score += 5; // Lowercase (Amazon best practice)

  const recommendation = score < 60
    ? "Add more relevant search terms — aim for 10+ unique keywords, lowercase, no commas"
    : undefined;

  return { score: Math.min(score, 100), recommendation };
}

function scoreImages(imageUrls: string[]): { score: number; recommendation?: string } {
  if (imageUrls.length === 0) return { score: 0, recommendation: "Add product images — listings with 5+ images convert significantly better" };
  if (imageUrls.length === 1) return { score: 25, recommendation: "Add more images — aim for at least 5 showing different angles and use cases" };
  if (imageUrls.length < 5) return { score: 50, recommendation: `Add ${5 - imageUrls.length} more images for better conversion` };
  if (imageUrls.length >= 7) return { score: 100 };
  return { score: 80 };
}

export function calculateSEOScore(listing: ListingData): SEOHealthScore {
  const titleLength = scoreTitleLength(listing.title, listing.marketplace);
  const titleKeywords = scoreTitleKeywords(listing.title);
  const titleScore = Math.round((titleLength.score + titleKeywords.score) / 2);

  const bullet = scoreBullets(listing.bullets, listing.marketplace);
  const desc = scoreDescription(listing.description, listing.marketplace);
  const kw = scoreKeywords(listing.backendKeywords, listing.marketplace);
  const img = scoreImages(listing.imageUrls);

  const overall = Math.round(
    titleScore * 0.3 +
    bullet.score * 0.2 +
    desc.score * 0.2 +
    kw.score * 0.15 +
    img.score * 0.15
  );

  const recommendations = [
    titleLength.recommendation,
    titleKeywords.recommendation,
    bullet.recommendation,
    desc.recommendation,
    kw.recommendation,
    img.recommendation,
  ].filter((r): r is string => !!r);

  return {
    overall,
    titleScore,
    bulletScore: bullet.score,
    descriptionScore: desc.score,
    keywordScore: kw.score,
    imageScore: img.score,
    recommendations,
  };
}
