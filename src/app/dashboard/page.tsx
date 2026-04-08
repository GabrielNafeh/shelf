"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { AlertBadge } from "@/components/dashboard/alert-badge";
import { RevenueChart } from "@/components/dashboard/charts/revenue-chart";
import { MarketplaceChart } from "@/components/dashboard/charts/marketplace-chart";
import { generateMockSalesSummary, generateMockAlerts, generateMockShelfScore } from "@/lib/marketplace/mock-sales-data";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Bell,
} from "lucide-react";
import type { AlertSeverity } from "@/lib/types";

const summary = generateMockSalesSummary();
const alerts = generateMockAlerts();
const shelfScore = generateMockShelfScore();

const ALERT_ICONS: Record<string, string> = {
  bsr_drop: "📉",
  price_change: "💰",
  stock_low: "📦",
  review_negative: "⭐",
  score_change: "📊",
};

export default function SalesDashboard() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Sales Dashboard</h1>
          <p className="text-[#6B7280] mt-0.5">Your e-commerce command center</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-[#22C55E] text-white"
                  : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: Shelf Score + KPIs */}
      <div className="grid grid-cols-12 gap-4">
        {/* Shelf Score */}
        <Link href="/dashboard/shelf-score" className="col-span-12 md:col-span-3 rounded-xl border border-[#E5E7EB] bg-white p-5 flex flex-col items-center justify-center hover:shadow-md transition-shadow group">
          <ScoreGauge score={shelfScore.overallScore} size={120} sublabel={`Benchmark: ${shelfScore.categoryBenchmark}`} />
          <span className="text-xs text-[#22C55E] font-medium mt-2 flex items-center gap-1 group-hover:underline">
            View details <ChevronRight className="w-3 h-3" />
          </span>
        </Link>

        {/* KPI Cards */}
        <div className="col-span-12 md:col-span-9 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Revenue"
            value={`$${summary.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 12.5, label: "vs last period" }}
          />
          <StatCard
            label="Orders"
            value={summary.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            trend={{ value: 8.3, label: "vs last period" }}
          />
          <StatCard
            label="Units Sold"
            value={summary.totalUnits.toLocaleString()}
            icon={Package}
            trend={{ value: 5.7, label: "vs last period" }}
          />
          <StatCard
            label="Profit Margin"
            value={`${summary.profitMargin}%`}
            icon={TrendingUp}
            trend={{ value: 2.1, label: "vs last period" }}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#111827]">Revenue Trend</h3>
            <span className="text-xs text-[#9CA3AF]">Last 30 days</span>
          </div>
          <RevenueChart data={summary.revenueByDay} />
        </div>

        {/* Revenue by Marketplace */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#111827]">By Marketplace</h3>
          </div>
          <MarketplaceChart data={summary.revenueByMarketplace} />
        </div>
      </div>

      {/* Bottom Row: Top Products + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <div className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="font-semibold text-[#111827]">Top Products</h3>
            <span className="text-xs text-[#9CA3AF]">By revenue</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  <th className="text-left p-4 font-medium text-[#6B7280]">Product</th>
                  <th className="text-right p-4 font-medium text-[#6B7280]">Revenue</th>
                  <th className="text-right p-4 font-medium text-[#6B7280]">Units</th>
                  <th className="text-right p-4 font-medium text-[#6B7280]">Profit</th>
                  <th className="text-center p-4 font-medium text-[#6B7280]">Channel</th>
                </tr>
              </thead>
              <tbody>
                {summary.topProducts.map((product, i) => (
                  <tr key={i} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                    <td className="p-4 font-medium text-[#111827]">{product.name}</td>
                    <td className="p-4 text-right text-[#111827]">${product.revenue.toLocaleString()}</td>
                    <td className="p-4 text-right text-[#6B7280]">{product.units.toLocaleString()}</td>
                    <td className="p-4 text-right text-[#22C55E] font-medium">${product.profit.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">
                        {product.marketplace}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="font-semibold text-[#111827] flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
            </h3>
            <Link href="/dashboard/alerts" className="text-xs text-[#22C55E] font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`px-5 py-3 flex items-start gap-3 hover:bg-[#F9FAFB] transition-colors ${
                  alert.isRead ? "opacity-60" : ""
                }`}
              >
                <span className="text-lg mt-0.5">{ALERT_ICONS[alert.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-[#111827] truncate">{alert.title}</p>
                    <AlertBadge severity={alert.severity as AlertSeverity} />
                  </div>
                  <p className="text-xs text-[#6B7280] line-clamp-2">{alert.message}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    {new Date(alert.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h3 className="font-semibold text-[#111827] mb-4">Profit & Loss Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Gross Revenue", value: `$${summary.totalRevenue.toLocaleString()}`, color: "text-[#111827]" },
            { label: "Marketplace Fees", value: `-$${Math.round(summary.totalRevenue * 0.15).toLocaleString()}`, color: "text-[#EF4444]" },
            { label: "Ad Spend", value: `-$${Math.round(summary.totalRevenue * 0.12).toLocaleString()}`, color: "text-[#EF4444]" },
            { label: "COGS", value: `-$${Math.round(summary.totalRevenue * 0.28).toLocaleString()}`, color: "text-[#EF4444]" },
            { label: "Net Profit", value: `$${summary.totalProfit.toLocaleString()}`, color: "text-[#22C55E] font-bold" },
            { label: "Margin", value: `${summary.profitMargin}%`, color: "text-[#22C55E] font-bold" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xs text-[#6B7280] mb-1">{item.label}</p>
              <p className={`text-lg font-semibold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
