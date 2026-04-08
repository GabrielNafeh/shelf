import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className = "" }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-[#E5E7EB] bg-white p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#6B7280]">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#9CA3AF]" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[#111827]">{value}</span>
        {trend && (
          <span className={`text-xs font-medium mb-1 ${trend.value >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
