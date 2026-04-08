"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { generateMockInventory } from "@/lib/marketplace/mock-sales-data";
import { Package, AlertTriangle, XCircle, BarChart3, TrendingDown } from "lucide-react";

const inventory = generateMockInventory();
const lowStock = inventory.filter((i) => i.daysOfSupply > 0 && i.daysOfSupply <= 14);
const outOfStock = inventory.filter((i) => i.currentStock === 0);
const avgDays = Math.round(inventory.reduce((s, i) => s + i.daysOfSupply, 0) / inventory.length);
const totalValue = Math.round(inventory.reduce((s, i) => s + i.currentStock * i.unitCost, 0));

function StockBar({ days, max = 90 }: { days: number; max?: number }) {
  const pct = Math.min((days / max) * 100, 100);
  const color = days === 0 ? "bg-[#EF4444]" : days <= 14 ? "bg-[#F59E0B]" : "bg-[#22C55E]";
  return (
    <div className="w-24 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2"><Package className="w-6 h-6" /> Inventory Intelligence</h1>
        <p className="text-[#6B7280] mt-0.5">Stock levels, velocity, and reorder forecasting</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total SKUs" value={inventory.length} icon={Package} />
        <StatCard label="Low Stock" value={lowStock.length} icon={AlertTriangle} trend={lowStock.length > 0 ? { value: -lowStock.length, label: "need attention" } : undefined} />
        <StatCard label="Out of Stock" value={outOfStock.length} icon={XCircle} />
        <StatCard label="Avg Days Supply" value={`${avgDays} days`} icon={BarChart3} />
      </div>

      {/* Urgent Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-4 space-y-2">
          {outOfStock.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span className="text-[#111827] font-medium">{item.productName}</span>
              <span className="text-[#EF4444]">— OUT OF STOCK</span>
              <button className="ml-auto text-xs bg-[#22C55E] text-white px-3 py-1 rounded-lg">Reorder Now</button>
            </div>
          ))}
          {lowStock.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span className="text-[#111827] font-medium">{item.productName}</span>
              <span className="text-[#F59E0B]">— {item.daysOfSupply} days left ({item.currentStock} units)</span>
            </div>
          ))}
        </div>
      )}

      {/* Inventory Table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
              <th className="text-left p-4 font-medium text-[#6B7280]">Product</th>
              <th className="text-left p-4 font-medium text-[#6B7280]">SKU</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Stock</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Velocity/day</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Days Supply</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Fulfillment</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Channel</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB]">
                <td className="p-4 font-medium text-[#111827]">{item.productName}</td>
                <td className="p-4 text-[#6B7280] font-mono text-xs">{item.sku}</td>
                <td className="p-4 text-center">
                  <span className={`font-semibold ${item.currentStock === 0 ? "text-[#EF4444]" : item.currentStock < 30 ? "text-[#F59E0B]" : "text-[#111827]"}`}>
                    {item.currentStock.toLocaleString()}
                  </span>
                </td>
                <td className="p-4 text-center text-[#6B7280]">{item.dailyVelocity}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <StockBar days={item.daysOfSupply} />
                    <span className="text-xs text-[#6B7280] w-8">{item.daysOfSupply}d</span>
                  </div>
                </td>
                <td className="p-4 text-center"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] uppercase">{item.fulfillmentType}</span></td>
                <td className="p-4 text-center"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">{item.marketplace}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
