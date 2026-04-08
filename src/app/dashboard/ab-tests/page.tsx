"use client";

import { useState } from "react";
import { FlaskConical, Plus, Trophy, BarChart3, ArrowRight } from "lucide-react";

interface ABTest {
  id: string;
  productName: string;
  marketplace: string;
  testField: string;
  variantA: string;
  variantB: string;
  status: string;
  winner?: string;
  resultsA: { impressions: number; clicks: number; conversions: number; conversionRate: number };
  resultsB: { impressions: number; clicks: number; conversions: number; conversionRate: number };
  startDate: string;
  significance: number;
}

const MOCK_TESTS: ABTest[] = [
  {
    id: "ab-1", productName: "Premium Insulated Tumbler 30oz", marketplace: "amazon", testField: "title",
    variantA: "Premium Insulated Stainless Steel Tumbler 30oz - Double Wall Vacuum Sealed Travel Mug with Lid",
    variantB: "30oz Insulated Tumbler - Keeps Drinks Cold 24hrs Hot 12hrs | BPA-Free Stainless Steel Travel Mug",
    status: "running", resultsA: { impressions: 12450, clicks: 623, conversions: 89, conversionRate: 14.3 },
    resultsB: { impressions: 12380, clicks: 694, conversions: 104, conversionRate: 15.0 },
    startDate: new Date(Date.now() - 7 * 86400000).toISOString(), significance: 0.82,
  },
  {
    id: "ab-2", productName: "Bamboo Cutting Board Set", marketplace: "amazon", testField: "bullets",
    variantA: "SET OF 3 SIZES: Large, Medium, Small for every cutting task",
    variantB: "3 PERFECT SIZES FOR EVERY MEAL: 18x12 for roasts, 14x10 for veggies, 10x8 for fruits",
    status: "completed", winner: "b", resultsA: { impressions: 8900, clicks: 356, conversions: 42, conversionRate: 11.8 },
    resultsB: { impressions: 8820, clicks: 412, conversions: 58, conversionRate: 14.1 },
    startDate: new Date(Date.now() - 21 * 86400000).toISOString(), significance: 0.96,
  },
  {
    id: "ab-3", productName: "LED Desk Lamp with Charger", marketplace: "shopify", testField: "description",
    variantA: "Illuminate your workspace with our multifunctional LED desk lamp...",
    variantB: "Stop fumbling with tangled cords. Our LED desk lamp charges your phone wirelessly...",
    status: "draft", resultsA: { impressions: 0, clicks: 0, conversions: 0, conversionRate: 0 },
    resultsB: { impressions: 0, clicks: 0, conversions: 0, conversionRate: 0 },
    startDate: "", significance: 0,
  },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  running: "bg-blue-100 text-blue-600",
  paused: "bg-amber-100 text-amber-600",
  completed: "bg-green-100 text-green-700",
};

const FIELD_LABELS: Record<string, string> = {
  title: "Title", bullets: "Bullets", description: "Description", images: "Images",
};

export default function ABTestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2"><FlaskConical className="w-6 h-6" /> A/B Testing</h1>
          <p className="text-[#6B7280] mt-0.5">Test listing variants and auto-apply winners</p>
        </div>
        <button className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Test
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_TESTS.map((test) => (
          <div key={test.id} className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#111827]">{test.productName}</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[test.status]} capitalize`}>{test.status}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280]">{FIELD_LABELS[test.testField]}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">{test.marketplace}</span>
                </div>
              </div>
              {test.status === "completed" && test.winner && (
                <div className="flex items-center gap-1 text-sm text-[#22C55E] font-medium">
                  <Trophy className="w-4 h-4" />
                  Variant {test.winner.toUpperCase()} wins
                </div>
              )}
            </div>

            {/* Variants Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`rounded-lg p-4 border ${test.winner === "a" ? "border-[#22C55E] bg-[#22C55E]/5" : "border-[#E5E7EB] bg-[#F9FAFB]"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#6B7280] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">A</span>
                  {test.winner === "a" && <Trophy className="w-3.5 h-3.5 text-[#22C55E]" />}
                </div>
                <p className="text-sm text-[#111827] line-clamp-2">{test.variantA}</p>
              </div>
              <div className={`rounded-lg p-4 border ${test.winner === "b" ? "border-[#22C55E] bg-[#22C55E]/5" : "border-[#E5E7EB] bg-[#F9FAFB]"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#6B7280] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">B</span>
                  {test.winner === "b" && <Trophy className="w-3.5 h-3.5 text-[#22C55E]" />}
                </div>
                <p className="text-sm text-[#111827] line-clamp-2">{test.variantB}</p>
              </div>
            </div>

            {/* Results */}
            {test.status !== "draft" && (
              <div className="grid grid-cols-2 gap-4">
                {[{ label: "Variant A", data: test.resultsA }, { label: "Variant B", data: test.resultsB }].map((variant) => (
                  <div key={variant.label} className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Impressions", value: variant.data.impressions.toLocaleString() },
                      { label: "Clicks", value: variant.data.clicks.toLocaleString() },
                      { label: "Conversions", value: variant.data.conversions.toString() },
                      { label: "Conv. Rate", value: `${variant.data.conversionRate}%` },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="text-xs text-[#9CA3AF]">{stat.label}</p>
                        <p className="text-sm font-semibold text-[#111827]">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F3F4F6]">
              <div className="text-xs text-[#9CA3AF]">
                {test.significance > 0 && `Statistical significance: ${Math.round(test.significance * 100)}%`}
                {test.startDate && ` • Started ${new Date(test.startDate).toLocaleDateString()}`}
              </div>
              {test.status === "completed" && test.winner && (
                <button className="text-xs bg-[#22C55E] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[#16A34A] flex items-center gap-1">
                  Apply Winner <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {test.status === "draft" && (
                <button className="text-xs bg-[#22C55E] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[#16A34A]">Start Test</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
