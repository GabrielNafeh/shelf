"use client";

import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { generateMockShelfScore } from "@/lib/marketplace/mock-sales-data";
import { Gauge, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

const score = generateMockShelfScore();

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#6B7280] w-36 shrink-0">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-[#F3F4F6] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-semibold text-[#111827] w-8 text-right">{value}</span>
    </div>
  );
}

export default function ShelfScorePage() {
  const recommendations = [
    { text: "Update backend keywords on 5 Amazon listings missing search terms", impact: "high" },
    { text: "Restock Yoga Mat (4 days of supply remaining) to avoid BSR drop", impact: "critical" },
    { text: "Respond to 2 negative reviews to improve review sentiment score", impact: "medium" },
    { text: "Reduce ACOS on 'Yoga Mat - Broad' campaign from 30% to target 25%", impact: "medium" },
    { text: "Add 3+ images to LED Desk Lamp listing (currently only 1 image)", impact: "high" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <Gauge className="w-6 h-6" />
          Shelf Score
        </h1>
        <p className="text-[#6B7280] mt-0.5">Your overall e-commerce health rating</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 flex flex-col items-center">
          <ScoreGauge score={score.overallScore} size={200} sublabel={`Category avg: ${score.categoryBenchmark}`} />
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            <span className="text-sm text-[#22C55E] font-medium">+6 from last week</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="font-semibold text-[#111827] mb-5">Score Breakdown</h3>
          <div className="space-y-4">
            <ScoreBar label="Listing Quality" value={score.listingQualityScore} color={score.listingQualityScore >= 70 ? "bg-[#22C55E]" : "bg-[#F59E0B]"} />
            <ScoreBar label="Pricing Strategy" value={score.pricingScore} color={score.pricingScore >= 70 ? "bg-[#22C55E]" : "bg-[#F59E0B]"} />
            <ScoreBar label="Review Health" value={score.reviewScore} color={score.reviewScore >= 70 ? "bg-[#22C55E]" : "bg-[#F59E0B]"} />
            <ScoreBar label="Ad Performance" value={score.adScore} color={score.adScore >= 70 ? "bg-[#22C55E]" : "bg-[#F59E0B]"} />
            <ScoreBar label="Inventory Health" value={score.inventoryScore} color={score.inventoryScore >= 70 ? "bg-[#22C55E]" : score.inventoryScore >= 50 ? "bg-[#F59E0B]" : "bg-[#EF4444]"} />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h3 className="font-semibold text-[#111827] mb-4">Recommendations to Improve Your Score</h3>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors">
              {rec.impact === "critical" ? (
                <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              ) : rec.impact === "high" ? (
                <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#6B7280] shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm text-[#111827]">{rec.text}</p>
                <span className={`text-xs font-medium mt-0.5 inline-block ${
                  rec.impact === "critical" ? "text-[#EF4444]" : rec.impact === "high" ? "text-[#F59E0B]" : "text-[#6B7280]"
                }`}>
                  {rec.impact.toUpperCase()} IMPACT
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
