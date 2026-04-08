import type { Marketplace } from "@/lib/types";

export interface MockListing {
  externalId: string;
  sku: string;
  asin?: string;
  title: string;
  description: string;
  bullets: string[];
  price: number;
  currency: string;
  imageUrls: string[];
  status: "active" | "inactive" | "suppressed" | "draft";
  category: string;
  backendKeywords: string;
}

const AMAZON_LISTINGS: MockListing[] = [
  {
    externalId: "B0DEMO00001",
    sku: "WB-TUMBLER-001",
    asin: "B0DEMO00001",
    title: "Premium Insulated Stainless Steel Tumbler 30oz - Double Wall Vacuum Sealed Travel Mug with Lid",
    description: "Keep your beverages at the perfect temperature all day long with our premium insulated tumbler. Crafted from 18/8 food-grade stainless steel with double-wall vacuum insulation technology, this 30oz tumbler keeps drinks ice cold for 24 hours or piping hot for 12 hours.",
    bullets: [
      "SUPERIOR INSULATION: Double-wall vacuum sealed technology keeps drinks cold 24hrs, hot 12hrs",
      "PREMIUM MATERIALS: 18/8 food-grade stainless steel, BPA-free, sweat-proof exterior",
      "PERFECT SIZE: 30oz capacity fits most car cup holders, ideal for commuting and travel",
      "EASY TO CLEAN: Wide mouth opening, dishwasher safe lid, hand wash body recommended",
      "SATISFACTION GUARANTEED: Lifetime warranty with hassle-free replacement policy",
    ],
    price: 29.99,
    currency: "USD",
    imageUrls: ["https://placehold.co/600x600/e2e8f0/475569?text=Tumbler+Front", "https://placehold.co/600x600/e2e8f0/475569?text=Tumbler+Side"],
    status: "active",
    category: "Kitchen & Dining > Travel Mugs & Tumblers",
    backendKeywords: "insulated tumbler stainless steel travel mug 30oz vacuum sealed hot cold coffee cup water bottle reusable",
  },
  {
    externalId: "B0DEMO00002",
    sku: "WB-YOGA-MAT-001",
    asin: "B0DEMO00002",
    title: "Extra Thick Yoga Mat 1/2 Inch - Non-Slip Exercise Mat with Carrying Strap for Home Gym Workout",
    description: "Transform your fitness routine with our extra thick yoga mat designed for maximum comfort and stability. The 1/2 inch high-density foam provides superior cushioning for joints during yoga, pilates, and floor exercises.",
    bullets: [
      "EXTRA THICK COMFORT: 1/2 inch high-density foam cushions joints during any workout",
      "NON-SLIP SURFACE: Textured dual-sided grip prevents sliding on any floor type",
      "INCLUDES CARRYING STRAP: Easy transport to gym, studio, or outdoor practice",
      "LARGE SIZE: 72 x 24 inches accommodates all body types and exercise styles",
      "ECO-FRIENDLY: Made from SGS certified non-toxic TPE material, latex and PVC free",
    ],
    price: 34.99,
    currency: "USD",
    imageUrls: ["https://placehold.co/600x600/e2e8f0/475569?text=Yoga+Mat"],
    status: "active",
    category: "Sports & Outdoors > Yoga > Yoga Mats",
    backendKeywords: "yoga mat thick exercise mat non slip workout mat gym mat pilates floor exercises home gym fitness",
  },
  {
    externalId: "B0DEMO00003",
    sku: "WB-LED-DESK-001",
    asin: "B0DEMO00003",
    title: "LED Desk Lamp with Wireless Charger - Dimmable Office Light 5 Color Modes USB Charging Port",
    description: "Illuminate your workspace with our multifunctional LED desk lamp featuring built-in wireless charging. With 5 color temperature modes and stepless brightness control, you can create the perfect lighting environment.",
    bullets: [
      "BUILT-IN WIRELESS CHARGER: Qi-compatible 10W fast wireless charging pad at the base",
      "5 LIGHTING MODES: Cool white to warm light with stepless dimming for any task",
      "USB CHARGING PORT: Extra USB-A port on the back to charge a second device",
      "ADJUSTABLE DESIGN: Flexible gooseneck and rotating head for precise light direction",
    ],
    price: 45.99,
    currency: "USD",
    imageUrls: ["https://placehold.co/600x600/e2e8f0/475569?text=Desk+Lamp"],
    status: "active",
    category: "Office Products > Desk Lamps",
    backendKeywords: "led desk lamp wireless charger office light dimmable usb port study reading light flexible gooseneck",
  },
  {
    externalId: "B0DEMO00004",
    sku: "WB-CUTTING-BD-001",
    asin: "B0DEMO00004",
    title: "Bamboo Cutting Board Set of 3 - Organic Wood Kitchen Chopping Boards with Juice Groove",
    description: "Upgrade your kitchen prep with our premium set of 3 bamboo cutting boards. Each board features deep juice grooves and is made from sustainably sourced organic bamboo that is naturally antimicrobial.",
    bullets: [
      "SET OF 3 SIZES: Large (18x12), Medium (14x10), Small (10x8) for every cutting task",
      "JUICE GROOVE: Deep channels catch liquids and prevent mess on countertops",
      "KNIFE FRIENDLY: Dense bamboo surface is gentle on blade edges, extends knife life",
      "NATURALLY ANTIMICROBIAL: Organic bamboo resists bacteria without chemical treatments",
      "SUSTAINABLE CHOICE: Made from FSC certified rapidly renewable bamboo",
    ],
    price: 24.99,
    currency: "USD",
    imageUrls: ["https://placehold.co/600x600/e2e8f0/475569?text=Cutting+Board"],
    status: "active",
    category: "Kitchen & Dining > Cutting Boards",
    backendKeywords: "bamboo cutting board set wooden chopping board organic kitchen boards juice groove knife friendly",
  },
  {
    externalId: "B0DEMO00005",
    sku: "WB-BKPACK-001",
    asin: "B0DEMO00005",
    title: "Anti-Theft Laptop Backpack 15.6 Inch - USB Charging Port Waterproof Business Travel Bag",
    description: "Protect your tech and stay organized with our anti-theft laptop backpack. Features a hidden zipper design, RFID blocking pocket, and USB charging port for secure, connected travel.",
    bullets: [
      "ANTI-THEFT DESIGN: Hidden main zipper, RFID blocking pocket, slash-proof material",
      "FITS 15.6\" LAPTOPS: Padded compartment with soft lining protects your device",
      "USB CHARGING: Built-in USB port with internal cable for on-the-go phone charging",
    ],
    price: 49.99,
    currency: "USD",
    imageUrls: ["https://placehold.co/600x600/e2e8f0/475569?text=Backpack"],
    status: "suppressed",
    category: "Electronics > Laptop Accessories > Bags & Cases",
    backendKeywords: "laptop backpack anti theft usb charging waterproof business travel bag 15.6 inch college school",
  },
];

const SHOPIFY_LISTINGS: MockListing[] = [
  {
    externalId: "shopify-prod-001",
    sku: "SP-CANDLE-LV-001",
    title: "Lavender Dreams Soy Candle - Hand-Poured Natural Aromatherapy",
    description: "Handcrafted in small batches using 100% natural soy wax and premium essential oils. Our Lavender Dreams candle fills your space with calming, therapeutic fragrance. Clean-burning with a cotton wick for 45+ hours of blissful relaxation.",
    bullets: [],
    price: 28.00,
    currency: "USD",
    imageUrls: ["https://placehold.co/600x600/e2e8f0/475569?text=Candle"],
    status: "active",
    category: "Home & Garden",
    backendKeywords: "",
  },
  {
    externalId: "shopify-prod-002",
    sku: "SP-TOTE-ORG-001",
    title: "Organic Cotton Market Tote - Reusable Grocery Bag",
    description: "Ditch single-use bags with our sturdy organic cotton market tote. GOTS certified, reinforced handles, and a flat bottom that stands on its own. Folds flat for easy storage. Machine washable.",
    bullets: [],
    price: 18.50,
    currency: "USD",
    imageUrls: ["https://placehold.co/600x600/e2e8f0/475569?text=Tote+Bag"],
    status: "active",
    category: "Bags & Accessories",
    backendKeywords: "",
  },
  {
    externalId: "shopify-prod-003",
    sku: "SP-JOURNAL-001",
    title: "Leather-Bound Gratitude Journal - 365 Day Guided Prompts",
    description: "Start each day with intention using our premium leather-bound gratitude journal. Features guided daily prompts, inspirational quotes, and monthly reflection pages. Lay-flat binding with 120gsm acid-free paper.",
    bullets: [],
    price: 32.00,
    currency: "USD",
    imageUrls: ["https://placehold.co/600x600/e2e8f0/475569?text=Journal"],
    status: "active",
    category: "Stationery",
    backendKeywords: "",
  },
];

const MOCK_LISTINGS: Record<Marketplace, MockListing[]> = {
  amazon: AMAZON_LISTINGS,
  shopify: SHOPIFY_LISTINGS,
  walmart: AMAZON_LISTINGS.slice(0, 3).map((l) => ({
    ...l,
    externalId: l.externalId.replace("B0DEMO", "WMT"),
  })),
  etsy: SHOPIFY_LISTINGS.map((l) => ({
    ...l,
    externalId: l.externalId.replace("shopify-prod", "etsy-listing"),
  })),
};

export function getMockListings(marketplace: Marketplace): MockListing[] {
  return MOCK_LISTINGS[marketplace] || [];
}

export function getMockConnection(marketplace: Marketplace) {
  const storeNames: Record<Marketplace, string> = {
    amazon: "Demo Seller Store",
    shopify: "demo-brand.myshopify.com",
    walmart: "Demo Walmart Seller",
    etsy: "DemoCraftsShop",
  };
  return {
    storeName: storeNames[marketplace],
    sellerId: `demo-${marketplace}-seller`,
    shopDomain: marketplace === "shopify" ? "demo-brand.myshopify.com" : undefined,
  };
}
