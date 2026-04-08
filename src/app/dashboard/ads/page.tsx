"use client";

import { useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { generateMockAdCampaigns } from "@/lib/marketplace/mock-sales-data";
import { Megaphone, DollarSign, MousePointer, Eye, TrendingUp, Pause, Play, Plus, Sparkles } from "lucide-react";

const campaigns = generateMockAdCampaigns();
const totalSpend = campaigns.reduce((s, c) => s + c.metrics.spend, 0);
const totalSales = campaigns.reduce((s, c) => s + c.metrics.sales, 0);
const avgAcos = Math.round(campaigns.reduce((s, c) => s + c.metrics.acos, 0) / campaigns.length * 10) / 10;
const avgRoas = Math.round(campaigns.reduce((s, c) => s + c.metrics.roas, 0) / campaigns.length * 10) / 10;

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-600",
  suggested: "bg-blue-100 text-blue-600",
  ended: "bg-gray-100 text-gray-500",
};

export default function AdsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2"><Megaphone className="w-6 h-6" /> Ad Manager</h1>
          <p className="text-[#6B7280] mt-0.5">Manage PPC campaigns and track ad performance</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Sparkles className="w-4 h-4" /> AI Generate Campaign
          </button>
          <button className="border border-[#E5E7EB] bg-white text-[#111827] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#F9FAFB]">
            <Plus className="w-4 h-4" /> Manual Campaign
          </button>
        </div>
      </div>

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
                  <span className={camp.metrics.acos <= camp.targetAcos ? "text-[#22C55E]" : "text-[#EF4444]"}>{camp.metrics.acos}%</span>
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
