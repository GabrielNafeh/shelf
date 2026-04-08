"use client";

import { useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { generateMockAdCampaigns } from "@/lib/marketplace/mock-sales-data";
import { Megaphone, DollarSign, MousePointer, Eye, TrendingUp, Pause, Play, Plus, Sparkles, X, Loader2, Target, Zap } from "lucide-react";

const initialCampaigns = generateMockAdCampaigns();

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-600",
  suggested: "bg-blue-100 text-blue-600",
  ended: "bg-gray-100 text-gray-500",
};

interface GeneratedCampaign {
  campaignName: string;
  campaignType: string;
  bidStrategy: string;
  keywords: { keyword: string; matchType: string; suggestedBid: number; estimatedSearchVolume: number; competitionLevel: string }[];
  negativeKeywords: string[];
  estimatedAcos: number;
  estimatedDailyImpressions: number;
  strategy: string;
}

export default function AdsPage() {
  const [campaigns] = useState(initialCampaigns);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedCampaign | null>(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [dailyBudget, setDailyBudget] = useState("25");
  const [targetAcos, setTargetAcos] = useState("25");

  const totalSpend = campaigns.reduce((s, c) => s + c.metrics.spend, 0);
  const totalSales = campaigns.reduce((s, c) => s + c.metrics.sales, 0);
  const avgAcos = Math.round(campaigns.reduce((s, c) => s + c.metrics.acos, 0) / campaigns.length * 10) / 10;
  const avgRoas = Math.round(campaigns.reduce((s, c) => s + c.metrics.roas, 0) / campaigns.length * 10) / 10;

  const COMP_COLORS: Record<string, string> = { low: "text-[#22C55E]", medium: "text-[#F59E0B]", high: "text-[#EF4444]" };

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setGenerating(true);
    setGenerated(null);
    try {
      const res = await fetch("/api/ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productDescription,
          dailyBudget: parseFloat(dailyBudget),
          targetAcos: parseFloat(targetAcos),
        }),
      });
      const data = await res.json();
      if (data.campaign) {
        setGenerated(data.campaign);
      }
    } catch {
      console.error("Failed to generate campaign");
    } finally {
      setGenerating(false);
    }
  };

  const closeGenerator = () => {
    setShowGenerator(false);
    setGenerated(null);
    setProductName("");
    setProductDescription("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2"><Megaphone className="w-6 h-6" /> Ad Manager</h1>
          <p className="text-[#6B7280] mt-0.5">Manage PPC campaigns and track ad performance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerator(true)}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> AI Generate Campaign
          </button>
        </div>
      </div>

      {/* AI Campaign Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeGenerator()}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">AI Campaign Generator</h2>
                  <p className="text-sm text-[#6B7280]">Generate optimized PPC campaigns with AI</p>
                </div>
              </div>
              <button onClick={closeGenerator} className="text-[#9CA3AF] hover:text-[#111827] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            {!generated ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#111827] block mb-1">Product Name *</label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Premium Insulated Tumbler 30oz"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#111827] block mb-1">Product Description (optional)</label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Brief description of your product, key features, target audience..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#111827] block mb-1">Daily Budget ($)</label>
                    <input
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#111827] block mb-1">Target ACOS (%)</label>
                    <input
                      type="number"
                      value={targetAcos}
                      onChange={(e) => setTargetAcos(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !productName.trim()}
                  className="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating campaign with AI...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate Campaign
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Results */
              <div className="p-6 space-y-5">
                {/* Campaign Overview */}
                <div className="rounded-xl bg-[#F9FAFB] p-4">
                  <h3 className="font-bold text-[#111827] text-lg mb-1">{generated.campaignName}</h3>
                  <p className="text-sm text-[#6B7280] mb-3">{generated.strategy}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-[#9CA3AF]">Est. ACOS</p>
                      <p className="text-lg font-bold text-[#111827]">{generated.estimatedAcos}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[#9CA3AF]">Daily Impressions</p>
                      <p className="text-lg font-bold text-[#111827]">{generated.estimatedDailyImpressions.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[#9CA3AF]">Keywords</p>
                      <p className="text-lg font-bold text-[#111827]">{generated.keywords.length}</p>
                    </div>
                  </div>
                </div>

                {/* Keywords Table */}
                <div>
                  <h4 className="font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Suggested Keywords
                  </h4>
                  <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                          <th className="text-left p-3 font-medium text-[#6B7280]">Keyword</th>
                          <th className="text-center p-3 font-medium text-[#6B7280]">Match</th>
                          <th className="text-right p-3 font-medium text-[#6B7280]">Bid</th>
                          <th className="text-right p-3 font-medium text-[#6B7280]">Volume</th>
                          <th className="text-center p-3 font-medium text-[#6B7280]">Competition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generated.keywords.map((kw, i) => (
                          <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                            <td className="p-3 font-medium text-[#111827]">{kw.keyword}</td>
                            <td className="p-3 text-center">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">{kw.matchType}</span>
                            </td>
                            <td className="p-3 text-right text-[#111827]">${kw.suggestedBid.toFixed(2)}</td>
                            <td className="p-3 text-right text-[#6B7280]">{kw.estimatedSearchVolume?.toLocaleString() || "—"}</td>
                            <td className="p-3 text-center">
                              <span className={`text-xs font-medium capitalize ${COMP_COLORS[kw.competitionLevel] || "text-[#6B7280]"}`}>{kw.competitionLevel}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Negative Keywords */}
                {generated.negativeKeywords && generated.negativeKeywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#111827] mb-2 text-sm">Negative Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {generated.negativeKeywords.map((kw, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white py-2.5 rounded-lg font-semibold transition-colors">
                    Launch Campaign
                  </button>
                  <button onClick={() => setGenerated(null)} className="flex-1 border border-[#E5E7EB] text-[#6B7280] py-2.5 rounded-lg font-medium hover:bg-[#F9FAFB] transition-colors">
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Ad Spend" value={`$${totalSpend.toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Ad Revenue" value={`$${totalSales.toLocaleString()}`} icon={TrendingUp} trend={{ value: 14.2, label: "vs last period" }} />
        <StatCard label="Avg ACOS" value={`${avgAcos}%`} icon={MousePointer} />
        <StatCard label="Avg ROAS" value={`${avgRoas}x`} icon={Eye} />
      </div>

      {/* Campaigns */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="p-5 pb-0">
          <h3 className="font-semibold text-[#111827]">Campaigns</h3>
        </div>
        <table className="w-full text-sm mt-3">
          <thead>
            <tr className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
              <th className="text-left p-4 font-medium text-[#6B7280]">Campaign</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Status</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Type</th>
              <th className="text-right p-4 font-medium text-[#6B7280]">Budget/day</th>
              <th className="text-right p-4 font-medium text-[#6B7280]">Spend</th>
              <th className="text-right p-4 font-medium text-[#6B7280]">Sales</th>
              <th className="text-right p-4 font-medium text-[#6B7280]">ACOS</th>
              <th className="text-right p-4 font-medium text-[#6B7280]">ROAS</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Action</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp) => (
              <tr key={camp.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB]">
                <td className="p-4">
                  <p className="font-medium text-[#111827]">{camp.campaignName}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{camp.keywords.length} keywords</p>
                </td>
                <td className="p-4 text-center">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[camp.status]} capitalize`}>{camp.status}</span>
                </td>
                <td className="p-4 text-center text-xs text-[#6B7280]">{camp.campaignType.replace(/_/g, " ")}</td>
                <td className="p-4 text-right text-[#111827]">${camp.dailyBudget}</td>
                <td className="p-4 text-right text-[#111827]">${camp.metrics.spend.toLocaleString()}</td>
                <td className="p-4 text-right text-[#22C55E] font-medium">${camp.metrics.sales.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <span className={camp.metrics.acos <= (camp.targetAcos || 25) ? "text-[#22C55E]" : "text-[#EF4444]"}>{camp.metrics.acos}%</span>
                </td>
                <td className="p-4 text-right text-[#111827]">{camp.metrics.roas}x</td>
                <td className="p-4 text-center">
                  <button className="text-[#6B7280] hover:text-[#111827]">
                    {camp.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
