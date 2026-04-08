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

// ============================================================
// Shelf 3.0 Types
// ============================================================

// Union types
export type AlertType = "bsr_drop" | "price_change" | "stock_low" | "review_negative" | "score_change";
export type AlertSeverity = "info" | "warning" | "critical";
export type PublishStatus = "draft" | "queued" | "publishing" | "live" | "error" | "reverted";
export type CampaignType = "sponsored_products" | "sponsored_brands" | "sponsored_display";
export type CampaignStatus = "draft" | "suggested" | "active" | "paused" | "ended";
export type BidStrategy = "dynamic_down" | "dynamic_up_down" | "fixed";
export type FulfillmentType = "fba" | "fbm" | "merchant" | "wfs";
export type InventoryAlertType = "low_stock" | "out_of_stock" | "overstock" | "reorder_now";
export type ReviewSentiment = "positive" | "neutral" | "negative";
export type CompetitionLevel = "low" | "medium" | "high" | "very_high";
export type MarketTrend = "rising" | "stable" | "declining";
export type PricingRuleType = "buy_box_offset" | "competitor_match" | "margin_floor" | "custom";
export type PriceTrigger = "rule" | "manual" | "competitor";
export type ABTestField = "title" | "bullets" | "description" | "images";
export type ABTestStatus = "draft" | "running" | "paused" | "completed";
export type ABVariant = "a" | "b";
export type ReportType = "weekly" | "monthly" | "custom";
export type ResponseType = "ai_suggested" | "manual" | "published";
export type ResponseStatus = "draft" | "approved" | "published";

// Shelf Score
export interface ShelfScore {
  id: string;
  userId: string;
  overallScore: number;
  listingQualityScore: number;
  pricingScore: number;
  reviewScore: number;
  adScore: number;
  inventoryScore: number;
  categoryBenchmark: number;
  calculatedAt: string;
}

export interface ShelfScoreHistory {
  id: string;
  shelfScoreId: string;
  overallScore: number;
  capturedAt: string;
}

// Sales Dashboard
export interface SalesData {
  id: string;
  userId: string;
  connectionId?: string;
  marketplace: Marketplace;
  externalId?: string;
  orderId: string;
  revenue: number;
  units: number;
  fees: number;
  adSpend: number;
  cogs: number;
  profit: number;
  currency: string;
  orderDate: string;
  createdAt: string;
}

export interface ProductMetrics {
  id: string;
  userId: string;
  listingId?: string;
  marketplace: Marketplace;
  bsr: number;
  sessions: number;
  conversionRate: number;
  unitsSold30d: number;
  revenue30d: number;
  refundRate: number;
  capturedAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  createdAt: string;
}

// One-Click Publish
export interface PublishJob {
  id: string;
  userId: string;
  listingOutputId?: string;
  connectionId?: string;
  marketplace: Marketplace;
  status: PublishStatus;
  externalListingId?: string;
  publishedAt?: string;
  errorMessage?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Ad Manager
export interface AdCampaign {
  id: string;
  userId: string;
  connectionId?: string;
  marketplace: Marketplace;
  campaignName: string;
  campaignType: CampaignType;
  status: CampaignStatus;
  dailyBudget: number;
  bidStrategy: BidStrategy;
  targetAcos: number;
  listingId?: string;
  keywords: { keyword: string; matchType: string; bid: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdMetric {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
  tacos: number;
  cpc: number;
  capturedAt: string;
}

// Inventory
export interface InventoryItem {
  id: string;
  userId: string;
  connectionId?: string;
  listingId?: string;
  marketplace: Marketplace;
  sku: string;
  productName?: string;
  currentStock: number;
  fulfillmentType: FulfillmentType;
  dailyVelocity: number;
  daysOfSupply: number;
  reorderPoint: number;
  reorderQty: number;
  leadTimeDays: number;
  unitCost: number;
  lastSyncedAt?: string;
  createdAt: string;
}

export interface InventoryAlert {
  id: string;
  userId: string;
  inventoryId: string;
  alertType: InventoryAlertType;
  message: string;
  isRead: boolean;
  predictedStockoutDate?: string;
  createdAt: string;
}

// Reviews
export interface Review {
  id: string;
  userId: string;
  connectionId?: string;
  listingId?: string;
  marketplace: Marketplace;
  externalReviewId?: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  reviewDate: string;
  sentiment: ReviewSentiment;
  sentimentScore: number;
  createdAt: string;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  responseType: ResponseType;
  responseText: string;
  status: ResponseStatus;
  publishedAt?: string;
  createdAt: string;
}

// Product Research
export interface ResearchReport {
  id: string;
  userId: string;
  query: string;
  marketplace: Marketplace;
  demandScore: number;
  competitionLevel: CompetitionLevel;
  trend: MarketTrend;
  avgPrice: number;
  avgReviews: number;
  estimatedMonthlyRevenue: number;
  marketGaps: string[];
  supplierMargins: Record<string, number>;
  aiAnalysis: string;
  createdAt: string;
}

// Pricing
export interface PricingRule {
  id: string;
  userId: string;
  listingId?: string;
  marketplace: Marketplace;
  ruleType: PricingRuleType;
  ruleConfig: Record<string, unknown>;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistoryEntry {
  id: string;
  listingId: string;
  oldPrice: number;
  newPrice: number;
  trigger: PriceTrigger;
  ruleId?: string;
  changedAt: string;
}

// A/B Testing
export interface ABTest {
  id: string;
  userId: string;
  listingId?: string;
  marketplace: Marketplace;
  testField: ABTestField;
  variantA: string;
  variantB: string;
  status: ABTestStatus;
  winner?: ABVariant;
  startDate?: string;
  endDate?: string;
  significanceThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestResult {
  id: string;
  testId: string;
  variant: ABVariant;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  capturedAt: string;
}

// Agency
export interface AgencyClient {
  id: string;
  teamId: string;
  clientName: string;
  clientEmail?: string;
  logoUrl?: string;
  portalEnabled: boolean;
  portalSlug?: string;
  whiteLabelConfig: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyReport {
  id: string;
  clientId: string;
  reportType: ReportType;
  reportData: Record<string, unknown>;
  generatedAt: string;
  sentAt?: string;
  createdAt: string;
}

// Dashboard summary types
export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  totalProfit: number;
  profitMargin: number;
  revenueByMarketplace: Record<Marketplace, number>;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; revenue: number; units: number; profit: number; marketplace: Marketplace }[];
}

export interface InventorySummary {
  totalSkus: number;
  lowStockCount: number;
  outOfStockCount: number;
  avgDaysOfSupply: number;
  totalInventoryValue: number;
}

export interface ReviewSummary {
  avgRating: number;
  totalReviews: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  starDistribution: Record<number, number>;
  recentNegative: Review[];
}
