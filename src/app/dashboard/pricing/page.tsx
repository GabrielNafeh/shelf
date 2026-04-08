"use client";

import { useState } from "react";
import { DollarSign, Plus, ToggleLeft, ToggleRight, ArrowDown, Shield, TrendingDown } from "lucide-react";

interface PricingRule {
  id: string;
  productName: string;
  marketplace: string;
  ruleType: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
  currentPrice: number;
  competitorPrice: number;
}

const MOCK_RULES: PricingRule[] = [
  { id: "pr-1", productName: "Premium Insulated Tumbler 30oz", marketplace: "amazon", ruleType: "buy_box_offset", description: "Stay $0.50 below Buy Box winner", minPrice: 22.99, maxPrice: 34.99, isActive: true, currentPrice: 29.49, competitorPrice: 29.99 },
  { id: "pr-2", productName: "Bamboo Cutting Board Set", marketplace: "amazon", ruleType: "competitor_match", description: "Match lowest competitor price", minPrice: 18.99, maxPrice: 29.99, isActive: true, currentPrice: 24.99, competitorPrice: 24.99 },
  { id: "pr-3", productName: "LED Desk Lamp with Charger", marketplace: "shopify", ruleType: "margin_floor", description: "Maintain 40% minimum margin", minPrice: 35.99, maxPrice: 54.99, isActive: false, currentPrice: 45.99, competitorPrice: 42.99 },
  { id: "pr-4", productName: "Anti-Theft Laptop Backpack", marketplace: "walmart", ruleType: "buy_box_offset", description: "Stay $1.00 below Buy Box", minPrice: 39.99, maxPrice: 59.99, isActive: true, currentPrice: 48.99, competitorPrice: 49.99 },
];

const RULE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  buy_box_offset: { label: "Buy Box Offset", color: "bg-blue-100 text-blue-700" },
  competitor_match: { label: "Competitor Match", color: "bg-purple-100 text-purple-700" },
  margin_floor: { label: "Margin Floor", color: "bg-amber-100 text-amber-700" },
  custom: { label: "Custom Rule", color: "bg-gray-100 text-gray-700" },
};

export default function PricingPage() {
  const [rules, setRules] = useState(MOCK_RULES);

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const activeRules = rules.filter((r) => r.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2"><DollarSign className="w-6 h-6" /> Pricing Autopilot</h1>
          <p className="text-[#6B7280] mt-0.5">Dynamic repricing rules and margin protection</p>
        </div>
        <button className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-center">
          <p className="text-3xl font-bold text-[#111827]">{rules.length}</p>
          <p className="text-sm text-[#6B7280]">Total Rules</p>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-center">
          <p className="text-3xl font-bold text-[#22C55E]">{activeRules}</p>
          <p className="text-sm text-[#6B7280]">Active Rules</p>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-center">
          <p className="text-3xl font-bold text-[#111827]">12</p>
          <p className="text-sm text-[#6B7280]">Price Changes (30d)</p>
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const typeConfig = RULE_TYPE_LABELS[rule.ruleType] || RULE_TYPE_LABELS.custom;
          const priceDiff = rule.currentPrice - rule.competitorPrice;

          return (
            <div key={rule.id} className={`rounded-xl border bg-white p-5 transition-colors ${rule.isActive ? "border-[#22C55E]/30" : "border-[#E5E7EB] opacity-60"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#111827]">{rule.productName}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConfig.color}`}>{typeConfig.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">{rule.marketplace}</span>
                  </div>
                  <p className="text-sm text-[#6B7280] mb-3">{rule.description}</p>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Your Price</p>
                      <p className="text-lg font-bold text-[#111827]">${rule.currentPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Competitor</p>
                      <p className="text-lg font-bold text-[#6B7280]">${rule.competitorPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Difference</p>
                      <p className={`text-lg font-bold ${priceDiff < 0 ? "text-[#22C55E]" : priceDiff > 0 ? "text-[#EF4444]" : "text-[#6B7280]"}`}>
                        {priceDiff < 0 ? "-" : priceDiff > 0 ? "+" : ""}${Math.abs(priceDiff).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Shield className="w-3.5 h-3.5" />
                      Floor: ${rule.minPrice} — Cap: ${rule.maxPrice}
                    </div>
                  </div>
                </div>
                <button onClick={() => toggleRule(rule.id)} className="shrink-0 ml-4">
                  {rule.isActive ? (
                    <ToggleRight className="w-8 h-8 text-[#22C55E]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-[#9CA3AF]" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
