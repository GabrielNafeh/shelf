"use client";

import { useState } from "react";
import { Send, CheckCircle2, Clock, AlertCircle, Loader2, RefreshCw } from "lucide-react";

type PubStatus = "draft" | "queued" | "publishing" | "live" | "error";

interface PublishJob {
  id: string;
  productName: string;
  marketplace: string;
  status: PubStatus;
  publishedAt?: string;
  errorMessage?: string;
}

const STATUS_CONFIG: Record<PubStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: Clock },
  queued: { label: "Queued", color: "bg-blue-100 text-blue-600", icon: Clock },
  publishing: { label: "Publishing", color: "bg-amber-100 text-amber-600", icon: Loader2 },
  live: { label: "Live", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  error: { label: "Error", color: "bg-red-100 text-red-600", icon: AlertCircle },
};

const MOCK_JOBS: PublishJob[] = [
  { id: "pub-1", productName: "Premium Insulated Tumbler 30oz", marketplace: "amazon", status: "live", publishedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "pub-2", productName: "Premium Insulated Tumbler 30oz", marketplace: "shopify", status: "live", publishedAt: new Date(Date.now() - 82800000).toISOString() },
  { id: "pub-3", productName: "Bamboo Cutting Board Set", marketplace: "amazon", status: "publishing" },
  { id: "pub-4", productName: "LED Desk Lamp with Charger", marketplace: "walmart", status: "queued" },
  { id: "pub-5", productName: "Anti-Theft Laptop Backpack", marketplace: "amazon", status: "error", errorMessage: "ASIN validation failed: product category mismatch" },
  { id: "pub-6", productName: "Extra Thick Yoga Mat", marketplace: "etsy", status: "draft" },
];

export default function PublishPage() {
  const [filter, setFilter] = useState<"all" | PubStatus>("all");
  const jobs = filter === "all" ? MOCK_JOBS : MOCK_JOBS.filter((j) => j.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2"><Send className="w-6 h-6" /> Publish Queue</h1>
          <p className="text-[#6B7280] mt-0.5">Push listings directly to your connected marketplaces</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["all", "live", "publishing", "queued", "error"] as const).map((f) => {
          const count = f === "all" ? MOCK_JOBS.length : MOCK_JOBS.filter((j) => j.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-xl border p-3 text-center transition-colors ${filter === f ? "border-[#22C55E] bg-[#22C55E]/5" : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"}`}>
              <p className="text-2xl font-bold text-[#111827]">{count}</p>
              <p className="text-xs text-[#6B7280] capitalize">{f === "all" ? "Total" : f}</p>
            </button>
          );
        })}
      </div>

      {/* Jobs Table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
              <th className="text-left p-4 font-medium text-[#6B7280]">Product</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Marketplace</th>
              <th className="text-center p-4 font-medium text-[#6B7280]">Status</th>
              <th className="text-right p-4 font-medium text-[#6B7280]">Published</th>
              <th className="text-right p-4 font-medium text-[#6B7280]">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const config = STATUS_CONFIG[job.status];
              const Icon = config.icon;
              return (
                <tr key={job.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB]">
                  <td className="p-4">
                    <p className="font-medium text-[#111827]">{job.productName}</p>
                    {job.errorMessage && <p className="text-xs text-[#EF4444] mt-0.5">{job.errorMessage}</p>}
                  </td>
                  <td className="p-4 text-center"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">{job.marketplace}</span></td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                      <Icon className={`w-3 h-3 ${job.status === "publishing" ? "animate-spin" : ""}`} />{config.label}
                    </span>
                  </td>
                  <td className="p-4 text-right text-[#9CA3AF] text-xs">{job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : "—"}</td>
                  <td className="p-4 text-right">
                    {job.status === "error" && (
                      <button className="text-xs text-[#22C55E] font-medium hover:underline flex items-center gap-1 ml-auto"><RefreshCw className="w-3 h-3" /> Retry</button>
                    )}
                    {job.status === "draft" && (
                      <button className="text-xs bg-[#22C55E] text-white px-3 py-1 rounded-lg font-medium hover:bg-[#16A34A]">Publish</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
