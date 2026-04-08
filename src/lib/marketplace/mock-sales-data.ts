import type { Marketplace } from "@/lib/types";

// Seeded random for consistent demo data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function randomBetween(min: number, max: number) {
  return min + rand() * (max - min);
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

// Generate 90 days of sales data
export function generateMockSalesData() {
  const days: { date: string; revenue: number; orders: number; units: number; fees: number; adSpend: number; cogs: number; profit: number; marketplace: Marketplace }[] = [];
  const marketplaces: Marketplace[] = ["amazon", "shopify", "walmart", "etsy"];
  const baseRevenue: Record<Marketplace, number> = { amazon: 850, shopify: 320, walmart: 210, etsy: 180 };
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
    const trendMultiplier = 1 + (90 - i) * 0.003; // slight upward trend

    for (const mp of marketplaces) {
      const base = baseRevenue[mp] * weekendMultiplier * trendMultiplier;
      const revenue = Math.round(base * randomBetween(0.7, 1.4) * 100) / 100;
      const orders = Math.max(1, Math.round(revenue / randomBetween(25, 55)));
      const units = orders + randomInt(0, Math.ceil(orders * 0.3));
      const fees = Math.round(revenue * randomBetween(0.12, 0.18) * 100) / 100;
      const adSpend = Math.round(revenue * randomBetween(0.08, 0.2) * 100) / 100;
      const cogs = Math.round(revenue * randomBetween(0.2, 0.35) * 100) / 100;
      const profit = Math.round((revenue - fees - adSpend - cogs) * 100) / 100;

      days.push({ date: dateStr, revenue, orders, units, fees, adSpend, cogs, profit, marketplace: mp });
    }
  }
  return days;
}

// Aggregate sales summary
export function generateMockSalesSummary() {
  const data = generateMockSalesData();
  const last30 = data.filter((d) => {
    const daysAgo = (Date.now() - new Date(d.date).getTime()) / 86400000;
    return daysAgo <= 30;
  });

  const totalRevenue = Math.round(last30.reduce((s, d) => s + d.revenue, 0) * 100) / 100;
  const totalOrders = last30.reduce((s, d) => s + d.orders, 0);
  const totalUnits = last30.reduce((s, d) => s + d.units, 0);
  const totalProfit = Math.round(last30.reduce((s, d) => s + d.profit, 0) * 100) / 100;
  const profitMargin = Math.round((totalProfit / totalRevenue) * 100 * 10) / 10;

  const revenueByMarketplace: Record<string, number> = {};
  for (const d of last30) {
    revenueByMarketplace[d.marketplace] = (revenueByMarketplace[d.marketplace] || 0) + d.revenue;
  }
  Object.keys(revenueByMarketplace).forEach((k) => {
    revenueByMarketplace[k] = Math.round(revenueByMarketplace[k] * 100) / 100;
  });

  // Daily aggregates
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  for (const d of last30) {
    if (!dailyMap[d.date]) dailyMap[d.date] = { revenue: 0, orders: 0 };
    dailyMap[d.date].revenue += d.revenue;
    dailyMap[d.date].orders += d.orders;
  }
  const revenueByDay = Object.entries(dailyMap)
    .map(([date, v]) => ({ date, revenue: Math.round(v.revenue * 100) / 100, orders: v.orders }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top products
  const topProducts = [
    { name: "Premium Insulated Tumbler 30oz", revenue: Math.round(totalRevenue * 0.22), units: Math.round(totalUnits * 0.2), profit: Math.round(totalProfit * 0.25), marketplace: "amazon" as Marketplace },
    { name: "Bamboo Cutting Board Set", revenue: Math.round(totalRevenue * 0.18), units: Math.round(totalUnits * 0.22), profit: Math.round(totalProfit * 0.2), marketplace: "amazon" as Marketplace },
    { name: "LED Desk Lamp with Charger", revenue: Math.round(totalRevenue * 0.15), units: Math.round(totalUnits * 0.12), profit: Math.round(totalProfit * 0.16), marketplace: "shopify" as Marketplace },
    { name: "Lavender Dreams Soy Candle", revenue: Math.round(totalRevenue * 0.12), units: Math.round(totalUnits * 0.15), profit: Math.round(totalProfit * 0.13), marketplace: "shopify" as Marketplace },
    { name: "Anti-Theft Laptop Backpack", revenue: Math.round(totalRevenue * 0.1), units: Math.round(totalUnits * 0.08), profit: Math.round(totalProfit * 0.09), marketplace: "walmart" as Marketplace },
  ];

  return { totalRevenue, totalOrders, totalUnits, totalProfit, profitMargin, revenueByMarketplace, revenueByDay, topProducts };
}

// Mock alerts
export function generateMockAlerts() {
  return [
    { id: "alert-1", type: "bsr_drop" as const, severity: "warning" as const, title: "BSR dropped on Tumbler 30oz", message: "Best Sellers Rank dropped from #1,245 to #1,890 in Kitchen & Dining", isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "alert-2", type: "price_change" as const, severity: "critical" as const, title: "Competitor undercut on Cutting Board", message: "ProLine Bamboo Set dropped price from $29.99 to $19.99 — 33% below your price", isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "alert-3", type: "review_negative" as const, severity: "warning" as const, title: "New 1-star review on LED Desk Lamp", message: "Customer reported packaging damage. Consider updating shipping protection.", isRead: false, createdAt: new Date(Date.now() - 14400000).toISOString() },
    { id: "alert-4", type: "stock_low" as const, severity: "critical" as const, title: "Low stock: Yoga Mat (12 units left)", message: "At current velocity (3.2/day), you'll be out of stock in ~4 days. Reorder now.", isRead: true, createdAt: new Date(Date.now() - 28800000).toISOString() },
    { id: "alert-5", type: "score_change" as const, severity: "info" as const, title: "Shelf Score improved: 72 → 78", message: "Your listing quality score improved after updating bullet points on 3 products.", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];
}

// Mock inventory
export function generateMockInventory() {
  return [
    { id: "inv-1", sku: "WB-TUMBLER-001", productName: "Premium Insulated Tumbler 30oz", marketplace: "amazon" as Marketplace, currentStock: 342, fulfillmentType: "fba" as const, dailyVelocity: 8.5, daysOfSupply: 40, reorderPoint: 100, reorderQty: 500, leadTimeDays: 21, unitCost: 6.50 },
    { id: "inv-2", sku: "WB-YOGA-MAT-001", productName: "Extra Thick Yoga Mat 1/2 Inch", marketplace: "amazon" as Marketplace, currentStock: 12, fulfillmentType: "fba" as const, dailyVelocity: 3.2, daysOfSupply: 4, reorderPoint: 50, reorderQty: 200, leadTimeDays: 14, unitCost: 8.20 },
    { id: "inv-3", sku: "WB-LED-DESK-001", productName: "LED Desk Lamp with Wireless Charger", marketplace: "amazon" as Marketplace, currentStock: 189, fulfillmentType: "fba" as const, dailyVelocity: 4.1, daysOfSupply: 46, reorderPoint: 60, reorderQty: 300, leadTimeDays: 28, unitCost: 12.80 },
    { id: "inv-4", sku: "WB-CUTTING-BD-001", productName: "Bamboo Cutting Board Set of 3", marketplace: "amazon" as Marketplace, currentStock: 0, fulfillmentType: "fbm" as const, dailyVelocity: 5.6, daysOfSupply: 0, reorderPoint: 75, reorderQty: 400, leadTimeDays: 18, unitCost: 4.30 },
    { id: "inv-5", sku: "WB-BKPACK-001", productName: "Anti-Theft Laptop Backpack 15.6\"", marketplace: "walmart" as Marketplace, currentStock: 87, fulfillmentType: "merchant" as const, dailyVelocity: 2.3, daysOfSupply: 38, reorderPoint: 30, reorderQty: 150, leadTimeDays: 21, unitCost: 14.50 },
    { id: "inv-6", sku: "SP-CANDLE-LV-001", productName: "Lavender Dreams Soy Candle", marketplace: "shopify" as Marketplace, currentStock: 456, fulfillmentType: "merchant" as const, dailyVelocity: 6.8, daysOfSupply: 67, reorderPoint: 100, reorderQty: 500, leadTimeDays: 7, unitCost: 3.20 },
    { id: "inv-7", sku: "SP-TOTE-ORG-001", productName: "Organic Cotton Market Tote", marketplace: "shopify" as Marketplace, currentStock: 23, fulfillmentType: "merchant" as const, dailyVelocity: 1.8, daysOfSupply: 13, reorderPoint: 25, reorderQty: 100, leadTimeDays: 10, unitCost: 4.50 },
    { id: "inv-8", sku: "SP-JOURNAL-001", productName: "Leather-Bound Gratitude Journal", marketplace: "etsy" as Marketplace, currentStock: 178, fulfillmentType: "merchant" as const, dailyVelocity: 3.4, daysOfSupply: 52, reorderPoint: 40, reorderQty: 200, leadTimeDays: 14, unitCost: 5.80 },
  ];
}

// Mock reviews
export function generateMockReviews() {
  return [
    { id: "rev-1", marketplace: "amazon" as Marketplace, reviewerName: "Sarah M.", rating: 5, title: "Best tumbler I've ever owned!", body: "Keeps my coffee hot for hours. Love the no-sweat exterior. Already bought two more as gifts.", verifiedPurchase: true, reviewDate: new Date(Date.now() - 86400000).toISOString(), sentiment: "positive" as const, sentimentScore: 0.95 },
    { id: "rev-2", marketplace: "amazon" as Marketplace, reviewerName: "Mike T.", rating: 1, title: "Lid broke after one week", body: "The lid cracked and now it leaks everywhere. Very disappointed for the price. Returning.", verifiedPurchase: true, reviewDate: new Date(Date.now() - 172800000).toISOString(), sentiment: "negative" as const, sentimentScore: -0.88 },
    { id: "rev-3", marketplace: "amazon" as Marketplace, reviewerName: "Jennifer L.", rating: 4, title: "Great mat, slightly slippery", body: "Love the thickness and comfort. Only complaint is it can be a bit slippery during hot yoga. Otherwise perfect.", verifiedPurchase: true, reviewDate: new Date(Date.now() - 259200000).toISOString(), sentiment: "positive" as const, sentimentScore: 0.62 },
    { id: "rev-4", marketplace: "shopify" as Marketplace, reviewerName: "David K.", rating: 5, title: "Amazing scent", body: "The lavender candle smells incredible. Burns evenly and lasts forever. Will definitely be ordering more.", verifiedPurchase: true, reviewDate: new Date(Date.now() - 345600000).toISOString(), sentiment: "positive" as const, sentimentScore: 0.92 },
    { id: "rev-5", marketplace: "amazon" as Marketplace, reviewerName: "Chris W.", rating: 2, title: "Smaller than expected", body: "The cutting boards are much thinner than pictured. They warp in the dishwasher. Not great quality for the price.", verifiedPurchase: true, reviewDate: new Date(Date.now() - 432000000).toISOString(), sentiment: "negative" as const, sentimentScore: -0.72 },
    { id: "rev-6", marketplace: "walmart" as Marketplace, reviewerName: "Amanda R.", rating: 5, title: "Perfect backpack", body: "Fits my 15 inch laptop perfectly. Love all the hidden pockets. USB charging is a game changer for travel.", verifiedPurchase: false, reviewDate: new Date(Date.now() - 518400000).toISOString(), sentiment: "positive" as const, sentimentScore: 0.90 },
    { id: "rev-7", marketplace: "etsy" as Marketplace, reviewerName: "Rachel P.", rating: 5, title: "Beautiful journal", body: "The leather quality is gorgeous and the prompts are thoughtful. Makes journaling easy and enjoyable.", verifiedPurchase: true, reviewDate: new Date(Date.now() - 604800000).toISOString(), sentiment: "positive" as const, sentimentScore: 0.88 },
    { id: "rev-8", marketplace: "amazon" as Marketplace, reviewerName: "Tom H.", rating: 3, title: "It's okay", body: "Does the job but nothing special. Wireless charging is slow. The light is nice though.", verifiedPurchase: true, reviewDate: new Date(Date.now() - 691200000).toISOString(), sentiment: "neutral" as const, sentimentScore: 0.15 },
  ];
}

// Mock ad campaigns
export function generateMockAdCampaigns() {
  return [
    { id: "camp-1", marketplace: "amazon" as Marketplace, campaignName: "Tumbler - Exact Match", campaignType: "sponsored_products" as const, status: "active" as const, dailyBudget: 25, bidStrategy: "dynamic_up_down" as const, targetAcos: 25, keywords: [{ keyword: "insulated tumbler 30oz", matchType: "exact", bid: 1.20 }, { keyword: "stainless steel tumbler", matchType: "exact", bid: 0.95 }], metrics: { impressions: 42350, clicks: 1856, spend: 1923.40, sales: 7694.20, acos: 24.9, roas: 4.0 } },
    { id: "camp-2", marketplace: "amazon" as Marketplace, campaignName: "Yoga Mat - Broad", campaignType: "sponsored_products" as const, status: "active" as const, dailyBudget: 15, bidStrategy: "dynamic_down" as const, targetAcos: 30, keywords: [{ keyword: "yoga mat thick", matchType: "broad", bid: 0.75 }, { keyword: "exercise mat", matchType: "broad", bid: 0.65 }], metrics: { impressions: 28900, clicks: 1245, spend: 987.50, sales: 3290.00, acos: 30.0, roas: 3.3 } },
    { id: "camp-3", marketplace: "amazon" as Marketplace, campaignName: "Desk Lamp - Brand Defense", campaignType: "sponsored_brands" as const, status: "paused" as const, dailyBudget: 10, bidStrategy: "fixed" as const, targetAcos: 20, keywords: [{ keyword: "led desk lamp wireless charger", matchType: "phrase", bid: 1.50 }], metrics: { impressions: 12400, clicks: 534, spend: 801.00, sales: 2890.50, acos: 27.7, roas: 3.6 } },
  ];
}

// Mock Shelf Score
export function generateMockShelfScore() {
  return {
    overallScore: 74,
    listingQualityScore: 82,
    pricingScore: 68,
    reviewScore: 71,
    adScore: 76,
    inventoryScore: 63,
    categoryBenchmark: 65,
  };
}
