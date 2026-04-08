"use client";

import { useState } from "react";
import { Microscope, Search, TrendingUp, TrendingDown, Minus, BarChart3, DollarSign, Loader2 } from "lucide-react";

interface ResearchResult {
  query: string;
  demandScore: number;
  competitionLevel: string;
  trend: string;
  avgPrice: number;
  avgReviews: number;
  estimatedMonthlyRevenue: number;
  marketGaps: string[];
}

const MOCK_RESULTS: ResearchResult[] = [
  { query: "insulated water bottle 32oz", demandScore: 87, competitionLevel: "high", trend: "rising", avgPrice: 24.99, avgReviews: 1245, estimatedMonthlyRevenue: 185000, marketGaps: ["No premium glass option in top 20", "Few options with built-in filter", "Limited color options for men"] },
  { query: "bamboo desk organizer", demandScore: 62, competitionLevel: "medium", trend: "stable", avgPrice: 34.99, avgReviews: 340, estimatedMonthlyRevenue: 45000, marketGaps: ["No options with wireless charging pad", "Missing cable management solutions", "Limited modern/minimalist designs"] },
];

function TrendArrow({ trend }: { trend: string }) {
  if (trend === "rising") return <TrendingUp className="w-4 h-4 text-[#22C55E]" />;
  if (trend === "declining") return <TrendingDown className="w-4 h-4 text-[#EF4444]" />;
  return <Minus className="w-4 h-4 text-[#9CA3AF]" />;
}

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#22C55E" : score >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-[#111827]">{score}</span>
      </div>
    </div>
  );
}

const COMP_COLORS: Record<string, string> = { low: "bg-green-100 text-green-700", medium: "bg-amber-100 text-amber-700", high: "bg-red-100 text-red-600", very_high: "bg-red-200 text-red-700" };

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(MOCK_RESULTS);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResults([{ query, demandScore: Math.floor(40 + Math.random() * 50), competitionLevel: ["low","medium","high"][Math.floor(Math.random()*3)], trend: ["rising","stable","declining"][Math.floor(Math.random()*3)], avgPrice: Math.round(15 + Math.random() * 50), avgReviews: Math.floor(50 + Math.random() * 2000), estimatedMonthlyRevenue: Math.floor(10000 + Math.random() * 200000), marketGaps: ["Opportunity identified by AI analysis", "Underserved niche detected"] }, ...results]);
      setLoading(false);
      setQuery("");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2"><Microscope className="w-6 h-6" /> Product Research</h1>
        <p className="text-[#6B7280] mt-0.5">AI-powered market analysis, demand scoring, and gap detection</p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Enter a product idea, niche, or keyword..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]" />
          </div>
          <button onClick={handleSearch} disabled={loading} className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Research"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((result, i) => (
          <div key={i} className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#111827] text-lg">{result.query}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${COMP_COLORS[result.competitionLevel] || COMP_COLORS.medium}`}>{result.competitionLevel} competition</span>
                  <div className="flex items-center gap-1 text-sm text-[#6B7280]"><TrendArrow trend={result.trend} /><span className="capitalize">{result.trend}</span></div>
                </div>
              </div>
              <ScoreRing score={result.demandScore} />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-[#F9FAFB]">
                <p className="text-xs text-[#6B7280]">Avg Price</p>
                <p className="text-lg font-bold text-[#111827]">${result.avgPrice}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#F9FAFB]">
                <p className="text-xs text-[#6B7280]">Avg Reviews</p>
                <p className="text-lg font-bold text-[#111827]">{result.avgReviews.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#F9FAFB]">
                <p className="text-xs text-[#6B7280]">Est. Monthly Rev</p>
                <p className="text-lg font-bold text-[#22C55E]">${(result.estimatedMonthlyRevenue / 1000).toFixed(0)}K</p>
              </div>
            </div>

            {result.marketGaps.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#111827] mb-2">Market Gaps Detected</p>
                <ul className="space-y-1">
                  {result.marketGaps.map((gap, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#6B7280]">
                      <span className="text-[#22C55E] mt-0.5">●</span>{gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
