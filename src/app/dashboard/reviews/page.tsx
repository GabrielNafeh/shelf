"use client";

import { useState } from "react";
import { generateMockReviews } from "@/lib/marketplace/mock-sales-data";
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Minus, Sparkles, Loader2 } from "lucide-react";

const reviews = generateMockReviews();
const avgRating = Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10;
const sentimentBreakdown = {
  positive: reviews.filter((r) => r.sentiment === "positive").length,
  neutral: reviews.filter((r) => r.sentiment === "neutral").length,
  negative: reviews.filter((r) => r.sentiment === "negative").length,
};
const starDist: Record<number, number> = {};
reviews.forEach((r) => { starDist[r.rating] = (starDist[r.rating] || 0) + 1; });

function StarBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#6B7280] w-6">{stars}★</span>
      <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
        <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#6B7280] w-6 text-right">{count}</span>
    </div>
  );
}

function SentimentIcon({ sentiment }: { sentiment: string }) {
  if (sentiment === "positive") return <ThumbsUp className="w-3.5 h-3.5 text-[#22C55E]" />;
  if (sentiment === "negative") return <ThumbsDown className="w-3.5 h-3.5 text-[#EF4444]" />;
  return <Minus className="w-3.5 h-3.5 text-[#9CA3AF]" />;
}

export default function ReviewsPage() {
  const [filter, setFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [generating, setGenerating] = useState<string | null>(null);
  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.sentiment === filter);

  const handleGenerateResponse = (reviewId: string) => {
    setGenerating(reviewId);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2"><MessageSquare className="w-6 h-6" /> Reviews & Reputation</h1>
        <p className="text-[#6B7280] mt-0.5">Monitor reviews, sentiment, and respond with AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Avg Rating */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {[1,2,3,4,5].map((s) => <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E5E7EB]"}`} />)}
          </div>
          <p className="text-3xl font-bold text-[#111827]">{avgRating}</p>
          <p className="text-xs text-[#6B7280]">{reviews.length} total reviews</p>
        </div>
        {/* Star Distribution */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-semibold text-[#111827] mb-3">Star Distribution</p>
          <div className="space-y-1.5">
            {[5,4,3,2,1].map((s) => <StarBar key={s} stars={s} count={starDist[s] || 0} total={reviews.length} />)}
          </div>
        </div>
        {/* Sentiment */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-semibold text-[#111827] mb-3">Sentiment Analysis</p>
          <div className="space-y-2">
            {([["positive", sentimentBreakdown.positive, "#22C55E"], ["neutral", sentimentBreakdown.neutral, "#9CA3AF"], ["negative", sentimentBreakdown.negative, "#EF4444"]] as const).map(([label, count, color]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm capitalize text-[#6B7280]">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color }}>{count}</span>
                  <span className="text-xs text-[#9CA3AF]">({Math.round((count / reviews.length) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "positive", "neutral", "negative"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-[#22C55E] text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.map((review) => (
          <div key={review.id} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E5E7EB]"}`} />)}</div>
                  <SentimentIcon sentiment={review.sentiment} />
                  {review.verifiedPurchase && <span className="text-xs text-[#22C55E] font-medium">Verified</span>}
                </div>
                <p className="font-semibold text-[#111827]">{review.title}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">{review.marketplace}</span>
                <p className="text-xs text-[#9CA3AF] mt-1">{review.reviewerName}</p>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-3">{review.body}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9CA3AF]">{new Date(review.reviewDate).toLocaleDateString()}</span>
              {review.sentiment === "negative" && (
                <button
                  onClick={() => handleGenerateResponse(review.id)}
                  className="text-xs bg-[#22C55E] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#16A34A] flex items-center gap-1"
                >
                  {generating === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {generating === review.id ? "Generating..." : "AI Response"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
