import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  BarChart3,
  Globe,
  Upload,
  Sparkles,
  Check,
  Star,
  ShieldCheck,
  Bot,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Paste a product URL or upload specs — get optimized listings in seconds, not hours.",
  },
  {
    icon: Globe,
    title: "Multi-Marketplace",
    description: "One input, four outputs. Amazon, Shopify, Walmart, and Etsy — each formatted to platform specs.",
  },
  {
    icon: Upload,
    title: "Bulk Processing",
    description: "Upload a CSV with hundreds of products. Get back a complete, enriched catalog ready to publish.",
  },
  {
    icon: Sparkles,
    title: "Brand Voice AI",
    description: "Train the AI on your existing listings. Every generated listing matches your brand tone perfectly.",
  },
  {
    icon: BarChart3,
    title: "SEO Optimization",
    description: "Built-in keyword research and natural keyword weaving. Rank higher, convert more.",
  },
  {
    icon: Bot,
    title: "AI-Agent Ready",
    description: "Structured Schema.org markup so AI shopping agents (ChatGPT, Perplexity) recommend YOUR products.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it out",
    features: ["10 listings/month", "2 marketplaces", "Basic brand voice", "CSV export"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For growing sellers",
    features: [
      "100 listings/month",
      "2 marketplaces",
      "Advanced brand voice",
      "SEO keywords",
      "CSV export",
      "Email support",
    ],
    cta: "Start Starter",
    popular: false,
  },
  {
    name: "Growth",
    price: "$149",
    period: "/month",
    description: "For scaling brands",
    features: [
      "500 listings/month",
      "All 4 marketplaces",
      "Advanced brand voice",
      "Bulk CSV upload",
      "SEO keywords",
      "Priority processing",
      "Priority support",
    ],
    cta: "Start Growth",
    popular: true,
  },
  {
    name: "Pro",
    price: "$299",
    period: "/month",
    description: "For power sellers",
    features: [
      "2,000 listings/month",
      "All 4 marketplaces",
      "Multiple brand voices",
      "Bulk CSV upload",
      "API access",
      "AI-agent optimization",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Start Pro",
    popular: false,
  },
];

const BEFORE_AFTER = {
  before: {
    title: "Blue Widget 10oz Container Storage",
    description:
      "Blue container for storing things. Made of plastic. 10 ounce size. Good quality. Fast shipping.",
  },
  after: {
    title: "Premium 10oz Blue Storage Container — BPA-Free, Leak-Proof, Stackable Kitchen Organization",
    bullets: [
      "PREMIUM BPA-FREE MATERIAL: Food-grade polypropylene keeps your family safe while storing leftovers, meal prep, and pantry essentials",
      "LEAK-PROOF SEAL: Patented snap-lock lid prevents spills during transport — perfect for lunches, travel, and on-the-go meals",
      "SPACE-SAVING STACKABLE DESIGN: Nest when empty, stack when full — reclaim up to 40% more cabinet and fridge space",
      "VERSATILE 10OZ CAPACITY: Ideal portion size for dips, sauces, snacks, baby food, and condiment storage",
      "DISHWASHER & FREEZER SAFE: From -20F to 230F — microwave, freeze, and clean with zero hassle",
    ],
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. NAVBAR: bg #111111, logo white, links #9CA3AF, CTA green pill */}
      <nav className="bg-[#111111] border-b border-[#1F2937] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#22C55E] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Shelf</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">Pricing</a>
              <a href="/score" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">Free Listing Score</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="text-sm text-[#9CA3AF] hover:text-white transition-colors px-3 py-1.5">Log in</button>
              </Link>
              <Link href="/signup">
                <button className="text-sm bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-1.5 rounded-full font-medium transition-colors">Start Free</button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO: bg #111111 */}
      <section className="bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center mb-6 px-4 py-1.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E] text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Optimized for AI Shopping Agents in 2026
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white">
              Product listings that{" "}
              <span className="text-[#22C55E]">sell themselves</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Generate optimized, conversion-ready listings for Amazon, Shopify, Walmart,
              and Etsy in seconds. Not hours. Powered by AI that understands what makes
              shoppers click &ldquo;Buy.&rdquo;
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 py-3 rounded-lg font-semibold text-lg flex items-center gap-2 transition-colors">
                  Start Optimizing Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/score">
                <button className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
                  Check Your Listing Score
                </button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#6B7280]">
              No credit card required. 10 free listings every month.
            </p>
          </div>

          {/* 3. BEFORE/AFTER: both #1A1A1A */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="rounded-xl border border-[#1F2937] bg-[#1A1A1A] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">Before</span>
                  <span className="text-sm text-[#9CA3AF]">Typical seller listing</span>
                </div>
                <h3 className="font-semibold mb-3 text-white">{BEFORE_AFTER.before.title}</h3>
                <p className="text-sm text-[#D1D5DB]">{BEFORE_AFTER.before.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-[#EF4444]">
                  <BarChart3 className="w-4 h-4" />
                  <span>Conversion rate: ~1.2%</span>
                </div>
              </div>
              {/* After */}
              <div className="rounded-xl border border-[#22C55E]/40 bg-[#1A1A1A] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">After Shelf</span>
                  <span className="text-sm text-[#9CA3AF]">AI-optimized</span>
                </div>
                <h3 className="font-semibold mb-3 text-white">
                  {BEFORE_AFTER.after.title}
                </h3>
                <ul className="space-y-2">
                  {BEFORE_AFTER.after.bullets.map((b, i) => (
                    <li key={i} className="text-sm text-[#E5E7EB] flex gap-2">
                      <Check className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-2 text-sm text-[#22C55E]">
                  <BarChart3 className="w-4 h-4" />
                  <span>Conversion rate: ~4.8% (+300%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS BAR: bg #111111, numbers white, labels #6B7280, divider #1F2937 */}
      <section className="bg-[#111111] py-12 border-t border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Listings Generated" },
              { value: "300%", label: "Avg. Conversion Lift" },
              { value: "45 sec", label: "Per Listing" },
              { value: "4.9/5", label: "Seller Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-[#6B7280] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURES: bg #FFFFFF, label green, heading #111827, cards #F9FAFB, border #E5E7EB */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#22C55E] mb-4 block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#111827]">
              Everything you need to dominate every marketplace
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              From single listings to bulk catalog optimization, Shelf handles it all.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-[#22C55E]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#111827]">{feature.title}</h3>
                <p className="text-sm text-[#6B7280]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS: bg #F3F4F6, label green, heading #111827, circles green */}
      <section className="bg-[#F3F4F6] py-20 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#22C55E] mb-4 block">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#111827]">Three steps. Sixty seconds.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Input Your Product",
                description: "Paste a URL, upload a CSV, or type in your product details. We handle the rest.",
              },
              {
                step: "2",
                title: "AI Optimizes Everything",
                description: "Our AI writes conversion-optimized titles, bullets, descriptions, and keywords for each marketplace.",
              },
              {
                step: "3",
                title: "Export & Publish",
                description: "Copy, download CSV, or push directly to your store. Watch conversions climb.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#111827]">{item.title}</h3>
                <p className="text-[#6B7280]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRICING: bg #FFFFFF, label green, heading #111827, cards white, featured green border */}
      <section id="pricing" className="bg-white py-24 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#22C55E] mb-4 block">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#111827]">
              Plans that scale with your catalog
            </h2>
            <p className="text-lg text-[#6B7280]">
              Start free. Upgrade when you need more. Cancel anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl p-6 bg-white ${
                  plan.popular
                    ? "border-2 border-[#22C55E] shadow-lg"
                    : "border border-[#E5E7EB]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#22C55E] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#111827]">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-[#111827]">{plan.price}</span>
                    <span className="text-[#6B7280]">{plan.period}</span>
                  </div>
                  <p className="text-sm text-[#6B7280] mt-1">{plan.description}</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 block">
                  {plan.popular ? (
                    <button className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-2.5 rounded-lg font-medium transition-colors">
                      {plan.cta}
                    </button>
                  ) : (
                    <button className="w-full bg-white hover:bg-gray-50 text-[#111827] py-2.5 rounded-lg font-medium border border-[#E5E7EB] transition-colors">
                      {plan.cta}
                    </button>
                  )}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-[#6B7280]">
            Need more? Pay-per-listing pricing at $0.75/listing with no monthly commitment.{" "}
            <Link href="/signup" className="text-[#22C55E] hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </section>

      {/* 8. BOTTOM CTA: bg #111111 */}
      <section className="bg-[#111111] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck className="w-12 h-12 text-[#22C55E]/80 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stop leaving money on the table with weak listings
          </h2>
          <p className="text-lg text-[#9CA3AF] mb-8">
            Every day with unoptimized listings is revenue you&apos;re losing to competitors. Start
            for free in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <button className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 py-3 rounded-lg font-semibold text-lg flex items-center gap-2 transition-colors">
                Start Optimizing Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/score">
              <button className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
                Check My Listing Score
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FOOTER: bg #F9FAFB, headings #111827, links #6B7280, divider #E5E7EB, copyright #9CA3AF */}
      <footer className="bg-[#F9FAFB] border-t border-[#E5E7EB] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#22C55E] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-[#111827]">Shelf</span>
              </div>
              <p className="text-sm text-[#6B7280]">
                AI-powered product listing optimization for e-commerce sellers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#111827]">Product</h4>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li><a href="#features" className="hover:text-[#111827] transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-[#111827] transition-colors">Pricing</a></li>
                <li><Link href="/score" className="hover:text-[#111827] transition-colors">Listing Score</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#111827]">Marketplaces</h4>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li>Amazon</li>
                <li>Shopify</li>
                <li>Walmart</li>
                <li>Etsy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#111827]">Company</h4>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li><a href="#" className="hover:text-[#111827] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#111827] transition-colors">Terms of Service</a></li>
                <li><a href="https://shelflistings.com/contact" className="hover:text-[#111827] transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#E5E7EB] text-center text-sm text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} Shelf. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
