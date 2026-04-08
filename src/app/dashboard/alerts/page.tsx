"use client";

import { useState } from "react";
import { AlertBadge } from "@/components/dashboard/alert-badge";
import { generateMockAlerts } from "@/lib/marketplace/mock-sales-data";
import { Bell, Check } from "lucide-react";
import type { AlertSeverity } from "@/lib/types";

const ALERT_ICONS: Record<string, string> = {
  bsr_drop: "📉", price_change: "💰", stock_low: "📦", review_negative: "⭐", score_change: "📊",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(generateMockAlerts());
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "unread" ? alerts.filter((a) => !a.isRead) : alerts;
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const markAllRead = () => setAlerts(alerts.map((a) => ({ ...a, isRead: true })));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alerts
            {unreadCount > 0 && (
              <span className="bg-[#EF4444] text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-[#6B7280] mt-0.5">Stay on top of changes across your stores</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "unread"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-[#22C55E] text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
              {f === "all" ? "All" : `Unread (${unreadCount})`}
            </button>
          ))}
          <button onClick={markAllRead} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white divide-y divide-[#F3F4F6]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">No alerts to show</div>
        ) : (
          filtered.map((alert) => (
            <div key={alert.id} className={`p-5 flex items-start gap-4 hover:bg-[#F9FAFB] transition-colors ${alert.isRead ? "opacity-60" : ""}`}>
              <span className="text-2xl">{ALERT_ICONS[alert.type] || "🔔"}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-[#111827]">{alert.title}</p>
                  <AlertBadge severity={alert.severity as AlertSeverity} />
                </div>
                <p className="text-sm text-[#6B7280]">{alert.message}</p>
                <p className="text-xs text-[#9CA3AF] mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
