export type Marketplace = "amazon" | "shopify" | "walmart" | "etsy";

export interface ProductInput {
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  features?: string[];
  specs?: Record<string, string>;
  images?: string[];
  price?: number;
  targetKeywords?: string[];
  url?: string;
}

export interface ListingOutput {
  marketplace: Marketplace;
  title: string;
  bullets?: string[];
  description: string;
  backendKeywords?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  schemaMarkup?: string;
  seoScore?: number;
}

export interface GeneratedListing {
  id: string;
  productInput: ProductInput;
  outputs: ListingOutput[];
  brandVoiceId?: string;
  createdAt: string;
  status: "generating" | "complete" | "error";
}

export interface BrandVoice {
  id: string;
  userId: string;
  name: string;
  tone: string;
  vocabulary: string[];
  exampleListings: string[];
  guidelines: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  company?: string;
  plan: "free" | "starter" | "growth" | "pro";
  listingsUsedThisMonth: number;
  listingsLimit: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
}

export interface ListingScore {
  overall: number;
  titleScore: number;
  descriptionScore: number;
  keywordScore: number;
  readabilityScore: number;
  seoScore: number;
  suggestions: string[];
}

export const PLAN_LIMITS: Record<string, { listings: number; price: number; marketplaces: number }> = {
  free: { listings: 10, price: 0, marketplaces: 2 },
  starter: { listings: 100, price: 49, marketplaces: 2 },
  growth: { listings: 500, price: 149, marketplaces: 4 },
  pro: { listings: 2000, price: 299, marketplaces: 4 },
};

// ============================================================
// Shelf 2.0 Types
// ============================================================

export type ConnectionStatus = "pending" | "connected" | "disconnected" | "error";
export type SyncStatus = "idle" | "syncing" | "error";
export type TrainingStatus = "pending" | "training" | "complete" | "error";
export type TeamRole = "admin" | "editor" | "viewer";
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";
export type ListingStatus = "active" | "inactive" | "suppressed" | "draft";
export type KeywordTrend = "up" | "down" | "stable" | "new";
export type CompetitorStatus = "active" | "paused" | "removed";

export interface MarketplaceConnection {
  id: string;
  userId: string;
  marketplace: Marketplace;
  storeName?: string;
  status: ConnectionStatus;
  syncStatus: SyncStatus;
  lastSyncAt?: string;
  errorMessage?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SyncedListing {
  id: string;
  connectionId: string;
  userId: string;
  marketplace: Marketplace;
  externalId: string;
  sku?: string;
  asin?: string;
  title: string;
  description: string;
  bullets: string[];
  price?: number;
  currency: string;
  imageUrls: string[];
  status: ListingStatus;
  category?: string;
  backendKeywords: string;
  seoScore?: number;
  rawData: Record<string, unknown>;
  lastSyncedAt: string;
  createdAt: string;
}

export interface BrandDNAProfile {
  id: string;
  userId: string;
  name: string;
  voiceProfile: Record<string, unknown>;
  tone: string;
  vocabulary: string[];
  messagingThemes: string[];
  valuePropositions: string[];
  styleGuidelines: string;
  trainedFrom: Record<string, unknown>;
  trainingStatus: TrainingStatus;
  errorMessage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Competitor {
  id: string;
  userId: string;
  marketplace: Marketplace;
  externalId?: string;
  asin?: string;
  url?: string;
  title: string;
  brand?: string;
  currentPrice?: number;
  currentBsr?: number;
  currentRating?: number;
  currentReviewCount: number;
  imageUrl?: string;
  category?: string;
  status: CompetitorStatus;
  lastCheckedAt?: string;
  createdAt: string;
}

export interface CompetitorSnapshot {
  id: string;
  competitorId: string;
  price?: number;
  bsr?: number;
  rating?: number;
  reviewCount: number;
  inStock: boolean;
  buyBoxOwner?: string;
  capturedAt: string;
}

export interface KeywordRank {
  id: string;
  userId: string;
  marketplace: Marketplace;
  keyword: string;
  asin?: string;
  listingId?: string;
  currentRank?: number;
  previousRank?: number;
  bestRank?: number;
  searchVolume?: number;
  trend: KeywordTrend;
  lastCheckedAt?: string;
  createdAt: string;
}

export interface KeywordRankHistory {
  id: string;
  keywordRankId: string;
  rank: number;
  page: number;
  capturedAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  slug?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  profile?: {
    email: string;
    fullName?: string;
  };
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy?: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

// SEO Health scoring
export interface SEOHealthScore {
  overall: number;
  titleScore: number;
  bulletScore: number;
  descriptionScore: number;
  keywordScore: number;
  imageScore: number;
  recommendations: string[];
}

export const MARKETPLACE_CONFIG: Record<Marketplace, { name: string; icon: string; titleMaxLength: number; bulletsCount: number; descriptionMaxLength: number }> = {
  amazon: {
    name: "Amazon",
    icon: "/icons/amazon.svg",
    titleMaxLength: 200,
    bulletsCount: 5,
    descriptionMaxLength: 2000,
  },
  shopify: {
    name: "Shopify",
    icon: "/icons/shopify.svg",
    titleMaxLength: 70,
    bulletsCount: 0,
    descriptionMaxLength: 5000,
  },
  walmart: {
    name: "Walmart",
    icon: "/icons/walmart.svg",
    titleMaxLength: 75,
    bulletsCount: 5,
    descriptionMaxLength: 4000,
  },
  etsy: {
    name: "Etsy",
    icon: "/icons/etsy.svg",
    titleMaxLength: 140,
    bulletsCount: 0,
    descriptionMaxLength: 3000,
  },
};
