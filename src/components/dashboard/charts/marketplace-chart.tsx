"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Marketplace } from "@/lib/types";

const MARKETPLACE_COLORS: Record<string, string> = {
  amazon: "#FF9900",
  shopify: "#95BF47",
  walmart: "#0071CE",
  etsy: "#F1641E",
};

interface MarketplaceChartProps {
  data: Record<string, number>;
}

export function MarketplaceChart({ data }: MarketplaceChartProps) {
  const chartData = Object.entries(data).map(([marketplace, revenue]) => ({
    marketplace: marketplace.charAt(0).toUpperCase() + marketplace.slice(1),
    revenue: Math.round(revenue),
    key: marketplace,
  }));

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="marketplace"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          />
          <Tooltip
            contentStyle={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: 13 }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={MARKETPLACE_COLORS[entry.key] || "#22C55E"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
